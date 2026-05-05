import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

// Reusable auth form (login/register)
export default function Form({
  route,
  method,
  variant = "card",
  onSuccess,
  onError,
}) {
  const navigate = useNavigate();

  // Form state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Determine mode
  const isLogin = method === "login";

  // UI text
  const title = isLogin ? "Welcome Back" : "Create Account";
  const subtitle = isLogin
    ? "Sign in to continue learning"
    : "Create an account to start learning";

  // Submit form + handle auth
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = isLogin
        ? { username, password }
        : { username, email, password };

      const res = await api.post(route, payload);

      if (onSuccess) {
        onSuccess(res.data);
      } else if (isLogin) {
        localStorage.setItem(ACCESS_TOKEN, res.data.access);
        localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
        navigate("/dashboard");
      }
    } catch (error) {
      if (onError) {
        onError(error);
      } else {
        alert(error.response?.data?.error || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // Render styled card variant
  if (variant === "card") {
    return (
      <div className="login-card">
        <h2>{title}</h2>
        <span className="login-card-subtitle">{subtitle}</span>

        <form onSubmit={handleSubmit}>
          {/* REGISTER ONLY: EMAIL FIELD */}
          {!isLogin && (
            <>
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </>
          )}

          {/* USERNAME FIELD */}
          <label className="login-label">Username</label>
          <input
            className="login-input"
            type="text"
            placeholder={
              isLogin ? "Enter your username" : "Choose a username"
            }
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          {/* PASSWORD FIELD */}
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

          {/* SUBMIT BUTTON */}
          <button
            className="auth-primary-btn auth-full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? isLogin
                ? "Signing in..."
                : "Creating account..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>

          {/* FORGOT PASSWORD */}
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

          {/* SWITCH LOGIN / REGISTER */}
          <button
            type="button"
            className="auth-secondary-btn auth-full"
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

  // Render simple fallback form
  return (
    <form onSubmit={handleSubmit}>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />

      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />

      <button type="submit">
        {isLogin ? "Login" : "Register"}
      </button>
    </form>
  );
}