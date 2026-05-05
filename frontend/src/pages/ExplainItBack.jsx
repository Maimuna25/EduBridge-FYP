import { useEffect, useState } from "react";
import api from "../api";
import "../styles/explain-it-back.css";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Explain It Back feature for testing user understanding
export default function ExplainItBack() {

  // Difficulty levels
  const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

  // Subject + topic data
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);

  // Subject + topic data
  const [selectedSubject, setSelectedSubject] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");

  // Difficulty selection
  const [difficulty, setDifficulty] = useState("Beginner");

  // Prompt data
  const [prompt, setPrompt] = useState(null);
  const [loadingPrompt, setLoadingPrompt] = useState(false);

  // User input state
  const [explanation, setExplanation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Feedback + score
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(null);

  // Track typing to hide concept
  const [isTyping, setIsTyping] = useState(false);

  /* FETCH SUBJECTS + TOPICS */

  // Load subjects and topics on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, topicsRes] = await Promise.all([
          api.get("/api/subjects/"),
          api.get("/api/topics/")
        ]);

        setSubjects(subjectsRes.data);
        setTopics(topicsRes.data);

        if (subjectsRes.data.length > 0) {
          setSelectedSubject(subjectsRes.data[0].name);
        }

      } catch (err) {
        console.error("Failed to load subjects/topics:", err);
      }
    };

    fetchData();
  }, []);

  // Filter topics by selected subject
  const filteredTopics = topics.filter(
    (t) => t.subject === selectedSubject
  );

  // Auto-select first topic when subject changes
  useEffect(() => {
    if (filteredTopics.length > 0) {
      setSelectedTopic(filteredTopics[0].name);
    }
  }, [selectedSubject, topics]);

  /* FETCH PROMPT */

  // Fetch explanation prompt when filters change
  useEffect(() => {

    if (!selectedSubject || !selectedTopic) return;

    const fetchPrompt = async () => {

      setLoadingPrompt(true);
      setPrompt(null);
      setFeedback("");
      setScore(null);
      setExplanation("");
      setIsTyping(false); // reset

      try {

        const res = await api.get("/api/explain/prompt/", {
          params: {
            subject: selectedSubject,
            topic: selectedTopic,
            difficulty,
          },
        });

        setPrompt(res.data);

      } catch (err) {

        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to load prompt.";

        setPrompt({ title: "Error", concept_text: `⚠️ ${msg}` });

      } finally {
        setLoadingPrompt(false);
      }

    };

    fetchPrompt();

  }, [selectedSubject, selectedTopic, difficulty]);

  /* SUBMIT */

  // Submit user explanation for AI feedback
  const handleSubmit = async () => {

    if (!prompt?.id) return;

    const text = explanation.trim();
    if (!text || submitting) return;

    setSubmitting(true);
    setFeedback("");
    setScore(null);

    try {

      const res = await api.post("/api/explain/attempt/", {
        prompt_id: prompt.id,
        user_explanation: text,
      });

      setFeedback(res.data?.ai_feedback || "No feedback returned.");
      setScore(res.data?.score ?? null);

    } catch (err) {

      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        err?.message ||
        "Something went wrong.";

      setFeedback(`⚠️ ${msg}`);

    } finally {
      setSubmitting(false);
    }

  };

  /* RENDER */

  return (

    <div className="explain-page-wrapper">

      <div className="explain-page">

        <div className="explain-header">

          <h1>Explain It Back</h1>

          <span className="chip">
            Explain a topic in your own words to test your understanding.
          </span>

          <div className="explain-controls">

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>

            {/* Topic selector */}
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              {filteredTopics.map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>

            {/* Difficulty selector */}
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

          </div>

        </div>

        {/* Main layout */}
        <div className="explain-main">

          {/* Concept Panel */}
          <div className="concept-panel">

            <h2>💡 Concept Explanation</h2>

            <div className="panel-scroll">

              {loadingPrompt ? (
                <p>Loading…</p>
              ) : (
                <>
                  {prompt?.title && <h3>{prompt.title}</h3>}

                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {prompt?.concept_text || "No concept text found."}
                  </ReactMarkdown>
                </>
              )}

            </div>

            {/* Hide concept while typing */}
            {isTyping && (
              <div className="concept-overlay">
                <p>🔒 Hidden while you write your explanation</p>
              </div>
            )}

          </div>


          {/* User input panel */}
          <div className="user-panel">

            <h2>Your Explanation</h2>

            <div className="panel-scroll">

              <p className="helper-text">
                Now explain the concept in your own words.
              </p>

              {/* Explanation input */}
              <textarea
                placeholder="Type your explanation here..."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                onFocus={() => setIsTyping(true)}
                onBlur={() => setIsTyping(false)}
                disabled={loadingPrompt}
              />

              {/* Character count */}
              <div className="char-count">
                {explanation.length} characters
              </div>

              {/* Submit button */}
              <button
                className="submit-btn"
                disabled={
                  !explanation.trim() ||
                  submitting ||
                  loadingPrompt ||
                  !prompt?.id
                }
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit for Feedback"}
              </button>

            </div>

          </div>

        </div>

        {/* Feedback section */}
        {feedback && (

          <div className="feedback-wrapper">

            <div className="feedback-card">

              {score !== null && (
                <div className="feedback-score">
                  🎯 Your Score: {score} / 10
                </div>
              )}

              <div className="feedback-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {feedback}
                </ReactMarkdown>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );
}