from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from reports.models import Report, Advisory
from reports.disease_engine import analyze_symptoms
from reports.advisory_engine import generate_advisory

User = get_user_model()


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        if not User.objects.filter(username='admin@farm.com').exists():
            admin = User.objects.create_superuser(
                username='admin@farm.com',
                email='admin@farm.com',
                password='admin123',
                phone_number='+256700000000',
                role='admin',
            )
            admin.first_name = 'System'
            admin.last_name = 'Admin'
            admin.save()
            self.stdout.write(self.style.SUCCESS('Created admin user'))

        if not User.objects.filter(username='farmer@farm.com').exists():
            farmer = User.objects.create_user(
                username='farmer@farm.com',
                email='farmer@farm.com',
                password='farmer123',
                phone_number='+256711111111',
                role='farmer',
            )
            farmer.first_name = 'Test'
            farmer.last_name = 'Farmer'
            farmer.save()
            self.stdout.write(self.style.SUCCESS('Created test farmer'))

        farmer = User.objects.get(email='farmer@farm.com')

        sample_reports = [
            {
                'user': farmer, 'farmer_name': 'Test Farmer',
                'contact_info': '+256711111111', 'location': 'Bushenyi',
                'crop_type': 'banana',
                'symptoms': {
                    'yellowing_of_leaves': True, 'wilting_of_leaves': True,
                    'splitting_of_pseudostem': True,
                },
                'comments': 'Wilting observed in the last 2 weeks',
            },
            {
                'user': farmer, 'farmer_name': 'Test Farmer',
                'contact_info': '+256711111111', 'location': 'Mbarara',
                'crop_type': 'coffee',
                'symptoms': {
                    'orange_powder_on_leaf_underside': True,
                    'yellow_leaf_spots': True, 'leaf_drop': True,
                },
                'comments': 'Orange powder seen on lower leaves',
            },
            {
                'user': farmer, 'farmer_name': 'Test Farmer',
                'contact_info': '+256711111111', 'location': 'Fort Portal',
                'crop_type': 'banana',
                'symptoms': {
                    'black_spots_on_leaves': True, 'yellow_brown_leaf_streaks': True,
                    'drying_leaf_edges': True,
                },
                'comments': 'Black spots appearing on older leaves',
            },
        ]

        for data in sample_reports:
            report = Report.objects.create(**data)

            disease_key, disease_name, description, severity, confidence = analyze_symptoms(
                report.crop_type, report.symptoms
            )

            if disease_key:
                report.disease = disease_key
                report.severity = severity
                report.confidence = confidence
                report.save()

                advisory_data = generate_advisory(disease_key, severity)
                if advisory_data:
                    Advisory.objects.create(
                        report=report,
                        disease_name=advisory_data['disease_name'],
                        description=advisory_data['description'],
                        severity=severity,
                        treatment=advisory_data['treatment'],
                        prevention=advisory_data['prevention'],
                        best_practices=advisory_data['best_practices'],
                    )

        self.stdout.write(self.style.SUCCESS(f'Created {len(sample_reports)} sample reports'))
