import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import CompleteProfile from "./CompleteProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null تعني لم نتحقق بعد

  useEffect(() => {
    const email = localStorage.getItem("email");
    setIsLoggedIn(!!email);
  }, []);

  if (isLoggedIn === null) {
    return null; // أو Spinner لو أردت
  }

  return (
    <HashRouter>
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Home />} />
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/app" element={isLoggedIn ? <QuestionPage /> : <Navigate to="/" />} />
        <Route path="/quiz" element={isLoggedIn ? <QuizPage /> : <Navigate to="/" />} />
        <Route path="/complete-profile" element={isLoggedIn ? <CompleteProfile /> : <Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
