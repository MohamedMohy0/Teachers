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
  const [attempts, setAttempts] = useState({});
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
      if (inputQuizNumber<0) {
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
        const percentage = Math.round((res.data.score / pages) * 100);
        setScore(res.data.score);
        setDate(res.data.date);
        setQuizFinished(true);
        setGrade(getGradeFromPercentage(percentage));
      } else {
        setAnswers(res.data.answers || {}); // تأكد أن answers كائن
        setQuizStarted(true);
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
    } catch (err) {
      toast.error("حدث خطأ أثناء تحميل صورة السؤال");
    }
  };

  // دالة لتوحيد شكل الحروف وتقليم الفراغات
  const normalizeLetter = (letter) => {
    if (!letter) return "";
    // استبدال ألف بدون همزة بألف بهمزة (مثلاً)
    let normalized = letter.trim();
    normalized = normalized.replace(/ا/g, "أ");
    // ممكن تضيف تعويضات أخرى إذا تريد
    return normalized;
  };

  const handleOptionClick = (option) => {
    if (locked[currentQuestion]) return;

    const correctAnswerRaw = answers[currentQuestion];
    const correctAnswer = normalizeLetter(String(correctAnswerRaw));
    const selected = normalizeLetter(String(option));
    const currentAttempts = attempts[currentQuestion] || 0;

    setSelectedOption(option);

    // طباعة القيم للمراجعة أثناء التطوير
    console.log("Selected option:", selected);
    console.log("Correct answer:", correctAnswer);
    console.log("Match result:", selected === correctAnswer);

    if (selected === correctAnswer) {
      toast.success("إجابة صحيحة");
      setScore((prev) => prev + 1);
      setLocked((prev) => ({ ...prev, [currentQuestion]: true }));
      setQuestionStatus((prev) => ({ ...prev, [currentQuestion]: "correct" }));
    } else {
      if (currentAttempts === 0) {
        toast.warn("حاول مرة أخرى");
        setAttempts((prev) => ({ ...prev, [currentQuestion]: 1 }));
        setQuestionStatus((prev) => ({ ...prev, [currentQuestion]: "wrong-once" }));
      } else {
        toast.error("الإجابة خاطئة");
        setLocked((prev) => ({ ...prev, [currentQuestion]: true }));
        setQuestionStatus((prev) => ({ ...prev, [currentQuestion]: "wrong" }));
      }
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
    if (percentage >= 90) return "+أ"
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
className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"          >
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
className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"          >
            {currentQuestion + 1 < pageCount ? "التالي" : "إنهاء"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
