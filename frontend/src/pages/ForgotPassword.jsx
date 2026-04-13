import { useState } from "react";
import api from "../api";
import "../styles/forgot-password.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/api/password-reset/", { email });
      setMessage("If this email exists, a reset link has been sent.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-wrapper">
        <div className="forgot-password-card">
          <h2 className="forgot-password-title">Reset Password</h2>

          <p className="forgot-password-subtitle">
            Enter your email to receive a reset link
          </p>

          <form onSubmit={handleSubmit}>
            <label className="forgot-password-label">Email</label>

            <input
              className="forgot-password-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <button
              className="forgot-password-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {message && (
              <p className="forgot-password-message">
                {message}
              </p>
            )}
          </form>

          <p className="forgot-password-footer">
            Remembered your password?{" "}
            <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}