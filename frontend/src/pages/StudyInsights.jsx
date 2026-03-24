import { useEffect, useState } from "react";
import "../styles/studyInsights.css";

export default function StudyInsights() {

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const token = localStorage.getItem("access");

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch(
          "http://127.0.0.1:8000/api/study-insights/",
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (!res.ok) {
          setLoading(false);
          return;
        }

        const result = await res.json();
        setData(result);
        setLoading(false);

      } catch (err) {
        console.error("Failed to load insights:", err);
        setLoading(false);
      }
    };

    fetchInsights();
  }, [token]);


  if (loading) return <div className="study-page">Loading insights...</div>;
  if (!data) return <div className="study-page">No data available.</div>;


  /* ============================= */
  /* DATA PREP */
  /* ============================= */

  const accuracyData = (data.accuracy_by_topic || [])
    .sort((a, b) => b.value - a.value);

  const weakest = accuracyData.slice(-2).reverse();
  const strongest = accuracyData.filter(t => t.value >= 85).slice(0, 2);


  /* ============================= */
  /* RENDER */
  /* ============================= */

  return (
    <div className="study-page-wrapper">
      <div className="study-page">

        {/* HEADER */}
        <div className="page-header">
          <h1>Study Insights</h1>
          <span className="chip">Track progress. Improve smarter.</span>
        </div>

        {/* AI INSIGHT */}
        <div className="chart-card ai-insight big">
          <h2>💡 Your Learning Insight</h2>
          <p>{data.ai_feedback}</p>

          {data.next_action && (
            <div className="next-action">
              👉 {data.next_action}
            </div>
          )}
        </div>


        {/* STATS */}
        <div className="stats-grid">

          {/* 🔥 FIXED STUDY FREQUENCY */}
          <div className="stat-card">
            <span>Study Activity</span>
            <strong>{data.study_frequency} sessions</strong>
            <small>Last 7 days</small>

            {data.study_frequency < 3 && (
              <small className="warn-text">
                ⚠️ Below recommended (3+ sessions)
              </small>
            )}
          </div>

          {/* ACCURACY */}
          <div className="stat-card">
            <span>Average Accuracy</span>
            <strong>{data.average_accuracy ?? 0}%</strong>

            {data.average_accuracy < 75 && (
              <small className="warn-text">🟡 Improving</small>
            )}

            {data.average_accuracy >= 75 && (
              <small className="success-text">🟢 Strong</small>
            )}
          </div>

          {/* TOPICS */}
          <div className="stat-card">
            <span>Topics Mastered</span>
            <strong>{data.topics_mastered}</strong>
            <small>out of {data.topics_total}</small>
          </div>

          {/* STREAK */}
          <div className="stat-card">
            <span>Study Streak</span>
            <strong>
              {data.study_streak > 0
                ? `🔥 ${data.study_streak} days`
                : "No active streak"}
            </strong>

            {data.study_streak === 0 && (
              <small className="danger-text">Start today 🔥</small>
            )}
          </div>

        </div>


        {/* 🎯 GOALS */}
        <div className="chart-card">
          <h2>🎯 Learning Goals</h2>

          <div className="goals-list">

            {data.goals?.map((goal, index) => (
              <div key={index} className="learning-goal-card">

                <div className="learning-goal-header">
                  <strong>
                    {goal.type === "consistency"
                      ? "Complete at least 3 study sessions/week"
                      : goal.label}
                  </strong>

                  <span className={`goal-status ${goal.status}`}>
                    {goal.status === "complete" ? "Completed" : "In Progress"}
                  </span>
                </div>

                <div className="learning-goal-bar">
                  <div
                    className="learning-goal-progress"
                    style={{ width: `${goal.progress}%` }}
                  />
                </div>

                <small className="learning-goal-text">
                  {goal.current} / {goal.target}
                </small>

              </div>
            ))}

          </div>
        </div>


        {/* ACCURACY CHART */}
        <div className="chart-card">
          <h2>Accuracy by Topic</h2>

          <div className="bar-chart">

            {accuracyData.map((item, index) => (
              <div key={index} className="bar">

                <div
                  className={`bar-fill ${item.subject}`}
                  style={{ height: `${item.value}%` }}
                />

                <span className="bar-label">{item.label}</span>
                <small>{item.value}%</small>

              </div>
            ))}

          </div>
        </div>


        {/* STRENGTHS & WEAKNESSES */}
        <div className="two-column">

          {/* STRENGTHS */}
          <div className="chart-card">
            <h2>💪 Strengths</h2>

            {strongest.length === 0 ? (
              <p>No strong topics yet.</p>
            ) : (
              strongest.map((t, i) => (
                <div key={i} className="insight-item success-box">
                  <strong>{t.label}</strong>
                  <p>{t.value}% accuracy — strong understanding</p>
                </div>
              ))
            )}
          </div>


          {/* WEAKNESSES */}
          <div className="chart-card">
            <h2>⚠️ Needs Improvement</h2>

            {weakest.length === 0 ? (
              <p>No weak topics detected.</p>
            ) : (
              weakest.map((t, i) => (
                <div key={i} className="insight-item danger-box">
                  <strong>{t.label}</strong>
                  <p>{t.value}% accuracy — review recommended</p>
                </div>
              ))
            )}
          </div>

        </div>

      </div>
    </div>
  );
}