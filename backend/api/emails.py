from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_verification_email(recipient_email, applicant_name, verification_code='MV-VERIFY-2026'):
    """
    Sends an official Legal Metrology verification email to the applicant.
    """
    subject = f"[METRAVOX] Statutory Verification & Account Confirmation - {applicant_name}"
    message = f"""
Dear {applicant_name},

Thank you for registering on METRAVOX – Online Verification System for Weighing and Measuring Instruments (Ministry of Consumer Affairs, Food & Public Distribution, Govt. of India).

Your applicant portal has been provisioned.

Applicant Email: {recipient_email}
Verification Security Code: {verification_code}
Portal URL: http://localhost:8000/#/login

Default Demo Passwords:
- Applicant Portal: Applicant@2026
- Officer Portal: Officer@2026
- Admin Console: Admin@2026

You may now lodge statutory verification applications, track inspections, and download Form V verification certificates online.

Sincerely,
Directorate of Legal Metrology
Ministry of Consumer Affairs, Food & Public Distribution
Government of India
    """.strip()

    try:
        sent = send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply.metravox@nic.in'),
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info(f"Verification email successfully sent to {recipient_email}")
        return {'status': 'sent', 'recipient': recipient_email, 'subject': subject}
    except Exception as e:
        logger.error(f"Error sending email to {recipient_email}: {str(e)}")
        # In console/dev mode or offline, we return confirmation
        return {'status': 'simulated', 'recipient': recipient_email, 'subject': subject, 'note': str(e)}

def send_application_notification_email(recipient_email, applicant_name, application_id, instrument_type):
    """
    Sends application status receipt email to the applicant.
    """
    subject = f"[METRAVOX] Application Lodged - ID #{application_id}"
    message = f"""
Dear {applicant_name},

Your application for verification of weighing/measuring instrument has been successfully lodged on the METRAVOX portal.

Application ID: {application_id}
Instrument: {instrument_type}
Applicant Registered Email: {recipient_email}
Track Online: http://localhost:8000/#/track?id={application_id}

Your dossier is currently assigned for Document Scrutiny under Rule 14 of Legal Metrology (General) Rules, 2011. You will receive notifications regarding scheduled field verification dates.

Regards,
Legal Metrology Enforcement Division
Government of India
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply.metravox@nic.in'),
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        return {'status': 'sent', 'recipient': recipient_email, 'applicationId': application_id}
    except Exception as e:
        return {'status': 'simulated', 'recipient': recipient_email, 'applicationId': application_id, 'note': str(e)}

def send_password_reset_otp_email(recipient_email, applicant_name, otp_code):
    """
    Sends a statutory password reset OTP email to the applicant.
    """
    subject = f"[METRAVOX] Password Reset Request - Verification OTP #{otp_code}"
    message = f"""
Dear {applicant_name},

A password reset request was initiated for your METRAVOX Registered Applicant Account ({recipient_email}).

Your one-time verification password (OTP) is:
==================================================
              OTP CODE: {otp_code}
==================================================

This code is valid for 15 minutes. Use this code on the METRAVOX password reset screen to establish a new password.

If you did not request a password reset, you can safely disregard this notice. Your existing credentials remain completely secure.

Sincerely,
Directorate of Legal Metrology
Ministry of Consumer Affairs, Food & Public Distribution
Government of India
    """.strip()

    try:
        send_mail(
            subject=subject,
            message=message,
            from_email=getattr(settings, 'DEFAULT_FROM_EMAIL', 'no-reply.metravox@nic.in'),
            recipient_list=[recipient_email],
            fail_silently=False,
        )
        logger.info(f"Password reset OTP successfully sent to {recipient_email}")
        return {'status': 'sent', 'recipient': recipient_email, 'subject': subject}
    except Exception as e:
        logger.error(f"Error sending password reset OTP to {recipient_email}: {str(e)}")
        return {'status': 'simulated', 'recipient': recipient_email, 'subject': subject, 'note': str(e)}

