import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const savedLang = localStorage.getItem("lang") || "en";

i18n.use(initReactI18next).init({
  resources: {

    /* ================= ENGLISH ================= */
    en: {
      translation: {

        /* SETTINGS */
        settings: "Settings",
        customize: "Customize your learning experience",
        appearance: "Appearance",
        theme: "Theme",
        choose_theme: "Choose how EduBridge looks",
        text_size: "Text Size",
        adjust_readability: "Adjust readability",
        language_region: "Language & Region",
        language: "Language",
        interface_language: "Interface language",
        account: "Account",
        logout: "Log Out",
        system: "System",
        light: "Light",
        dark: "Dark",
        small: "Small",
        default: "Default",
        large: "Large",

        /* OFFLINE */
        offline_mode: "Offline Mode",
        offline_description: "Download quizzes and lessons to access them without internet.",
        search_placeholder: "Search quizzes or topics...",
        downloaded_content: "Downloaded Content",
        available_quizzes: "Available Quizzes",
        available_topics: "Available Topics",
        downloaded_quiz: "Downloaded Topic Quiz",
        downloaded_topic: "Downloaded Topic Reading",
        quiz: "Quizzes",
        topic: "Topic",
        lesson: "Lesson",
        open: "Open",
        remove: "Remove",
        download: "Download",

        /* SUBJECTS */
        all: "All",
        mathematics: "Mathematics",
        science: "Science",
        english: "English",
        chemistry: "Chemistry",

        /* QUIZZES */
        quiz_tagline: "Test your understanding and track your progress",
        loading_quizzes: "Loading quizzes...",
        all_levels: "All Levels",
        beginner: "Beginner",
        intermediate: "Intermediate",
        advanced: "Advanced",

        quizzes_completed: "Quizzes Completed",
        average_score: "Average Score",
        quizzes_remaining: "Quizzes Remaining",

        recommended_next: "Recommended Next",
        recommended_text: "Based on your previous quiz performance, we recommend reviewing this topic.",
        review_quiz: "Review Quiz",

        start: "Start",
        retry: "Retry",
        completed: "Completed",
        not_started: "Not Started",

        /* STUDY INSIGHTS */
        study_insights: "Study Insights",
        study_tagline: "Track progress. Improve smarter.",
        learning_insight: "Your Learning Insight",
        loading_insights: "Loading insights...",
        no_data: "No data available.",

        study_frequency: "Study Frequency",
        days_per_week: "days/week",
        low_frequency: "⚠️ Below recommended (3+ days)",

        average_accuracy: "Average Accuracy",
        improving: "🟡 Improving",
        strong: "🟢 Strong",

        topics_mastered: "Topics Mastered",
        out_of: "out of",

        study_streak: "Study Streak",
        days: "days",
        no_streak: "No active streak",
        start_today: "Start today 🔥",

        learning_goals: "Learning Goals",
        completed_goal: "Completed",
        in_progress: "In Progress",

        accuracy_by_topic: "Accuracy by Topic",

        strengths: "Strengths",
        needs_improvement: "Needs Improvement",

        no_strengths: "No strong topics yet.",
        no_weaknesses: "No weak topics detected.",

        strong_understanding: "accuracy — strong understanding",
        review_recommended: "accuracy — review recommended",

        /* ================= DASHBOARD ================= */
        welcome_back: "Welcome Back",
        learning_tagline: "Continue your learning journey in Mathematics, Science, and Chemistry",
        continue_learning: "Continue learning",
        quick_actions: "Quick Actions",
        ask_ai: "Ask AI Tutor",
        ai_help: "Get help with any topic",
        explain_back: "Explain It Back",
        test_understanding: "Test your understanding",
        take_quiz: "Take a Quiz",
        practice_knowledge: "Practice your knowledge",
        recent_topics: "Recent Topics Studied",
        no_recent: "Start learning topics to see your progress here.",
        your_notes: "Your Notes",
        no_notes: "No notes yet. Create your first one 👇",
        create_note: "Create a Note",
        save_note: "Save Note",
        title: "Title",
        content: "Content",
        close: "Close",
        delete: "Delete",
        need_help: "Need help?",
        need_assistance: "Need assistance?",
        ai_prompt: "Would you like help from the AI Tutor with a topic?",
        go_ai: "Go to AI Tutor",
        cancel: "Cancel"
      }
    },

    /* ================= SPANISH ================= */
    es: {
      translation: {

        settings: "Configuración",
        customize: "Personaliza tu experiencia de aprendizaje",
        appearance: "Apariencia",
        theme: "Tema",
        choose_theme: "Elige cómo se ve EduBridge",
        text_size: "Tamaño de texto",
        adjust_readability: "Ajustar legibilidad",
        language_region: "Idioma y región",
        language: "Idioma",
        interface_language: "Idioma de la interfaz",
        account: "Cuenta",
        logout: "Cerrar sesión",
        system: "Sistema",
        light: "Claro",
        dark: "Oscuro",
        small: "Pequeño",
        default: "Predeterminado",
        large: "Grande",

        mathematics: "Matemáticas",
        science: "Ciencia",
        english: "Inglés",
        chemistry: "Química",

        /* DASHBOARD */
        welcome_back: "Bienvenido de nuevo",
        learning_tagline: "Continúa tu aprendizaje",
        continue_learning: "Continuar",
        quick_actions: "Acciones rápidas",
        ask_ai: "Preguntar al AI",
        take_quiz: "Hacer cuestionario",
        your_notes: "Tus notas",
        create_note: "Crear nota",
        save_note: "Guardar nota",
        close: "Cerrar",
        delete: "Eliminar"
      }
    },

    /* ================= FRENCH ================= */
    fr: {
      translation: {

        settings: "Paramètres",
        mathematics: "Mathématiques",
        science: "Science",
        english: "Anglais",
        chemistry: "Chimie",

        /* DASHBOARD */
        welcome_back: "Bon retour",
        learning_tagline: "Continue ton apprentissage",
        quick_actions: "Actions rapides",
        your_notes: "Vos notes",
        create_note: "Créer une note",
        save_note: "Enregistrer",
        close: "Fermer",
        delete: "Supprimer"
      }
    },

    /* ================= GERMAN ================= */
    de: {
      translation: {

        settings: "Einstellungen",
        mathematics: "Mathematik",
        science: "Wissenschaft",
        english: "Englisch",
        chemistry: "Chemie",

        /* DASHBOARD */
        welcome_back: "Willkommen zurück",
        learning_tagline: "Lerne weiter",
        quick_actions: "Aktionen",
        your_notes: "Notizen",
        create_note: "Notiz erstellen",
        save_note: "Speichern",
        close: "Schließen",
        delete: "Löschen"
      }
    }

  },

  lng: savedLang,
  fallbackLng: "en",

  interpolation: {
    escapeValue: false
  }
});

export default i18n;