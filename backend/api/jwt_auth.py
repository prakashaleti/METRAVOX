import hmac
import hashlib
import base64
import json
import time
from functools import wraps
from django.conf import settings
from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework import status

JWT_SECRET = getattr(settings, 'SECRET_KEY', 'metravox-super-secret-jwt-key-2026')
JWT_ALGORITHM = 'HS256'
ACCESS_TOKEN_LIFETIME_SECONDS = 7200
REFRESH_TOKEN_LIFETIME_SECONDS = 604800

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_jwt(payload: dict) -> str:
    header = {'typ': 'JWT', 'alg': JWT_ALGORITHM}
    header_bytes = json.dumps(header, separators=(',', ':')).encode('utf-8')
    payload_bytes = json.dumps(payload, separators=(',', ':')).encode('utf-8')

    header_b64 = _b64url_encode(header_bytes)
    payload_b64 = _b64url_encode(payload_bytes)

    signing_input = f'{header_b64}.{payload_b64}'.encode('utf-8')
    signature = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(signature)

    return f'{header_b64}.{payload_b64}.{sig_b64}'

def verify_jwt(token: str) -> dict:
    parts = token.split('.')
    if len(parts) != 3:
        raise ValueError('Invalid token structure')

    header_b64, payload_b64, sig_b64 = parts
    signing_input = f'{header_b64}.{payload_b64}'.encode('utf-8')
    expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()

    actual_sig = _b64url_decode(sig_b64)
    if not hmac.compare_digest(expected_sig, actual_sig):
        raise ValueError('Invalid signature')

    payload_json = _b64url_decode(payload_b64).decode('utf-8')
    payload = json.loads(payload_json)

    if 'exp' in payload and payload['exp'] < int(time.time()):
        raise ValueError('Token has expired')

    return payload

def generate_tokens_for_user(user: User, role: str, name: str = None) -> dict:
    now = int(time.time())
    display_name = name or user.get_full_name() or user.first_name or user.username
    
    access_payload = {
        'token_type': 'access',
        'sub': user.id,
        'username': user.username,
        'email': user.email,
        'role': role,
        'name': display_name,
        'iat': now,
        'exp': now + ACCESS_TOKEN_LIFETIME_SECONDS,
    }
    
    refresh_payload = {
        'token_type': 'refresh',
        'sub': user.id,
        'username': user.username,
        'iat': now,
        'exp': now + REFRESH_TOKEN_LIFETIME_SECONDS,
    }

    return {
        'access_token': create_jwt(access_payload),
        'refresh_token': create_jwt(refresh_payload),
        'expires_in': ACCESS_TOKEN_LIFETIME_SECONDS,
        'token_type': 'Bearer'
    }

def jwt_required(allowed_roles=None):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            auth_header = request.headers.get('Authorization', '')
            if not auth_header.startswith('Bearer '):
                return Response({'error': 'Authorization header missing or invalid. Use Bearer token.'},
                                status=status.HTTP_401_UNAUTHORIZED)
            
            token = auth_header.split(' ')[1].strip()
            try:
                payload = verify_jwt(token)
                if payload.get('token_type') != 'access':
                    return Response({'error': 'Invalid token type. Access token required.'},
                                    status=status.HTTP_401_UNAUTHORIZED)
            except ValueError as e:
                return Response({'error': f'Authentication failed: {str(e)}'},
                                status=status.HTTP_401_UNAUTHORIZED)
            
            request.jwt_user = payload
            
            if allowed_roles:
                user_role = payload.get('role', '').lower()
                roles_lower = [r.lower() for r in allowed_roles]
                if user_role not in roles_lower:
                    return Response({'error': f'Forbidden: Role {user_role} is not authorized for this resource.'},
                                    status=status.HTTP_403_FORBIDDEN)
            
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator
