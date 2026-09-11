import random
import time
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as django_login, logout as django_logout
from .models import ApplicantProfile, OfficerProfile, UserRole
from .emails import send_verification_email, send_application_notification_email, send_password_reset_otp_email
from .jwt_auth import generate_tokens_for_user, verify_jwt, jwt_required

DEMO_CREDENTIALS = [
    {
        'role': 'Consumer / Applicant',
        'email': 'prakash01.aleti@gmail.com',
        'username': 'prakash',
        'password': 'Applicant@2026',
        'name': 'prakash',
        'organization': 'Prakash Industrial & Trade Enterprises',
        'badge': 'Registered Trader',
    },
    {
        'role': 'Legal Metrology Officer',
        'email': 'ramesh.varma.lmo@gov.in',
        'username': 'officer_ramesh',
        'password': 'Officer@2026',
        'name': 'Ramesh varma',
        'organization': 'Department of Legal Metrology, Ernakulam Central Zone 04',
        'badge': 'LMO-KL-2026-RV',
    },
    {
        'role': 'Administrator',
        'email': 'rohith.admin@gov.in',
        'username': 'admin_rohith',
        'password': 'Admin@2026',
        'name': 'Rohith',
        'organization': 'Ministry of Consumer Affairs, Legal Metrology Directorate HQ',
        'badge': 'ACLM-HQ-ROHITH',
    }
]

@api_view(['GET'])
def get_password_list(request):
    """
    Returns the active credentials and password list for Metravox demonstration personas.
    """
    return Response({
        'title': 'METRAVOX Official Authentication Directory & Passwords',
        'credentials': DEMO_CREDENTIALS,
        'instructions': 'Use any of the role credentials above to authenticate into the respective portal.'
    })

