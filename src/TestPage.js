import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import loadingAnim from "./Loading.json";

function TestPage() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("بدون اسم");
  const [testNumber, setTestNumber] = useState(null);
  const [inputTestNumber, setInputTestNumber] = useState("");
  const [pageCount, setPageCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState({});
  const [savedAnswers, setSavedAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [savedFlag, setSavedFlag] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [date, setDate] = useState("");
  const [grade, setGrade] = useState("");
  const [testStarted, setTestStarted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState(null);
  const [showSolve, setShowSolve] = useState(true); // <-- جديد
  const timerRef = useRef(null);
  const [, setDarkMode] = useState(false);
  const options = ["ا", "ب", "ج", "د"];
  const navigate = useNavigate();
  const BASE_URL = "https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev";

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    const storedDarkMode = localStorage.getItem("darkMode") === "true";

    if (!storedEmail) {
      toast.error("يرجى تسجيل الدخول أولاً");
      setTimeout(() => navigate("/"), 2000);
      return;
    }
    setDarkMode(storedDarkMode);
    setEmail(storedEmail);
  }, [navigate]);

  const resetTestState = () => {
    setPageCount(0);
    setCurrentQuestion(0);
    setImageUrl(null);
    setCorrectAnswers({});
    setSavedAnswers({});
    setSelectedOption(null);
    setSavedFlag({});
    setScore(0);
    setDate("");
    setGrade("");
    setTestFinished(false);
    setTestStarted(false);
    setTestCompleted(false);
    setShowSolve(true);
    clearInterval(timerRef.current);
    setTimeLeftMs(null);
  };

  const calculateScoreFromAttempts = async (testNum, emailParam) => {
    try {
      const res = await axios.post(`${BASE_URL}/submit_test_on_timeout`, {
        email: emailParam,
        test_number: testNum
      }, {
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
      });

      return res.data;
    } catch (err) {
      console.error("Error details:", err.response?.data || err.message);
      throw new Error(err.response?.data?.detail || "فشل في إرسال الاختبار");
    }
  };

  const submitAnswersFromAttempts = async (testNum, emailParam) => {
  if (!testNum || testNum <= 0) {
    toast.error("الرجاء اختيار رقم اختبار صحيح قبل الإرسال");
    return;
  }

  try {
    setLoading(true);
    const result = await calculateScoreFromAttempts(testNum, emailParam);
    
    // جلب أحدث حالة للاختبار بعد التسليم
    const testInfoRes = await axios.get(`${BASE_URL}/get_test_info?email=${emailParam}&test_number=${testNum}`);
    const testInfo = testInfoRes.data;

    setTestCompleted(true);
    setTestFinished(testInfo.show_solve ?? false);
    setDate(result.date || new Date().toLocaleDateString("ar-EG"));
    setScore(result.score || 0);
    setPageCount(testInfo.total_questions || pageCount);
    
    const percentage = Math.round((result.score / (testInfo.total_questions || pageCount)) * 100);
    setGrade(getGradeFromPercentage(percentage));
    
    if (testInfo.show_solve) {
      // جلب الإجابات الصحيحة إذا كان مسموحاً بعرضها
      const answersRes = await axios.get(`${BASE_URL}/get_saved_answers?email=${emailParam}&test_number=${testNum}`);
      setSavedAnswers(answersRes.data || {});
      setCorrectAnswers(testInfo.answers || {});
    }

    toast.success("تم إرسال نتيجك بنجاح");
  } catch (err) {
    console.error("Failed to submit answers:", err);
    toast.error(err.message || "حدث خطأ أثناء إرسال النتيجة");
  } finally {
    setLoading(false);
  }
};

 const startTimer = (ms, currentTestNumber, currentEmail) => {
    clearInterval(timerRef.current);
    setTimeLeftMs(ms);

    const endTs = Date.now() + ms;

    timerRef.current = setInterval(() => {
        const left = Math.max(0, endTs - Date.now());
        setTimeLeftMs(left);
        
        // إضافة تحقق إضافي لانتهاء الوقت
        if (left <= 0) {
            clearInterval(timerRef.current);
            submitAnswersFromAttempts(currentTestNumber, currentEmail);
        }
    }, 1000);

    setTimeout(async () => {
        clearInterval(timerRef.current);
        await submitAnswersFromAttempts(currentTestNumber, currentEmail);
    }, ms);
};

  const formatTime = (ms) => {
    if (ms == null) return "--:--:--";
    const totalSec = Math.floor(ms / 1000);
    const hh = Math.floor(totalSec / 3600);
    const mm = Math.floor((totalSec % 3600) / 60);
    const ss = totalSec % 60;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
  };

  const loadQuestionImage = async (pageIndex, emailParam, testNum) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/get_test_page?email=${emailParam}&page=${pageIndex}&test_number=${testNum}`,
        { responseType: "blob" }
      );
      setImageUrl(URL.createObjectURL(res.data));
      const saved = savedAnswers[pageIndex];
      setSelectedOption(saved || null);
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء تحميل صورة السؤال");
    }
  };

  const handleSelectOption = (opt) => {
    setSelectedOption(opt);
  };

  const handleSaveAnswer = async () => {
    if (!selectedOption) {
      toast.warn("يرجى اختيار خيار قبل الحفظ");
      return;
    }

    try {
      await axios.post(`${BASE_URL}/save_test_attempt`, {
        email,
        test_number: testNumber,
        question_index: currentQuestion,
        selected_option: selectedOption
      });

      setSavedAnswers((prev) => ({ ...prev, [currentQuestion]: selectedOption }));
      setSavedFlag((prev) => ({ ...prev, [currentQuestion]: true }));
      toast.success("تم حفظ الإجابة بنجاح في النظام");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ الإجابة");
    }
  };

  const handleNext = async () => {
    if (currentQuestion + 1 < pageCount) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedOption(savedAnswers[nextIndex] || null);
      await loadQuestionImage(nextIndex, email, testNumber);
    } else {
      handleSaveAndFinish();
    }
  };

  const handlePrev = async () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setSelectedOption(savedAnswers[prevIndex] || null);
      await loadQuestionImage(prevIndex, email, testNumber);
    }
  };

 const handleSaveAndFinish = async () => {
  clearInterval(timerRef.current);

  try {
    if (selectedOption) {
      await handleSaveAnswer();
    }

    const result = await calculateScoreFromAttempts(testNumber, email);

    setTestCompleted(true);
    setTestFinished(false); // ← لا تعرض النتائج مباشرة بعد التسليم
    setDate(result.date || new Date().toLocaleDateString("ar-EG"));
    setScore(result.score || 0);
    const percentage = Math.round((result.score / pageCount) * 100);
    setGrade(getGradeFromPercentage(percentage));

    toast.success("تم إرسال نتيجتك بنجاح، سيتم إعلامك بالنتيجة لاحقاً");
    
    // إعادة تحميل بيانات الاختبار للحصول على أحدث حالة
    const res = await axios.get(`${BASE_URL}/get_test_info?email=${email}&test_number=${testNumber}`);
    const data = res.data;
    setShowSolve(data.show_solve ?? false);
    
    // إذا كان مسموحاً بعرض الحلول، تحديث الحالة
    if (data.show_solve) {
      setTestFinished(true);
    }
  } catch (err) {
    console.error(err);
    toast.error("حدث خطأ أثناء إرسال النتيجة");
  }
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



const startTest = async () => {
    if (!inputTestNumber || Number(inputTestNumber) < 0) {
        toast.warn("يرجى إدخال رقم صحيح");
        return;
    }
    resetTestState();
    setLoading(true);

    try {
        const res = await axios.get(`${BASE_URL}/get_test_info?email=${email}&test_number=${inputTestNumber}`);
        const data = res.data;

        setTestNumber(Number(inputTestNumber));
        setUserName(data.name || "بدون اسم");
        setShowSolve(data.show_solve ?? true);

        // إذا كان الاختبار يعرض الحلول مباشرة
        if (data.show_solve) {
            if (data.status === "completed") {
                setTestCompleted(true);
                setTestFinished(true);
                setScore(data.score || 0);
                setPageCount(data.total_questions || 0);
                setDate(data.date || new Date().toLocaleDateString("ar-EG"));
                const percentage = Math.round((data.score / (data.total_questions || 1)) * 100);
                setGrade(getGradeFromPercentage(percentage));
                
                // جلب الإجابات المحفوظة
                const answersRes = await axios.get(
                    `${BASE_URL}/get_saved_answers?email=${email}&test_number=${inputTestNumber}`
                  );

                  // فصل saved_answers و correct_answers
                  setSavedAnswers(answersRes.data.saved_answers || {});
                  setCorrectAnswers(answersRes.data.correct_answers || {});

                return;
            } else if (data.status === "not_completed") {
                setTestCompleted(false);
                setTestFinished(false);
                toast.info(data.message || "لم تقم بحل هذا الاختبار بعد");
                return;
            }
        }

        // الحالات الأخرى (التدفق العادي)
        if (data.status === "completed_no_show") {
            setTestCompleted(true);
            setTestFinished(false);
            toast.info("تم إرسال إجاباتك، انتظر النتيجة");
            return;
        }
        if (data.status === "time_over") {
            setTestCompleted(true);
            setTestFinished(data.show_solve);
            setScore(data.score || 0);
            toast.info(data.message || "انتهى وقت الاختبار");
            return;
        }
        if (data.status === "finished_day_over") {
            setTestCompleted(true);
            setTestFinished(false);
            setScore(data.score ?? 0);
            toast.info(data.message || "انتهى وقت الاختبار");
            return;
        }

        // اختبار جديد
        setPageCount(data.page_count);
        setCorrectAnswers(data.answers || {});
        setTestStarted(true);
        setTimeLeftMs(data.end_hour ? new Date(data.end_hour).getTime() - Date.now() : 0);
        await loadQuestionImage(0, email, Number(inputTestNumber));
        startTimer(data.end_hour ? new Date(data.end_hour).getTime() - Date.now() : 0, Number(inputTestNumber), email);
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.detail || "غير مسموح بحل هذا الاختبار أو فشل الاتصال");
    } finally {
        setLoading(false);
    }
};

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-50">
        <Player autoplay loop src={loadingAnim} style={{ height: 150, width: 150 }} />
      </div>
    );
  }

  if (testCompleted && !testFinished) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-blue-600 dark:text-blue-400">تم إرسال إجاباتك بنجاح</h2>
          <div className="mb-6">
            <Player autoplay loop src={loadingAnim} style={{ height: 100, width: 100 }} />
          </div>
          <p className="mb-4 text-gray-700 dark:text-gray-300">سيتم تصحيح إجاباتك وعرض النتيجة لاحقاً.</p>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">رقم الاختبار: {testNumber}</p>
          <button 
            onClick={() => navigate("/dashboard")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full mt-4 w-full transition duration-300"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Before test started
  if (!testStarted && !testFinished) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-[#f5f7fa] dark:bg-gray-900 p-6 relative overflow-hidden font-sans transition-colors duration-300"
      >
        <Particles id="tsparticles" init={particlesInit} options={{ fullScreen: { enable: true, zIndex: -1 }, particles: { number: { value: 40 }, color: { value: "#3b82f6" }, shape: { type: "circle" }, opacity: { value: 0.3 }, size: { value: { min: 1, max: 5 } }, move: { enable: true, speed: 1 } } }} />
        <ToastContainer />
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }} className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-md w-full text-center">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">اختر رقم الاختبار الذي ترغب بحله</h2>
          <input type="number" value={inputTestNumber} onChange={(e) => setInputTestNumber(e.target.value)} className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl mb-4 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="أدخل رقم الاختبار" />
          <button onClick={startTest} className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-full font-bold text-xl shadow-md transition duration-300">ابدأ الاختبار</button>
          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">الوقت سيبدأ عند الضغط على ابدأ وسيتم إغلاق الاختبار تلقائيًا عند انتهاء الوقت.</p>
        </motion.div>
      </div>
    );
  }
// If answers submitted but Show_Solve = false


   if (testCompleted && testFinished) {
    const percentage = Math.round((score / (pageCount || 1)) * 100);
    return (
      <div dir="rtl" className="min-h-screen bg-[#f5f7fa] dark:bg-gray-900 p-6 relative overflow-auto">
        <Particles id="tsparticles" init={particlesInit} options={{ fullScreen: { enable: true, zIndex: -1 }, particles: { number: { value: 40 }, color: { value: "#3b82f6" }, shape: { type: "circle" }, opacity: { value: 0.15 }, size: { value: { min: 1, max: 5 } }, move: { enable: true, speed: 1 } } }} />
        <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100 }} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 max-w-4xl w-full mx-auto">
          <ToastContainer />
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-blue-700 dark:text-blue-400">نتيجة الاختبار رقم {testNumber}</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">الاسم</p>
                <p className="font-bold">{userName}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">التاريخ</p>
                <p className="font-bold">{date}</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">الدرجة</p>
                <p className="font-bold">{score} / {pageCount}</p>
              </div>
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">النسبة</p>
                <p className="font-bold">{percentage} </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">التقدير</p>
                <p className="font-bold">{grade}</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-xl font-bold text-center mb-6">تفاصيل الإجابات</h3>
           {Array.from({ length: pageCount }).map((_, i) => {
  const studentAnswer = savedAnswers[i] || "-";
  const correctAnswer = correctAnswers[i] || "-";
  
  // تحويل كل الإجابات إلى سلسلة نصية للمقارنة
  const normalizedStudent = String(studentAnswer).trim();
  const normalizedCorrect = String(correctAnswer).trim();
  const isCorrect = normalizedStudent === normalizedCorrect;
  
  return (
    <div key={i} className={`p-6 rounded-xl border ${
      isCorrect 
        ? "bg-green-50 border-green-200" 
        : "bg-red-50 border-red-200"
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold">السؤال {i + 1}</h4>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
          isCorrect 
            ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" 
            : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100"
        }`}>
          {isCorrect ? "صحيح" : "خاطئ"}
        </span>
      </div>
      
      <QuestionImageReview pageIndex={i} email={email} testNumber={testNumber} />
      
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className={`p-3 rounded-lg ${
          isCorrect 
            ? "bg-green-100 dark:bg-green-800/50" 
            : "bg-red-100 dark:bg-red-800/50"
        }`}>
 <p className="text-sm text-gray-600">إجابتك</p>
          <p className="font-bold">{normalizedStudent}</p>
        </div>
        <div className="bg-blue-100 p-3 rounded-lg">
          <p className="text-sm text-gray-600">الإجابة الصحيحة</p>
          <p className="font-bold">{normalizedCorrect}</p>
        </div>
      </div>
    </div>
  );
})}
          </div>

          <div className="mt-8 text-center">
            <button 
              onClick={() => navigate("/dashboard")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-bold transition duration-300"
            >
              العودة للرئيسية
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

 if (testCompleted && !testFinished && !showSolve) {
    return (
      <div dir="rtl" className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-md text-center">
          <h2 className="text-2xl font-bold mb-4">تم إرسال إجاباتك</h2>
          <p>انتظر نتيجة الاختبار، لن يتم عرض الإجابات الصحيحة بعد.</p>
          <button onClick={() => navigate("/dashboard")} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full mt-6">
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  // Test in progress UI
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
        className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 mt-10 relative"
      >
        <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400 text-center mb-4">
          الاختبار رقم {testNumber}
        </h1>

        <div className="flex justify-center mb-6">
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-6 py-3 rounded-full shadow-md font-mono font-bold text-lg">
            ⏳ {formatTime(timeLeftMs)}
          </div>
        </div>

        <p className="text-center text-lg font-bold mb-4">
          السؤال {currentQuestion + 1} من {pageCount}
        </p>

        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {Array.from({ length: pageCount }).map((_, i) => {
            const isSaved = !!savedFlag[i];
            const bgColor = isSaved ? "bg-blue-500" : "bg-gray-300";
            return (
              <button
                key={i}
                onClick={async () => {
                  setCurrentQuestion(i);
                  setSelectedOption(savedAnswers[i] || null);
                  await loadQuestionImage(i, email, testNumber);
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
          <div className="mb-6 flex justify-center">
            <img
              src={imageUrl}
              alt={`Question ${currentQuestion + 1}`}
              className="max-w-full rounded-xl shadow-lg border border-gray-300 dark:border-gray-700"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-6 text-center mb-6">
          {options.map((opt) => {
            const isSelected = selectedOption === opt;
            return (
              <button
                key={opt}
                onClick={() => handleSelectOption(opt)}
                className={`p-4 rounded-xl font-bold border-2 transition-all duration-200 ${
                  isSelected
                    ? "bg-blue-500 border-blue-700 text-white"
                    : "bg-white border-gray-300 hover:bg-blue-50 dark:bg-gray-700 dark:hover:bg-blue-800 dark:text-gray-200"
                }`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        <div className="relative flex justify-between items-center mt-12 w-full">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold"
          >
            السابق
          </button>

          <button
            onClick={handleSaveAnswer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold"
          >
            حفظ
          </button>

          <button
            onClick={handleNext}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-bold"
          >
            {currentQuestion + 1 < pageCount ? "التالي" : "إنهاء وتسليم"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function QuestionImageReview({ pageIndex, email, testNumber }) {
  const [imgSrc, setImgSrc] = useState(null);
  const BASE_URL = "https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev";

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/get_test_page?email=${email}&page=${pageIndex}&test_number=${testNumber}`, { responseType: "blob" });
        const obj = URL.createObjectURL(res.data);
        if (mounted) setImgSrc(obj);
      } catch (err) {
        console.error(err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [pageIndex, email, testNumber]);

  if (!imgSrc) return <div className="h-40 w-full bg-gray-100 dark:bg-gray-800 rounded-md flex items-center justify-center">جاري التحميل...</div>;
  return <img src={imgSrc} alt={`Question ${pageIndex + 1}`} className="w-full rounded-md shadow-sm" />;
}

export default TestPage;