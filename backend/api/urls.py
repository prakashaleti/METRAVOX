from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    VerificationApplicationViewSet, 
    DigitalCertificateViewSet,
    dashboard_analytics,
    verification_history
)
from .auth_views import (
    login_user,
    refresh_jwt_token,
    get_current_user_profile,
    register_applicant,
    get_password_list,
    send_applicant_verification_email,
    forgot_password_request,
    reset_password_confirm
)

router = DefaultRouter()
router.register(r'applications', VerificationApplicationViewSet, basename='application')
router.register(r'certificates', DigitalCertificateViewSet, basename='certificate')

urlpatterns = [
    # Authentication & JWT Endpoints
    path('auth/login/', login_user, name='auth-login'),
    path('auth/token/', login_user, name='auth-token'),
    path('auth/token/refresh/', refresh_jwt_token, name='auth-token-refresh'),
    path('auth/me/', get_current_user_profile, name='auth-me'),
    path('auth/register/', register_applicant, name='auth-register'),
    path('auth/passwords/', get_password_list, name='auth-passwords'),
    path('auth/send_verification_email/', send_applicant_verification_email, name='auth-send-verification-email'),
    path('auth/forgot_password/', forgot_password_request, name='auth-forgot-password'),
    path('auth/reset_password/', reset_password_confirm, name='auth-reset-password'),

    # Analytics & History
    path('analytics/stats/', dashboard_analytics, name='dashboard-analytics'),
    path('history/', verification_history, name='verification-history'),
    
    path('', include(router.urls)),
]
