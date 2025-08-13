import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import TestPage from "./TestPage"; // ⬅️ استيراد الصفحة الجديدة
import CompleteProfile from "./CompleteProfile";
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
        <Route path="/test" element={<TestPage />} /> {/* ⬅️ صفحة الـ Test */}
        <Route path="/complete-profile" element={<CompleteProfile />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
