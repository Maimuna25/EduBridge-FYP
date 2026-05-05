import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/dashboard.css";

// Main dashboard page with subjects, progress, and notes
export default function Dashboard() {
  const navigate = useNavigate();
  const [showHelper, setShowHelper] = useState(false);

  // Notes state
  const [notes, setNotes] = useState([]);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [selectedNote, setSelectedNote] = useState(null);

  // Edit state for notes
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Data for subjects, topics, and progress
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState([]);
  const [recentTopics, setRecentTopics] = useState([]);

  // Initial data fetch
  useEffect(() => {
    getNotes();
    fetchSubjects();
    fetchTopics();
    fetchProgress();
  }, []);

  // Build recent topics when data changes
  useEffect(() => {
    buildRecentTopics();
  }, [topics, progress]);

  // Fetch subjects from API
  const fetchSubjects = async () => {
    try {
      const res = await api.get("/api/subjects/");
      setSubjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch topics from API
  const fetchTopics = async () => {
    try {
      const res = await api.get("/api/topics/");
      setTopics(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch user progress
  const fetchProgress = async () => {
    try {
      const res = await api.get("/api/progress/");
      setProgress(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Merge topics + progress into recent activity
  const buildRecentTopics = () => {
    if (!topics.length || !progress.length) return;

    const merged = progress
      .map((p) => {
        const topic = topics.find((t) => t.slug === p.topic);
        if (!topic) return null;

        const subject =
          topic.subject_name ||
          topic.subject ||
          topic.category?.subject ||
          "";

        return {
          title: topic.name,
          percent: p.progress ?? 0,
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


  // Fetch notes
  const getNotes = () => {
    api
      .get("/api/notes/")
      .then((res) => setNotes(res.data))
      .catch((err) => alert(err));
  };

  // Delete note by ID
  const deleteNote = (id) => {
    api
      .delete(`/api/notes/delete/${id}/`)
      .then((res) => {
        if (res.status === 204) getNotes();
      })
      .catch((error) => alert(error));
  };

  // Create new note
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

  // Update selected note
  const updateNote = () => {
    api
      .put(`/api/notes/${selectedNote.id}/`, {
        title: editTitle,
        content: editContent,
      })
      .then(() => {
        getNotes();
        setIsEditing(false);
        setSelectedNote(null);
      })
      .catch((err) => alert(err));
  };

  // Navigate to subject page
  const goToSubject = (subject) => {
    navigate("/subjects", { state: { subject } });
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">

        {/* HEADER */}
        <div className="dashboard-header">
          <h1>Welcome Back</h1>
          <span className="chip">
            Explain a topic in your own words to test your understanding.
          </span>
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
              <p>Get help instantly</p>
            </div>

            <div className="quick-card" onClick={() => navigate("/explain-it-back")}>
              <strong>Explain It Back</strong>
              <p>Test understanding</p>
            </div>

            <div className="quick-card" onClick={() => navigate("/quizzes")}>
              <strong>Take a Quiz</strong>
              <p>Practice knowledge</p>
            </div>
          </div>
        </section>

        {/* RECENT TOPICS */}
        <section className="section">
          <h2>Recent Topics</h2>

          <div className="progress-list">
            {recentTopics.length === 0 ? (
              <p>No progress yet.</p>
            ) : (
              recentTopics.map((topic, index) => (
                <Progress key={index} {...topic} />
              ))
            )}
          </div>
        </section>

        {/* NOTES */}
        <section className="section">
          <h2>Your Notes</h2>

          <div className="notes-grid">

            <div className="notes-list">
              {notes.length === 0 ? (
                <p>No notes yet</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="note-card clickable"
                    onClick={() => {
                      setSelectedNote(note);
                      setEditTitle(note.title);
                      setEditContent(note.content);
                    }}
                  >
                    <h4>{note.title}</h4>
                    <p>{note.content}</p>

                    <span className="note-date">
                      Last edited:{" "}
                      {new Date(note.updated_at || note.created_at).toLocaleDateString()}
                      <span className="note-time">
                        {new Date(note.updated_at || note.created_at).toLocaleTimeString()}
                      </span>
                    </span>
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

                <button className="primary-btn">Save Note</button>
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

            {isEditing ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                />
              </>
            ) : (
              <>
                <h3>{selectedNote.title}</h3>

                <span className="note-date">
                  Last edited:{" "}
                  {new Date(
                    selectedNote.updated_at || selectedNote.created_at
                  ).toLocaleString()}
                </span>

                <p>{selectedNote.content}</p>
              </>
            )}

            <div className="note-popup-actions">
              <button
                className="secondary-btn"
                onClick={() => setSelectedNote(null)}
              >
                Close
              </button>

              {!isEditing ? (
                <button
                  className="edit-btn"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              ) : (
                <button
                  className="primary-btn"
                  onClick={updateNote}
                >
                  Save
                </button>
              )}

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
      <div className="ai-helper" onClick={() => setShowHelper(true)}>
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
            <p>Would you like help from the AI Tutor?</p>

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

/* Progress bar component for topic completion */
function Progress({ title, percent, subject }) {
  const getColor = () => {
    const name = (subject || "").toLowerCase();

    if (name.includes("math")) return "#2563eb";
    if (name.includes("science")) return "#16a34a";
    if (name.includes("english")) return "#7c3aed";

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