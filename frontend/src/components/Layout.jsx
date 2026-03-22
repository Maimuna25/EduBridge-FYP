import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import "../styles/layout.css";

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
