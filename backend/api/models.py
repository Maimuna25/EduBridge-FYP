from django.db import models
from django.contrib.auth.models import User


# ========================================
# LEARNING STRUCTURE (CORE)
# ========================================

class Subject(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)

    def __str__(self):
        return self.name


class Category(models.Model):

    LEVEL_CHOICES = [
        ("beginner", "Beginner"),
        ("intermediate", "Intermediate"),
        ("advanced", "Advanced"),
    ]

    DISCIPLINE_CHOICES = [
        ("physics", "Physics"),
        ("chemistry", "Chemistry"),
        ("biology", "Biology"),
    ]

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="categories"
    )

    name = models.CharField(max_length=100)
    slug = models.SlugField()

    level = models.CharField(
        max_length=20,
        choices=LEVEL_CHOICES,
        default="beginner"
    )

    # ✅ NEW
    discipline = models.CharField(
        max_length=50,
        choices=DISCIPLINE_CHOICES,
        blank=True,
        null=True
    )

    class Meta:
        unique_together = ("subject", "slug", "level")

    def __str__(self):
        return f"{self.subject.name} - {self.name} ({self.level})"


class Topic(models.Model):
    category = models.ForeignKey(
        Category,
        on_delete=models.CASCADE,
        related_name="topics"
    )
    name = models.CharField(max_length=100)
    slug = models.SlugField()

    class Meta:
        unique_together = ("category", "slug")

    def __str__(self):
        return self.name

    # ✅ ADD THIS
    @property
    def subject(self):
        return self.category.subject

class Slide(models.Model):
    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="slides"
    )
    content = models.TextField()
    order = models.PositiveIntegerField()

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.topic.name} - Slide {self.order}"

class SlideCompletion(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="completed_slides"
    )

    slide = models.ForeignKey(
        Slide,
        on_delete=models.CASCADE,
        related_name="completions"
    )

    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "slide")

    def __str__(self):
        return f"{self.user.username} completed {self.slide}"

class UserActivity(models.Model):

    ACTIVITY_TYPES = [
        ("slide", "Slide Viewed"),
        ("quiz", "Quiz Attempted"),
        ("ai", "AI Tutor Used"),
        ("explain", "Explain It Back Used"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"


class TopicProgress(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    topic = models.ForeignKey(Topic, on_delete=models.CASCADE)

    slides_completed = models.IntegerField(default=0)

    # 👇 this tracks the last time progress changed
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "topic")

    @property
    def progress_percent(self):
        total_slides = self.topic.slides.count()

        if total_slides == 0:
            return 0

        percent = (self.slides_completed / total_slides) * 100
        return min(int(percent), 100)

    def __str__(self):
        return f"{self.user} - {self.topic} ({self.progress_percent}%)"


# ========================================
# NOTES
# ========================================

class Note(models.Model):
    title = models.CharField(max_length=100)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notes"
    )

    def __str__(self):
        return self.title


# ========================================
# EXPLAIN FEATURE
# ========================================

class ExplainPrompt(models.Model):

    DIFFICULTY_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="explain_prompts"
    )

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="explain_prompts"
    )

    difficulty = models.CharField(max_length=20, choices=DIFFICULTY_CHOICES)

    title = models.CharField(max_length=200, blank=True, default="")
    concept_text = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("topic", "difficulty")

    def __str__(self):
        return f"{self.topic.name} ({self.difficulty})"


class ExplainAttempt(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="explain_attempts"
    )

    prompt = models.ForeignKey(
        ExplainPrompt,
        on_delete=models.CASCADE,
        related_name="attempts"
    )

    user_explanation = models.TextField()
    ai_feedback = models.TextField(blank=True, default="")
    score = models.IntegerField(null=True, blank=True)

    performance_level = models.CharField(
        max_length=50,
        blank=True,
        default=""
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} – {self.prompt.topic.name}"


# ========================================
# AI CHAT SYSTEM
# ========================================

