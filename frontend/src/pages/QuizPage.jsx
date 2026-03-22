import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "../styles/QuizPage.css";

import { getCachedQuiz } from "../utils/offlineManager";

export default function QuizPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchQuiz();
  }, [id, i18n.language]); // 🔥 refetch when language changes

  async function fetchQuiz() {
    const token = localStorage.getItem("access");
    const lang = i18n.language || "en";

    if (!token) {
      setError(t("not_logged_in"));
      setLoading(false);
      return;
    }

    try {
      /* ==========================
         OFFLINE MODE
      ========================== */

      if (!navigator.onLine) {
        const cachedQuiz = await getCachedQuiz(Number(id));

        if (!cachedQuiz || !cachedQuiz.questions) {
          throw new Error(t("quiz_not_downloaded"));
        }

        setQuestions(cachedQuiz.questions);
        setLoading(false);
        return;
      }

      /* ==========================
         ONLINE MODE
      ========================== */

      const url = `http://127.0.0.1:8000/api/quizzes/${id}/?lang=${lang}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(t("failed_load_quiz"));
      }

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error(t("no_questions"));
      }

      setQuestions(data.questions);

    } catch (err) {
      console.error("Quiz fetch error:", err);

      try {
        const cachedQuiz = await getCachedQuiz(Number(id));

        if (cachedQuiz && cachedQuiz.questions) {
          setQuestions(cachedQuiz.questions);
          setLoading(false);
          return;
        }

      } catch {}

      setError(err.message);
    }

    setLoading(false);
  }

  const handleAnswer = (optionKey) => {
    const questionId = questions[currentIndex].id;

    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionKey,
    }));

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("access");

    try {
      const url = "http://127.0.0.1:8000/api/quizzes/submit/";

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quiz_id: id,
          answers: selectedAnswers,
        }),
      });

      if (!response.ok) {
        throw new Error(t("submit_failed"));
      }

      const data = await response.json();

      navigate(`/quiz/${id}/result`, {
        state: {
          score: data.score,
          total: data.total,
        },
      });

    } catch (err) {
      alert(t("offline_submit_warning"));
    }
  };

  if (loading) return <div className="quiz-container">{t("loading_quiz")}</div>;

  if (error) return <div className="quiz-container error">{error}</div>;

  const question = questions[currentIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-card">

        <h2>
          {t("question")} {currentIndex + 1} {t("of")} {questions.length}
        </h2>

        <h3>{question.question_text}</h3>

        <div className="options">
          {["A", "B", "C", "D"].map((letter) => {
            const optionText = question[`option_${letter.toLowerCase()}`];

            if (!optionText) return null;

            return (
              <button
                key={letter}
                className="option-btn"
                onClick={() => handleAnswer(letter)}
              >
                {optionText}
              </button>
            );
          })}
        </div>

        {currentIndex === questions.length - 1 && (
          <button className="submit-btn" onClick={handleSubmit}>
            {t("submit_quiz")}
          </button>
        )}

      </div>
    </div>
  );
}