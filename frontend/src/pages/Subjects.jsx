import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/subjects.css";

export default function Subjects() {

  const navigate = useNavigate();
  const location = useLocation();

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [categories, setCategories] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);

  const token = localStorage.getItem("access");

  // ✅ Get subject from Dashboard navigation
  const incomingSubject = location.state?.subject;


  // ================================
  // FETCH SUBJECTS
  // ================================
  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/subjects/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        setSubjects(data);

        // 🔥 If coming from Dashboard → match subject
        if (incomingSubject) {

          const match = data.find(
            s => s.name.toLowerCase().includes(incomingSubject.toLowerCase())
          );

          if (match) {
            setSelectedSubject(match);
            return;
          }
        }

        // fallback (default first subject)
        if (data.length > 0) {
          setSelectedSubject(data[0]);
        }

      });

  }, []);


  // ================================
  // FETCH CATEGORIES
  // ================================
  useEffect(() => {

    if (!selectedSubject) return;

    fetch("http://127.0.0.1:8000/api/categories/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {

        const filtered = data.filter(
          cat => cat.subject === selectedSubject.id
        );

        setCategories(filtered);

      });

  }, [selectedSubject]);


  // ================================
  // FETCH TOPICS
  // ================================
  useEffect(() => {

    fetch("http://127.0.0.1:8000/api/topics/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setTopics(data));

  }, []);


  // ================================
  // FETCH PROGRESS
  // ================================
  const loadProgress = () => {

    fetch("http://127.0.0.1:8000/api/progress/", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProgress(data));

  };

  useEffect(() => {
    loadProgress();
  }, []);


  // ================================
  // CATEGORY PROGRESS
  // ================================
  const getCategoryProgress = (categoryId) => {

    const categoryTopics = topics.filter(
      t => t.category === categoryId
    );

    if (categoryTopics.length === 0) return 0;

    const topicSlugs = categoryTopics.map(t => t.slug);

    const topicProgress = progress.filter(p =>
      topicSlugs.includes(p.topic)
    );

    if (topicProgress.length === 0) return 0;

    const total = topicProgress.reduce(
      (sum, p) => sum + p.progress,
      0
    );

    return Math.round(total / categoryTopics.length);
  };


  // ================================
  // SUBJECT PROGRESS
  // ================================
  const getSubjectProgress = () => {

    if (categories.length === 0) return 0;

    const values = categories.map(cat =>
      getCategoryProgress(cat.id)
    );

    const total = values.reduce((sum, v) => sum + v, 0);

    return Math.round(total / categories.length);
  };


  if (!selectedSubject) return null;

  const subjectProgress = getSubjectProgress();


  return (

    <div className="subjects-page">

      <div className="subject-container">

        <h1 className="subject-title">
          Subject Hub
        </h1>

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
              onClick={() => setSelectedSubject(subj)}
            >
              {subj.name}
            </button>

          ))}

        </div>


        {/* MAIN SUBJECT PROGRESS */}
        <div className="main-progress-card">

          <h2>{selectedSubject.name} Progress</h2>

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


        {/* CATEGORY GRID */}
        <h2 className="topics-heading">
          Topic Categories
        </h2>

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

                    if (!firstTopic) {
                      alert("No topics in this category yet.");
                      return;
                    }

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

      </div>

    </div>
  );
}