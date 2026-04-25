import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/offline.css";

import {
  cacheQuizzes,
  getCachedQuizzes,
  deleteCachedQuiz,
  cacheTopics,
  getCachedTopics
} from "../utils/offlineManager";

export default function Offline() {

  const navigate = useNavigate();
  const token = localStorage.getItem("access");

  const [userId, setUserId] = useState(null);

  const [downloadedQuizzes, setDownloadedQuizzes] = useState([]);
  const [downloadedTopics, setDownloadedTopics] = useState([]);

  const [availableQuizzes, setAvailableQuizzes] = useState([]);
  const [availableTopics, setAvailableTopics] = useState([]);

  const [search, setSearch] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");

  /* =========================
     FETCH CURRENT USER
  ========================= */

  useEffect(() => {
    getCurrentUser();
  }, []);

  async function getCurrentUser() {

    if (!navigator.onLine || !token) {
      const fallbackUser = localStorage.getItem("current_user");

      if (fallbackUser) {
        try {
          const parsed = JSON.parse(fallbackUser);
          setUserId(Number(parsed.id));
        } catch {
          setUserId(Number(fallbackUser));
        }
      }
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/api/user/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const user = await res.json();

      localStorage.setItem("current_user", JSON.stringify(user));
      setUserId(Number(user.id));

    } catch {
      const fallbackUser = localStorage.getItem("current_user");

      if (fallbackUser) {
        try {
          const parsed = JSON.parse(fallbackUser);
          setUserId(Number(parsed.id));
        } catch {
          setUserId(Number(fallbackUser));
        }
      }
    }
  }

  /* ========================= */

  useEffect(() => {
    if (userId !== null) {
      loadOfflineData(userId);
    }
  }, [userId]);

  async function loadOfflineData(currentUserId) {

    const cachedQuizzes = await getCachedQuizzes(currentUserId);
    const cachedTopics = await getCachedTopics(currentUserId);

    setDownloadedQuizzes(cachedQuizzes);
    setDownloadedTopics(cachedTopics);

    if (!navigator.onLine || !token) return;

    try {

      const quizRes = await fetch("http://127.0.0.1:8000/api/quizzes/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const quizzes = await quizRes.json();

      const cachedQuizIds = cachedQuizzes.map(q => q.id);

      setAvailableQuizzes(
        quizzes.filter(q => !cachedQuizIds.includes(q.id))
      );

      const topicRes = await fetch("http://127.0.0.1:8000/api/topics/", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const topics = await topicRes.json();

      const cachedTopicSlugs = cachedTopics.map(t => t.slug);

      setAvailableTopics(
        topics.filter(t => !cachedTopicSlugs.includes(t.slug))
      );

    } catch {
      setAvailableQuizzes([]);
      setAvailableTopics([]);
    }
  }

  /* =========================
     ACTIONS
  ========================= */

  // 🔥 FIXED HERE
  async function handleQuizDownload(quiz) {
    if (!userId) return;

    try {
      const res = await fetch(
        `http://127.0.0.1:8000/api/quizzes/${quiz.id}/`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const fullQuiz = await res.json();

      console.log("✅ Full quiz downloaded:", fullQuiz);

      await cacheQuizzes([fullQuiz], userId);

      loadOfflineData(userId);

    } catch (err) {
      console.error("❌ Quiz download failed:", err);
    }
  }

  async function handleTopicDownload(topic) {
    if (!userId) return;
    await cacheTopics([topic], userId);
    loadOfflineData(userId);
  }

  async function handleRemoveQuiz(id) {
    if (!userId) return;
    await deleteCachedQuiz(id, userId);
    loadOfflineData(userId);
  }

  function openQuiz(id) {
    navigate(`/quiz/${id}`);
  }

  function openTopic(topic) {

    const subject = topic.subject_name?.toLowerCase() || "english";
    const category = topic.slug || "general";
    const slug = topic.slug;

    navigate(`/subjects/${subject}/${category}/${slug}`);
  }

  /* ========================= */

  const filterItems = (items) => {
    return items.filter(item => {

      const title = (item.topic || item.name || item.slug || "").toLowerCase();

      const matchesSearch = title.includes(search.toLowerCase());

      const matchesSubject =
        subjectFilter === "all" ||
        (item.subject || "").toLowerCase() === subjectFilter;

      return matchesSearch && matchesSubject;
    });
  };

  /* ========================= */

  return (

    <div className="offline-wrapper">

      <div className="offline-page">

        <div className="page-header">
          <h1>Offline Mode</h1>
          <span className="chip">
            Download quizzes and lessons to access them without internet.
          </span>
        </div>

        <section>
          <h2>Downloaded Content</h2>

          <div className="list-card">

            {filterItems(downloadedQuizzes).map(q => (
              <OfflineItem
                key={`quiz-${q.id}`}
                subject={q.subject}
                subjectKey={(q.subject || "").toLowerCase()}
                title={q.topic}
                description="Downloaded Quiz"
                downloaded
                onOpen={() => openQuiz(q.id)}
                onRemove={() => handleRemoveQuiz(q.id)}
              />
            ))}

            {filterItems(downloadedTopics).map(t => (
              <OfflineItem
                key={`topic-${t.slug}`}
                subject="Lesson"
                subjectKey="lesson"
                title={t.name || t.slug}
                description="Downloaded Topic"
                downloaded
                onOpen={() => openTopic(t)}
              />
            ))}

          </div>
        </section>

        <section>
          <h2>Available Quizzes</h2>

          <div className="list-card">

            {filterItems(availableQuizzes).map(q => (
              <OfflineItem
                key={q.id}
                subject={q.subject}
                subjectKey={(q.subject || "").toLowerCase()}
                title={q.topic}
                description="Quiz"
                onDownload={() => handleQuizDownload(q)}
              />
            ))}

          </div>
        </section>

        <section>
          <h2>Available Topics</h2>

          <div className="list-card">

            {filterItems(availableTopics).map(t => (
              <OfflineItem
                key={t.slug}
                subject="Lesson"
                subjectKey="lesson"
                title={t.name || t.slug}
                description="Topic"
                onDownload={() => handleTopicDownload(t)}
              />
            ))}

          </div>
        </section>

      </div>
    </div>
  );
}


/* ================================= */

function OfflineItem({
  subject,
  subjectKey,
  title,
  description,
  downloaded,
  onDownload,
  onRemove,
  onOpen
}) {

  return (

    <div className={`offline-item ${subjectKey}`}>

      <div className="icon">
        {downloaded ? "✓" : "↓"}
      </div>

      <div className="item-info">

        <span className={`tag ${subjectKey}`}>
          {subject}
        </span>

        <h4>{title}</h4>

        <p className="muted">{description}</p>

      </div>

      {downloaded ? (

        <div className="action-buttons">

          <button className="download-btn" onClick={onOpen}>
            Open
          </button>

          {onRemove && (
            <button className="remove-btn" onClick={onRemove}>
              Remove
            </button>
          )}

        </div>

      ) : (

        <button
          className={`download-btn ${subjectKey}`}
          onClick={onDownload}
        >
          Download
        </button>

      )}

    </div>

  );
}