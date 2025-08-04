import { useState } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./Home";
import Dashboard from "./Dashboard";
import QuestionPage from "./QuestionPage";
import QuizPage from "./QuizPage";
import CompleteProfile from "./CompleteProfile";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  // الحالة المركزية للمستخدم
  const [user, setUser] = useState(null); // { email, level, name }

  // تحقق من تسجيل الدخول (إذا كانت هناك بيانات مستخدم)
  const isAuthenticated = !!user;

  return (
    <HashRouter>
      <ToastContainer position="top-center" />
      <Routes>
        {/* صفحة الدخول - إذا سجل المستخدم الدخول، ينتقل إلى لوحة التحكم */}
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

        {/* لوحة التحكم */}
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

        {/* صفحة الأسئلة */}
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

        {/* صفحة الاختبار */}
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

        {/* صفحة إكمال الملف الشخصي */}
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
