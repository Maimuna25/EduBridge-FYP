import Form from "../components/Form"
import "../styles/auth.css"

function Register() {
  return (
    <div className="auth-page">
      <Form route="/api/user/register/" method="register" />
    </div>
  )
}

export default Register