import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/auth.css";

export default function Verify() {
  const navigate = useNavigate();
  const location = useLocation();

  console.log("=== VERIFY PAGE LOADED ===");

  // Check navigation state
  console.log("LOCATION STATE:", location.state);

  const email =
    location.state?.email ||
    localStorage.getItem("verifyEmail") ||
    "";

  console.log("EMAIL RESOLVED:", email);

  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (value, index) => {
    console.log(`INPUT CHANGE at index ${index}:`, value);

    if (!/^[0-9]?$/.test(value)) {
      console.warn("INVALID INPUT (not a digit):", value);
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    console.log("CURRENT CODE STATE:", newCode.join(""));

    if (value && index < 5) {
      console.log("AUTO FOCUS →", index + 1);
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    console.log(`KEY DOWN at ${index}:`, e.key);

    if (e.key === "Backspace" && !code[index] && index > 0) {
      console.log("BACKSPACE MOVE BACK");
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").slice(0, 6);

    console.log("PASTE DETECTED:", paste);

    if (!/^\d+$/.test(paste)) {
      console.warn("INVALID PASTE (non-numeric)");
      return;
    }

    const newCode = paste.split("");
    setCode(newCode);

    console.log("PASTE APPLIED:", newCode.join(""));

    inputsRef.current[5]?.focus();
  };

  const verifyCode = async () => {
    const fullCode = code.join("");

    console.log("=== VERIFY REQUEST START ===");
    console.log("EMAIL:", email);
    console.log("CODE:", fullCode);

    if (fullCode.length < 6) {
      console.warn("CODE TOO SHORT");
      alert("Enter full code");
      return;
    }

    try {
      const startTime = Date.now();

      const res = await api.post("/api/user/verify-email/", {
        email,
        code: fullCode,
      });

      console.log("=== VERIFY SUCCESS ===");
      console.log("RESPONSE:", res.data);
      console.log("TIME TAKEN:", Date.now() - startTime, "ms");

      if (!res.data.access || !res.data.refresh) {
        console.error("⚠️ TOKENS MISSING FROM RESPONSE");
      }

      // Store tokens
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);

      console.log("TOKENS STORED SUCCESSFULLY");

      // cleanup
      localStorage.removeItem("verifyEmail");

      console.log("REDIRECTING → /dashboard");

      navigate("/dashboard");

    } catch (err) {
      console.error("=== VERIFY ERROR ===");
      console.error("FULL ERROR:", err);
      console.error("RESPONSE:", err.response?.data);

      alert(err.response?.data?.error || "Verification failed");
    }
  };

  // Auto-submit when full code entered
  useEffect(() => {
    const fullCode = code.join("");

    if (fullCode.length === 6) {
      console.log("AUTO SUBMIT TRIGGERED");
      verifyCode();
    }
  }, [code]);

  const resendCode = async () => {
    console.log("=== RESEND CODE REQUEST ===");
    console.log("EMAIL:", email);

    try {
      const res = await api.post("/api/user/resend-code/", { email });

      console.log("RESEND SUCCESS:", res.data);

      alert("New code sent!");
    } catch (err) {
      console.error("RESEND ERROR:", err.response?.data || err);
      alert("Failed to resend code");
    }
  };

  // No email = broken flow
  if (!email) {
    console.error("❌ NO EMAIL FOUND → INVALID ACCESS");

    return (
      <div className="auth-page">
        <div className="login-card">
          <h2>Invalid Access</h2>
          <p>Please register again.</p>
          <button
            className="primary-btn"
            onClick={() => navigate("/register")}
          >
            Go to Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="login-card">

        <h2>Verify Email</h2>
        <span className="login-card-subtitle">
          Enter the 6-digit code sent to {email}
        </span>

        <div className="otp-container" onPaste={handlePaste}>
          {code.map((digit, i) => (
            <input
              key={i}
              type="text"
              maxLength="1"
              value={digit}
              ref={(el) => (inputsRef.current[i] = el)}
              onChange={(e) => handleChange(e.target.value, i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="otp-input"
            />
          ))}
        </div>

        <button className="primary-btn" onClick={verifyCode}>
          Verify Account
        </button>

        <button className="secondary-btn" onClick={resendCode}>
          Resend Code
        </button>

      </div>
    </div>
  );
}