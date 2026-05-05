import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/QuizPage.css";

import { getCachedQuiz } from "../utils/offlineManager";

// Quiz page with offline support
export default function QuizPage() {

  const { id } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  async function fetchQuiz() {

    const token = localStorage.getItem("access");

    setLoading(true);
    setError(null);

    /* Offline First (Priority) */

    if (!navigator.onLine) {

      const cachedQuiz = await getCachedQuiz(Number(id));

      if (cachedQuiz && cachedQuiz.questions?.length > 0) {
        setQuestions(cachedQuiz.questions);
        setLoading(false);
        return;
      }

      setError("This quiz is not available offline.");
      setLoading(false);
      return;
    }

    /* Online */

    try {

      if (!token) throw new Error("You are not logged in.");

      const url = `http://127.0.0.1:8000/api/quizzes/${id}/`;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load quiz.");

      const data = await res.json();

      if (!data.questions || data.questions.length === 0) {
        throw new Error("No questions found.");
      }

      setQuestions(data.questions);

    } catch (err) {

      const cachedQuiz = await getCachedQuiz(Number(id));

      if (cachedQuiz && cachedQuiz.questions?.length > 0) {
        setQuestions(cachedQuiz.questions);
      } else {
        setError(err.message);
      }

    }

    setLoading(false);
  }

  /* Answer Handling */

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

  /* Submit */

  const handleSubmit = async () => {

    const token = localStorage.getItem("access");

    // Offline mode → show correct answers
    if (!navigator.onLine) {
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

      if (!response.ok) throw new Error("Failed to submit quiz.");

      const data = await response.json();

      navigate(`/quiz/${id}/result`, {
        state: {
          score: data.score,
          total: data.total,
        },
      });

    } catch {
      alert("Submission failed. Please try again.");
    }
  };

  /* UI States */

  if (loading) return <div className="quiz-container">Loading quiz...</div>;

  if (error) return <div className="quiz-container error">{error}</div>;

  const question = questions[currentIndex];

  return (
    <div className="quiz-container">
      <div className="quiz-card">

        <h2>
          Question {currentIndex + 1} of {questions.length}
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
            Submit Quiz
          </button>
        )}

      </div>
    </div>
  );
}