import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";
import "../styles/ai-tutor.css";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatAiText(text) {

  if (!text) return "";

  const alreadyStructured =
    text.includes("\n- ") ||
    text.includes("\n• ") ||
    /\n\d+\./.test(text) ||
    text.includes("\n##") ||
    text.includes("\n###");

  if (alreadyStructured) return text.trim();
  if (text.length < 240) return text.trim();

  return text.replace(/\. /g, ".\n\n").trim();
}

export default function AiTutor() {

  const location = useLocation();
  const slideContext = location.state?.slideContent || "";
  const topicContext = location.state?.topic || "General";

  const [sessionId, setSessionId] = useState(null);
  const [activeSession, setActiveSession] = useState(null);

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [messages, setMessages] = useState([]);
  const [historySessions, setHistorySessions] = useState([]);

  const initialized = useRef(false);
  const messagesEndRef = useRef(null);

  const prompts = [
    "Explain this topic in simple terms",
    "Give me a real world example",
    "What are the key concepts?",
    "Test my understanding with a question",
    "Summarise this topic for me"
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  /* ------------------------
     Load conversation list
  ------------------------ */

  const loadHistory = async () => {

    try {

      const res = await api.get("/api/chat/sessions/");
      setHistorySessions(res.data || []);

    } catch (err) {

      console.error("Failed to load sessions", err);

    }

  };


  /* ------------------------
     Load selected session
  ------------------------ */

  const loadSession = async (session) => {

    try {

      setSessionId(session.id);
      setActiveSession(session.id);

      const res = await api.get("/api/ai/history/", {
        params: { session_id: session.id }
      });

      const formatted = res.data.messages.map(m => ({
        role: m.role,
        text: m.content
      }));

      setMessages(formatted);

    } catch (err) {

      console.error("Failed to load session history", err);

    }

  };


  /* ------------------------
     Init session
  ------------------------ */

  useEffect(() => {

    if (initialized.current) return;
    initialized.current = true;

    const initSession = async () => {

      try {

        const res = await api.post("/api/ai/switch-session/", {
          subject: "Learning",
          topic: topicContext
        });

        const newSessionId = res.data.session_id;

        setSessionId(newSessionId);
        setActiveSession(newSessionId);

        loadHistory();

        if (slideContext) {

          const introMessage = `I am studying the topic "${topicContext}".

Here is the lesson content:

${slideContext}

Please explain this clearly for me.`;

          sendToAi(introMessage, newSessionId);

        } else {

          setMessages([
            {
              role: "assistant",
              text: "Hello! I'm your AI tutor.\n\nAsk me anything you'd like to learn."
            }
          ]);

        }

      } catch (err) {

        console.error("Session init failed:", err);

      }

    };

    initSession();

  }, []);


  /* ------------------------
     Send message
  ------------------------ */

  const sendToAi = async (text, overrideSession = null) => {

    const sid = overrideSession || sessionId;
    if (!sid) return;

    setMessages(prev => [...prev, { role: "user", text }]);
    setInput("");
    setSending(true);

    try {

      const res = await api.post("/api/ai/tutor/", {
        message: text,
        session_id: sid,
        slide_content: slideContext
      });

      const rawReply =
        res?.data?.reply || "Sorry — I couldn't generate a response.";

      const reply = formatAiText(rawReply);

      setMessages(prev => [...prev, { role: "assistant", text: reply }]);

      loadHistory();

    } catch (err) {

      setMessages(prev => [
        ...prev,
        { role: "assistant", text: "⚠️ Something went wrong." }
      ]);

    } finally {

      setSending(false);

    }

  };


  const handleSend = () => {

    const text = input.trim();
    if (!text || sending) return;

    sendToAi(text);

  };


  const handlePrompt = (prompt) => {
    setInput(prompt);
  };


  const onKeyDown = (e) => {

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }

  };


  return (

    <div className="ai-tutor-page">

      <div className="ai-page">

        <div className="ai-header">

          <h1>AI Tutor</h1>

          <div className="ai-meta">
            <span className="chip">Topic: {topicContext}</span>
          </div>

        </div>


        <div className="prompt-bar">

          {prompts.map((p, i) => (

            <button
              key={i}
              className="prompt-chip"
              onClick={() => handlePrompt(p)}
            >
              {p}
            </button>

          ))}

        </div>


        <div className="ai-layout">

          {/* CHAT */}

          <div className="ai-chat">

            <div className="ai-messages">

              {messages.map((msg, i) => (

                <div
                  key={i}
                  className={`ai-message ${
                    msg.role === "user" ? "user" : "bot"
                  }`}
                >

                  {msg.role === "assistant" ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}

                </div>

              ))}

              {sending && (
                <div className="ai-message bot">Typing…</div>
              )}

              <div ref={messagesEndRef} />

            </div>

            <div className="ai-input">

              <input
                type="text"
                placeholder="Ask a question..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={sending}
              />

              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                Send
              </button>

            </div>

          </div>


          {/* HISTORY */}

          <div className="ai-history">

            <h3>Conversation History</h3>

            <div className="history-list">

              {historySessions.map((session) => (

                <div
                  key={session.id}
                  className={`history-item ${
                    activeSession === session.id ? "active" : ""
                  }`}
                  onClick={() => loadSession(session)}
                >

                  <strong>{session.topic}</strong>

                  <p className="history-date">
                    {new Date(session.created_at).toLocaleDateString()}
                  </p>

                </div>

              ))}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}