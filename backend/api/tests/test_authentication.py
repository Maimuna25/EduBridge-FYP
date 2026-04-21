from rest_framework.test import APITestCase
from rest_framework import status


class AuthenticationTests(APITestCase):

    def test_insights_requires_auth(self):
        response = self.client.get("/api/study-insights/")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)