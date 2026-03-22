import Form from "../components/Form";
import "../styles/loginPage.css";

export default function Login() {
  return (
    <div className="login-page">
      <div className="login-wrapper">
        {/* LEFT */}
        <div className="login-left">
          <h1>
            Learn Smarter,
            <br />
            Not Harder
          </h1>

          <div className="accent-line" />

          <p className="subtitle">
            EduBridge is an AI-powered learning platform designed for adult learners
            to build confidence in Mathematics, Science, and English.
          </p>

          <div className="features">
            <div>🤖 Personalised AI tutoring</div>
            <div>🧠 Explain-it-back learning</div>
            <div>⏱ Learn at your own pace</div>
          </div>
        </div>

        {/* RIGHT (real login logic lives in Form) */}
        <div className="login-right">
          <Form route="/api/token/" method="login" variant="card" />
        </div>
      </div>
    </div>
  );
}
