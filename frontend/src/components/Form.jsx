import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

export default function Form({
  route,
  method,
  variant = "card",
  onSuccess,
  onError,
}) {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(""); // ✅ NEW
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
      // ✅ Send email ONLY for register
      const payload = isLogin
        ? { username, password }
        : { username, email, password };

      console.log("SUBMIT PAYLOAD:", payload); // 🔍 DEBUG

      const res = await api.post(route, payload);

      console.log("RESPONSE:", res.data); // 🔍 DEBUG

      if (onSuccess) {
        onSuccess(res.data);
      } else {
        if (isLogin) {
          localStorage.setItem(ACCESS_TOKEN, res.data.access);
          localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
          navigate("/dashboard");
        }
      }
    } catch (error) {
      console.error("FORM ERROR:", error.response?.data || error); // 🔍 DEBUG

      if (onError) {
        onError(error);
      } else {
        alert(error.response?.data?.error || "Something went wrong");
      }
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

          {/* ✅ EMAIL FIELD (REGISTER ONLY) */}
          {!isLogin && (
            <>
              <label className="login-label">Email</label>
              <input
                className="login-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </>
          )}

          {/* USERNAME / EMAIL */}
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

          {/* SUBMIT BUTTON */}
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

  return (
    <form onSubmit={handleSubmit}>
      <input value={username} onChange={(e) => setUsername(e.target.value)} />
      <input value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit">{isLogin ? "Login" : "Register"}</button>
    </form>
  );
}