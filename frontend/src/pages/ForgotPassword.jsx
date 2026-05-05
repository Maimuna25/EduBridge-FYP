import { useState } from "react";
import api from "../api";
import "../styles/forgot-password.css";

// Password reset request page
export default function ForgotPassword() {

  // Form state
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit email to request reset link
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

          {/* Page title */}
          <h2 className="forgot-password-title">Reset Password</h2>

          {/* Instruction text */}
          <p className="forgot-password-subtitle">
            Enter your email to receive a reset link
          </p>

          {/* Reset form */}
          <form onSubmit={handleSubmit}>
            <label className="forgot-password-label">Email</label>

            {/* Email input */}
            <input
              className="forgot-password-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {/* Submit button */}
            <button
              className="forgot-password-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            {/* Feedback message */}
            {message && (
              <p className="forgot-password-message">
                {message}
              </p>
            )}
          </form>

          {/* Back to login link */}
          <p className="forgot-password-footer">
            Remembered your password?{" "}
            <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}