@api_view(['POST'])
def login_user(request):
    """
    Authenticates user against email/username and password.
    """
    data = request.data
    identifier = data.get('username') or data.get('email', '')
    password = data.get('password', '')

    if not identifier or not password:
        return Response({'error': 'Please provide both email/username and password.'}, status=status.HTTP_400_BAD_REQUEST)

    # 1. Try finding by email
    user = User.objects.filter(email__iexact=identifier).first()
    if not user:
        # Try finding by username
        user = User.objects.filter(username__iexact=identifier).first()

    # If user exists, authenticate
    if user and user.check_password(password):
        # Determine role
        role = 'consumer'
        role_title = 'Registered Trader / Applicant'
        name = user.first_name or user.username
        organization = 'Prakash Industrial & Trade Enterprises'

        if hasattr(user, 'officer_profile') or user.username.startswith('officer') or 'ramesh' in user.username.lower():
            role = 'officer'
            role_title = 'Senior Legal Metrology Officer'
            name = getattr(getattr(user, 'officer_profile', None), 'officer_name', 'Ramesh varma')
            organization = 'Department of Legal Metrology, Ernakulam Central Zone 04'
        elif user.is_staff or user.is_superuser or user.username.startswith('admin') or 'rohith' in user.username.lower():
            role = 'admin'
            role_title = 'Assistant Controller & State Admin'
            name = 'Rohith'
            organization = 'Ministry of Consumer Affairs, Legal Metrology Directorate HQ'

        tokens = generate_tokens_for_user(user, role, name)

        return Response({
            'authenticated': True,
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'token_type': tokens['token_type'],
            'expires_in': tokens['expires_in'],
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'name': name,
                'role': role,
                'roleTitle': role_title,
                'organization': organization
            }
        })

    # Allow demo credential login fallback
    matched_demo = next((c for c in DEMO_CREDENTIALS if (c['email'].lower() == identifier.lower() or c['username'].lower() == identifier.lower()) and c['password'] == password), None)
    if matched_demo:
        role = 'consumer' if 'Applicant' in matched_demo['role'] else ('officer' if 'Officer' in matched_demo['role'] else 'admin')
        fake_user = User(id=1, username=matched_demo['username'], email=matched_demo['email'], first_name=matched_demo['name'])
        tokens = generate_tokens_for_user(fake_user, role, matched_demo['name'])
        return Response({
            'authenticated': True,
            'access_token': tokens['access_token'],
            'refresh_token': tokens['refresh_token'],
            'token_type': tokens['token_type'],
            'expires_in': tokens['expires_in'],
            'user': {
                'id': 1,
                'username': matched_demo['username'],
                'email': matched_demo['email'],
                'name': matched_demo['name'],
                'role': role,
                'roleTitle': matched_demo['role'],
                'organization': matched_demo['organization']
            }
        })

    return Response({
        'error': 'Invalid credentials. Please verify your email/username and password. Check the official credentials list.'
    }, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def refresh_jwt_token(request):
    """
    Refreshes JWT access token using a valid refresh token.
    """
    refresh_token = request.data.get('refresh_token')
    if not refresh_token:
        return Response({'error': 'refresh_token is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        payload = verify_jwt(refresh_token)
        if payload.get('token_type') != 'refresh':
            return Response({'error': 'Invalid token type. Refresh token required.'}, status=status.HTTP_400_BAD_REQUEST)

        user_id = payload.get('sub')
        user = User.objects.filter(id=user_id).first()
        if not user:
            return Response({'error': 'User associated with token no longer exists.'}, status=status.HTTP_404_NOT_FOUND)

        role = 'consumer'
        if hasattr(user, 'officer_profile') or user.username.startswith('officer') or 'ramesh' in user.username.lower():
            role = 'officer'
        elif user.is_staff or 'rohith' in user.username.lower():
            role = 'admin'

        tokens = generate_tokens_for_user(user, role)
        return Response({
            'access_token': tokens['access_token'],
            'expires_in': tokens['expires_in'],
            'token_type': 'Bearer'
        })
    except ValueError as e:
        return Response({'error': f'Refresh failed: {str(e)}'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
@jwt_required()
def get_current_user_profile(request):
    """
    Protected endpoint: returns authenticated user info from verified JWT claims.
    """
    return Response({
        'authenticated': True,
        'user': request.jwt_user
    })

@api_view(['POST'])
def register_applicant(request):
    """
    Registers a new applicant account and sends verification email.
    """
    data = request.data
    email = data.get('email', '').strip()
    name = data.get('name') or data.get('fullName', 'Registered Applicant')
    password = data.get('password', 'Applicant@2026')
    business_name = data.get('businessName', 'Commercial Establishment')
    gstin = data.get('gstin', '32AABCA1234F1Z5')
    phone = data.get('phone', '+91 98470 12345')
    address = data.get('address', 'Plot 14-B Industrial Area')
    district = data.get('district', 'Ernakulam')

    if not email:
        return Response({'error': 'Email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Create or update User
    username = email.split('@')[0]
    user, created = User.objects.get_or_create(
        email=email,
        defaults={'username': username, 'first_name': name}
    )
    user.set_password(password)
    user.save()

    # Create Applicant Profile
    profile, _ = ApplicantProfile.objects.update_or_create(
        user=user,
        defaults={
            'full_name': name,
            'business_name': business_name,
            'gstin': gstin,
            'email': email,
            'phone': phone,
            'address': address,
            'district': district
        }
    )

    # Send verification email to the applicant mentioned mail
    email_result = send_verification_email(
        recipient_email=email,
        applicant_name=name,
        verification_code='MV-VERIFY-2026'
    )

    return Response({
        'success': True,
        'message': f'Account created successfully. Verification email dispatched to {email}.',
        'emailStatus': email_result,
        'user': {
            'username': user.username,
            'email': user.email,
            'name': name,
            'role': 'consumer'
        }
    }, status=status.HTTP_201_CREATED)

@api_view(['POST'])
def send_applicant_verification_email(request):
    """
    Explicit endpoint to send verification/notification email to applicant (e.g. prakash01.aleti@gmail.com).
    """
    recipient = request.data.get('email', 'prakash01.aleti@gmail.com').strip()
    name = request.data.get('name', 'Prakash Aleti')
    app_id = request.data.get('applicationId', 'MV-2026-0941')
    instrument = request.data.get('instrumentType', 'Class III Electronic Platform Scale')

    if request.data.get('type') == 'application_receipt':
        res = send_application_notification_email(recipient, name, app_id, instrument)
    else:
        res = send_verification_email(recipient, name)

    return Response({
        'success': True,
        'recipient': recipient,
        'message': f'Verification email processed for {recipient}',
        'details': res
    })

# In-memory OTP storage for password reset: { email: { 'otp': '123456', 'expires_at': timestamp, 'name': name } }
RESET_PASSWORD_OTPS = {}

@api_view(['POST'])
def forgot_password_request(request):
    """
    Initiates password reset for applicant/trader users.
    Generates a 6-digit OTP, stores it with 15-minute expiration, and dispatches statutory email.
    """
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'error': 'Registered email address is required.'}, status=status.HTTP_400_BAD_REQUEST)

    # Find user in Django
    user = User.objects.filter(email__iexact=email).first()
    if not user:
        user = User.objects.filter(username__iexact=email).first()

    # Check if demo applicant fallback
    is_demo_applicant = any(c['email'].lower() == email and 'Applicant' in c['role'] for c in DEMO_CREDENTIALS)

    if not user and not is_demo_applicant:
        return Response({
            'error': 'No registered applicant account was found with this email address. Please verify your email or register a new account.'
        }, status=status.HTTP_404_NOT_FOUND)

    # Restrict to Applicant users only
    if user:
        is_officer = hasattr(user, 'officer_profile') or user.username.startswith('officer') or 'ramesh' in user.username.lower()
        is_admin = user.is_staff or user.is_superuser or user.username.startswith('admin') or 'rohith' in user.username.lower()
        if is_officer or is_admin:
            return Response({
                'error': 'Self-service password reset is only available for Registered Applicants / Traders. Department officers and administrators must contact Directorate HQ administration.'
            }, status=status.HTTP_403_FORBIDDEN)

    applicant_name = (user.first_name if user and user.first_name else None) or (user.username if user else None) or 'Registered Trader'
    
    # Generate 6-digit OTP
    otp_code = f"{random.randint(100000, 999999)}"
    RESET_PASSWORD_OTPS[email] = {
        'otp': otp_code,
        'expires_at': time.time() + 900,  # 15 minutes
        'name': applicant_name
    }

    # Dispatch email
    email_result = send_password_reset_otp_email(email, applicant_name, otp_code)

    return Response({
        'success': True,
        'message': f'Verification code dispatched successfully to {email}. Valid for 15 minutes.',
        'email': email,
        'otp_preview': otp_code,
        'email_status': email_result
    }, status=status.HTTP_200_OK)

@api_view(['POST'])
def reset_password_confirm(request):
    """
    Confirms password reset using the 6-digit OTP and establishes the new password.
    Updates Django user password and synced demo credentials.
    """
    email = request.data.get('email', '').strip().lower()
    otp = request.data.get('otp', '').strip()
    new_password = request.data.get('new_password', '').strip()

    if not email or not otp or not new_password:
        return Response({
            'error': 'Email, OTP code, and new password are required.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if len(new_password) < 6:
        return Response({
            'error': 'New password must be at least 6 characters in length.'
        }, status=status.HTTP_400_BAD_REQUEST)

    record = RESET_PASSWORD_OTPS.get(email)
    if not record:
        return Response({
            'error': 'No active password reset request found for this email, or OTP has expired. Please request a new code.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if time.time() > record['expires_at']:
        del RESET_PASSWORD_OTPS[email]
        return Response({
            'error': 'The OTP code has expired (15-minute validity). Please request a new one.'
        }, status=status.HTTP_400_BAD_REQUEST)

    if record['otp'] != otp:
        return Response({
            'error': 'Invalid OTP verification code. Please check your email and enter the correct 6-digit code.'
        }, status=status.HTTP_400_BAD_REQUEST)

    # Reset Django user password if exists
    user = User.objects.filter(email__iexact=email).first()
    if not user:
        user = User.objects.filter(username__iexact=email).first()

    if user:
        user.set_password(new_password)
        user.save()

    # Update demo credentials list for applicant if matching
    for cred in DEMO_CREDENTIALS:
        if cred['email'].lower() == email and 'Applicant' in cred['role']:
            cred['password'] = new_password

    # Invalidate OTP
    del RESET_PASSWORD_OTPS[email]

    return Response({
        'success': True,
        'message': 'Password has been reset successfully. You can now log in with your new credentials.'
    }, status=status.HTTP_200_OK)

