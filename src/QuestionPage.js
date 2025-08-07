import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loadingAnim from "./Loading.json";

function QuestionPage() {
  const [grade, setGrade] = useState("");
  const [lecture, setLecture] = useState("");
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [, setDarkMode] = useState(false);

  const navigate = useNavigate();

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  // Initialize on mount: get user info and darkMode from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedLevel = localStorage.getItem("Level");
    const savedMode = localStorage.getItem("darkMode") === "true";

    if (!savedEmail || !savedLevel) {
      toast.error("يجب تسجيل الدخول أولاً");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    setEmail(savedEmail);
    setGrade(savedLevel);
    setDarkMode(savedMode);

    // simulate loading spinner for UX
    const timer = setTimeout(() => setInitialLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [navigate]);

  // Sync dark mode class on <html> whenever darkMode changes

  // Listen to darkMode changes from other tabs (optional)
  useEffect(() => {
    const onStorageChange = (event) => {
      if (event.key === "darkMode") {
        setDarkMode(event.newValue === "true");
      }
    };
    window.addEventListener("storage", onStorageChange);
    return () => window.removeEventListener("storage", onStorageChange);
  }, []);

  // Handle form submit to fetch question image
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!lecture || !question) {
      toast.warn("يرجى إدخال رقم المحاضرة ورقم السؤال");
      return;
    }

    setLoading(true);
    setImageUrl(null);

    try {
      const encodedEmail = encodeURIComponent(email);
      const encodedGrade = encodeURIComponent(grade);
      const res = await axios.get(
        `https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/get_page?email=${encodedEmail}&grade=${encodedGrade}&lecture_number=${lecture}&question_number=${question}`,
        {
          responseType: "blob",
        }
      );

      const url = URL.createObjectURL(res.data);
      setImageUrl(url);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.warn(error.response.data.detail || "غير مسموح بعرض الحل الآن");
      } else if (error.response?.status === 404) {
        toast.error("لم يتم العثور على السؤال");
      } else {
        toast.error("حدث خطأ أثناء تحميل الملف");
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading animation while initializing
  if (initialLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-50">
        <Player autoplay loop src={loadingAnim} style={{ height: 150, width: 150 }} />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f5f7fa] dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative overflow-hidden font-sans transition-colors duration-300"
    >
      {/* Background Particles */}
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: { enable: true, zIndex: -1 },
          particles: {
            number: { value: 40 },
            color: { value: "#3b82f6" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: { min: 1, max: 5 } },
            move: { enable: true, speed: 1 },
          },
        }}
      />

      {/* Toast Notifications */}
      <ToastContainer />

      <div className="max-w-2xl mx-auto pt-24 z-10 relative px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            عرض حل السؤال
          </h1>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block mb-2 font-semibold">الصف الدراسي:</label>
              <input
                type="text"
                value={grade}
                readOnly
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">رقم المحاضرة:</label>
              <input
                type="number"
                value={lecture}
                onChange={(e) => setLecture(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: 2"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">رقم السؤال:</label>
              <input
                type="number"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="مثال: 5"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-full font-bold text-xl shadow-md transition duration-300 flex items-center justify-center"
              disabled={loading}
            >
              {loading && (
                <span className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full ml-3" />
              )}
              {loading ? "جاري التحميل..." : "عرض الحل"}
            </button>
          </form>

          <div className="mt-10 text-center min-h-[200px] flex flex-col justify-center items-center">
            {loading ? (
              <Player autoplay loop src={loadingAnim} style={{ height: 150, width: 150 }} />
            ) : imageUrl ? (
              <>
                <h2 className="text-xl font-semibold mb-4">حل السؤال:</h2>
                <img
                  src={imageUrl}
                  alt="حل السؤال"
                  className="max-w-full rounded-xl shadow-lg border"
                />
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default QuestionPage;
