from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from api.models import ApplicantProfile, OfficerProfile

class Command(BaseCommand):
    help = 'Ensures default administrative, officer, and applicant accounts exist without wiping database'

    def handle(self, *args, **kwargs):
        # 1. Applicant: prakash
        user_prakash, created = User.objects.get_or_create(
            username='prakash',
            defaults={
                'email': 'prakash01.aleti@gmail.com',
                'first_name': 'prakash'
            }
        )
        if created:
            user_prakash.set_password('Applicant@2026')
            user_prakash.save()
        ApplicantProfile.objects.get_or_create(
            user=user_prakash,
            defaults={
                'full_name': 'prakash',
                'business_name': 'Prakash Industrial & Trade Enterprises',
                'gstin': '32AABCP9871F1Z2',
                'email': 'prakash01.aleti@gmail.com',
                'phone': '+91 98470 12345',
                'address': 'Plot 14-B, Industrial Development Area, Kalamassery',
                'district': 'Ernakulam',
                'state': 'Kerala',
                'pincode': '683109'
            }
        )

        # 2. Officer: Ramesh varma
        user_ramesh, created = User.objects.get_or_create(
            username='officer_ramesh',
            defaults={
                'email': 'ramesh.varma.lmo@gov.in',
                'first_name': 'Ramesh',
                'last_name': 'varma'
            }
        )
        if created:
            user_ramesh.set_password('Officer@2026')
            user_ramesh.save()
        OfficerProfile.objects.get_or_create(
            user=user_ramesh,
            defaults={
                'officer_name': 'Ramesh varma',
                'designation': 'Senior Legal Metrology Officer',
                'badge_number': 'LMO-KL-2026-RV',
                'jurisdiction_zone': 'Ernakulam Central Zone 04',
                'district': 'Ernakulam',
                'phone': '+91 94470 55102',
                'email': 'ramesh.varma.lmo@gov.in'
            }
        )

        # 3. Admin: Rohith
        user_rohith, created = User.objects.get_or_create(
            username='admin_rohith',
            defaults={
                'email': 'rohith.admin@gov.in',
                'first_name': 'Rohith',
                'is_staff': True,
                'is_superuser': True
            }
        )
        if created:
            user_rohith.set_password('Admin@2026')
            user_rohith.save()

        self.stdout.write(self.style.SUCCESS('METRAVOX initial users verified successfully.'))
