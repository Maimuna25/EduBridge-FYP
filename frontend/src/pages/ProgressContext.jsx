import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

const ProgressContext = createContext();

export function ProgressProvider({ children }) {
  // ✅ Load from localStorage on first render
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("eduProgress");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading progress:", error);
      return {};
    }
  });

  // ✅ Save to localStorage whenever progress changes
  useEffect(() => {
    try {
      localStorage.setItem("eduProgress", JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, [progress]);

  // ✅ Update topic progress safely
  const updateTopicProgress = useCallback((subject, topic, percent) => {
    setProgress(prev => {
      const currentPercent = prev?.[subject]?.[topic] || 0;

      // Only update if progress increased (prevents slide back reducing %)
      if (percent <= currentPercent) return prev;

      return {
        ...prev,
        [subject]: {
          ...prev[subject],
          [topic]: percent
        }
      };
    });
  }, []);

  // ✅ Get topic progress
  const getTopicProgress = useCallback((subject, topic) => {
    return progress?.[subject]?.[topic] || 0;
  }, [progress]);

  // ✅ Calculate subject progress
  const getSubjectProgress = useCallback((subject, totalTopics) => {
    const subjectData = progress?.[subject] || {};
    const topicValues = Object.values(subjectData);

    if (!topicValues.length) return 0;

    const total = topicValues.reduce((acc, val) => acc + val, 0);
    return Math.round(total / totalTopics);
  }, [progress]);

  return (
    <ProgressContext.Provider
      value={{
        progress, // 🔥 IMPORTANT — this was missing
        updateTopicProgress,
        getTopicProgress,
        getSubjectProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  return useContext(ProgressContext);
}