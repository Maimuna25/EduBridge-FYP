import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

// Reusable login/register form component
export default function Form({ route, method, variant = "card" }) {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine if login mode
  const isLogin = method === "login";

  // Handle form submission and authentication
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(route, { username, password });

      if (res?.data?.access) localStorage.setItem("ACCESS_TOKEN", res.data.access);
      if (res?.data?.refresh) localStorage.setItem("REFRESH_TOKEN", res.data.refresh);

      // Redirect after successful login/register
      navigate("/dashboard");
    } catch (err) {
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  // Render styled login card UI
  if (variant === "card") {
    return (
      <div className="login-card">
        <h2>Welcome Back</h2>
        <span className="login-card-subtitle">Sign in to continue learning</span>

        <form onSubmit={handleSubmit}>

          {/* Username input */}
          <label className="login-label">Username</label>
          <input
            className="login-input"
            type="text"
            placeholder="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          {/* Password input */}
          <label className="login-label">Password</label>
          <input
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {/* Forgot password link */}
          <div className="forgot-password">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          {/* Submit button */}
          <button className="primary-btn full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

           {/* Divider */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* Switch to register */}
          <button
            type="button"
            className="secondary-btn full"
            onClick={() => navigate("/register")}
          >
            Create an Account
          </button>

          {/* Footer note */}
          <small className="login-footnote">
            Designed for independent learners aged 18+
          </small>
        </form>
      </div>
    );
  }

  // fallback simple form
  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
}
