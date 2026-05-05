import { createContext, useEffect, useState } from "react";

// Global settings context
export const SettingsContext = createContext();

// Provide theme, text size, and notification settings
export function SettingsProvider({ children }) {

  // Theme state (light/dark/system)
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  // Text size state
  const [textSize, setTextSize] = useState(
    localStorage.getItem("textSize") || "default"
  );

  // Notification toggle state
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );


  useEffect(() => {

    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
    else if (theme === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    }
    else {
      document.documentElement.removeAttribute("data-theme");
    }

  }, [theme]);


  useEffect(() => {

    localStorage.setItem("textSize", textSize);

    document.documentElement.setAttribute(
      "data-text-size",
      textSize
    );

  }, [textSize]);


  // Persist notification setting
  useEffect(() => {
    localStorage.setItem("notifications", notifications);
  }, [notifications]);

  // Provide settings to app
  return (

    <SettingsContext.Provider
      value={{

        theme,
        setTheme,

        textSize,
        setTextSize,

        notifications,
        setNotifications

      }}
    >

      {children}

    </SettingsContext.Provider>

  );

}