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

    console.log("Fetching user...");

    if (!token) {
      console.log("No token found");
      return;
    }

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/api/user/",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("User response status:", res.status);

      const text = await res.text();

      console.log("Raw user response:", text);

      const user = JSON.parse(text);

      console.log("User object:", user);

      setUserId(user.id);

    } catch (err) {

      console.error("User fetch failed:", err);

      /* fallback user */
      const fallbackUser = localStorage.getItem("current_user");

      if (fallbackUser) {

        console.log("Using fallback user:", fallbackUser);

        setUserId(fallbackUser);

      }

    }

  }


  /* =========================
     LOAD DATA AFTER USER EXISTS
  ========================= */

  useEffect(() => {

    if (!userId) {
      console.log("No userId yet");
      return;
    }

    console.log("UserID ready:", userId);

    loadOfflineData(userId);

  }, [userId]);


  /* =========================
     LOAD OFFLINE + API DATA
  ========================= */

  async function loadOfflineData(currentUserId) {

    console.log("Loading offline data for user:", currentUserId);

    const cachedQuizzes = await getCachedQuizzes(currentUserId);
    const cachedTopics = await getCachedTopics(currentUserId);

    console.log("Cached quizzes:", cachedQuizzes);
    console.log("Cached topics:", cachedTopics);

    setDownloadedQuizzes(cachedQuizzes);
    setDownloadedTopics(cachedTopics);

    if (!token) return;

    try {

      console.log("Fetching quizzes...");

      const quizRes = await fetch(
        "http://127.0.0.1:8000/api/quizzes/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const quizzes = await quizRes.json();

      console.log("API quizzes:", quizzes);

      const cachedQuizIds = cachedQuizzes.map(q => q.id);

      setAvailableQuizzes(
        quizzes.filter(q => !cachedQuizIds.includes(q.id))
      );


      console.log("Fetching topics...");

      const topicRes = await fetch(
        "http://127.0.0.1:8000/api/topics/",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const topics = await topicRes.json();

      console.log("API topics:", topics);

      const cachedTopicSlugs = cachedTopics.map(t => t.slug);

      setAvailableTopics(
        topics.filter(t => !cachedTopicSlugs.includes(t.slug))
      );

    } catch (err) {

      console.error("API fetch failed:", err);

      setAvailableQuizzes([]);
      setAvailableTopics([]);

    }

  }


  /* =========================
     DOWNLOAD FUNCTIONS
  ========================= */

  async function handleQuizDownload(quiz) {

    console.log("Downloading quiz:", quiz);

    if (!userId) return;

    await cacheQuizzes([quiz], userId);

    loadOfflineData(userId);

  }

  async function handleTopicDownload(topic) {

    console.log("Downloading topic:", topic);

    if (!userId) return;

    await cacheTopics([topic], userId);

    loadOfflineData(userId);

  }

  async function handleRemoveQuiz(id) {

    console.log("Removing quiz:", id);

    if (!userId) return;

    await deleteCachedQuiz(id, userId);

    loadOfflineData(userId);

  }


  function openQuiz(id) {

    console.log("Opening quiz:", id);

    navigate(`/quiz/${id}`);

  }

  function openTopic(slug) {

    console.log("Opening topic:", slug);

    navigate(`/subjects/topic/${slug}`);

  }


  /* =========================
     FILTERING
  ========================= */

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


  return (

    <div className="offline-wrapper">

      <div className="offline-page">

        <div className="page-header">

          <h1>Offline Mode</h1>

          <span className="chip">
            Download quizzes and lessons to access them without internet.
          </span>

        </div>


        <div className="offline-controls">

          <input
            className="offline-search"
            placeholder="Search quizzes or topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="subject-filters">

            {["all", "mathematics", "science", "english"].map(subject => (

              <button
                key={subject}
                className={`filter-btn ${subjectFilter === subject ? "active" : ""}`}
                onClick={() => setSubjectFilter(subject)}
              >
                {subject === "all"
                  ? "All"
                  : subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>

            ))}

          </div>

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
                description={`Downloaded Topic Quiz`}
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
                description="Downloaded Topic Reading"
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
                description={`Topic Quiz`}
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
                description="Topic Reading"
                onDownload={() => handleTopicDownload(t)}
              />

            ))}

          </div>

        </section>

      </div>

    </div>

  );

}



/* =================================
   ITEM COMPONENT
================================= */

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

        <p className="muted">
          {description}
        </p>

      </div>

      {downloaded ? (

        <div className="action-buttons">

          <button
            className="download-btn"
            onClick={onOpen}
          >
            Open
          </button>

          {onRemove && (
            <button
              className="remove-btn"
              onClick={onRemove}
            >
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