
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import Note from "./Note";
import "../styles/dashboard.css";

export default function Dashboard() {

  const navigate = useNavigate();
  const [showHelper, setShowHelper] = useState(false);

  // NOTES
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");

  const [selectedNote, setSelectedNote] = useState(null);

  // SUBJECT DATA
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);

  // =========================
  // FETCH DATA
  // =========================

  useEffect(() => {
    getNotes();
    fetchSubjects();
    fetchTopics();
    fetchProgress();
  }, []);

  useEffect(() => {
    buildRecentTopics();
  }, [topics, progress]);

  const fetchSubjects = async () => {
    try {
      const res = await api.get("/api/subjects/");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await api.get("/api/topics/");
      setTopics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await api.get("/api/progress/");
      setProgress(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // =========================
  // BUILD RECENT TOPICS
  // =========================

  const buildRecentTopics = () => {
    if (!topics.length || !progress.length) return;

    const merged = progress
      .map((p) => {
        const topic = topics.find((t) => t.slug === p.topic);

        if (!topic) return null;

        let subject =
          topic.subject_name ||
          topic.subject ||
          topic.category?.subject ||
          "";

        if (typeof subject === "object") {
          subject = subject?.name || "";
        }

        return {
          title: topic.name,
          percent: p.progress,
          subject: String(subject),
          lastAccessed: p.updated_at || p.created_at,
        };
      })
      .filter((t) => t && t.percent > 0);

    merged.sort(
      (a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed)
    );

    setRecentTopics(merged.slice(0, 4));
  };

  // =========================
  // NOTES
  // =========================

  const getNotes = () => {
    api
      .get("/api/notes/")
      .then((res) => setNotes(res.data))
      .catch((err) => alert(err));
  };

  const deleteNote = (id) => {
    api
      .delete(`/api/notes/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) getNotes();
      })
      .catch((error) => alert(error));
  };

  const createNote = (e) => {
    e.preventDefault();

    api
      .post("/api/notes/", { content, title })
      .then((res) => {
        if (res.status === 201) {
          setTitle("");
          setContent("");
          getNotes();
        }
      })
      .catch((err) => alert(err));
  };

  // =========================
  // NAVIGATION
  // =========================

  const goToSubject = (subject) => {
    navigate("/subjects", { state: { subject } });
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER */}
        <div className="dashboard-header">
          <h1>Welcome Back</h1>
          <p>
            <span className="chip">Continue your learning journey in Mathematics, Science, and Chemistry</span>
          </p>
        </div>

        {/* SUBJECT CARDS */}
        <section className="section">
          <div className="subject-cards">

            <div className="subject-card" onClick={() => goToSubject("mathematics")}>
              📘
              <div>
                <strong>Mathematics</strong>
                <span>Continue learning</span>
              </div>
            </div>

            <div className="subject-card" onClick={() => goToSubject("science")}>
              🧪
              <div>
                <strong>Science</strong>
                <span>Continue learning</span>
              </div>
            </div>

            <div className="subject-card" onClick={() => goToSubject("english")}>
              🟣
              <div>
                <strong>English</strong>
                <span>Continue learning</span>
              </div>
            </div>

          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="section">
          <h2>Quick Actions</h2>

          <div className="quick-actions">

            <div className="quick-card" onClick={() => navigate("/ai-tutor")}>
              <strong>Ask AI Tutor</strong>
              <p>Get help with any topic</p>
            </div>

            <div className="quick-card" onClick={() => navigate("/explain-it-back")}>
              <strong>Explain It Back</strong>
              <p>Test your understanding</p>
            </div>

            <div className="quick-card" onClick={() => navigate("/quizzes")}>
              <strong>Take a Quiz</strong>
              <p>Practice your knowledge</p>
            </div>

          </div>
        </section>

        {/* RECENT TOPICS */}
        <section className="section">
          <h2>Recent Topics Studied</h2>

          <div className="progress-list">

            {recentTopics.length === 0 && (
              <p className="empty-text">
                Start learning topics to see your progress here.
              </p>
            )}

            {recentTopics.map((topic, index) => (
              <Progress
                key={index}
                title={topic.title}
                percent={topic.percent}
                subject={topic.subject}
              />
            ))}

          </div>
        </section>

        {/* NOTES */}
        <section className="section">
          <h2>Your Notes</h2>

          <div className="notes-grid">

            <div className="notes-list">

              {notes.length === 0 ? (
                <p className="notes-empty">
                  No notes yet. Create your first one 👇
                </p>
              ) : (
                notes.map((note) => (

                  <div
                    key={note.id}
                    className="note-card clickable"
                    onClick={() => setSelectedNote(note)}
                  >
                    <h4>{note.title}</h4>

                    <p>
                      {note.content.length > 80
                        ? note.content.substring(0, 80) + "..."
                        : note.content}
                    </p>
                  </div>

                ))
              )}

            </div>

            <div className="notes-create">

              <h3>Create a Note</h3>

              <form onSubmit={createNote}>

                <label>Title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />

                <label>Content</label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />

                <button className="primary-btn">
                  Save Note
                </button>

              </form>

            </div>
          </div>
        </section>

      </div>

      {/* NOTE POPUP */}

      {selectedNote && (

        <div
          className="note-popup-overlay"
          onClick={() => setSelectedNote(null)}
        >

          <div
            className="note-popup"
            onClick={(e) => e.stopPropagation()}
          >

            <h3>{selectedNote.title}</h3>

            <p>{selectedNote.content}</p>

            <div className="note-popup-actions">

              <button
                className="secondary-btn"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </button>

              <button
                className="danger-btn"
                onClick={() => {
                  deleteNote(selectedNote.id);
                  setSelectedNote(null);
                }}
              >
                Delete
              </button>

            </div>

          </div>

        </div>

      )}

      {/* AI HELPER */}
      <div
        className="ai-helper"
        onClick={() => setShowHelper(true)}
      >
        🤖 Need help?
      </div>

      {showHelper && (
        <div
          className="ai-popup-overlay"
          onClick={() => setShowHelper(false)}
        >
          <div
            className="ai-popup"
            onClick={(e) => e.stopPropagation()}
          >

            <h3>Need assistance?</h3>

            <p>
              Would you like help from the AI Tutor with a topic?
            </p>

            <div className="popup-actions">

              <button
                className="primary-btn"
                onClick={() => navigate("/ai-tutor")}
              >
                Go to AI Tutor
              </button>

              <button
                className="secondary-btn"
                onClick={() => setShowHelper(false)}
              >
                Cancel
              </button>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Progress({ title, percent, subject }) {

  const colorMap = {
    mathematics: "#2563eb",
    science: "#16a34a",
    english: "#7c3aed",
  };

  const getColor = () => {
    const name = (subject || "").toLowerCase();

    if (name.includes("math")) return colorMap.mathematics;
    if (name.includes("science")) return colorMap.science;
    if (name.includes("english")) return colorMap.english;

    return "#2563eb";
  };

  return (
    <div className="progress-item">

      <div className="progress-header">
        <strong>{title}</strong>
        <span>{percent}%</span>
      </div>

      <div className="dash-progress-bar">
        <div
          className="dash-progress-fill"
          style={{
            width: `${percent}%`,
            backgroundColor: getColor(),
          }}
        />
      </div>

    </div>
  );
}

