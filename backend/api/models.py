from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
import uuid

class UserRole(models.TextChoices):
    CONSUMER = 'CONSUMER', 'Consumer / Trader'
    OFFICER = 'OFFICER', 'Legal Metrology Officer'
    ADMIN = 'ADMIN', 'Administrator'

class ApplicationStatus(models.TextChoices):
    SUBMITTED = 'Application Submitted', 'Application Submitted'
    UNDER_REVIEW = 'Under Review', 'Under Review'
    RETURNED = 'Returned for Correction', 'Returned for Correction'
    SCHEDULED = 'Verification Scheduled', 'Verification Scheduled'
    INSPECTING = 'Inspection in Progress', 'Inspection in Progress'
    APPROVED = 'Approved', 'Approved'
    REJECTED = 'Rejected', 'Rejected'
    CERT_GENERATED = 'Certificate Generated', 'Certificate Generated'

class ApplicantProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='applicant_profile', null=True, blank=True)
    full_name = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255)
    gstin = models.CharField(max_length=20, db_index=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100, default='Kerala')
    pincode = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.business_name} ({self.gstin})"

class OfficerProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='officer_profile', null=True, blank=True)
    officer_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=255, default='Senior Legal Metrology Officer')
    badge_number = models.CharField(max_length=50, unique=True)
    jurisdiction_zone = models.CharField(max_length=150)
    district = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField()

    def __str__(self):
        return f"{self.officer_name} ({self.badge_number})"

class VerificationApplication(models.Model):
    application_id = models.CharField(max_length=30, unique=True, db_index=True)
    applicant = models.ForeignKey(ApplicantProfile, on_delete=models.CASCADE, related_name='applications', null=True, blank=True)
    applicant_name = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255)
    gstin = models.CharField(max_length=20)
    email = models.EmailField()
    phone = models.CharField(max_length=20)
    premises_address = models.TextField()
    district = models.CharField(max_length=100)
    
    # Instrument Details
    instrument_category = models.CharField(max_length=150)
    instrument_type = models.CharField(max_length=255)
    accuracy_class = models.CharField(max_length=100)
    capacity = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=255)
    model_number = models.CharField(max_length=150)
    serial_number = models.CharField(max_length=150, db_index=True)
    year_of_manufacture = models.IntegerField(default=2025)
    verification_nature = models.CharField(max_length=100, default='Re-verification / Periodic Renewal')
    inspection_venue = models.CharField(max_length=255, default='Trader Premises (On-site)')
    
    # Workflow Status
    status = models.CharField(
        max_length=50, 
        choices=ApplicationStatus.choices, 
        default=ApplicationStatus.SUBMITTED,
        db_index=True
    )
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Return for Correction tracking
    return_reason = models.TextField(blank=True, null=True)
    returned_at = models.DateTimeField(blank=True, null=True)
    applicant_correction_notes = models.TextField(blank=True, null=True)
    
    # Inspection Scheduling
    assigned_officer = models.ForeignKey(OfficerProfile, on_delete=models.SET_NULL, null=True, blank=True)
    scheduled_date = models.DateField(blank=True, null=True)
    scheduled_slot = models.CharField(max_length=100, blank=True, null=True)
    special_instructions = models.TextField(blank=True, null=True)
    
    # Financials
    statutory_fee = models.DecimalField(max_digits=10, decimal_places=2, default=850.00)
    fee_status = models.CharField(max_length=50, default='PAID_ONLINE')
    
    # Rejection Reason (if rejected)
    rejection_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.application_id} - {self.instrument_type} ({self.status})"

class ApplicationDocument(models.Model):
    application = models.ForeignKey(VerificationApplication, on_delete=models.CASCADE, related_name='documents')
    document_name = models.CharField(max_length=255)
    file = models.FileField(upload_to='verification_docs/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

class ApplicationTimelineEvent(models.Model):
    application = models.ForeignKey(VerificationApplication, on_delete=models.CASCADE, related_name='timeline_events')
    stage = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    description = models.TextField()
    actor = models.CharField(max_length=150)
    timestamp = models.DateTimeField(default=timezone.now)

class InspectionObservation(models.Model):
    application = models.OneToOneField(VerificationApplication, on_delete=models.CASCADE, related_name='inspection_record')
    inspector = models.ForeignKey(OfficerProfile, on_delete=models.SET_NULL, null=True)
    inspection_date = models.DateField(default=timezone.now)
    standards_used = models.CharField(max_length=255)
    mpe_tolerance = models.CharField(max_length=100)
    max_observed_error = models.CharField(max_length=50)
    seal_number = models.CharField(max_length=100, unique=True)
    verdict = models.CharField(max_length=20, default='PASSED')
    remarks = models.TextField()
    raw_readings_json = models.JSONField(default=list)

class DigitalCertificate(models.Model):
    certificate_number = models.CharField(max_length=50, unique=True, db_index=True)
    application = models.ForeignKey(VerificationApplication, on_delete=models.CASCADE, related_name='digital_certificates', null=True, blank=True)
    applicant_name = models.CharField(max_length=255)
    business_name = models.CharField(max_length=255)
    gstin = models.CharField(max_length=20)
    premises_address = models.TextField()
    
    instrument_type = models.CharField(max_length=255)
    instrument_class = models.CharField(max_length=100)
    manufacturer = models.CharField(max_length=255)
    model_number = models.CharField(max_length=150)
    serial_number = models.CharField(max_length=150, db_index=True)
    capacity = models.CharField(max_length=100)
    
    verification_date = models.DateField()
    expiry_date = models.DateField(db_index=True)
    
    issuing_authority = models.CharField(max_length=255, default='Office of the Assistant Controller of Legal Metrology')
    verifying_officer = models.CharField(max_length=255)
    officer_designation = models.CharField(max_length=150, default='Senior Legal Metrology Officer')
    seal_number = models.CharField(max_length=100)
    fee_paid = models.CharField(max_length=50)
    security_hash = models.CharField(max_length=64)
    created_at = models.DateTimeField(auto_now_add=True)

    @property
    def remaining_days(self):
        today = timezone.now().date()
        return (self.expiry_date - today).days

    def __str__(self):
        return f"{self.certificate_number} - {self.serial_number} (Expires: {self.expiry_date})"
