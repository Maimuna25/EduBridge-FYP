from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework import status


class StudyInsightsTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="student",
            password="pass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_study_insights(self):
        response = self.client.get("/api/study-insights/")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("average_accuracy", response.data)
        self.assertIn("study_streak", response.data)