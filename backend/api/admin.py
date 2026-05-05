
# This file registers models so they can be managed through the Django admin panel
from django.contrib import admin

from .models import (
    Note,
    ExplainPrompt,
    ExplainAttempt,
    ChatSession,
    ChatMessage,
    Quiz,
    Question,
    UserQuizAttempt,
    UserAnswer,
    SlideCompletion,
    Subject,
    Category,
    Topic,
    Slide,
    TopicProgress,
    UserSettings,
)

# Allows Slides to be edited inside Topic admin page
class SlideInline(admin.TabularInline):
    model = Slide
    extra = 1  # show one empty extra row


# Allows Topics to be edited inside Category admin page
class TopicInline(admin.TabularInline):
    model = Topic
    extra = 1


# Allows Categories to be edited inside Subject admin page
class CategoryInline(admin.TabularInline):
    model = Category
    extra = 1


# Subject admin page
@admin.register(Subject)
class SubjectAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "slug")  # columns shown
    prepopulated_fields = {"slug": ("name",)}  # auto-generate slug
    inlines = [CategoryInline]


# Category admin page
@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "subject", "slug")
    list_filter = ("subject",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = [TopicInline]


# Topic admin page
@admin.register(Topic)
class TopicAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "category", "slug")
    list_filter = ("category",)
    prepopulated_fields = {"slug": ("name",)}
    inlines = [SlideInline]


# Slide admin page
@admin.register(Slide)
class SlideAdmin(admin.ModelAdmin):
    list_display = ("id", "topic", "order")
    list_filter = ("topic",)
    ordering = ("topic", "order")


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "author", "created_at")
    search_fields = ("title", "content", "author__username")
    list_filter = ("created_at",)


# Prompt questions shown to users
@admin.register(ExplainPrompt)
class ExplainPromptAdmin(admin.ModelAdmin):
    list_display = ("id", "subject", "topic", "difficulty", "created_at")
    search_fields = ("subject", "topic", "title", "concept_text")
    list_filter = ("subject", "difficulty", "created_at")


# User attempts and AI feedback
@admin.register(ExplainAttempt)
class ExplainAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "prompt", "score", "created_at")
    search_fields = (
        "user__username",
        "prompt__subject",
        "prompt__topic",
        "user_explanation",
        "ai_feedback",
    )
    list_filter = ("prompt__subject", "prompt__difficulty", "created_at")


# Chat sessions
@admin.register(ChatSession)
class ChatSessionAdmin(admin.ModelAdmin):
    list_display = ("user", "subject", "topic", "message_count", "created_at")
    search_fields = ("user__username", "subject", "topic")
    list_filter = ("subject",)


# Individual chat messages
@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "role", "created_at")
    list_filter = ("role", "created_at")
    search_fields = ("content",)


# Allows questions inside quiz page
class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


# Question admin
@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("id", "quiz", "question_text")


# Quiz admin
@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ("id", "subject", "topic", "difficulty", "created_at")
    search_fields = ("subject", "topic")
    list_filter = ("subject", "difficulty", "created_at")
    inlines = [QuestionInline]


# Allows answers inside attempt page
class UserAnswerInline(admin.TabularInline):
    model = UserAnswer
    extra = 0
    readonly_fields = ("question", "selected_option", "is_correct")
    can_delete = False


# User quiz attempts
@admin.register(UserQuizAttempt)
class UserQuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "quiz", "score", "total_questions", "completed_at")
    search_fields = ("user__username", "quiz__subject", "quiz__topic")
    list_filter = ("quiz__subject", "quiz__difficulty", "completed_at")
    inlines = [UserAnswerInline]


# Individual user answers
@admin.register(UserAnswer)
class UserAnswerAdmin(admin.ModelAdmin):
    list_display = ("id", "attempt", "question", "selected_option", "is_correct")



# Topic progress percentages
@admin.register(TopicProgress)
class TopicProgressAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "topic",
        "slides_completed",
        "progress_percent",
        "updated_at",
    )
    search_fields = ("user__username",)


# Completed slides
@admin.register(SlideCompletion)
class SlideCompletionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "slide", "completed_at")
    search_fields = ("user__username", "slide__topic__name")
    list_filter = ("completed_at",)


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "notifications_enabled", "reminder_time")
    search_fields = ("user__username",)