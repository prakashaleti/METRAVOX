from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from api.models import (
    VerificationApplication, 
    DigitalCertificate, 
    ApplicantProfile, 
    OfficerProfile, 
    ApplicationStatus
)

class MetravoxBackendTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create test profiles
        self.applicant = ApplicantProfile.objects.create(
            full_name='Test Applicant',
            business_name='Test Mills Ltd',
            gstin='32TEST1234F1Z9',
            email='test@testmills.in',
            phone='+91 99999 11111',
            address='Industrial Estate, Kochi',
            district='Ernakulam',
            pincode='682001'
        )

        self.officer = OfficerProfile.objects.create(
            officer_name='Inspector Testing',
            badge_number='LMO-TEST-001',
            jurisdiction_zone='Zone 1',
            district='Ernakulam',
            phone='+91 98888 22222',
            email='officer.test@gov.in'
        )

        # Create base test application
        self.app = VerificationApplication.objects.create(
            application_id='MV-TEST-001',
            applicant=self.applicant,
            applicant_name='Test Applicant',
            business_name='Test Mills Ltd',
            gstin='32TEST1234F1Z9',
            email='test@testmills.in',
            phone='+91 99999 11111',
            premises_address='Industrial Estate, Kochi',
            district='Ernakulam',
            instrument_category='Electronic Weighing Scales',
            instrument_type='Class III Platform Scale',
            accuracy_class='Class III',
            capacity='150 kg',
            manufacturer='Essae',
            model_number='DS-215',
            serial_number='SN-TEST-8812',
            status=ApplicationStatus.SUBMITTED,
            statutory_fee=850.00
        )

    def test_application_list(self):
        """Test retrieving list of applications"""
        response = self.client.get('/api/v1/applications/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Check that our test application is in results
        results = response.data.get('results', response.data)
        self.assertTrue(len(results) >= 1)
        self.assertEqual(results[0]['applicationId'], 'MV-TEST-001')

    def test_application_create(self):
        """Test submitting a new verification application"""
        payload = {
            'applicantName': 'Ramesh Nair',
            'businessName': 'Kochi Spices Export Corp',
            'gstin': '32KOCHI9988G1Z5',
            'email': 'ramesh@spices.in',
            'phone': '+91 94444 33333',
            'premises_address': 'Spices Park, Puthencruz',
            'district': 'Ernakulam',
            'instrumentType': 'Commercial Checkweigher',
            'instrumentCategory': 'Electronic Weighing Scales',
            'instrumentClass': 'Class III',
            'capacity': '30 kg (e = 5 g)',
            'manufacturer': 'Eagle Scales',
            'modelNumber': 'ACS-30',
            'serialNumber': 'EG-2026-9901',
            'feeAmount': 600.00
        }
        response = self.client.post('/api/v1/applications/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue('applicationId' in response.data)
        self.assertEqual(response.data['status'], ApplicationStatus.SUBMITTED)

    def test_application_detail_by_custom_id(self):
        """Test fetching application by custom string Application ID (e.g. MV-TEST-001)"""
        response = self.client.get('/api/v1/applications/MV-TEST-001/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['applicationId'], 'MV-TEST-001')
        self.assertEqual(response.data['serialNumber'], 'SN-TEST-8812')

    def test_officer_return_for_correction(self):
        """Test officer returning application for correction"""
        response = self.client.post(
            '/api/v1/applications/MV-TEST-001/return_for_correction/',
            {'reason': 'Please attach valid Model Approval certificate.'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, ApplicationStatus.RETURNED)
        self.assertIn('Model Approval', self.app.return_reason)

    def test_applicant_resubmit(self):
        """Test applicant resubmitting corrected application"""
        # First return it
        self.app.status = ApplicationStatus.RETURNED
        self.app.save()

        response = self.client.post(
            '/api/v1/applications/MV-TEST-001/resubmit/',
            {'notes': 'Uploaded Section 22 certificate as requested.'},
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, ApplicationStatus.UNDER_REVIEW)

    def test_officer_schedule_inspection(self):
        """Test scheduling verification inspection"""
        response = self.client.post(
            '/api/v1/applications/MV-TEST-001/schedule_inspection/',
            {
                'date': '2026-09-20',
                'slot': '11:00 AM - 01:00 PM',
                'venue': 'Trader Warehouse Bay 2',
                'instructions': 'Keep test platform clean.'
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, ApplicationStatus.SCHEDULED)
        self.assertEqual(str(self.app.scheduled_date), '2026-09-20')

    def test_record_inspection_and_approve_generates_certificate(self):
        """Test recording observations and approving -> generates Form V certificate"""
        response = self.client.post(
            '/api/v1/applications/MV-TEST-001/record_inspection_and_approve/',
            {
                'seal_number': 'KL-07-SEAL-TEST-99',
                'standards': 'F1 Calibrated Weights',
                'mpe': '±5.0 g',
                'error': '+1.2 g',
                'remarks': 'Satisfies General Rules 2011.',
                'tests': [
                    {'load': '10 kg', 'reading': '10.000 kg', 'error': '0.0 g', 'mpe': '±2.5 g', 'result': 'PASS'}
                ]
            },
            format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app.refresh_from_db()
        self.assertEqual(self.app.status, ApplicationStatus.CERT_GENERATED)

        # Check certificate generated
        cert = DigitalCertificate.objects.get(application=self.app)
        self.assertTrue(cert.certificate_number.startswith('CERT-LM-'))
        self.assertEqual(cert.seal_number, 'KL-07-SEAL-TEST-99')

    def test_certificate_authenticity_verification(self):
        """Test public QR verification endpoint"""
        today = timezone.now().date()
        cert = DigitalCertificate.objects.create(
            certificate_number='CERT-TEST-999',
            application=self.app,
            applicant_name='Test Applicant',
            business_name='Test Mills',
            gstin='32TEST',
            premises_address='Kochi',
            instrument_type='Scale',
            instrument_class='Class III',
            manufacturer='Essae',
            model_number='DS',
            serial_number='SN-123',
            capacity='150 kg',
            verification_date=today,
            expiry_date=today + timedelta(days=365),
            seal_number='SEAL-99',
            fee_paid='850'
        )

        response = self.client.get('/api/v1/certificates/verify_authenticity/?cert=CERT-TEST-999')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['certificateNumber'], 'CERT-TEST-999')

    def test_expiry_alerts_calculation(self):
        """Test dynamic calculation of expiry alerts across all severity tiers"""
        today = timezone.now().date()

        # Create 1 expired, 1 urgent (5d), 1 warning (12d), 1 reminder (25d)
        DigitalCertificate.objects.create(
            certificate_number='CERT-EXP-01',
            applicant_name='A', business_name='B', gstin='C', premises_address='D',
            instrument_type='T1', instrument_class='C1', manufacturer='M', model_number='MD',
            serial_number='SN1', capacity='10kg',
            verification_date=today - timedelta(days=370),
            expiry_date=today - timedelta(days=5),
            seal_number='S1', fee_paid='100'
        )
        DigitalCertificate.objects.create(
            certificate_number='CERT-URG-01',
            applicant_name='A', business_name='B', gstin='C', premises_address='D',
            instrument_type='T2', instrument_class='C1', manufacturer='M', model_number='MD',
            serial_number='SN2', capacity='10kg',
            verification_date=today - timedelta(days=360),
            expiry_date=today + timedelta(days=4),
            seal_number='S2', fee_paid='100'
        )
        DigitalCertificate.objects.create(
            certificate_number='CERT-WARN-01',
            applicant_name='A', business_name='B', gstin='C', premises_address='D',
            instrument_type='T3', instrument_class='C1', manufacturer='M', model_number='MD',
            serial_number='SN3', capacity='10kg',
            verification_date=today - timedelta(days=350),
            expiry_date=today + timedelta(days=12),
            seal_number='S3', fee_paid='100'
        )
        DigitalCertificate.objects.create(
            certificate_number='CERT-REM-01',
            applicant_name='A', business_name='B', gstin='C', premises_address='D',
            instrument_type='T4', instrument_class='C1', manufacturer='M', model_number='MD',
            serial_number='SN4', capacity='10kg',
            verification_date=today - timedelta(days=340),
            expiry_date=today + timedelta(days=25),
            seal_number='S4', fee_paid='100'
        )

        response = self.client.get('/api/v1/certificates/expiry_alerts/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data['expired']) >= 1)
        self.assertTrue(len(response.data['urgent']) >= 1)
        self.assertTrue(len(response.data['warning']) >= 1)
        self.assertTrue(len(response.data['reminder']) >= 1)

    def test_dashboard_analytics_endpoint(self):
        """Test aggregate analytics endpoint"""
        response = self.client.get('/api/v1/analytics/stats/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('totalApplications', response.data)
        self.assertIn('monthlyTrajectory', response.data)
        self.assertIn('categoryDistribution', response.data)

    def test_verification_history_endpoint(self):
        """Test centralized audit log endpoint"""
        response = self.client.get('/api/v1/history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        self.assertEqual(response.data[0]['applicationId'], 'MV-TEST-001')
