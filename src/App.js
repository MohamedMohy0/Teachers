import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import CompleteProfile from "./CompleteProfile"; // ⬅️ استيراد الصفحة الجديدة
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <HashRouter>
      <ToastContainer position="top-center" />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/app" element={<QuestionPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/complete-profile" element={<CompleteProfile />} /> {/* ⬅️ أضف هذا السطر */}
      </Routes>
    </HashRouter>
  );
}

export default App;
