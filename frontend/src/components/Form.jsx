import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";
// import LoadingIndicator from "./LoadingIndicator";

export default function Form({ route, method, variant = "card" }) {
  const navigate = useNavigate();

  // backend expects username/password (even if UI says "Email")
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const isLogin = method === "login";
  const title = isLogin ? "Welcome Back" : "Create Account";
  const subtitle = isLogin
    ? "Sign in to continue learning"
    : "Create an account to start learning";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(route, { username, password });

      if (isLogin) {
        // ✅ original “logic engine” behavior
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/dashboard"); // or "/" if you prefer
      } else {
        // ✅ original behavior: after register go to login
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  // ===== Card UI (your new design) =====
  if (variant === "card") {
    return (
      <div className="login-card">
        <h2>{title}</h2>
        <span className="login-card-subtitle">{subtitle}</span>

        <form onSubmit={handleSubmit}>
          <label className="login-label">{isLogin ? "Email" : "Username"}</label>
          <input
            className="login-input"
            type="text"
            placeholder={isLogin ? "you@example.com" : "Choose a username"}
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
            autoComplete={isLogin ? "current-password" : "new-password"}
            required
          />

          {isLogin && (
            <div className="forgot-password">
              <button
                type="button"
                className="link-btn"
                onClick={() => navigate("/forgot-password")}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* {loading && <LoadingIndicator />} */}

          <button className="primary-btn full" type="submit" disabled={loading}>
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

          <div className="divider">
            <span>or</span>
          </div>

          <button
            type="button"
            className="secondary-btn full"
            onClick={() => navigate(isLogin ? "/register" : "/login")}
          >
            {isLogin ? "Create an Account" : "Go to Login"}
          </button>

          <small className="login-footnote">
            Designed for independent learners aged 18+
          </small>
        </form>
      </div>
    );
  }

  // ===== fallback simple layout =====
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="username"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="password"
        type="password"
      />
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
}
