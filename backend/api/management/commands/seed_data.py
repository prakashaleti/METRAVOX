from django.core.management import call_command
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Seeds only the 3 designated personas (prakash, Ramesh varma, Rohith) with clean application records'

    def handle(self, *args, **kwargs):
        call_command('clean_and_init_users')
