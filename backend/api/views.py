from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404

from rest_framework import generics, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView

from datetime import timedelta, datetime
from django.db.models import Count, Avg
from django.db.models.functions import TruncDate

from .models import (
    Subject,
    Category,
    Topic,
    Slide,
    Note,
    ExplainPrompt,
    ExplainAttempt,
    ChatSession,
    ChatMessage,
    Quiz,
    UserQuizAttempt,
    UserAnswer,
    TopicProgress,
    SlideCompletion,
    UserSettings,
    UserActivity
)

from .serializers import (
    UserSerializer,
    NoteSerializer,
    ExplainPromptSerializer,
    ExplainAttemptSerializer,
    SubjectSerializer,
    CategorySerializer,
    TopicSerializer,
    SlideSerializer,
)

import os
from openai import OpenAI


class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email
        })


# ========================================
# NOTES
# ========================================

class NoteListCreate(generics.ListCreateAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NoteDelete(generics.DestroyAPIView):
    serializer_class = NoteSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Note.objects.filter(author=self.request.user)


class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


# ========================================
# QUIZ SYSTEM
# ========================================

class QuizListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        subject_id = request.query_params.get("subject")
        difficulty = request.query_params.get("difficulty")

        quizzes = Quiz.objects.all()

        if subject_id:
            quizzes = quizzes.filter(subject__name=subject_id)

        if difficulty:
            quizzes = quizzes.filter(difficulty=difficulty)

        data = [
            {
                "id": quiz.id,
                "subject": quiz.subject.name,
                "topic": quiz.topic.name,
                "difficulty": quiz.difficulty,
                "question_count": quiz.questions.count(),
            }
            for quiz in quizzes
        ]

        return Response(data)


class QuizDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, quiz_id):

        quiz = get_object_or_404(Quiz, id=quiz_id)

        return Response({
            "id": quiz.id,
            "subject": quiz.subject.name,
            "topic": quiz.topic.name,
            "difficulty": quiz.difficulty,
            "questions": [
                {
                    "id": q.id,
                    "question_text": q.question_text,
                    "option_a": q.option_a,
                    "option_b": q.option_b,
                    "option_c": q.option_c,
                    "option_d": q.option_d,
                }
                for q in quiz.questions.all()
            ]
        })


