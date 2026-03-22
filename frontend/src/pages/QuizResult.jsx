import { useLocation, useParams, useNavigate } from "react-router-dom";
import "../styles/quizResult.css";

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const score = location.state?.score;
  const total = location.state?.total;

  if (score === undefined || total === undefined) {
    return (
      <div className="result-wrapper">
        <div className="result-card">
          <h2>No result data found</h2>
          <button onClick={() => navigate(`/quiz/${id}`)}>
            Back to Quiz
          </button>
        </div>
      </div>
    );
  }

  const percentage = Math.round((score / total) * 100);

  return (
    <div className="result-wrapper">
      <div className="result-card">

        <h1 className="result-title">Quiz Results</h1>

        <div className="score-circle">
          <span className="score-number">{percentage}%</span>
        </div>

        <p className="score-detail">
          You scored <strong>{score}</strong> out of <strong>{total}</strong>
        </p>

        <div className="result-buttons">
          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>

          <button
            className="secondary-btn"
            onClick={() => navigate(`/quiz/${id}`)}
          >
            Retry Quiz
          </button>
        </div>

      </div>
    </div>
  );
}

export default QuizResult;