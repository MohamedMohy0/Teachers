import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

  const BASE_URL = "https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev";

  const options = ["ا", "ب", "ج", "د"]; // خيارات الحروف

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    setEmail(storedEmail);
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
    if (!inputQuizNumber) {
      toast.warn("يرجى إدخال رقم صحيح");
      return;
    }
    if (inputQuizNumber < 0) {
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
        // تأكد أن النتيجة عدد وليس نص أو null
        const scoreFromServer = Number(res.data.score) || 0;
        const percentage = Math.round((scoreFromServer / pages) * 100);
        setScore(scoreFromServer);
        setDate(res.data.date);
        setQuizFinished(true);
        setGrade(getGradeFromPercentage(percentage));
      } else {
        setAnswers(res.data.answers || {}); // تأكد أن answers كائن
        setQuizStarted(true);
        loadQuestionImage(0, email, inputQuizNumber);
        await loadAttempts(email, Number(inputQuizNumber)); // تحميل حالة المحاولات المخزنة
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
    } catch (err) {
      toast.error("حدث خطأ أثناء تحميل صورة السؤال");
    }
  };

  // تحميل محاولات المستخدم السابقة من السيرفر وتحديث score بناءً عليها
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

      // تحديث الدرجة بعد تحميل حالة المحاولات
      const correctCount = Object.values(newQuestionStatus).filter(status => status === "correct").length;
      setScore(correctCount);

    } catch (err) {
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
    } catch (err) {
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

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;

  if (!quizStarted && !quizFinished) {
    return (
      <div
        dir="rtl"
        className="min-h-screen flex items-center justify-center bg-gray-100 p-6"
      >
        <ToastContainer />
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6">
            اختر رقم الواجب الذي ترغب بحله
          </h2>
          <input
            type="number"
            value={inputQuizNumber}
            onChange={(e) => setInputQuizNumber(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-xl mb-4"
            placeholder="أدخل رقم الواجب"
          />
          <button
            onClick={startQuiz}
            className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"
          >
            ابدأ الواجب
          </button>
        </div>
      </div>
    );
  }

  if (quizFinished) {
    const percentage = Math.round((score / pageCount) * 100);
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center w-full max-w-md">
          <h2 className="text-3xl font-extrabold text-green-700 mb-6">
            تم الانتهاء من الواجب رقم {quizNumber}
          </h2>
          <p className="text-right text-lg font-bold">الاسم: {userName}</p>
          <p className="text-right text-lg font-bold">تاريخ الإكمال: {date}</p>
          <p className="text-right text-lg font-bold">
            الدرجة: {score} من {pageCount}
          </p>
          <p className="text-right text-lg font-bold">%النسبة: {percentage}</p>
          <p className="text-right text-lg font-bold">التقدير: {grade}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-gray-100 p-6 text-gray-800 font-sans"
    >
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">
          واجب رقم {quizNumber}
        </h1>
        <p className="text-center mb-4">
          السؤال {currentQuestion + 1} من {pageCount}
        </p>

        {/* شريط حالة الأسئلة */}
        <div className="flex justify-center gap-2 mb-4">
          {Array.from({ length: pageCount }).map((_, i) => {
            const status = getQuestionStatus(i);
            let bgColor = "bg-gray-300"; // لم يتم الاجابة

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
                className={`${bgColor} w-6 h-6 rounded cursor-pointer flex items-center justify-center text-white text-sm font-bold select-none`}
                title={`السؤال ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {imageUrl && (
          <div className="mb-6">
            <img
              src={imageUrl}
              alt={`Question ${currentQuestion + 1}`}
              className="mx-auto max-w-full border rounded shadow"
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-center">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              disabled={locked[currentQuestion]}
              className={`p-3 rounded-xl font-bold border-2 transition-all duration-200 ${
                selectedOption === opt
                  ? normalizeLetter(opt) === normalizeLetter(String(answers[currentQuestion]))
                    ? "bg-green-100 border-green-500 text-green-700"
                    : "bg-red-100 border-red-500 text-red-700"
                  : "bg-white border-gray-300 hover:bg-blue-100"
              }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrev}
            disabled={currentQuestion === 0}
            className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"
          >
            السابق
          </button>

          <button
            onClick={handleNext}
            disabled={!allAnswered && currentQuestion + 1 === pageCount}
            className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"
          >
            {currentQuestion + 1 < pageCount ? "التالي" : "إنهاء"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
