import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/TopicSummary.css";

import { getCachedTopic } from "../utils/offlineManager";

export default function TopicSummary() {

  const { topicSlug } = useParams();
  const navigate = useNavigate();

  const [slides, setSlides] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access");

  // ==========================
  // MARK PROGRESS
  // ==========================
  const markSlideComplete = (slideIndex) => {

    if (!slides.length) return;

    const slidesCompleted = slideIndex + 1;

    fetch("http://127.0.0.1:8000/api/progress/update/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        topic_slug: topicSlug,
        slides_completed: slidesCompleted
      }),
    }).catch(() => {});
  };

  // ==========================
  // LOAD TOPIC
  // ==========================
  useEffect(() => {

    async function loadTopic() {

      setLoading(true);

      // OFFLINE MODE
      if (!navigator.onLine) {

        const cachedTopic = await getCachedTopic(topicSlug);

        if (cachedTopic) {
          const sortedSlides = (cachedTopic.slides || []).sort(
            (a, b) => a.order - b.order
          );

          setSlides(sortedSlides);
          setCurrentSlide(0);
          setLoading(false);
          return;
        }
      }

      // ONLINE MODE
      try {

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

        const sortedSlides = (topic.slides || []).sort(
          (a, b) => a.order - b.order
        );

        setSlides(sortedSlides);
        setCurrentSlide(0);

      } catch {

        const cachedTopic = await getCachedTopic(topicSlug);

        if (cachedTopic) {
          const sortedSlides = (cachedTopic.slides || []).sort(
            (a, b) => a.order - b.order
          );

          setSlides(sortedSlides);
        }
      }

      setLoading(false);
    }

    loadTopic();

  }, [topicSlug, token]);

  // ==========================
  // ✅ TRACK PROGRESS (FIXED)
  // ==========================
  useEffect(() => {
    if (slides.length > 0) {
      markSlideComplete(currentSlide);
    }
  }, [currentSlide, slides]);

  // ==========================
  // NAVIGATION
  // ==========================
  const handleNext = () => {
    const nextSlide = currentSlide + 1;

    if (nextSlide < slides.length) {
      setCurrentSlide(nextSlide);
    }
  };

  const handlePrev = () => {
    const prevSlide = currentSlide - 1;

    if (prevSlide >= 0) {
      setCurrentSlide(prevSlide);
    }
  };

  const askAiTutor = () => {

    const slideContent = slides[currentSlide]?.content;

    navigate("/ai-tutor", {
      state: {
        topic: topicSlug,
        slideNumber: currentSlide + 1,
        slideContent: slideContent
      }
    });
  };

  // ==========================
  // UI
  // ==========================
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

          <p>No slides available.</p>

        ) : (

          <>
            <div className="slide-card">
              <p>{slides[currentSlide].content}</p>
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