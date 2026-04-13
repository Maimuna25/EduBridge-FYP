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

    console.log("🔍 Fetching user...");

    // 🚨 If OFFLINE → use fallback ONLY
    if (!navigator.onLine) {
      console.log("📴 Offline detected — using stored user");

      const fallbackUser = localStorage.getItem("current_user");

      if (fallbackUser) {
        try {
          const parsed = JSON.parse(fallbackUser);
          console.log("✅ Loaded fallback user:", parsed);
          setUserId(Number(parsed.id));
        } catch {
          console.log("⚠️ Fallback raw value:", fallbackUser);
          setUserId(Number(fallbackUser));
        }
      } else {
        console.warn("❌ No fallback user found in localStorage");
      }

      return;
    }

    // 🚨 If no token → fallback
    if (!token) {
      console.warn("⚠️ No token — using fallback");

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

      if (!res.ok) {
        throw new Error("Bad response");
      }

      const user = await res.json();

      console.log("✅ API user:", user);

      // 🔥 Save for offline usage
      localStorage.setItem("current_user", JSON.stringify(user));

      setUserId(Number(user.id));

    } catch (err) {

      console.error("❌ User fetch failed:", err);

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


  /* =========================
     LOAD DATA AFTER USER EXISTS
  ========================= */

  useEffect(() => {

    console.log("👀 userId:", userId);

    if (userId === null) return;

    loadOfflineData(userId);

  }, [userId]);


  /* =========================
     LOAD OFFLINE + API DATA
  ========================= */

  async function loadOfflineData(currentUserId) {

    console.log("📦 Loading offline data for:", currentUserId);

    const cachedQuizzes = await getCachedQuizzes(currentUserId);
    const cachedTopics = await getCachedTopics(currentUserId);

    console.log("🧠 Cached quizzes:", cachedQuizzes);
    console.log("🧠 Cached topics:", cachedTopics);

    setDownloadedQuizzes(cachedQuizzes);
    setDownloadedTopics(cachedTopics);

    // 🚨 STOP if offline
    if (!navigator.onLine || !token) {
      console.log("📴 Offline mode — skipping API fetch");
      return;
    }

    try {

      console.log("🌐 Fetching quizzes...");

      const quizRes = await fetch(
        "http://127.0.0.1:8000/api/quizzes/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const quizzes = await quizRes.json();

      const cachedQuizIds = cachedQuizzes.map(q => q.id);

      setAvailableQuizzes(
        quizzes.filter(q => !cachedQuizIds.includes(q.id))
      );


      console.log("🌐 Fetching topics...");

      const topicRes = await fetch(
        "http://127.0.0.1:8000/api/topics/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const topics = await topicRes.json();

      const cachedTopicSlugs = cachedTopics.map(t => t.slug);

      setAvailableTopics(
        topics.filter(t => !cachedTopicSlugs.includes(t.slug))
      );

    } catch (err) {

      console.error("❌ API fetch failed:", err);

      setAvailableQuizzes([]);
      setAvailableTopics([]);

    }

  }


  /* =========================
     DOWNLOAD FUNCTIONS
  ========================= */

  async function handleQuizDownload(quiz) {
    if (!userId) return;

    console.log("⬇️ Downloading quiz:", quiz);

    await cacheQuizzes([quiz], userId);
    loadOfflineData(userId);
  }

  async function handleTopicDownload(topic) {
    if (!userId) return;

    console.log("⬇️ Downloading topic:", topic);

    await cacheTopics([topic], userId);
    loadOfflineData(userId);
  }

  async function handleRemoveQuiz(id) {
    if (!userId) return;

    console.log("🗑 Removing quiz:", id);

    await deleteCachedQuiz(id, userId);
    loadOfflineData(userId);
  }


  function openQuiz(id) {
    navigate(`/quiz/${id}`);
  }

  function openTopic(slug) {
    navigate(`/subjects/topic/${slug}`);
  }


  /* =========================
     FILTERING
  ========================= */

  const filterItems = (items) => {

    console.log("🔎 Filtering items:", items);

    return items.filter(item => {

      const title = (item.topic || item.name || item.slug || "").toLowerCase();

      const matchesSearch = title.includes(search.toLowerCase());

      const matchesSubject =
        subjectFilter === "all" ||
        (item.subject || "").toLowerCase() === subjectFilter;

      return matchesSearch && matchesSubject;

    });

  };


  /* =========================
     DEBUG STATE
  ========================= */

  console.log("🎯 STATE");
  console.log("userId:", userId);
  console.log("downloadedTopics:", downloadedTopics);
  console.log("downloadedQuizzes:", downloadedQuizzes);


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
                onOpen={() => openTopic(t.slug)}
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