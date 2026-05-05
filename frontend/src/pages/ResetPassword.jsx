import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

// Component for handling password reset using a token from the URL
export default function ResetPassword() {
  const { token } = useParams();

  // State for the new password input
  const [password, setPassword] = useState("");

  // State for user feedback (success or error message)
  const [message, setMessage] = useState("");

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      // Send token and new password to backend for verification/reset
      await api.post("/api/password-reset/confirm/", {
        token,
        password,
      });

      // Notify user of success
      setMessage("Password reset successful!");
    } catch (err) {

      // Log error for debugging and show user-friendly message
      console.error(err);
      setMessage("Invalid or expired token.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-wrapper">
        <div className="login-card">
          <h2>Set New Password</h2>

          <form onSubmit={handleSubmit}>
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button type="submit">Reset Password</button>

            {message && <p>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}