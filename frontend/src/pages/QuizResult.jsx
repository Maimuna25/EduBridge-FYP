import { useLocation, useParams, useNavigate } from "react-router-dom";
import "../styles/quizResult.css";

// Quiz Result page displays the user's score after completing a quiz
function QuizResult() {

  // Access navigation + route data
  const location = useLocation();  // contains state passed from previous page
  const navigate = useNavigate();  // used for navigation
  const { id } = useParams();      // get quiz ID from URL

  // Extract score data from navigation state
  const score = location.state?.score;
  const total = location.state?.total;

  // If user lands here without score data (e.g. refresh), show fallback UI
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

  // Calculate percentage score
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="result-wrapper">
      <div className="result-card">

        {/* Page title */}
        <h1 className="result-title">Quiz Results</h1>

        {/* Circular score display */}
        <div className="score-circle">
          <span className="score-number">{percentage}%</span>
        </div>

        {/* Score breakdown */}
        <p className="score-detail">
          You scored <strong>{score}</strong> out of <strong>{total}</strong>
        </p>

        {/* Action buttons */}
        <div className="result-buttons">
          <button
            className="primary-btn"
            onClick={() => navigate("/")}
          >
            Go Home
          </button>

          {/* Retry the same quiz */}
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