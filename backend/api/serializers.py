from django.contrib.auth.models import User
from rest_framework import serializers

from .models import (
    Subject,
    Category,
    Topic,
    Slide,
    TopicProgress,
    Note,
    ExplainPrompt,
    ExplainAttempt,
    ChatSession,
    ChatMessage,
    LearningAnalytics,
    Quiz,
    Question,
    UserQuizAttempt,
    UserAnswer,
)

# User Serializer
# Handles registration + ser data
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "password","email"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    # Create secure hashed user
    def create(self, validated_data):
        return User.objects.create_user(**validated_data)


# Notes Serializer
class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ["id", "title", "content", "created_at", "author"]
        extra_kwargs = {
            "author": {"read_only": True}
        }


# Explain Feature Serializer
# Prompt shown to user
class ExplainPromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = ExplainPrompt
        fields = [
            "id",
            "subject",
            "topic",
            "difficulty",
            "title",
            "concept_text",
            "created_at",
        ]

# Stores user answer + AI feedback
class ExplainAttemptSerializer(serializers.ModelSerializer):
    prompt = ExplainPromptSerializer(read_only=True)
    prompt_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = ExplainAttempt
        fields = [
            "id",
            "prompt",
            "prompt_id",
            "user_explanation",
            "ai_feedback",
            "score",
            "performance_level",
            "created_at",
        ]

        read_only_fields = [
            "ai_feedback",
            "score",
            "performance_level",
            "created_at",
            "prompt",
        ]

    def create(self, validated_data):
        prompt_id = validated_data.pop("prompt_id")
        user = self.context["request"].user
        prompt = ExplainPrompt.objects.get(id=prompt_id)

        return ExplainAttempt.objects.create(
            user=user,
            prompt=prompt,
            **validated_data
        )


# Chat System
# Individual messages
class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "role",
            "content",
            "token_estimate",
            "created_at",
        ]
        read_only_fields = ["created_at"]

# Chat session with nested messages
class ChatSessionSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)

    class Meta:
        model = ChatSession
        fields = [
            "id",
            "subject",
            "topic",
            "learning_mode",
            "summary",
            "message_count",
            "created_at",
            "updated_at",
            "messages",
        ]
        read_only_fields = [
            "summary",
            "message_count",
            "created_at",
            "updated_at",
        ]


# Learning Analytics Serializer
class LearningAnalyticsSerializer(serializers.ModelSerializer):
    class Meta:
        model = LearningAnalytics
        fields = [
            "id",
            "subject",
            "topic",
            "total_sessions",
            "total_messages",
            "average_session_length",
            "struggling",
            "confidence_score",
            "last_activity",
        ]
        read_only_fields = fields


# Quiz System
# Quiz questions
class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = [
            "id",
            "question_text",
            "option_a",
            "option_b",
            "option_c",
            "option_d",
            "correct_option",
        ]

        # Hide answer from normal frontend users
        extra_kwargs = {
            "correct_option": {"write_only": True}
        }

# Quiz with nested questions
class QuizSerializer(serializers.ModelSerializer):

    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = [
            "id",
            "subject",
            "topic",
            "difficulty",
            "created_at",
            "questions",
        ]

# Stores selected answers
class UserAnswerSerializer(serializers.ModelSerializer):

    question = QuestionSerializer(read_only=True)
    question_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserAnswer
        fields = [
            "id",
            "question",
            "question_id",
            "selected_option",
            "is_correct",
        ]
        read_only_fields = ["is_correct", "question"]

    def create(self, validated_data):
        question_id = validated_data.pop("question_id")
        question = Question.objects.get(id=question_id)

        selected = validated_data["selected_option"]

        return UserAnswer.objects.create(
            question=question,
            is_correct=(selected == question.correct_option),
            **validated_data
        )

# Full quiz attempt
class UserQuizAttemptSerializer(serializers.ModelSerializer):

    quiz = QuizSerializer(read_only=True)
    quiz_id = serializers.IntegerField(write_only=True)

    answers = UserAnswerSerializer(many=True, read_only=True)

    class Meta:
        model = UserQuizAttempt
        fields = [
            "id",
            "quiz",
            "quiz_id",
            "score",
            "total_questions",
            "completed_at",
            "answers",
        ]
        read_only_fields = [
            "score",
            "total_questions",
            "completed_at",
            "quiz",
            "answers",
        ]

    def create(self, validated_data):
        quiz_id = validated_data.pop("quiz_id")
        quiz = Quiz.objects.get(id=quiz_id)
        user = self.context["request"].user

        return UserQuizAttempt.objects.create(
            user=user,
            quiz=quiz,
            total_questions=quiz.questions.count()
        )


# Subject / Category / Topic / Slide
# Individual learning slides
class SlideSerializer(serializers.ModelSerializer):
    class Meta:
        model = Slide
        fields = ["id", "content", "order", "topic"]

# Individual learning slides
class TopicSerializer(serializers.ModelSerializer):

    category = serializers.IntegerField(source="category.id", read_only=True)

    subject = serializers.CharField(
        source="category.subject.name",
        read_only=True
    )

    slides = SlideSerializer(many=True, read_only=True)

    class Meta:
        model = Topic
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "subject",
            "slides"
        ]

# Category with topics
class CategorySerializer(serializers.ModelSerializer):
    topics = TopicSerializer(many=True, read_only=True)

    class Meta:
        model = Category
        fields = [
            "id",
            "name",
            "slug",
            "subject",
            "level",
            "discipline",
            "topics",
        ]

# Subject with categories
class SubjectSerializer(serializers.ModelSerializer):
    categories = CategorySerializer(many=True, read_only=True)

    class Meta:
        model = Subject
        fields = ["id", "name", "slug", "categories"]


# Progress Tracking
class TopicProgressSerializer(serializers.ModelSerializer):

    topic_name = serializers.CharField(source="topic.name", read_only=True)
    topic_slug = serializers.CharField(source="topic.slug", read_only=True)
    subject = serializers.CharField(source="topic.category.subject.name", read_only=True)

    class Meta:
        model = TopicProgress
        fields = [
            "topic_slug",
            "topic_name",
            "subject",
            "progress_percent",
            "updated_at",
        ]