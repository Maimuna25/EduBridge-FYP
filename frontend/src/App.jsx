import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { ProgressProvider } from "./pages/ProgressContext";

import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AITutor from "./pages/AITutor";
import Subjects from "./pages/Subjects";
import ExplainItBack from "./pages/ExplainItBack";
import Quizzes from "./pages/Quizzes";
import QuizPage from "./pages/QuizPage";
import StudyInsights from "./pages/StudyInsights";
import Offline from "./pages/Offline";
import Settings from "./pages/Settings";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import TopicSummary from "./pages/TopicSummary";
import QuizResult from "./pages/QuizResult";

import ReminderGlobal from "./components/ReminderGlobal"; // 🔥 NEW
import ResetPassword from "./pages/ResetPassword";

import "./i18n";
import { syncAttempts } from "./utils/offlineManager";

import "./styles/Form.css";


function Logout() {
  localStorage.clear();
  return <Navigate to="/login" replace />;
}

function RegisterAndLogout() {
  localStorage.clear();
  return <Register />;
}


export default function App() {

  /* ======================================
     OFFLINE SYNC LISTENER
  ====================================== */

  useEffect(() => {

    function handleReconnect() {

      console.log("Internet reconnected. Syncing offline attempts...");
      syncAttempts();

    }

    window.addEventListener("online", handleReconnect);

    return () => {
      window.removeEventListener("online", handleReconnect);
    };

  }, []);


  /* ======================================
     SERVICE WORKER REGISTRATION
  ====================================== */

  useEffect(() => {

    if ("serviceWorker" in navigator) {

      window.addEventListener("load", () => {

        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered:", registration.scope);
          })
          .catch((error) => {
            console.log("Service Worker registration failed:", error);
          });

      });

    }

  }, []);


  return (
    <ProgressProvider>

      <BrowserRouter>

        {/* 🔥 GLOBAL REMINDER (WORKS EVERYWHERE) */}
        <ReminderGlobal />

        <Routes>

          {/* redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<RegisterAndLogout />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

          {/* protected routes with layout */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >

            <Route path="/dashboard" element={<Dashboard />} />

            <Route path="/ai-tutor" element={<AITutor />} />

            <Route path="/subjects" element={<Subjects />} />

            <Route
              path="/subjects/:subjectSlug/:categorySlug/:topicSlug"
              element={<TopicSummary />}
            />

            <Route path="/explain-it-back" element={<ExplainItBack />} />

            <Route path="/quizzes" element={<Quizzes />} />

            <Route path="/quiz/:id" element={<QuizPage />} />

            <Route path="/quiz/:id/result" element={<QuizResult />} />

            <Route path="/studyInsights" element={<StudyInsights />} />

            <Route path="/offline" element={<Offline />} />

            <Route path="/settings" element={<Settings />} />

          </Route>

          {/* fallback */}
          <Route path="*" element={<NotFound />} />

        </Routes>

      </BrowserRouter>

    </ProgressProvider>
  );
}