from rest_framework.test import APITestCase
from django.contrib.auth.models import User
from rest_framework import status


class QuizTests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            username="quizuser",
            password="pass123"
        )
        self.client.force_authenticate(user=self.user)

    def test_quiz_submission(self):
        response = self.client.post("/api/quizzes/submit/", {
            "answers": [1, 2, 3]
        })

        self.assertIn(response.status_code, [
            status.HTTP_200_OK,
            status.HTTP_400_BAD_REQUEST
        ])