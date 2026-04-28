import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Form({ route, method, variant = "card" }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState(""); // backend expects username
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = method === "login";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(route, { username, password });

      // typical JWT token response: { access, refresh }
      if (res?.data?.access) localStorage.setItem("ACCESS_TOKEN", res.data.access);
      if (res?.data?.refresh) localStorage.setItem("REFRESH_TOKEN", res.data.refresh);

      navigate("/dashboard");
    } catch (err) {
      // keep your current behavior
      alert(err);
    } finally {
      setLoading(false);
    }
  };

  // NEW “Welcome Back” card UI
  if (variant === "card") {
    return (
      <div className="login-card">
        <h2>Welcome Back</h2>
        <span className="login-card-subtitle">Sign in to continue learning</span>

        <form onSubmit={handleSubmit}>
          <label className="login-label">Username</label>
          <input
            className="login-input"
            type="text"
            placeholder="you@example.com"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

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

          <div className="forgot-password">
            <button
              type="button"
              className="link-btn"
              onClick={() => navigate("/forgot-password")}
            >
              Forgot password?
            </button>
          </div>

          <button className="primary-btn full" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="secondary-btn full"
            onClick={() => navigate("/register")}
          >
            Create an Account
          </button>

          <small className="login-footnote">
            Designed for independent learners aged 18+
          </small>
        </form>
      </div>
    );
  }

  // fallback (if you ever want old layout)
  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
}
