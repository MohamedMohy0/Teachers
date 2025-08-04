import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import CompleteProfile from "./CompleteProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [user, setUserState] = useState(null);

  const setUser = (userData) => {
    localStorage.setItem("user", JSON.stringify(userData));
    setUserState(userData);
  };

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUserState(JSON.parse(savedUser));
    }
  }, []);

  // التوجيه التلقائي عند تسجيل الدخول حسب حالة الاسم
  useEffect(() => {
    if (user) {
      if (!user.name || user.name.trim() === "") {
        window.location.hash = "#/complete-profile";
      } else {
        window.location.hash = "#/dashboard";
      }
    }
  }, [user]);

  const isAuthenticated = !!user;

  return (
    <HashRouter>
      <ToastContainer position="top-center" />
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" />
            ) : (
              <Home setUser={setUser} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/app"
          element={
            isAuthenticated ? (
              <QuestionPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/quiz"
          element={
            isAuthenticated ? (
              <QuizPage user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        <Route
          path="/complete-profile"
          element={
            isAuthenticated ? (
              <CompleteProfile user={user} setUser={setUser} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </HashRouter>
  );
}

export default App;
