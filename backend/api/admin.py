from django.contrib import admin
from .models import (
    ApplicantProfile, 
    OfficerProfile, 
    VerificationApplication, 
    ApplicationDocument, 
    ApplicationTimelineEvent, 
    InspectionObservation, 
    DigitalCertificate
)

@admin.register(VerificationApplication)
class VerificationApplicationAdmin(admin.ModelAdmin):
    list_display = ('application_id', 'applicant_name', 'instrument_type', 'serial_number', 'status', 'submitted_at')
    list_filter = ('status', 'district', 'verification_nature')
    search_fields = ('application_id', 'applicant_name', 'business_name', 'serial_number')

@admin.register(DigitalCertificate)
class DigitalCertificateAdmin(admin.ModelAdmin):
    list_display = ('certificate_number', 'applicant_name', 'instrument_type', 'serial_number', 'verification_date', 'expiry_date')
    list_filter = ('verification_date', 'expiry_date')
    search_fields = ('certificate_number', 'serial_number', 'applicant_name')

@admin.register(InspectionObservation)
class InspectionObservationAdmin(admin.ModelAdmin):
    list_display = ('application', 'seal_number', 'mpe_tolerance', 'max_observed_error', 'verdict', 'inspection_date')

@admin.register(ApplicantProfile)
class ApplicantProfileAdmin(admin.ModelAdmin):
    list_display = ('business_name', 'full_name', 'gstin', 'district', 'phone')

@admin.register(OfficerProfile)
class OfficerProfileAdmin(admin.ModelAdmin):
    list_display = ('officer_name', 'badge_number', 'jurisdiction_zone', 'district')
