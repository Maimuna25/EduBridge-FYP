from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    NoteListCreate,
    NoteDelete,
    CreateUserView,
    AiTutorView,
    ChatHistoryView,
    SwitchSessionView,
    ExplainPromptView,
    ExplainAttemptCreateView,
    QuizListView,
    QuizDetailView,
    SubmitQuizView,
    UserQuizHistoryView,
    SubjectViewSet,
    CategoryViewSet,
    TopicViewSet,
    SlideViewSet,
    UpdateTopicProgressView,
    TopicProgressView,
    ChatSessionsView,
    StudyInsightsView, CurrentUserView,
    SetReminderView, NoteUpdate, VerifyEmailView, ResendCodeView,
)


router = DefaultRouter()
router.register("subjects", SubjectViewSet)
router.register("categories", CategoryViewSet)
router.register("topics", TopicViewSet)
router.register("slides", SlideViewSet)

urlpatterns = [

    # API routers
    path("", include(router.urls)),

    # Notes
    path("notes/", NoteListCreate.as_view()),
    path("notes/delete/<int:pk>/", NoteDelete.as_view()),
    path("notes/<int:pk>/", NoteUpdate.as_view()),

    # User
    path("user/register/", CreateUserView.as_view()),
    path("user/", CurrentUserView.as_view()),
    path('password-reset/', include('django_rest_passwordreset.urls')),
    path("user/verify-email/", VerifyEmailView.as_view()),
    path("user/resend-code/", ResendCodeView.as_view()),

    # Reminder API
    path("reminder/set/", SetReminderView.as_view()),

    # AI Tutor
    path("ai/switch-session/", SwitchSessionView.as_view()),
    path("ai/tutor/", AiTutorView.as_view()),
    path("ai/history/", ChatHistoryView.as_view()),
    path("chat/sessions/", ChatSessionsView.as_view()),

    # Explain feature
    path("explain/prompt/", ExplainPromptView.as_view()),
    path("explain/attempt/", ExplainAttemptCreateView.as_view()),

    # Quiz
    path("quizzes/", QuizListView.as_view()),
    path("quizzes/submit/", SubmitQuizView.as_view()),
    path("quizzes/history/", UserQuizHistoryView.as_view()),
    path("quizzes/<int:quiz_id>/", QuizDetailView.as_view()),

    # Progress
    path("progress/update/", UpdateTopicProgressView.as_view()),
    path("progress/", TopicProgressView.as_view()),

    # Study Insights
    path("study-insights/", StudyInsightsView.as_view()),
]