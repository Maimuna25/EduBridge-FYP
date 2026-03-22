import { useEffect, useState } from "react";

export default function ReminderGlobal() {

  const [showPopup, setShowPopup] = useState(false);

  const notifications = localStorage.getItem("notifications") === "true";
  const reminderTime = localStorage.getItem("reminderTime") || "19:00";

  useEffect(() => {

    if (!notifications) return;

    let lastTriggered = null;

    const checkTime = () => {

      const now = new Date();
      const hours = now.getHours().toString().padStart(2, "0");
      const minutes = now.getMinutes().toString().padStart(2, "0");

      const current = `${hours}:${minutes}`;

      console.log("⏰ GLOBAL NOW:", current, "| TARGET:", reminderTime);

      if (reminderTime && current >= reminderTime && lastTriggered !== reminderTime) {

        console.log("🔥 GLOBAL POPUP TRIGGERED");

        setShowPopup(true);
        lastTriggered = current;
      }
    };

    const interval = setInterval(checkTime, 5000);

    return () => clearInterval(interval);

  }, [notifications, reminderTime]);

  return (
    <>
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>📚 Study Reminder</h2>
            <p>Time to continue your learning on EduBridge!</p>

            <button
              className="close-btn"
              onClick={() => setShowPopup(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}