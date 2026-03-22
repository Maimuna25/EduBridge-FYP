import { createContext, useEffect, useState } from "react";

export const SettingsContext = createContext();

export function SettingsProvider({ children }) {

  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "system"
  );

  const [textSize, setTextSize] = useState(
    localStorage.getItem("textSize") || "default"
  );

  // ✅ ADD THIS (notifications state)
  const [notifications, setNotifications] = useState(
    localStorage.getItem("notifications") === "true"
  );


  /* ============================
     THEME
  ============================ */

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


  /* ============================
     TEXT SIZE
  ============================ */

  useEffect(() => {

    localStorage.setItem("textSize", textSize);

    document.documentElement.setAttribute(
      "data-text-size",
      textSize
    );

  }, [textSize]);


  /* ============================
     NOTIFICATIONS (NEW)
  ============================ */

  useEffect(() => {
    localStorage.setItem("notifications", notifications);
  }, [notifications]);


  return (

    <SettingsContext.Provider
      value={{

        theme,
        setTheme,

        textSize,
        setTextSize,

        notifications,
        setNotifications   // ✅ THIS FIXES YOUR ERROR

      }}
    >

      {children}

    </SettingsContext.Provider>

  );

}