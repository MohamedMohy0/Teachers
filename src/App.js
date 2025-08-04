import { useEffect, useState } from "react";
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import CompleteProfile from "./CompleteProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function AppWrapper() {
  const [user, setUserState] = useState(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    if (user) {
      if (!user.name || user.name.trim() === "") {
        navigate("/complete-profile");
      } else {
        navigate("/dashboard");
      }
    }
  }, [user, navigate]);

  const isAuthenticated = !!user;

  return (
    <>
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
    </>
  );
}

// ✅ هذه هي الطريقة الصحيحة للف ملف AppWrapper داخل HashRouter
export default function App() {
  return (
    <HashRouter>
      <AppWrapper />
    </HashRouter>
  );
}
