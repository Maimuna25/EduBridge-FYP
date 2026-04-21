from rest_framework.test import APITestCase
from rest_framework import status


class OfflineTests(APITestCase):

    def test_access_without_token(self):
        response = self.client.get("/api/user/")

        # Should block access when not authenticated
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)