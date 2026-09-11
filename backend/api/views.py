from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q, Count
from datetime import timedelta, date
import uuid

from .models import (
    VerificationApplication, 
    DigitalCertificate, 
    InspectionObservation, 
    ApplicationTimelineEvent,
    ApplicationDocument,
    ApplicationStatus,
    ApplicantProfile,
    OfficerProfile
)
from .serializers import (
    VerificationApplicationSerializer, 
    DigitalCertificateSerializer, 
    InspectionObservationSerializer
)

class VerificationApplicationViewSet(viewsets.ModelViewSet):
    queryset = VerificationApplication.objects.all().order_by('-submitted_at')
    serializer_class = VerificationApplicationSerializer

    def get_queryset(self):
        qs = VerificationApplication.objects.all().order_by('-submitted_at')
        email = self.request.query_params.get('email')
        applicant_id = self.request.query_params.get('applicant_id')
        if email:
            qs = qs.filter(email__iexact=email.strip())
        elif applicant_id:
            qs = qs.filter(applicant_id=applicant_id)
        return qs

    def get_object(self):
        lookup = self.kwargs.get('pk')
        try:
            # Try by integer PK first
            return self.queryset.get(pk=int(lookup))
        except (ValueError, VerificationApplication.DoesNotExist):
            # Try by application_id string (e.g. MV-2026-0941)
            return self.queryset.get(application_id__iexact=lookup)

    def perform_create(self, serializer):
        app_id = f"MV-{timezone.now().year}-{uuid.uuid4().hex[:4].upper()}"
        email = self.request.data.get('email')
        applicant_profile = None
        if email:
            applicant_profile = ApplicantProfile.objects.filter(email__iexact=email.strip()).first()
        app = serializer.save(
            application_id=app_id, 
            status=ApplicationStatus.SUBMITTED,
            submitted_at=timezone.now(),
            applicant=applicant_profile
        )
        ApplicationTimelineEvent.objects.create(
            application=app,
            stage='Application Submitted',
            title='Application Lodged Online',
            description='Statutory application registered online. Fee payment confirmed.',
            actor=app.applicant_name
        )

    @action(detail=True, methods=['post'])
    def return_for_correction(self, request, pk=None):
        app = self.get_object()
        reason = request.data.get('reason', 'Discrepancy in submitted documents or model specifications.')
        app.status = ApplicationStatus.RETURNED
        app.return_reason = reason
        app.returned_at = timezone.now()
        app.save()

        ApplicationTimelineEvent.objects.create(
            application=app,
            stage='Returned for Correction',
            title='Application Returned for Correction',
            description=reason,
            actor='Legal Metrology Officer'
        )
        return Response(VerificationApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def resubmit(self, request, pk=None):
        app = self.get_object()
        notes = request.data.get('notes', 'Applicant corrected requested items.')
        app.status = ApplicationStatus.UNDER_REVIEW
        app.applicant_correction_notes = notes
        app.save()

        ApplicationTimelineEvent.objects.create(
            application=app,
            stage='Under Review',
            title='Application Resubmitted with Corrections',
            description=f"Applicant correction notes: {notes}",
            actor=f"{app.applicant_name} (Applicant)"
        )
        return Response(VerificationApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def schedule_inspection(self, request, pk=None):
        app = self.get_object()
        app.status = ApplicationStatus.SCHEDULED
        app.scheduled_date = request.data.get('date')
        app.scheduled_slot = request.data.get('slot', '10:30 AM - 12:30 PM')
        app.inspection_venue = request.data.get('venue', app.inspection_venue)
        app.special_instructions = request.data.get('instructions', '')
        app.save()

        ApplicationTimelineEvent.objects.create(
            application=app,
            stage='Verification Scheduled',
            title='Inspection Date & Slot Allocated',
            description=f"Scheduled for {app.scheduled_date} ({app.scheduled_slot}) at {app.inspection_venue}.",
            actor='Legal Metrology Officer'
        )
        return Response(VerificationApplicationSerializer(app).data)

    @action(detail=True, methods=['post'])
    def record_inspection_and_approve(self, request, pk=None):
        app = self.get_object()
        cert_number = f"CERT-LM-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
        seal_number = request.data.get('seal_number', f"KL-07-SEAL-{timezone.now().year}-9912")
        today = timezone.now().date()
        expiry = today + timedelta(days=365)

        raw_readings = request.data.get('tests', [
            {'load': '10 kg', 'reading': '10.000 kg', 'error': '0.0 g', 'mpe': '±2.5 g', 'result': 'PASS'},
            {'load': '50 kg', 'reading': '50.002 kg', 'error': '+2.0 g', 'mpe': '±5.0 g', 'result': 'PASS'},
            {'load': '150 kg', 'reading': '150.003 kg', 'error': '+3.0 g', 'mpe': '±5.0 g', 'result': 'PASS'},
        ])

        # Create inspection record
        InspectionObservation.objects.update_or_create(
            application=app,
            defaults={
                'inspection_date': today,
                'standards_used': request.data.get('standards', 'Working Class Standards M1/F1'),
                'mpe_tolerance': request.data.get('mpe', '± 5.0 g'),
                'max_observed_error': request.data.get('error', '+ 2.0 g'),
                'seal_number': seal_number,
                'verdict': 'PASSED',
                'remarks': request.data.get('remarks', 'Instrument verified within permissible tolerance. Stamped with official seal.'),
                'raw_readings_json': raw_readings
            }
        )

        # Create certificate
        cert, _ = DigitalCertificate.objects.update_or_create(
            application=app,
            defaults={
                'certificate_number': cert_number,
                'applicant_name': app.applicant_name,
                'business_name': app.business_name,
                'gstin': app.gstin,
                'premises_address': app.premises_address,
                'instrument_type': app.instrument_type,
                'instrument_class': app.accuracy_class,
                'manufacturer': app.manufacturer,
                'model_number': app.model_number,
                'serial_number': app.serial_number,
                'capacity': app.capacity,
                'verification_date': today,
                'expiry_date': expiry,
                'verifying_officer': request.data.get('inspector', 'Ramesh varma'),
                'seal_number': seal_number,
                'fee_paid': f"₹ {app.statutory_fee}",
                'security_hash': uuid.uuid4().hex
            }
        )

        app.status = ApplicationStatus.CERT_GENERATED
        app.save()

        ApplicationTimelineEvent.objects.create(
            application=app,
            stage='Certificate Generated',
            title='Digital Certificate Form V Issued',
            description=f"Official certificate {cert_number} issued with security seal {seal_number}.",
            actor='Controller of Legal Metrology'
        )

        return Response({
            'application': VerificationApplicationSerializer(app).data,
            'certificate': DigitalCertificateSerializer(cert).data
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        app = self.get_object()
        reason = request.data.get('reason', 'Instrument exceeds Maximum Permissible Error tolerance.')
        app.status = ApplicationStatus.REJECTED
        app.rejection_reason = reason
        app.save()

        ApplicationTimelineEvent.objects.create(
            application=app,
            stage='Rejected',
            title='Verification Rejected',
            description=f"Statutory rejection notice issued. Reason: {reason}",
            actor='Legal Metrology Officer'
        )
        return Response(VerificationApplicationSerializer(app).data)

class DigitalCertificateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DigitalCertificate.objects.all().order_by('-verification_date')
    serializer_class = DigitalCertificateSerializer

    def get_queryset(self):
        qs = DigitalCertificate.objects.all().order_by('-verification_date')
        email = self.request.query_params.get('email')
        if email:
            qs = qs.filter(application__email__iexact=email.strip())
        return qs

    def get_object(self):
        lookup = self.kwargs.get('pk')
        try:
            return self.queryset.get(pk=int(lookup))
        except (ValueError, DigitalCertificate.DoesNotExist):
            return self.queryset.get(certificate_number__iexact=lookup)

    @action(detail=False, methods=['get'])
    def verify_authenticity(self, request):
        cert_num = request.query_params.get('cert', '')
        try:
            cert = DigitalCertificate.objects.get(certificate_number__iexact=cert_num)
            return Response(DigitalCertificateSerializer(cert).data)
        except DigitalCertificate.DoesNotExist:
            return Response({'error': 'Certificate not found in central registry'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['get'])
    def expiry_alerts(self, request):
        today = timezone.now().date()
        certs = DigitalCertificate.objects.all()

        urgent = []
        warning = []
        reminder = []
        expired = []
        valid = []

        for c in certs:
            data = DigitalCertificateSerializer(c).data
            days = (c.expiry_date - today).days
            data['days'] = days

            if days < 0:
                expired.append(data)
            elif days <= 7:
                urgent.append(data)
            elif days <= 15:
                warning.append(data)
            elif days <= 30:
                reminder.append(data)
            else:
                valid.append(data)

        return Response({
            'urgent': urgent,
            'warning': warning,
            'reminder': reminder,
            'expired': expired,
            'valid': valid,
            'totalActionRequired': len(urgent) + len(warning) + len(expired),
            'allExpiringSoon': expired + urgent + warning + reminder
        })

@api_view(['GET'])
def dashboard_analytics(request):
    total_apps = VerificationApplication.objects.count()
    total_certs = DigitalCertificate.objects.count()
    under_review = VerificationApplication.objects.filter(
        status__in=[ApplicationStatus.SUBMITTED, ApplicationStatus.UNDER_REVIEW]
    ).count()
    scheduled = VerificationApplication.objects.filter(status=ApplicationStatus.SCHEDULED).count()
    returned = VerificationApplication.objects.filter(status=ApplicationStatus.RETURNED).count()
    
    today = timezone.now().date()
    expired_certs = DigitalCertificate.objects.filter(expiry_date__lt=today).count()
    expiring_soon = DigitalCertificate.objects.filter(
        expiry_date__gte=today, 
        expiry_date__lte=today + timedelta(days=30)
    ).count()

    monthly_trajectory = [
        {'month': 'Apr', 'initialVerifications': 140, 'renewals': 320},
        {'month': 'May', 'initialVerifications': 180, 'renewals': 390},
        {'month': 'Jun', 'initialVerifications': 210, 'renewals': 440},
        {'month': 'Jul', 'initialVerifications': 260, 'renewals': 510},
        {'month': 'Aug', 'initialVerifications': 290, 'renewals': 580},
        {'month': 'Sep', 'initialVerifications': 340, 'renewals': 620},
    ]

    category_distribution = [
        {'name': 'Electronic Platform Scales', 'value': 45, 'color': '#0f766e'},
        {'name': 'Heavy Commercial Weighbridges', 'value': 20, 'color': '#0284c7'},
        {'name': 'Fuel Dispensers & Flowmeters', 'value': 18, 'color': '#eab308'},
        {'name': 'Laboratory Precision Balances', 'value': 12, 'color': '#8b5cf6'},
        {'name': 'Counter & Steelyard Scales', 'value': 5, 'color': '#f43f5e'},
    ]

    district_compliance = [
        {'district': 'Ernakulam', 'compliance': 97.5},
        {'district': 'Thiruvananthapuram', 'compliance': 96.7},
        {'district': 'Kozhikode', 'compliance': 96.7},
        {'district': 'Thrissur', 'compliance': 97.0},
        {'district': 'Kannur', 'compliance': 95.9},
    ]

    return Response({
        'totalApplications': total_apps,
        'totalCertificates': total_certs,
        'underReview': under_review,
        'scheduled': scheduled,
        'returned': returned,
        'expiredCertificates': expired_certs,
        'expiringSoon': expiring_soon,
        'monthlyTrajectory': monthly_trajectory,
        'categoryDistribution': category_distribution,
        'districtCompliance': district_compliance
    })

@api_view(['GET'])
def verification_history(request):
    apps = VerificationApplication.objects.all().order_by('-submitted_at')
    records = []
    for app in apps:
        cert = getattr(app, 'digital_certificate', None)
        inspection = getattr(app, 'inspection_record', None)
        records.append({
            'applicationId': app.application_id,
            'applicantName': app.applicant_name,
            'businessName': app.business_name,
            'instrumentType': app.instrument_type,
            'serialNumber': app.serial_number,
            'capacity': app.capacity,
            'submittedDate': app.submitted_at.strftime('%Y-%m-%d'),
            'verificationDate': cert.verification_date.strftime('%Y-%m-%d') if cert else (inspection.inspection_date.strftime('%Y-%m-%d') if inspection else 'In Scrutiny'),
            'certificateNumber': cert.certificate_number if cert else None,
            'sealNumber': cert.seal_number if cert else (inspection.seal_number if inspection else None),
            'status': app.status,
            'result': 'FAILED / REJECTED' if app.status == ApplicationStatus.REJECTED else ('PASSED & CERTIFIED' if (cert or app.status == ApplicationStatus.APPROVED) else 'PENDING VERIFICATION'),
            'assignedOfficer': 'Officer S. Venkataraman'
        })
    return Response(records)
