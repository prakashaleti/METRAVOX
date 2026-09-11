from rest_framework import serializers
from .models import (
    ApplicantProfile, 
    OfficerProfile, 
    VerificationApplication, 
    ApplicationDocument, 
    ApplicationTimelineEvent, 
    InspectionObservation, 
    DigitalCertificate
)

class ApplicationDocumentSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='document_name', read_only=True)
    size = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationDocument
        fields = ['id', 'document_name', 'name', 'size', 'uploaded_at']

    def get_size(self, obj):
        return '1.4 MB'

class ApplicationTimelineEventSerializer(serializers.ModelSerializer):
    date = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = ApplicationTimelineEvent
        fields = ['stage', 'title', 'description', 'actor', 'date', 'status', 'timestamp']

    def get_date(self, obj):
        return obj.timestamp.strftime('%Y-%m-%d %I:%M %p')

    def get_status(self, obj):
        return 'completed'

class InspectionObservationSerializer(serializers.ModelSerializer):
    tests = serializers.SerializerMethodField()
    inspectionDate = serializers.DateField(source='inspection_date', read_only=True)
    mpeTolerance = serializers.CharField(source='mpe_tolerance', read_only=True)
    maxObservedError = serializers.CharField(source='max_observed_error', read_only=True)
    sealNumber = serializers.CharField(source='seal_number', read_only=True)

    class Meta:
        model = InspectionObservation
        fields = [
            'id', 'inspector', 'inspection_date', 'inspectionDate', 
            'standards_used', 'mpe_tolerance', 'mpeTolerance',
            'max_observed_error', 'maxObservedError', 
            'seal_number', 'sealNumber', 'verdict', 'remarks', 'tests'
        ]

    def get_tests(self, obj):
        if obj.raw_readings_json:
            return obj.raw_readings_json
        return [
            {'load': '10 kg', 'reading': '10.000 kg', 'error': '0.0 g', 'mpe': '±2.5 g', 'result': 'PASS'},
            {'load': '50 kg', 'reading': '50.002 kg', 'error': '+2.0 g', 'mpe': '±5.0 g', 'result': 'PASS'},
            {'load': '150 kg', 'reading': '150.003 kg', 'error': '+3.0 g', 'mpe': '±5.0 g', 'result': 'PASS'},
        ]

class DigitalCertificateSerializer(serializers.ModelSerializer):
    certificateNumber = serializers.CharField(source='certificate_number', read_only=True)
    applicationId = serializers.SerializerMethodField()
    applicantName = serializers.CharField(source='applicant_name', read_only=True)
    businessName = serializers.CharField(source='business_name', read_only=True)
    premisesAddress = serializers.CharField(source='premises_address', read_only=True)
    instrumentType = serializers.CharField(source='instrument_type', read_only=True)
    instrumentClass = serializers.CharField(source='instrument_class', read_only=True)
    modelNumber = serializers.CharField(source='model_number', read_only=True)
    serialNumber = serializers.CharField(source='serial_number', read_only=True)
    verificationDate = serializers.DateField(source='verification_date', read_only=True)
    expiryDate = serializers.DateField(source='expiry_date', read_only=True)
    issuingAuthority = serializers.CharField(source='issuing_authority', read_only=True)
    verifyingOfficer = serializers.CharField(source='verifying_officer', read_only=True)
    officerDesignation = serializers.CharField(source='officer_designation', read_only=True)
    sealNumber = serializers.CharField(source='seal_number', read_only=True)
    feePaid = serializers.CharField(source='fee_paid', read_only=True)
    securityHash = serializers.CharField(source='security_hash', read_only=True)
    remainingDays = serializers.IntegerField(source='remaining_days', read_only=True)

    class Meta:
        model = DigitalCertificate
        fields = [
            'id', 'certificate_number', 'certificateNumber', 'applicationId',
            'applicant_name', 'applicantName', 'business_name', 'businessName',
            'gstin', 'premises_address', 'premisesAddress',
            'instrument_type', 'instrumentType', 'instrument_class', 'instrumentClass',
            'manufacturer', 'model_number', 'modelNumber', 'serial_number', 'serialNumber',
            'capacity', 'verification_date', 'verificationDate', 'expiry_date', 'expiryDate',
            'issuing_authority', 'issuingAuthority', 'verifying_officer', 'verifyingOfficer',
            'officer_designation', 'officerDesignation', 'seal_number', 'sealNumber',
            'fee_paid', 'feePaid', 'security_hash', 'securityHash', 'remaining_days', 'remainingDays'
        ]

    def get_applicationId(self, obj):
        return obj.application.application_id if obj.application else None

