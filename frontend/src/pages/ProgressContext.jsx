import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback
} from "react";

// Context for managing user learning progress
const ProgressContext = createContext();

// Context for managing user learning progress
export function ProgressProvider({ children }) {

  // Provider for global progress state
  const [progress, setProgress] = useState(() => {
    try {
      const saved = localStorage.getItem("eduProgress");
      return saved ? JSON.parse(saved) : {};
    } catch (error) {
      console.error("Error loading progress:", error);
      return {};
    }
  });

  // Load progress from localStorage on initial render
  useEffect(() => {
    try {
      localStorage.setItem("eduProgress", JSON.stringify(progress));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
  }, [progress]);

  // Update topic progress (only increases allowed)
  const updateTopicProgress = useCallback((subject, topic, percent) => {
    setProgress(prev => {
      const currentPercent = prev?.[subject]?.[topic] || 0;

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

  // Get progress for a specific topic
  const getTopicProgress = useCallback((subject, topic) => {
    return progress?.[subject]?.[topic] || 0;
  }, [progress]);

  // Calculate overall subject progress
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
        progress, // Expose full progress state
        updateTopicProgress,
        getTopicProgress,
        getSubjectProgress
      }}
    >
      {children}
    </ProgressContext.Provider>
  );
}

// Hook to access progress context
export function useProgress() {
  return useContext(ProgressContext);
}