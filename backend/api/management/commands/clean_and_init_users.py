from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import (
    ApplicantProfile, 
    OfficerProfile, 
    VerificationApplication, 
    DigitalCertificate, 
    InspectionObservation, 
    ApplicationTimelineEvent, 
    ApplicationDocument
)

class Command(BaseCommand):
    help = 'Cleans all default applications and data records, and provisions prakash, Ramesh varma, and Rohith'

    def handle(self, *args, **kwargs):
        self.stdout.write('Clearing all default applications and operational data...')
        
        # 1. Delete all transactional verification records
        doc_count = ApplicationDocument.objects.all().delete()[0]
        obs_count = InspectionObservation.objects.all().delete()[0]
        event_count = ApplicationTimelineEvent.objects.all().delete()[0]
        cert_count = DigitalCertificate.objects.all().delete()[0]
        app_count = VerificationApplication.objects.all().delete()[0]
        
        self.stdout.write(f'Deleted {app_count} applications, {cert_count} certificates, {obs_count} inspections, {event_count} timeline events, {doc_count} documents.')

        # 2. Reset Profiles & Users
        ApplicantProfile.objects.all().delete()
        OfficerProfile.objects.all().delete()
        User.objects.all().delete()

        # 3. Create the 3 exact personas requested:
        # A) User (Consumer / Applicant): prakash
        user_prakash = User.objects.create(
            username='prakash',
            email='prakash01.aleti@gmail.com',
            first_name='prakash',
            last_name=''
        )
        user_prakash.set_password('Applicant@2026')
        user_prakash.save()

        ApplicantProfile.objects.create(
            user=user_prakash,
            full_name='prakash',
            business_name='Prakash Industrial & Trade Enterprises',
            gstin='32AABCP9871F1Z2',
            email='prakash01.aleti@gmail.com',
            phone='+91 98470 12345',
            address='Plot 14-B, Industrial Development Area, Kalamassery',
            district='Ernakulam',
            state='Kerala',
            pincode='683109'
        )
        self.stdout.write(self.style.SUCCESS('Created User: prakash (prakash01.aleti@gmail.com)'))

        # B) Legal Metrology Officer: Ramesh varma
        user_ramesh = User.objects.create(
            username='officer_ramesh',
            email='ramesh.varma.lmo@gov.in',
            first_name='Ramesh',
            last_name='varma'
        )
        user_ramesh.set_password('Officer@2026')
        user_ramesh.save()

        OfficerProfile.objects.create(
            user=user_ramesh,
            officer_name='Ramesh varma',
            designation='Senior Legal Metrology Officer',
            badge_number='LMO-KL-2026-RV',
            jurisdiction_zone='Ernakulam Central Zone 04',
            district='Ernakulam',
            phone='+91 94470 55102',
            email='ramesh.varma.lmo@gov.in'
        )
        self.stdout.write(self.style.SUCCESS('Created Officer: Ramesh varma (ramesh.varma.lmo@gov.in)'))

        # C) Administrator: Rohith
        user_rohith = User.objects.create(
            username='admin_rohith',
            email='rohith.admin@gov.in',
            first_name='Rohith',
            last_name='',
            is_staff=True,
            is_superuser=True
        )
        user_rohith.set_password('Admin@2026')
        user_rohith.save()
        self.stdout.write(self.style.SUCCESS('Created Admin: Rohith (rohith.admin@gov.in)'))

        self.stdout.write(self.style.SUCCESS(
            f'Clean slate complete! VerificationApplication count: {VerificationApplication.objects.count()}, DigitalCertificate count: {DigitalCertificate.objects.count()}'
        ))
