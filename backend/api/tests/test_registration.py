from rest_framework.test import APITestCase
from rest_framework import status


class RegistrationTests(APITestCase):

    def test_user_registration(self):
        response = self.client.post("/api/user/register/", {
            "username": "testuser",
            "password": "testpass123",
            "email": "test@example.com"
        })

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("message", response.data)