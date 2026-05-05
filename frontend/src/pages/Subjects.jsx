import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/subjects.css";

// Main Subjects hub component (handles subjects, categories, topics, and progress)
export default function Subjects() {

  const navigate = useNavigate();
  const location = useLocation();

  // STATES
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);

  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);

  // Auth token + optional subject passed via navigation
  const token = localStorage.getItem("access");
  const incomingSubject = location.state?.subject;

  // FETCH SUBJECTS

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/subjects/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        setSubjects(data);

        // If redirected with a subject (e.g., from dashboard), match it
        if (incomingSubject) {
          const match = data.find(
            s => s.name.toLowerCase().includes(incomingSubject.toLowerCase())
          );
          if (match) {
            setSelectedSubject(match);
            return;
          }
        }

        // Default to first subject
        if (data.length > 0) {
          setSelectedSubject(data[0]);
        }
      });
  }, []);

  // FETCH CATEGORIES
  useEffect(() => {
    if (!selectedSubject) return;

    fetch("http://127.0.0.1:8000/api/categories/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        // Filter categories by selected subject
        let filtered = data.filter(
          cat => cat.subject === selectedSubject.id
        );

        // Additional filtering for science disciplines
        if (selectedSubject.slug === "science" && selectedDiscipline) {
          filtered = filtered.filter(cat =>
            cat.discipline?.toLowerCase() === selectedDiscipline
          );
        }

        setCategories(filtered);
      });

  }, [selectedSubject, selectedDiscipline]);

  // FETCH TOPICS
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/topics/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTopics(data));
  }, []);

  // FETCH PROGRESS
  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/progress/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgress(data));
  }, []);

  // CATEGORY PROGRESS CALCULATION
  const getCategoryProgress = (categoryId) => {

    // Get topics belonging to this category
    const categoryTopics = topics.filter(
      t => t.category === categoryId
    );

    if (categoryTopics.length === 0) return 0;

     // Extract topic identifiers (slugs)
    const topicSlugs = categoryTopics.map(t => t.slug);

    // Match user progress for those topics
    const topicProgress = progress.filter(p =>
        topicSlugs.includes(p.topic)
    );

    // Sum progress values
    const total = topicProgress.reduce(
        (sum, p) => sum + p.progress,
        0
    );

    return Math.round(total / categoryTopics.length);
  };

  // SUBJECT / DISCIPLINE PROGRESS
  const getSubjectProgress = () => {

    if (categories.length === 0) return 0;

    // Get progress for each category
    const values = categories.map(cat =>
      getCategoryProgress(cat.id)
    );

    // Average across categories
    const total = values.reduce((sum, v) => sum + v, 0);

    return Math.round(total / categories.length);
  };

  // PROGRESS TITLE
  const format = (text) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const getProgressTitle = () => {
    if (selectedSubject.slug === "science" && selectedDiscipline) {
      return `${format(selectedDiscipline)} Progress`;
    }
    return `${selectedSubject.name} Progress`;
  };

  // Prevent rendering before subject is ready
  if (!selectedSubject) return null;

  const subjectProgress = getSubjectProgress();

  return (

    <div className="subjects-page">

      <div className="subject-container">

        <h1 className="subject-title">Subject Hub</h1>

        <p className="subject-subtitle">
          <span className="chip">Explore topics and track your progress</span>
        </p>

        {/* SUBJECT TABS */}
        <div className="subject-tabs">
          {subjects.map(subj => (
            <button
              key={subj.id}
              className={`tab-btn ${
                selectedSubject.id === subj.id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedSubject(subj);
                setSelectedDiscipline(null);
              }}
            >
              {subj.name}
            </button>
          ))}
        </div>

        {/* ================= SCIENCE SELECT ================= */}
        {selectedSubject.slug === "science" && !selectedDiscipline && (
          <div className="science-selection-wrapper">

            <h2 className="science-title">Choose a field</h2>

            <div className="science-selection">

              <button
                className="science-card biology"
                onClick={() => setSelectedDiscipline("biology")}
              >
                <span className="icon">🧬</span>
                Biology
              </button>

              <button
                className="science-card chemistry"
                onClick={() => setSelectedDiscipline("chemistry")}
              >
                <span className="icon">⚗️</span>
                Chemistry
              </button>

              <button
                className="science-card physics"
                onClick={() => setSelectedDiscipline("physics")}
              >
                <span className="icon">⚡</span>
                Physics
              </button>

            </div>

          </div>
        )}

        {/* ================= MAIN CONTENT ================= */}
        {(selectedSubject.slug !== "science" || selectedDiscipline) && (
          <>
            {selectedSubject.slug === "science" && (
              <button
                className="back-btn"
                onClick={() => setSelectedDiscipline(null)}
              >
                ← Back
              </button>
            )}

            <div className="main-progress-card">
              <h2>{getProgressTitle()}</h2>

              <div className="main-progress-bar">
                <div
                  className={`main-progress-fill ${selectedSubject.slug}`}
                  style={{ width: `${subjectProgress}%` }}
                ></div>
              </div>

              <div className="progress-percentage">
                {subjectProgress}%
              </div>
            </div>

            <h2 className="topics-heading">Topic Categories</h2>

            <div className="topics-grid">

              {categories.map(category => {

                const categoryProgress = getCategoryProgress(category.id);

                const firstTopic = topics.find(
                  topic => topic.category === category.id
                );

                return (
                  <div key={category.id} className="topic-card">

                    <h3>{category.name}</h3>

                    <div className="topic-progress-bar">
                      <div
                        className={`topic-progress-fill ${selectedSubject.slug}`}
                        style={{ width: `${categoryProgress}%` }}
                      ></div>
                    </div>

                    <div className="topic-progress-text">
                      {categoryProgress}%
                    </div>

                    <button
                      className={`continue-btn ${selectedSubject.slug}`}
                      onClick={() => {
                        if (!firstTopic) return;

                        navigate(
                          `/subjects/${selectedSubject.slug}/${category.slug}/${firstTopic.slug}`
                        );
                      }}
                    >
                      Continue
                    </button>

                  </div>
                );

              })}

            </div>
          </>
        )}

      </div>

    </div>
  );
}