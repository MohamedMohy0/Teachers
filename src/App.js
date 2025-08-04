import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import CompleteProfile from "./CompleteProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const isLoggedIn = !!localStorage.getItem("email"); // تحقق من وجود تسجيل دخول

  return (
    <HashRouter>
      <ToastContainer position="top-center" />
      <Routes>
        {/* الصفحة الرئيسية: نوجه المستخدم حسب حالته */}
        <Route path="/" element={isLoggedIn ? <Navigate to="/dashboard" /> : <Home />} />

        {/* باقي الصفحات تتطلب تسجيل دخول */}
        <Route path="/dashboard" element={isLoggedIn ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/app" element={isLoggedIn ? <QuestionPage /> : <Navigate to="/" />} />
        <Route path="/quiz" element={isLoggedIn ? <QuizPage /> : <Navigate to="/" />} />
        <Route path="/complete-profile" element={isLoggedIn ? <CompleteProfile /> : <Navigate to="/" />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