class ChatSession(models.Model):

    LEARNING_MODE_CHOICES = [
        ("normal", "Normal"),
        ("simple", "Explain Simply"),
        ("advanced", "Advanced Detail"),
        ("quiz", "Quiz Mode"),
        ("step_by_step", "Step By Step"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="chat_sessions"
    )

    # Keeping as text intentionally (flexible conversation context)
    subject = models.CharField(max_length=100)
    topic = models.CharField(max_length=100)

    learning_mode = models.CharField(
        max_length=50,
        choices=LEARNING_MODE_CHOICES,
        default="normal"
    )

    summary = models.TextField(blank=True, default="")
    message_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_activity = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.username} - {self.subject} ({self.topic})"


class ChatMessage(models.Model):

    ROLE_CHOICES = [
        ("system", "System"),
        ("user", "User"),
        ("assistant", "Assistant"),
    ]

    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name="messages"
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    content = models.TextField()
    token_estimate = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.role} message in session {self.session.id}"


# ========================================
# LEARNING ANALYTICS
# ========================================

class LearningAnalytics(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="learning_analytics"
    )

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="analytics"
    )

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="analytics"
    )

    total_sessions = models.IntegerField(default=0)
    total_messages = models.IntegerField(default=0)
    average_session_length = models.FloatField(default=0)

    struggling = models.BooleanField(default=False)
    confidence_score = models.FloatField(default=0)

    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "topic")

    def __str__(self):
        return f"{self.user.username} – {self.topic.name}"


# ========================================
# QUIZ SYSTEM
# ========================================


class Quiz(models.Model):

    DIFFICULTY_CHOICES = [
        ("Beginner", "Beginner"),
        ("Intermediate", "Intermediate"),
        ("Advanced", "Advanced"),
    ]

    subject = models.ForeignKey(
        Subject,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="quizzes"
    )

    difficulty = models.CharField(
        max_length=20,
        choices=DIFFICULTY_CHOICES
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "Quiz"
        verbose_name_plural = "Quizzes"

    def __str__(self):
        return f"{self.topic.name} ({self.difficulty})"


class Question(models.Model):

    OPTION_CHOICES = [
        ("A", "Option A"),
        ("B", "Option B"),
        ("C", "Option C"),
        ("D", "Option D"),
    ]

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    question_text = models.TextField()

    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)

    correct_option = models.CharField(
        max_length=1,
        choices=OPTION_CHOICES
    )

    def __str__(self):
        return self.question_text


class UserQuizAttempt(models.Model):

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="quiz_attempts"
    )

    quiz = models.ForeignKey(
        Quiz,
        on_delete=models.CASCADE,
        related_name="attempts"
    )

    score = models.IntegerField(default=0)
    total_questions = models.IntegerField(default=0)

    completed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} – {self.quiz.topic.name} – {self.score}/{self.total_questions}"


class UserAnswer(models.Model):

    OPTION_CHOICES = [
        ("A", "Option A"),
        ("B", "Option B"),
        ("C", "Option C"),
        ("D", "Option D"),
    ]

    attempt = models.ForeignKey(
        UserQuizAttempt,
        on_delete=models.CASCADE,
        related_name="answers"
    )

    question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE
    )

    selected_option = models.CharField(
        max_length=1,
        choices=OPTION_CHOICES
    )

    is_correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.attempt.user.username} – Q{self.question.id}"


# ========================================
# USER SETTINGS (EMAIL REMINDERS)
# ========================================

# class UserSettings(models.Model):
#
#     user = models.OneToOneField(
#         User,
#         on_delete=models.CASCADE,
#         related_name="settings"
#     )
#
#     notifications_enabled = models.BooleanField(default=False)
#     reminder_time = models.TimeField(null=True, blank=True)
#
#     def __str__(self):
#         return f"{self.user.username} settings"


class UserSettings(models.Model):

    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="settings"
    )

    notifications_enabled = models.BooleanField(default=False)
    reminder_time = models.TimeField(null=True, blank=True)

    # ✅ REPLACE this
    last_sent_reminder_time = models.TimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} settings"

# ========================================
# AUTO CREATE SETTINGS
# ========================================

from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    if created:
        UserSettings.objects.create(user=instance)