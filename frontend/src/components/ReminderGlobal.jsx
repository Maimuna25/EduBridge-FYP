import { useEffect, useState } from "react";
import "../styles/reminder.css";

// Global study reminder popup based on saved time
export default function ReminderGlobal() {

  // Popup visibility state
  const [showPopup, setShowPopup] = useState(false);

  // User settings from localStorage
  const notifications = localStorage.getItem("notifications") === "true";
  const reminderTime = localStorage.getItem("reminderTime") || "19:00";

  // Check current time against reminder time
  useEffect(() => {

    if (!notifications) return;

    let lastTriggered = null;

    const checkTime = () => {

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      const current = `${hours}:${minutes}`;

      console.log("⏰ GLOBAL NOW:", current, "| TARGET:", reminderTime);

      // Trigger popup once when time condition is met
      if (reminderTime && current >= reminderTime && lastTriggered !== reminderTime) {

        console.log("GLOBAL POPUP TRIGGERED");

        setShowPopup(true);
        lastTriggered = current;
      }
    };

    // Run check every 5 seconds
    const interval = setInterval(checkTime, 5000);

    return () => clearInterval(interval);

  }, [notifications, reminderTime]);

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
            <div className="popup-box">

                <div className="popup-icon">📚</div>

                <h2>Study Reminder</h2>

                <p>Time to continue your learning on <strong>EduBridge</strong></p>

                <button
                    className="close-btn"
                    onClick={() => setShowPopup(false)}
                >
                    Continue Learning
                </button>

            </div>
        </div>
      )}
    </>
  );
}