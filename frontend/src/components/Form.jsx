import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

export default function Form({ route, method, variant = "card" }) {
  const navigate = useNavigate();

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
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/dashboard");
      } else {
        navigate("/login");
      }
    } catch (error) {
      alert(error);
    } finally {
      setLoading(false);
    }
  };

  if (variant === "card") {
    return (
      <div className="login-card">
        <h2>{title}</h2>
        <span className="login-card-subtitle">{subtitle}</span>

        <form onSubmit={handleSubmit}>
          {/* EMAIL */}
          <label className="login-label">
            {isLogin ? "Email" : "Username"}
          </label>
          <input
            className="login-input"
            type="text"
            placeholder={isLogin ? "you@example.com" : "Choose a username"}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          {/* PASSWORD */}
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

          {/* SIGN IN BUTTON */}
          <button
            className="auth-primary-btn auth-full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

          {/* FORGOT PASSWORD (FIXED) */}
          {isLogin && (
            <div className="auth-forgot-text">
              <span onClick={() => navigate("/forgot-password")}>
                Forgot password?
              </span>
            </div>
          )}

          {/* DIVIDER */}
          <div className="divider">
            <span>or</span>
          </div>

          {/* REGISTER */}
          <button
            type="button"
            className="auth-secondary-btn auth-full"
            onClick={() => navigate(isLogin ? "/register" : "/login")}
          >
            {isLogin ? "Create an Account" : "Go to Login"}
          </button>

          {/* FOOTNOTE */}
          <small className="login-footnote">
            Designed for independent learners aged 18+
          </small>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
}