import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await api.post("/api/password-reset/confirm/", {
        token,
        password,
      });

      setMessage("Password reset successful!");
    } catch (err) {
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