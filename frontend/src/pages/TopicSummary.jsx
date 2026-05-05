import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/TopicSummary.css";

import { getCachedTopics } from "../utils/offlineManager";

// Component for displaying topic slides with offline support + progress tracking
export default function TopicSummary() {

  // Get topic slug from URL + navigation helper
  const { topicSlug } = useParams();
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(0);

  const token = localStorage.getItem("access");

  // GET USER (IMPORTANT FOR CACHE)
  useEffect(() => {
    const stored = localStorage.getItem("current_user");

    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserId(Number(parsed.id));
      } catch {
        setUserId(Number(stored));
      }
    }
  }, []);

  // MARK PROGRESS
  const markSlideComplete = (slideIndex) => {

    if (!slides.length || !navigator.onLine) return;

    fetch("http://127.0.0.1:8000/api/progress/update/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic_slug: topicSlug,
        slides_completed: slideIndex + 1
      }),
    }).catch(() => {});
  };

  // LOAD TOPIC
  useEffect(() => {

    if (!topicSlug || userId === null) return;

    async function loadTopic() {

      console.log("📍 Loading topic:", topicSlug);

      setLoading(true);

      // OFFLINE FIRST
      if (!navigator.onLine) {

        console.log("📴 Offline mode");

        const cachedTopics = await getCachedTopics(userId);

        console.log("🧠 Cached topics:", cachedTopics);

        const topic = cachedTopics.find(t => t.slug === topicSlug);

        if (topic && topic.slides) {

          console.log("✅ Found topic in cache:", topic);

          const sortedSlides = topic.slides.sort(
            (a, b) => a.order - b.order
          );

          setSlides(sortedSlides);
          setCurrentSlide(0);
          setLoading(false);
          return;
        }

        console.warn("❌ Topic not found in cache or missing slides");
      }

      // ONLINE
      try {

        console.log("🌐 Fetching from API");

        const res = await fetch("http://127.0.0.1:8000/api/topics/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const topics = await res.json();
        const topic = topics.find(t => t.slug === topicSlug);

        if (!topic) {
          setSlides([]);
          setLoading(false);
          return;
        }

        console.log("✅ Loaded from API:", topic);

        const sortedSlides = (topic.slides || []).sort(
          (a, b) => a.order - b.order
        );

        setSlides(sortedSlides);
        setCurrentSlide(0);

      } catch (err) {

        console.error("❌ API failed, trying cache", err);

        // fallback to cache
        const cachedTopics = await getCachedTopics(userId);
        const topic = cachedTopics.find(t => t.slug === topicSlug);

        if (topic && topic.slides) {

          console.log("✅ Fallback cache success");

          const sortedSlides = topic.slides.sort(
            (a, b) => a.order - b.order
          );

          setSlides(sortedSlides);
        } else {
          console.error("❌ No cached fallback available");
          setSlides([]);
        }
      }

      setLoading(false);
    }

    loadTopic();

  }, [topicSlug, token, userId]);

  // TRACK PROGRESS
  useEffect(() => {
    if (slides.length > 0) {
      markSlideComplete(currentSlide);
    }
  }, [currentSlide, slides]);

  // NAVIGATION
  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const askAiTutor = () => {
    const slideContent = slides[currentSlide]?.content;

    navigate("/ai-tutor", {
      state: {
        topic: topicSlug,
        slideNumber: currentSlide + 1,
        slideContent
      }
    });
  };

  // UI
  return (

    <div className="topic-summary-wrapper">

      <div className="topic-summary-container">

        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <h1>
          {topicSlug?.replace("-", " ").toUpperCase()}
        </h1>

        {loading ? (

          <p>Loading slides...</p>

        ) : slides.length === 0 ? (

          <p>No slides available (offline or not downloaded).</p>

        ) : (

          <>
            <div className="slide-card">
              <p>{slides[currentSlide]?.content}</p>
            </div>

            <div className="slide-progress">
              {currentSlide + 1} / {slides.length}
            </div>

            <div className="slide-actions">

              <button
                className="nav-btn"
                onClick={handlePrev}
                disabled={currentSlide === 0}
              >
                Previous
              </button>

              <button
                className="ai-btn"
                onClick={askAiTutor}
              >
                Ask AI Tutor
              </button>

              <button
                className="nav-btn"
                onClick={handleNext}
                disabled={currentSlide === slides.length - 1}
              >
                Next
              </button>

            </div>
          </>
        )}

      </div>

    </div>
  );
}