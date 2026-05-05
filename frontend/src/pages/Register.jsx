import { useNavigate } from "react-router-dom";
import Form from "../components/Form";
import "../styles/auth.css";

function Register() {
  const navigate = useNavigate();

  // After successful register, go to verification page
  const handleSuccess = (data) => {
    navigate("/verify", {
      state: { email: data.email }
    });
  };

  const handleError = (error) => {
    if (error.response?.data?.error === "User already exists") {
      alert("You already have an account. Please sign in.");
      navigate("/login");
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="auth-page">
      <Form
        route="/api/user/register/"
        method="register"
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
}

export default Register;