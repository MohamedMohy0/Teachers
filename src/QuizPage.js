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

function QuizPage() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("بدون اسم");
  const [quizNumber, setQuizNumber] = useState(null);
  const [inputQuizNumber, setInputQuizNumber] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [, setAttempts] = useState({});
  const [locked, setLocked] = useState({});
  const [questionStatus, setQuestionStatus] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [date, setDate] = useState("");
  const [grade, setGrade] = useState("");
  const [quizStarted, setQuizStarted] = useState(false);
  const [, setDarkMode] = useState(false);

  const options = ["ا", "ب", "ج", "د"];
  const navigate = useNavigate();

  // Load user email & dark mode, redirect if not logged in
  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedDarkMode = localStorage.getItem("darkMode") === "true";

    if (!storedEmail) {
      toast.error("يرجى تسجيل الدخول أولاً");
      setTimeout(() => navigate("/"), 2000);
      return;
    }
    setEmail(storedEmail);
    setDarkMode(storedDarkMode);
  }, [navigate]);

  const BASE_URL = "https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev";

  // Particles init
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const resetQuizState = () => {
    setPageCount(0);
    setCurrentQuestion(0);
    setImageUrl(null);
    setAnswers({});
    setSelectedOption(null);
    setAttempts({});
    setLocked({});
    setQuestionStatus({});
    setScore(0);
    setDate("");
    setGrade("");
    setQuizFinished(false);
    setQuizStarted(false);
  };

  const getPageCountIfMissing = async (quizNum) => {
    const res = await axios.get(`${BASE_URL}/get_quiz_page_count?quiz_number=${quizNum}`);
    return res.data.page_count;
  };

  const startQuiz = async () => {
    if (!inputQuizNumber || inputQuizNumber < 0) {
      toast.warn("يرجى إدخال رقم صحيح");
      return;
    }
    resetQuizState();
    setLoading(true);

    try {
      const res = await axios.get(`${BASE_URL}/get_quiz_info?email=${email}&quiz_number=${inputQuizNumber}`);
      let pages = res.data.page_count;

      if (!pages) {
        pages = await getPageCountIfMissing(inputQuizNumber);
      }

      setPageCount(pages);
      setQuizNumber(Number(inputQuizNumber));
      setUserName(res.data.name);

      if (res.data.already_done) {
        const scoreFromServer = Number(res.data.score) || 0;
        const percentage = Math.round((scoreFromServer / pages) * 100);
        setScore(scoreFromServer);
        setDate(res.data.date);
        setQuizFinished(true);
        setGrade(getGradeFromPercentage(percentage));
      } else {
        setAnswers(res.data.answers || {});
        setQuizStarted(true);
        await loadAttempts(email, Number(inputQuizNumber));
        loadQuestionImage(0, email, inputQuizNumber);
      }
    } catch (error) {
      toast.error("غير مسموح بحل هذا الواجب بعد");
    } finally {
      setLoading(false);
    }
  };

  const loadQuestionImage = async (pageIndex, email, quizNum) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/get_quiz_page?email=${email}&page=${pageIndex}&quiz_number=${quizNum}`,
        { responseType: "blob" }
      );
      setImageUrl(URL.createObjectURL(res.data));
    } catch {
      toast.error("حدث خطأ أثناء تحميل صورة السؤال");
    }
  };

  const loadAttempts = async (email, quizNum) => {
    try {
      const res = await axios.get(`${BASE_URL}/get_attempts`, {
        params: { email, quiz_number: quizNum }
      });
      const attemptsData = res.data;

      const newLocked = {};
      const newQuestionStatus = {};
      for (const [qIndex, val] of Object.entries(attemptsData)) {
        newLocked[qIndex] = val.locked;
        newQuestionStatus[qIndex] = val.status;
      }
      setLocked(newLocked);
      setQuestionStatus(newQuestionStatus);

      const correctCount = Object.values(newQuestionStatus).filter(status => status === "correct").length;
      setScore(correctCount);

    } catch {
      toast.error("فشل في تحميل حالة المحاولات السابقة");
    }
  };

  const normalizeLetter = (letter) => {
    if (!letter) return "";
    let normalized = letter.trim();
    normalized = normalized.replace(/ا/g, "أ");
    return normalized;
  };

  const handleOptionClick = async (option) => {
    if (locked[currentQuestion]) return;

    setSelectedOption(option);

    try {
      const res = await axios.post(`${BASE_URL}/submit_attempt`, {
        email,
        quiz_number: Number(quizNumber),
        question_index: currentQuestion,
        selected_option: option,
      });

      const { status, locked: isLocked, attempts: attemptCount } = res.data;

      setLocked((prev) => ({ ...prev, [currentQuestion]: isLocked }));
      setAttempts((prev) => ({ ...prev, [currentQuestion]: attemptCount }));
      setQuestionStatus((prev) => ({ ...prev, [currentQuestion]: status }));

      if (status === "correct") {
        toast.success("إجابة صحيحة");
        setScore((prev) => prev + 1);
      } else if (status === "wrong-once") {
        toast.warn("حاول مرة أخرى");
      } else if (status === "wrong") {
        toast.error("الإجابة خاطئة");
      }
    } catch {
      toast.error("حدث خطأ أثناء التحقق من الإجابة");
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < pageCount) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedOption(null);
      loadQuestionImage(nextIndex, email, quizNumber);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setSelectedOption(null);
      loadQuestionImage(prevIndex, email, quizNumber);
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    const pages = pageCount > 0 ? pageCount : 1;
    const percentage = Math.round((score / pages) * 100);
    setDate(new Date().toLocaleDateString("ar-EG"));
    setGrade(getGradeFromPercentage(percentage));

    axios
      .post(`${BASE_URL}/submit_score`, {
        email: email,
        score: score,
        quiz_number: Number(quizNumber),
      })
      .then(() => toast.success("تم إرسال نتيجتك بنجاح"))
      .catch(() => toast.error("حدث خطأ أثناء إرسال النتيجة"));
  };

  const getGradeFromPercentage = (percentage) => {
    if (percentage >= 90) return "+أ";
    if (percentage >= 85) return "أ";
    if (percentage >= 80) return "+ب";
    if (percentage >= 75) return "ب";
    if (percentage >= 70) return "+ج";
    if (percentage >= 65) return "ج";
    if (percentage >= 60) return "د";
    return "راسب";
  };

  const getQuestionStatus = (index) => {
    return questionStatus[index] || "unanswered";
  };

  const allAnswered =
    pageCount > 0 &&
    Object.keys(questionStatus).length === pageCount &&
    Object.values(questionStatus).every(
      (status) => status === "correct" || status === "wrong"
    );

  // Show main loading animation while loading quiz data or question images
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-50">
        <Player autoplay loop src={loadingAnim} style={{ height: 150, width: 150 }} />
      </div>
    );
  }

  // Before quiz started
  if (!quizStarted && !quizFinished) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#f5f7fa] dark:bg-gray-900 p-6 relative overflow-hidden font-sans transition-colors duration-300"
      >
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
        <ToastContainer />
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center"
        >
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            اختر رقم الواجب الذي ترغب بحله
          </h2>
          <input
            type="number"
            value={inputQuizNumber}
            onChange={(e) => setInputQuizNumber(e.target.value)}
            className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl mb-6 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="أدخل رقم الواجب"
          />
          <button
            onClick={startQuiz}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-full font-bold text-xl shadow-md transition duration-300"
          >
            ابدأ الواجب
          </button>
        </motion.div>
      </div>
    );
  }

  // After quiz finished
  if (quizFinished) {
    const percentage = Math.round((score / pageCount) * 100);
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#f5f7fa] dark:bg-gray-900 p-6 relative overflow-hidden font-sans transition-colors duration-300"
      >
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
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center"
        >
          <ToastContainer />
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            تم الانتهاء من الواجب رقم {quizNumber}
          </h2>
        <p className="text-right text-lg font-bold text-black dark:text-white">الاسم: {userName}</p>
        <p className="text-right text-lg font-bold text-black dark:text-white">تاريخ الإكمال: {date}</p>
        <p className="text-right text-lg font-bold text-black dark:text-white">الدرجة: {score} من {pageCount}</p>
        <p className="text-right text-lg font-bold text-black dark:text-white">النسبة: {percentage}%</p>
        <p className="text-right text-lg font-bold text-black dark:text-white">التقدير: {grade}</p>

        </motion.div>
      </div>
    );
  }

  // Quiz in progress UI
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f5f7fa] dark:bg-gray-900 text-gray-800 dark:text-gray-100 relative overflow-hidden font-sans transition-colors duration-300"
    >
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
      <ToastContainer />
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-24 relative"
      >
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
          واجب رقم {quizNumber}
        </h1>
        <p className="text-center text-lg font-bold text-black dark:text-white">
          السؤال {currentQuestion + 1} من {pageCount}
        </p>
        <p className="text-center text-lg font-bold text-black dark:text-white">
             
             </p>

        {/* Question status bar */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {Array.from({ length: pageCount }).map((_, i) => {
            const status = getQuestionStatus(i);
            let bgColor = "bg-gray-300";

            if (status === "correct") bgColor = "bg-green-500";
            else if (status === "wrong-once") bgColor = "bg-yellow-400";
            else if (status === "wrong") bgColor = "bg-red-600";

            return (
              <button
                key={i}
                onClick={() => {
                  setCurrentQuestion(i);
                  setSelectedOption(null);
                  loadQuestionImage(i, email, quizNumber);
                }}
                className={`${bgColor} w-8 h-8 rounded cursor-pointer flex items-center justify-center text-white text-sm font-bold select-none`}
                title={`السؤال ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {imageUrl && (
          <div className="mb-8 flex justify-center">
            <img
              src={imageUrl}
              alt={`Question ${currentQuestion + 1}`}
              className="max-w-full rounded-xl shadow-lg border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 text-center">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              disabled={locked[currentQuestion]}
              className={`p-4 rounded-xl font-bold border-2 transition-all duration-200
                ${
                  selectedOption === opt
                    ? normalizeLetter(opt) === normalizeLetter(String(answers[currentQuestion]))
                      ? "bg-green-100 border-green-500 text-green-700"
                      : "bg-red-100 border-red-500 text-red-700"
                    : "bg-white border-gray-300 hover:bg-blue-100 dark:bg-gray-700 dark:hover:bg-blue-700 dark:text-gray-200"
                }
              `}
            >
              {opt}
            </button>
          ))}
        </div>

 <div className="flex justify-between mt-10 space-x-4 rtl:space-x-reverse">
  <button
    onClick={handlePrev}
    disabled={currentQuestion === 0}
    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-full font-bold text-lg shadow-md transition duration-300"
  >
    السابق
  </button>

  <button
    onClick={handleNext}
    disabled={!allAnswered && currentQuestion + 1 === pageCount}
    className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 rounded-full font-bold text-lg shadow-md transition duration-300"
  >
    {currentQuestion + 1 < pageCount ? "التالي" : "إنهاء"}
  </button>
</div>

      </motion.div>
    </div>
  );
}

export default QuizPage;
