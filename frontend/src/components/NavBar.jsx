import { NavLink } from "react-router-dom";
import "../styles/navbar.css"; // make sure the path matches your folder name exactly

export default function NavBar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>EduBridge</h1>
        <p>University Learning Platform</p>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/subjects">Subjects</NavLink>
        <NavLink to="/ai-tutor">AI Tutor</NavLink>
        <NavLink to="/explain-it-back">Explain It Back</NavLink>
        <NavLink to="/quizzes">Quizzes</NavLink>
        <NavLink to="/studyInsights">Study Insights</NavLink>
        <NavLink to="/offline">Offline</NavLink>
        <NavLink to="/settings">Settings</NavLink>
      </nav>

      <div className="sidebar-footer">Version 1.0.0</div>
    </aside>
  );
}
