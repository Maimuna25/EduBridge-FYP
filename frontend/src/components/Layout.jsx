import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import "../styles/layout.css";

// Main app layout wrapper with navbar + routed content
export default function Layout() {
  return (
    <div className="app-shell">
      <NavBar />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
}
