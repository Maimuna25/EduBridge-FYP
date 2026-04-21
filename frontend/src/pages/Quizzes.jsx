import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/quizzes.css";
import { cacheQuizzes, getCachedQuizzes } from "../utils/offlineManager";

export default function Quizzes() {

  const [quizzes, setQuizzes] = useState([]);
  const [history, setHistory] = useState([]);

  const [subjectFilter, setSubjectFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem("access");
  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, [subjectFilter, difficultyFilter]);

  function buildQuizURL() {
    let url = "http://127.0.0.1:8000/api/quizzes/";
    const params = [];

    if (subjectFilter) {
      params.push(`subject=${encodeURIComponent(subjectFilter)}`);
    }

    if (difficultyFilter) {
      params.push(`difficulty=${encodeURIComponent(difficultyFilter)}`);
    }

    if (params.length) {
      url += "?" + params.join("&");
    }

    return url;
  }

  async function safeFetch(url) {
    try {
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error(`Server error ${res.status}`);
      }

      const text = await res.text();
      return JSON.parse(text);

    } catch (err) {
      console.warn("Fetch failed:", err.message);
      throw err;
    }
  }

  async function fetchAll() {
    setLoading(true);
    setError(null);

    const quizURL = buildQuizURL();
    const historyURL = "http://127.0.0.1:8000/api/quizzes/history/";

    let quizData = [];
    let historyData = [];

    try {
      quizData = await safeFetch(quizURL);
    } catch {
      console.warn("Offline mode: loading quizzes from IndexedDB");

      quizData = await getCachedQuizzes();

      if (Array.isArray(quizData)) {
        if (subjectFilter) {
          quizData = quizData.filter(q => q.subject === subjectFilter);
        }
        if (difficultyFilter) {
          quizData = quizData.filter(q => q.difficulty === difficultyFilter);
        }
      }
    }

    try {
      historyData = await safeFetch(historyURL);
    } catch {
      console.warn("Offline: history unavailable");
      historyData = [];
    }

    setQuizzes(Array.isArray(quizData) ? quizData : []);
    setHistory(Array.isArray(historyData) ? historyData : []);

    setLoading(false);
  }

  // ================= FIXED LOGIC =================

  // Get latest attempt per quiz
  const latestAttempts = Object.values(
    history.reduce((acc, attempt) => {
      const existing = acc[attempt.quiz_id];

      if (
        !existing ||
        new Date(attempt.created_at) > new Date(existing.created_at)
      ) {
        acc[attempt.quiz_id] = attempt;
      }

      return acc;
    }, {})
  );

  // Find lowest score from latest attempts
  const lowestAttempt = latestAttempts.length
    ? latestAttempts.reduce((lowest, current) => {
        const currentPercent = current.total
          ? current.score / current.total
          : 1;

        const lowestPercent = lowest.total
          ? lowest.score / lowest.total
          : 1;

        return currentPercent < lowestPercent ? current : lowest;
      })
    : null;

  const recommendedQuiz = lowestAttempt
    ? quizzes.find((q) => q.id === lowestAttempt.quiz_id)
    : null;

  // ================= STATS =================

  const uniqueCompleted = new Set(history.map((h) => h.quiz_id)).size;

  const completedCount = uniqueCompleted;

  const averageScore =
    history.length > 0
      ? Math.round(
          history.reduce((acc, item) => {
            if (!item.total) return acc;
            return acc + (item.score / item.total) * 100;
          }, 0) / history.length
        )
      : 0;

  const remainingCount =
    quizzes.length > completedCount
      ? quizzes.length - completedCount
      : 0;

  // ================= UI =================

  if (loading) {
    return <div className="quizzes-page">Loading quizzes...</div>;
  }

  if (error) {
    return <div className="quizzes-page error">{error}</div>;
  }

  return (
    <div className="quizzes-page-wrapper">
      <div className="quizzes-page">
        <div className="quizzes-container">

          <div className="quizzes-header">
            <h1>Quizzes</h1>
            <span className="quizzes-chip">
              Test your understanding and track your progress
            </span>
          </div>

          <div className="quiz-filters">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              <option value="">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
            </select>

            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="quiz-stats">
            <StatCard title="Quizzes Completed" value={completedCount} />
            <StatCard title="Average Score" value={`${averageScore}%`} />
            <StatCard title="Quizzes Remaining" value={remainingCount} />
          </div>

          <div className="quiz-slider">
            {quizzes.map((quiz) => {

              const attempt = history.find(
                (h) => h.quiz_id === quiz.id
              );

              const status = attempt ? "Completed" : "Not Started";

              const score = attempt
                ? Math.round((attempt.score / attempt.total) * 100) + "%"
                : null;

              return (
                <QuizCard
                  key={quiz.id}
                  quizId={quiz.id}
                  title={quiz.topic}
                  subject={quiz.subject}
                  difficulty={quiz.difficulty}
                  status={status}
                  score={score}
                />
              );
            })}
          </div>

          {recommendedQuiz && (
            <div className="recommended-box">
              <h3>Recommended Next</h3>

              <div className="recommended-card">
                <div>
                  <h4>{recommendedQuiz.topic}</h4>
                  <p>
                    Based on your latest performance, we recommend reviewing this topic.
                  </p>
                </div>

                <button
                  onClick={() => navigate(`/quiz/${recommendedQuiz.id}`)}
                >
                  Review Quiz
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

/* COMPONENTS */

function StatCard({ title, value }) {
  return (
    <div className="stat-card">
      <span>{title}</span>
      <strong>{value}</strong>
    </div>
  );
}

function QuizCard({ quizId, title, subject, difficulty, status, score }) {

  const navigate = useNavigate();

  function handleStart() {
    navigate(`/quiz/${quizId}`);
  }

  return (
    <div className="quiz-card">

      <div className="quiz-info">
        <h3>{title}</h3>
        <span className="quiz-subject">{subject}</span>

        <span className={`difficulty ${difficulty.toLowerCase()}`}>
          {difficulty}
        </span>
      </div>

      <div className="quiz-meta">
        <span className={`status ${status.toLowerCase().replace(" ", "-")}`}>
          {status}
        </span>

        {score && <strong>{score}</strong>}

        <button onClick={handleStart}>
          {status === "Completed" ? "Retry" : "Start"}
        </button>
      </div>

    </div>
  );
}