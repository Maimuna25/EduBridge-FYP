import Form from "../components/Form";
import "../styles/loginPage.css";

export default function Login() {
  return (
    <main className="login-page">
      <div className="login-wrapper">

        {/* LEFT SIDE - MARKETING / INFO */}
        <section className="login-left">
          <h1>
            Learn Smarter,
            <br />
            Not Harder
          </h1>

          <p className="subtitle">
            EduBridge is an AI-powered learning platform designed for adult learners
            to build confidence in Mathematics, Science, and English.
          </p>

          <div className="features">
            <div>🤖 Personalised AI tutoring</div>
            <div>🧠 Explain-it-back learning</div>
            <div>⏱ Learn at your own pace</div>
          </div>
        </section>

        {/* RIGHT SIDE - LOGIN FORM */}
        <section className="login-right">
          <Form
            route="/api/token/"
            method="login"
            variant="card"
          />
        </section>

      </div>
    </main>
  );
}