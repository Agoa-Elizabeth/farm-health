from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Report, Advisory
from .disease_engine import analyze_symptoms
from .advisory_engine import generate_advisory

User = get_user_model()


class DiseaseEngineTests(TestCase):
    def test_banana_bacterial_wilt_detection(self):
        symptoms = {
            'yellowing_of_leaves': True,
            'wilting_of_leaves': True,
            'splitting_of_pseudostem': True,
            'premature_ripening_of_fruits': True,
        }
        disease_key, name, desc, severity, conf = analyze_symptoms('banana', symptoms)
        self.assertEqual(disease_key, 'banana_bacterial_wilt')
        self.assertIn(severity, ['high', 'critical'])

    def test_coffee_leaf_rust_detection(self):
        symptoms = {
            'yellow_leaf_spots': True,
            'orange_powder_on_leaf_underside': True,
            'leaf_drop': True,
        }
        disease_key, name, desc, severity, conf = analyze_symptoms('coffee', symptoms)
        self.assertEqual(disease_key, 'coffee_leaf_rust')

    def test_no_disease_detected(self):
        symptoms = {'stunted_growth': True}
        disease_key, name, desc, severity, conf = analyze_symptoms('banana', symptoms)
        self.assertIsNone(disease_key)

    def test_generate_advisory(self):
        advisory = generate_advisory('banana_bacterial_wilt', 'high')
        self.assertIsNotNone(advisory)
        self.assertIn('treatment', advisory)
        self.assertIn('prevention', advisory)
        self.assertIn('best_practices', advisory)
        self.assertEqual(advisory['disease_name'], 'Banana Bacterial Wilt')


class ReportAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='farmer@test.com',
            email='farmer@test.com',
            password='testpass123',
            phone_number='+256700000002',
            role='farmer',
        )
        login_res = self.client.post('/api/auth/login/', {
            'username': 'farmer@test.com',
            'password': 'testpass123',
        }, format='json')
        self.token = login_res.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token}')

    def test_create_report(self):
        data = {
            'farmer_name': 'Test Farmer',
            'contact_info': '+256700000002',
            'location': 'Bushenyi',
            'crop_type': 'banana',
            'symptoms': {
                'yellowing_of_leaves': True,
                'wilting_of_leaves': True,
                'splitting_of_pseudostem': True,
            },
            'comments': 'Wilting observed',
        }
        res = self.client.post('/api/reports/', data, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertIsNotNone(res.data['disease'])

    def test_list_my_reports(self):
        Report.objects.create(
            user=self.user, farmer_name='TF', contact_info='+256700000002',
            location='Bushenyi', crop_type='banana', symptoms={'stunted_growth': True},
        )
        res = self.client.get('/api/reports/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data['results']), 1)

    def test_report_has_advisory(self):
        data = {
            'farmer_name': 'Test Farmer',
            'contact_info': '+256700000002',
            'location': 'Bushenyi',
            'crop_type': 'coffee',
            'symptoms': {
                'yellow_leaf_spots': True,
                'orange_powder_on_leaf_underside': True,
            },
        }
        res = self.client.post('/api/reports/', data, format='json')
        report_id = res.data['id']
        adv_res = self.client.get(f'/api/reports/{report_id}/advisory/')
        self.assertEqual(adv_res.status_code, status.HTTP_200_OK)
        self.assertIn('treatment', adv_res.data)