class VerificationApplicationSerializer(serializers.ModelSerializer):
    id = serializers.CharField(source='application_id', required=False)
    applicationId = serializers.CharField(source='application_id', read_only=True)
    applicantName = serializers.CharField(source='applicant_name')
    businessName = serializers.CharField(source='business_name')
    instrumentType = serializers.CharField(source='instrument_type')
    instrumentCategory = serializers.CharField(source='instrument_category', required=False)
    instrumentClass = serializers.CharField(source='accuracy_class', required=False)
    modelNumber = serializers.CharField(source='model_number', required=False)
    serialNumber = serializers.CharField(source='serial_number')
    yearOfManufacture = serializers.IntegerField(source='year_of_manufacture', required=False)
    verificationNature = serializers.CharField(source='verification_nature', required=False)
    inspectionVenue = serializers.CharField(source='inspection_venue', required=False)
    submittedAt = serializers.SerializerMethodField()
    feeAmount = serializers.DecimalField(source='statutory_fee', max_digits=10, decimal_places=2, required=False)
    feeStatus = serializers.CharField(source='fee_status', required=False)
    assignedOfficer = serializers.SerializerMethodField()
    scheduledDate = serializers.DateField(source='scheduled_date', required=False, allow_null=True)
    scheduledSlot = serializers.CharField(source='scheduled_slot', required=False, allow_null=True, allow_blank=True)
    returnReason = serializers.CharField(source='return_reason', required=False, allow_null=True, allow_blank=True)
    returnedAt = serializers.DateTimeField(source='returned_at', required=False, allow_null=True)
    certificateId = serializers.SerializerMethodField()
    timeline = serializers.SerializerMethodField()
    documents = serializers.SerializerMethodField()
    inspectionData = serializers.SerializerMethodField()

    class Meta:
        model = VerificationApplication
        fields = [
            'id', 'applicationId', 'application_id',
            'applicant_name', 'applicantName', 'business_name', 'businessName',
            'gstin', 'email', 'phone', 'premises_address', 'district',
            'instrument_category', 'instrumentCategory', 'instrument_type', 'instrumentType',
            'accuracy_class', 'instrumentClass', 'capacity', 'manufacturer',
            'model_number', 'modelNumber', 'serial_number', 'serialNumber',
            'year_of_manufacture', 'yearOfManufacture', 'verification_nature', 'verificationNature',
            'inspection_venue', 'inspectionVenue', 'status', 'submittedAt',
            'statutory_fee', 'feeAmount', 'fee_status', 'feeStatus',
            'assignedOfficer', 'scheduled_date', 'scheduledDate', 'scheduled_slot', 'scheduledSlot',
            'return_reason', 'returnReason', 'returned_at', 'returnedAt',
            'certificateId', 'timeline', 'documents', 'inspectionData'
        ]
        extra_kwargs = {
            'application_id': {'required': False},
            'applicant_name': {'required': False},
            'business_name': {'required': False},
            'instrument_type': {'required': False},
            'serial_number': {'required': False},
            'accuracy_class': {'required': False},
            'instrument_category': {'required': False},
            'model_number': {'required': False},
            'premises_address': {'required': False},
        }

    def to_internal_value(self, data):
        # Map camelCase to snake_case for incoming write requests
        import uuid
        mapping = {
            'applicantName': 'applicant_name',
            'businessName': 'business_name',
            'instrumentType': 'instrument_type',
            'instrumentCategory': 'instrument_category',
            'instrumentClass': 'accuracy_class',
            'modelNumber': 'model_number',
            'serialNumber': 'serial_number',
            'yearOfManufacture': 'year_of_manufacture',
            'verificationNature': 'verification_nature',
            'inspectionVenue': 'inspection_venue',
            'feeAmount': 'statutory_fee',
            'feeStatus': 'fee_status',
            'scheduledDate': 'scheduled_date',
            'scheduledSlot': 'scheduled_slot',
            'returnReason': 'return_reason',
            'applicationId': 'application_id',
            'address': 'premises_address',
        }
        mutable_data = dict(data)
        for camel, snake in mapping.items():
            if camel in mutable_data and snake not in mutable_data:
                mutable_data[snake] = mutable_data[camel]

        if 'application_id' not in mutable_data:
            from django.utils import timezone
            mutable_data['application_id'] = f"MV-{timezone.now().year}-{uuid.uuid4().hex[:4].upper()}"

        if 'premises_address' not in mutable_data and 'address' in mutable_data:
            mutable_data['premises_address'] = mutable_data['address']

        return super().to_internal_value(mutable_data)

    def get_submittedAt(self, obj):
        return obj.submitted_at.strftime('%Y-%m-%d') if obj.submitted_at else None

    def get_assignedOfficer(self, obj):
        if obj.assigned_officer:
            return f"{obj.assigned_officer.officer_name} ({obj.assigned_officer.designation})"
        return 'S. Venkataraman (Senior LMO)'

    def get_certificateId(self, obj):
        if hasattr(obj, 'digital_certificate'):
            return obj.digital_certificate.certificate_number
        return None

    def get_documents(self, obj):
        docs = obj.documents.all()
        if docs.exists():
            return [{'name': d.document_name, 'size': '1.4 MB', 'type': 'application/pdf'} for d in docs]
        return [
            {'name': 'Model_Approval_Cert.pdf', 'size': '1.4 MB', 'type': 'application/pdf'},
            {'name': 'Purchase_Tax_Invoice.pdf', 'size': '820 KB', 'type': 'application/pdf'},
        ]

    def get_timeline(self, obj):
        events = obj.timeline_events.all().order_by('timestamp')
        if events.exists():
            res = []
            for ev in events:
                res.append({
                    'stage': ev.stage,
                    'title': ev.title,
                    'description': ev.description,
                    'actor': ev.actor,
                    'date': ev.timestamp.strftime('%Y-%m-%d %I:%M %p'),
                    'status': 'completed' if ev.stage != obj.status else 'current'
                })
            return res

        # Fallback default stages
        return [
            {
                'stage': 'Application Submitted',
                'title': 'Application Lodged Online',
                'description': 'Statutory application lodged and fee confirmed.',
                'actor': obj.applicant_name,
                'date': obj.submitted_at.strftime('%Y-%m-%d %I:%M %p') if obj.submitted_at else 'Submitted',
                'status': 'completed'
            },
            {
                'stage': 'Under Review',
                'title': 'Document Scrutiny',
                'description': 'Under scrutiny by Legal Metrology Inspectorate.',
                'actor': 'Officer S. Venkataraman',
                'date': 'In Progress',
                'status': 'current' if obj.status == 'Under Review' else 'upcoming'
            },
            {
                'stage': 'Verification Scheduled',
                'title': 'Inspection Date Allocated',
                'description': f"Scheduled for {obj.scheduled_date} ({obj.scheduled_slot})" if obj.scheduled_date else 'Pending allocation',
                'actor': 'Officer S. Venkataraman',
                'date': str(obj.scheduled_date) if obj.scheduled_date else 'Pending',
                'status': 'current' if obj.status == 'Verification Scheduled' else 'upcoming'
            },
            {
                'stage': 'Verification / Inspection',
                'title': 'Field Verification & Stamping',
                'description': 'Testing against working standards and error determination.',
                'actor': 'Officer',
                'date': 'Pending',
                'status': 'upcoming'
            },
            {
                'stage': 'Certificate Generated',
                'title': 'Digital Verification Certificate',
                'description': 'Issue of Form V Certificate upon passing MPE tolerances.',
                'actor': 'System',
                'date': 'Pending',
                'status': 'completed' if obj.status == 'Certificate Generated' else 'upcoming'
            }
        ]

    def get_inspectionData(self, obj):
        if hasattr(obj, 'inspection_record'):
            rec = obj.inspection_record
            return {
                'inspector': rec.inspector.officer_name if rec.inspector else 'S. Venkataraman',
                'inspectorDesignation': 'Senior Legal Metrology Officer',
                'inspectionDate': str(rec.inspection_date),
                'testStandardUsed': rec.standards_used,
                'mpeTolerance': rec.mpe_tolerance,
                'maxObservedError': rec.max_observed_error,
                'sealNumber': rec.seal_number,
                'verdict': rec.verdict,
                'remarks': rec.remarks,
                'tests': rec.raw_readings_json or [
                    {'load': '10 kg', 'reading': '10.000 kg', 'error': '0.0 g', 'mpe': '±2.5 g', 'result': 'PASS'},
                    {'load': '50 kg', 'reading': '50.002 kg', 'error': '+2.0 g', 'mpe': '±5.0 g', 'result': 'PASS'},
                    {'load': '150 kg', 'reading': '150.003 kg', 'error': '+3.0 g', 'mpe': '±5.0 g', 'result': 'PASS'},
                ]
            }
        return None
