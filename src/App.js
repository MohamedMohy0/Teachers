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
  const [email, setEmail] = useState(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  return (
    <HashRouter>
      <ToastContainer position="top-center" />
      <Routes>
        {/* إذا لم يسجل دخول، يبقى في صفحة Home */}
        <Route path="/" element={email ? <Navigate to="/dashboard" /> : <Home setEmail={setEmail} />} />
        
        {/* المسارات الأخرى محمية: إذا لم يسجل دخول، يعود إلى صفحة الدخول */}
        <Route path="/dashboard" element={email ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/app" element={email ? <QuestionPage /> : <Navigate to="/" />} />
        <Route path="/quiz" element={email ? <QuizPage /> : <Navigate to="/" />} />
        <Route path="/complete-profile" element={email ? <CompleteProfile /> : <Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
