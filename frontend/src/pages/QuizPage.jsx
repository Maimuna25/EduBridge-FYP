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
  const [showAnswers, setShowAnswers] = useState(false); // ⭐ NEW

  useEffect(() => {
    fetchQuiz();
  }, [id, i18n.language]);

  async function fetchQuiz() {

    const token = localStorage.getItem("access");
    const lang = i18n.language || "en";

    setLoading(true);
    setError(null);

    /* ==========================
       OFFLINE FIRST (PRIORITY)
    ========================== */

    if (!navigator.onLine) {

      console.log("📴 Offline → loading cached quiz");

      const cachedQuiz = await getCachedQuiz(Number(id));

      console.log("🧠 Cached quiz:", cachedQuiz);

      if (cachedQuiz && cachedQuiz.questions?.length > 0) {
        setQuestions(cachedQuiz.questions);
        setLoading(false);
        return;
      }

      setError(t("quiz_not_downloaded"));
      setLoading(false);
      return;
    }

    /* ==========================
       ONLINE
    ========================== */

    try {

      if (!token) throw new Error(t("not_logged_in"));

      const url = `http://127.0.0.1:8000/api/quizzes/${id}/?lang=${lang}`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(t("failed_load_quiz"));

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error(t("no_questions"));
      }

      setQuestions(data.questions);

    } catch (err) {

      console.error("❌ API failed, trying cache");

      const cachedQuiz = await getCachedQuiz(Number(id));

      if (cachedQuiz && cachedQuiz.questions?.length > 0) {
        setQuestions(cachedQuiz.questions);
      } else {
        setError(err.message);
      }

    }

    setLoading(false);
  }

  /* ==========================
     ANSWER HANDLING
  ========================== */

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

  /* ==========================
     SUBMIT
  ========================== */

  const handleSubmit = async () => {

    const token = localStorage.getItem("access");

    // ⭐ OFFLINE MODE → SHOW ANSWERS INSTEAD
    if (!navigator.onLine) {
      console.log("📴 Offline submit → showing answers");
      setShowAnswers(true);
      return;
    }

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/api/quizzes/submit/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quiz_id: id,
            answers: selectedAnswers,
          }),
        }
      );

      if (!response.ok) throw new Error(t("submit_failed"));

      const data = await response.json();

      navigate(`/quiz/${id}/result`, {
        state: {
          score: data.score,
          total: data.total,
        },
      });

    } catch {
      alert(t("offline_submit_warning"));
    }
  };

  /* ==========================
     UI STATES
  ========================== */

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

            const isCorrect = question.correct_answer === letter;

            return (
              <button
                key={letter}
                className={`option-btn ${
                  showAnswers
                    ? isCorrect
                      ? "correct"
                      : "wrong"
                    : ""
                }`}
                onClick={() => !showAnswers && handleAnswer(letter)}
              >
                {optionText}
                {showAnswers && isCorrect && " ✓"}
              </button>
            );
          })}

        </div>

        {currentIndex === questions.length - 1 && !showAnswers && (
          <button className="submit-btn" onClick={handleSubmit}>
            {t("submit_quiz")}
          </button>
        )}

      </div>
    </div>
  );
}