class SubmitQuizView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        quiz_id = request.data.get("quiz_id")
        answers = request.data.get("answers", {})

        if not quiz_id:
            return Response(
                {"error": "quiz_id required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        quiz = get_object_or_404(Quiz, id=quiz_id)
        questions = quiz.questions.all()

        score = 0

        attempt = UserQuizAttempt.objects.create(
            user=request.user,
            quiz=quiz,
            total_questions=questions.count(),
            score=0,
            completed_at=timezone.now()
        )

        for question in questions:

            selected = answers.get(str(question.id), None)

            is_correct = selected == question.correct_option

            if is_correct:
                score += 1

            UserAnswer.objects.create(
                attempt=attempt,
                question=question,
                selected_option=selected if selected else "",
                is_correct=is_correct
            )

        attempt.score = score
        attempt.save()

        attempt.score = score
        attempt.save()

        UserActivity.objects.create(
            user=request.user,
            activity_type="quiz"
        )

        return Response({
            "score": score,
            "total": questions.count()
        })

        return Response({
            "score": score,
            "total": questions.count()
        })


class UserQuizHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        attempts = (
            UserQuizAttempt.objects
            .filter(user=request.user)
            .select_related("quiz", "quiz__topic", "quiz__subject")
            .order_by("-completed_at")
        )

        return Response([
            {
                "quiz_id": attempt.quiz.id,
                "quiz_topic": attempt.quiz.topic.name,
                "subject": attempt.quiz.subject.name,
                "difficulty": attempt.quiz.difficulty,
                "score": attempt.score,
                "total": attempt.total_questions,
                "completed_at": attempt.completed_at,
            }
            for attempt in attempts
        ])


# ========================================
# AI HELPER
# ========================================

def extract_text_from_response(result):

    try:
        if hasattr(result, "output_text") and result.output_text:
            return result.output_text.strip()

        if hasattr(result, "output") and result.output:
            first = result.output[0]
            if hasattr(first, "content") and first.content:
                text = ""
                for item in first.content:
                    if hasattr(item, "text"):
                        text += item.text
                if text.strip():
                    return text.strip()

        return "Sorry — I couldn't generate a response."

    except Exception:
        return "Sorry — I couldn't generate a response."


# ========================================
# SESSION SWITCH
# ========================================

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone

class SwitchSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        subject = (request.data.get("subject") or "General").strip()
        topic = (request.data.get("topic") or "General").strip()
        learning_mode = request.data.get("learning_mode", "normal")

        # Reuse session if it already exists for this topic
        session, created = ChatSession.objects.get_or_create(
            user=request.user,
            subject=subject,
            topic=topic,
            defaults={
                "learning_mode": learning_mode
            }
        )

        # If session already existed, update learning mode + timestamp
        if not created:

            if session.learning_mode != learning_mode:
                session.learning_mode = learning_mode

            session.updated_at = timezone.now()
            session.save()

        return Response({
            "session_id": session.id,
            "subject": session.subject,
            "topic": session.topic,
            "learning_mode": session.learning_mode,
        })


# ========================================
# AI TUTOR
# ========================================

class AiTutorView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        message = (request.data.get("message") or "").strip()
        session_id = request.data.get("session_id")
        slide_content = (request.data.get("slide_content") or "").strip()

        if not message or not session_id:
            return Response(
                {"error": "message and session_id required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        session = get_object_or_404(
            ChatSession,
            id=session_id,
            user=request.user
        )

        # Save user message
        ChatMessage.objects.create(
            session=session,
            role="user",
            content=message,
        )

        # Safely update session metadata
        session.last_activity = timezone.now()

        if session.message_count is None:
            session.message_count = 0

        session.message_count += 1
        session.updated_at = timezone.now()
        session.save()

        # Build AI prompt
        system_prompt = f"""
You are an adaptive AI tutor helping a student understand educational material.

Subject: {session.subject}
Topic: {session.topic}

If lesson content is provided, explain it clearly for the student.

Lesson Content:
{slide_content}

Instructions:
- Explain clearly and simply.
- Use step-by-step explanations if appropriate.
- Give a short example when helpful.
- Encourage understanding rather than just giving answers.
"""

        api_key = os.getenv("OPENAI_API_KEY")

        if not api_key:
            return Response(
                {"error": "OPENAI_API_KEY not configured"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            client = OpenAI(api_key=api_key)

            result = client.responses.create(
                model="gpt-4.1-mini",
                input=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": message}
                ],
            )

            assistant_text = extract_text_from_response(result)

        except Exception as e:
            return Response(
                {"error": f"OpenAI request failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Save AI response
        ChatMessage.objects.create(
            session=session,
            role="assistant",
            content=assistant_text,
        )

        UserActivity.objects.create(
            user=request.user,
            activity_type="ai"
        )

        return Response({
            "reply": assistant_text
        })

# ========================================
# CHAT HISTORY
# ========================================

class ChatHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        session_id = request.query_params.get("session_id")

        if not session_id:
            return Response({"messages": []})

        session = get_object_or_404(
            ChatSession,
            id=session_id,
            user=request.user
        )

        messages = session.messages.order_by("created_at")

        return Response({
            "messages": [
                {
                    "role": m.role,
                    "content": m.content,
                    "created_at": m.created_at,
                }
                for m in messages
            ]
        })

class ChatSessionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        sessions = ChatSession.objects.filter(
            user=request.user
        ).order_by("-created_at")

        return Response([
            {
                "id": s.id,
                "topic": s.topic,
                "created_at": s.created_at
            }
            for s in sessions
        ])


# ========================================
# SUBJECT / CATEGORY / TOPIC / SLIDE API
# ========================================

class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all()
    serializer_class = SubjectSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class TopicViewSet(viewsets.ModelViewSet):
    queryset = Topic.objects.all()
    serializer_class = TopicSerializer


class SlideViewSet(viewsets.ModelViewSet):
    queryset = Slide.objects.all()
    serializer_class = SlideSerializer
    permission_classes = [IsAuthenticated]

# ========================================
# TOPIC SLIDES
# ========================================

# ========================================
# TOPIC SLIDES
# ========================================

class TopicSlidesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, topic_slug):

        topic = get_object_or_404(Topic, slug=topic_slug)

        slides = Slide.objects.filter(
            topic=topic
        ).order_by("order")

        # ✅ Track slide activity (ONCE per visit)
        UserActivity.objects.create(
            user=request.user,
            activity_type="slide"
        )

        serializer = SlideSerializer(slides, many=True)

        return Response(serializer.data)


# ========================================
# PROGRESS SYSTEM
# ========================================
class UpdateTopicProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        topic_slug = request.data.get("topic_slug")
        slides_completed = int(request.data.get("slides_completed", 0))

        topic = get_object_or_404(Topic, slug=topic_slug)

        progress, created = TopicProgress.objects.get_or_create(
            user=request.user,
            topic=topic
        )

        slides = topic.slides.all().order_by("order")
        total_slides = slides.count()

        # Prevent impossible numbers
        slides_completed = min(slides_completed, total_slides)

        # ========================================
        # ✅ CREATE SLIDE COMPLETION RECORDS (FIX)
        # ========================================

        completed_slides = slides[:slides_completed]

        for slide in completed_slides:
            SlideCompletion.objects.get_or_create(
                user=request.user,
                slide=slide
            )

        # ========================================
        # UPDATE PROGRESS
        # ========================================

        progress.slides_completed = slides_completed
        progress.save()

        return Response({
            "status": "updated",
            "slides_completed": slides_completed
        })

class TopicProgressView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        print("\n----- FETCH PROGRESS REQUEST -----")
        print("User:", request.user)

        progress_items = (
            TopicProgress.objects
            .filter(user=request.user)
            .select_related("topic", "topic__category", "topic__category__subject")
            .order_by("-updated_at")   # 🔥 newest first
        )

        print("Progress Items Found:", progress_items.count())

        data = [
            {
                "topic": p.topic.slug,
                "category": p.topic.category.slug,
                "subject": p.topic.category.subject.slug,
                "progress": p.progress_percent,
                "slides_completed": p.slides_completed,
                "updated_at": p.updated_at,   # 🔥 important
            }
            for p in progress_items
        ]

        print("Response Data:", data)

        return Response(data)

class ExplainPromptView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subject = request.query_params.get("subject")
        topic = request.query_params.get("topic")
        difficulty = request.query_params.get("difficulty")

        prompt = get_object_or_404(
            ExplainPrompt,
            subject__name=subject,
            topic__name=topic,
            difficulty=difficulty,
        )

        return Response(ExplainPromptSerializer(prompt).data)


class ExplainAttemptCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        prompt_id = request.data.get("prompt_id")
        user_explanation = (request.data.get("user_explanation") or "").strip()

        if not prompt_id or not user_explanation:
            return Response(
                {"error": "prompt_id and user_explanation are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        prompt = get_object_or_404(ExplainPrompt, id=prompt_id)

        # Create attempt first
        attempt = ExplainAttempt.objects.create(
            user=request.user,
            prompt=prompt,
            user_explanation=user_explanation,
        )

        api_key = os.getenv("OPENAI_API_KEY")
        model = os.getenv("OPENAI_MODEL", "gpt-4.1-mini")

        if not api_key:
            return Response(
                {"error": "OPENAI_API_KEY not set"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        client = OpenAI(api_key=api_key)

        grading_prompt = f"""
You are an expert teacher.

Topic: {prompt.topic.name}
Difficulty: {prompt.difficulty}

Correct concept explanation:
{prompt.concept_text}

Student explanation:
{user_explanation}

Instructions:
1. Give constructive feedback.
2. Point out what is correct.
3. Explain what is missing or incorrect.
4. Give a score out of 10.
5. At the end write: SCORE: X/10
"""

        try:
            result = client.responses.create(
                model=model,
                input=grading_prompt,
            )

            ai_feedback = extract_text_from_response(result)

            import re
            score_match = re.search(r"SCORE:\s*(\d+)/10", ai_feedback)

            score = None
            if score_match:
                score = int(score_match.group(1))

            attempt.ai_feedback = ai_feedback
            attempt.score = score
            attempt.save()

            return Response({
                "ai_feedback": ai_feedback,
                "score": score,
            })

        except Exception as e:
            # ✅ Track explain activity
            UserActivity.objects.create(
                user=request.user,
                activity_type="explain"
            )
            return Response(
                {"error": f"OpenAI error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

# ========================================
# STUDY INSIGHTS ANALYTICS
# ========================================

class StudyInsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user
        now = timezone.now()

        DAYS_RANGE = 30
        last_period = now - timedelta(days=DAYS_RANGE)

        # ========================================
        # LATEST ATTEMPTS PER QUIZ
        # ========================================

        all_attempts = (
            UserQuizAttempt.objects
            .filter(user=user)
            .select_related("quiz__topic", "quiz__subject")
            .order_by("-completed_at")
        )

        seen = set()
        attempts = []

        for a in all_attempts:
            if a.quiz_id not in seen:
                attempts.append(a)
                seen.add(a.quiz_id)

        # ========================================
        # STUDY FREQUENCY (FIXED)
        # ========================================

        activity_days = set(
            SlideCompletion.objects
            .filter(user=user, completed_at__gte=last_period)
            .annotate(day=TruncDate("completed_at"))
            .values_list("day", flat=True)
        )

        activity_days |= set(
            UserQuizAttempt.objects
            .filter(user=user, completed_at__gte=last_period)
            .annotate(day=TruncDate("completed_at"))
            .values_list("day", flat=True)
        )

        study_days = len(activity_days)
        study_frequency = round((study_days / DAYS_RANGE) * 7)

        # ========================================
        # ACCURACY
        # ========================================

        total_score = sum(a.score for a in attempts)
        total_q = sum(a.total_questions for a in attempts)

        average_accuracy = round((total_score / total_q) * 100, 1) if total_q else 0

        # ========================================
        # TOPICS MASTERED
        # ========================================

        topic_progress = TopicProgress.objects.filter(user=user)

        topics_mastered = sum(
            1 for p in topic_progress if p.progress_percent == 100
        )

        topics_total = Topic.objects.count()

        # ========================================
        # WEEKLY ACTIVITY
        # ========================================

        week_days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        weekly_data = {d: 0 for d in week_days}

        recent_attempts_week = UserQuizAttempt.objects.filter(
            user=user,
            completed_at__gte=now - timedelta(days=7)
        )

        for a in recent_attempts_week:
            day = week_days[a.completed_at.weekday()]
            weekly_data[day] += a.total_questions

        # ========================================
        # ACCURACY BY TOPIC
        # ========================================

        topic_scores = {}

        for a in attempts:
            topic = a.quiz.topic.name
            subject = a.quiz.subject.slug

            acc = (a.score / a.total_questions) * 100

            if topic not in topic_scores:
                topic_scores[topic] = {"values": [], "subject": subject}

            topic_scores[topic]["values"].append(acc)

        accuracy_by_topic = [
            {
                "label": t,
                "value": round(sum(d["values"]) / len(d["values"])),
                "subject": d["subject"]
            }
            for t, d in topic_scores.items()
        ]

        # ========================================
        # COMMON MISTAKES
        # ========================================

        mistakes = (
            UserAnswer.objects
            .filter(attempt__user=user, is_correct=False)
            .values("question__quiz__topic__name")
            .annotate(count=Count("id"))
            .order_by("-count")[:2]
        )

        common_mistakes = [
            m["question__quiz__topic__name"] for m in mistakes
        ]

        # ========================================
        # STRENGTHS
        # ========================================

        strengths = [
            t["label"]
            for t in accuracy_by_topic
            if t["value"] >= 85
        ][:2]

        # ========================================
        # STUDY STREAK (FIXED)
        # ========================================

        activity_days = set(
            SlideCompletion.objects
            .filter(user=user)
            .annotate(day=TruncDate("completed_at"))
            .values_list("day", flat=True)
        )

        activity_days |= set(
            UserQuizAttempt.objects
            .filter(user=user)
            .annotate(day=TruncDate("completed_at"))
            .values_list("day", flat=True)
        )

        streak = 0
        current_day = now.date()

        # 🔥 allow streak even if today has no activity yet
        if current_day not in activity_days:
            current_day -= timedelta(days=1)

        while current_day in activity_days:
            streak += 1
            current_day -= timedelta(days=1)

        # ========================================
        # TREND DETECTION
        # ========================================

        recent_attempts = UserQuizAttempt.objects.filter(
            user=user,
            completed_at__gte=now - timedelta(days=14)
        ).order_by("completed_at")

        trend = "stable"

        if len(recent_attempts) >= 4:

            half = len(recent_attempts) // 2
            first_half = recent_attempts[:half]
            second_half = recent_attempts[half:]

            def avg(attempts):
                total = sum(a.score for a in attempts)
                count = sum(a.total_questions for a in attempts)
                return (total / count) * 100 if count else 0

            first_avg = avg(first_half)
            second_avg = avg(second_half)

            if second_avg > first_avg + 5:
                trend = "improving"
            elif second_avg < first_avg - 5:
                trend = "declining"

        # ========================================
        # PERFORMANCE LEVEL
        # ========================================

        if average_accuracy < 50:
            performance_level = "Beginner"
        elif average_accuracy < 75:
            performance_level = "Intermediate"
        else:
            performance_level = "Advanced"

        # ========================================
        # NEXT ACTION
        # ========================================

        next_action = "Keep practicing regularly."

        if accuracy_by_topic:
            weakest_topic = min(accuracy_by_topic, key=lambda x: x["value"])

            if weakest_topic["value"] < 50:
                next_action = f"Focus on improving {weakest_topic['label']}."
            elif weakest_topic["value"] < 75:
                next_action = f"Practice more questions in {weakest_topic['label']}."
            else:
                next_action = "You're doing well — try more advanced topics."

        # ========================================
        # GOALS SYSTEM
        # ========================================

        goals = []

        target_accuracy = 80
        accuracy_progress = min(int((average_accuracy / target_accuracy) * 100), 100)

        goals.append({
            "type": "accuracy",
            "label": f"Reach {target_accuracy}% accuracy",
            "current": average_accuracy,
            "target": target_accuracy,
            "progress": accuracy_progress,
            "status": "complete" if average_accuracy >= target_accuracy else "in_progress"
        })

        target_days = 3
        consistency_progress = min(int((study_frequency / target_days) * 100), 100)

        goals.append({
            "type": "consistency",
            "label": f"Study at least {target_days} days/week",
            "current": study_frequency,
            "target": target_days,
            "progress": consistency_progress,
            "status": "complete" if study_frequency >= target_days else "in_progress"
        })

        if accuracy_by_topic:
            weakest = min(accuracy_by_topic, key=lambda x: x["value"])

            topic_target = 60
            topic_progress_val = min(int((weakest["value"] / topic_target) * 100), 100)

            goals.append({
                "type": "topic",
                "label": f"Improve {weakest['label']} to {topic_target}%",
                "current": weakest["value"],
                "target": topic_target,
                "progress": topic_progress_val,
                "status": "complete" if weakest["value"] >= topic_target else "in_progress"
            })

        # ========================================
        # SMART AI FEEDBACK
        # ========================================

        if trend == "declining":
            ai_feedback = (
                "Your performance has dropped recently. "
                f"Revisit {common_mistakes[0] if common_mistakes else 'key topics'}."
            )

        elif trend == "improving":
            ai_feedback = (
                "Your performance is improving. Continue building momentum with consistent practice."
            )

        elif study_frequency < 2:
            ai_feedback = (
                "Your study consistency is low. Aim for at least 3 sessions per week."
            )

        elif common_mistakes:
            ai_feedback = (
                f"You are struggling with {common_mistakes[0]}. Focus on strengthening this area."
            )

        else:
            ai_feedback = (
                "You are making steady progress. Continue refining your understanding."
            )

        return Response({
            "study_frequency": study_frequency,
            "study_streak": streak,
            "average_accuracy": average_accuracy,
            "topics_mastered": topics_mastered,
            "topics_total": topics_total,
            "weekly_study_time": weekly_data,
            "accuracy_by_topic": accuracy_by_topic,
            "common_mistakes": common_mistakes,
            "strengths": strengths,
            "ai_feedback": ai_feedback,
            "trend": trend,
            "performance_level": performance_level,
            "next_action": next_action,
            "goals": goals
        })


class SetReminderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):

        reminder_time_str = request.data.get("reminderTime")
        enabled = request.data.get("enabled", False)

        user = request.user

        reminder_time = None
        if reminder_time_str:
            try:
                reminder_time = datetime.strptime(reminder_time_str, "%H:%M").time()
            except ValueError:
                return Response(
                    {"error": "Invalid time format"},
                    status=status.HTTP_400_BAD_REQUEST
                )

        settings_obj, _ = UserSettings.objects.get_or_create(user=user)

        settings_obj.reminder_time = reminder_time
        settings_obj.notifications_enabled = enabled
        settings_obj.save()

        return Response({"status": "saved"})