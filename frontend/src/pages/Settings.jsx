import { useContext, useEffect, useState } from "react";
import "../styles/settings.css";
import { SettingsContext } from "../context/SettingsContext";

export default function Settings() {

  const {
    theme,
    setTheme,
    textSize,
    setTextSize,
    notifications,
    setNotifications
  } = useContext(SettingsContext);

  const [reminderTime, setReminderTime] = useState(
    localStorage.getItem("reminderTime") || ""
  );

  // ===== API CALL (REMINDER) =====
  const saveReminderToBackend = async (time, enabled) => {
    try {
      const token = localStorage.getItem("access");

      const res = await fetch("http://127.0.0.1:8000/api/reminder/set/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reminderTime: time,
          enabled: enabled
        })
      });

      const data = await res.json();
      console.log("📡", res.status, data);

    } catch (err) {
      console.error("❌ Failed to save reminder:", err);
    }
  };

  // ===== DELETE ACCOUNT =====
  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("access");

      const res = await fetch("http://127.0.0.1:8000/api/user/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        localStorage.clear();
        sessionStorage.clear();

        alert("Account deleted successfully");
        window.location.href = "/";
      } else {
        const data = await res.json();
        console.error(data);
        alert("Failed to delete account");
      }

    } catch (err) {
      console.error(err);
      alert("Error deleting account");
    }
  };

  // ===== TOGGLE =====
  const handleNotificationToggle = () => {

    if (!notifications) {
      setNotifications(true);
      localStorage.setItem("notifications", "true");

      if (reminderTime) {
        saveReminderToBackend(reminderTime, true);
      }

    } else {
      setNotifications(false);
      localStorage.setItem("notifications", "false");

      saveReminderToBackend(reminderTime, false);
    }
  };

  // ===== SAVE TIME =====
  useEffect(() => {

    if (!reminderTime) return;

    localStorage.setItem("reminderTime", reminderTime);

    if (notifications) {
      saveReminderToBackend(reminderTime, true);
    }

  }, [reminderTime]);

  // ===== LOAD STATE =====
  useEffect(() => {

    const saved = localStorage.getItem("notifications");

    if (saved === "true") {
      setNotifications(true);
    }

  }, []);

  return (

    <div className="settings-wrapper">

      <div className="settings-page">

        <div className="page-header">
          <h1>Settings</h1>
          <span className="chip">Customise your learning experience</span>
        </div>

        {/* ===== APPEARANCE ===== */}
        <div className="settings-card">

          <h2>Appearance</h2>

          <div className="setting-row">
            <div>
              <h4>Theme</h4>
              <p className="muted">Choose how EduBridge looks</p>
            </div>

            <div className="option-group">
              <button
                className={`option ${theme === "light" ? "active" : ""}`}
                onClick={() => setTheme("light")}
              >
                Light
              </button>
              <button
                className={`option ${theme === "dark" ? "active" : ""}`}
                onClick={() => setTheme("dark")}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="setting-row">
            <div>
              <h4>Text Size</h4>
              <p className="muted">Adjust readability</p>
            </div>

            <div className="option-group">
              <button
                className={`option ${textSize === "small" ? "active" : ""}`}
                onClick={() => setTextSize("small")}
              >
                Small
              </button>
              <button
                className={`option ${textSize === "default" ? "active" : ""}`}
                onClick={() => setTextSize("default")}
              >
                Default
              </button>
              <button
                className={`option ${textSize === "large" ? "active" : ""}`}
                onClick={() => setTextSize("large")}
              >
                Large
              </button>
            </div>
          </div>

        </div>

        {/* ===== NOTIFICATIONS ===== */}
        <div className="settings-card">

          <h2>Notifications & Reminders</h2>

          <div className="setting-row">
            <div>
              <h4>Study Reminders</h4>
              <p className="muted">Get reminders to stay consistent</p>
            </div>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={handleNotificationToggle}
              />
              <span className="slider"></span>
            </label>
          </div>

          {notifications && (
            <div className="setting-row">
              <div>
                <h4>Reminder Time</h4>
              </div>

              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
              />
            </div>
          )}

        </div>

        {/* ===== ACCOUNT ===== */}
        <div className="settings-card logout-card">

          <h2>Account</h2>

          <div className="account-actions">

            <button
              className="logout-btn"
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = "/";
              }}
            >
              Log Out
            </button>

            <button
              className="delete-btn"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>

          </div>

        </div>

      </div>
    </div>
  );
}