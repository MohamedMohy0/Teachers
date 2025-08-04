import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function QuizPage() {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("بدون اسم");
  const [quizNumber, setQuizNumber] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [imageUrl, setImageUrl] = useState(null);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [attempts, setAttempts] = useState({});
  const [locked, setLocked] = useState({});
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quizFinished, setQuizFinished] = useState(false);
  const reportRef = useRef(null);

  const downloadReport = async () => {
    const element = reportRef.current;

    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
    pdf.save(`تقرير_${userName}.pdf`);
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    if (!storedEmail) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    setEmail(storedEmail);

    axios
      .get(`https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/get_quiz_info?email=${storedEmail}`)
      .then((res) => {
        setQuizNumber(res.data.quiz_number);
        setPageCount(res.data.page_count);
        setAnswers(res.data.answers);
        setLoading(false);
        loadQuestionImage(0, storedEmail);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          toast.error(err.response.data.detail);
        } else {
          toast.error("حدث خطأ أثناء تحميل بيانات الكويز");
        }
      });

    axios
      .get(`https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/get_user?email=${storedEmail}`)
      .then((res) => {
        setUserName(res.data.Name || "بدون اسم");
        localStorage.setItem("name", res.data.Name || "بدون اسم");
      })
      .catch((err) => {
        console.error("فشل تحميل الاسم:", err);
      });
  }, []);

  const loadQuestionImage = async (pageIndex, email) => {
    try {
      const res = await axios.get(
        `https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/get_quiz_page?email=${email}&page=${pageIndex}`,
        { responseType: "blob" }
      );
      setImageUrl(URL.createObjectURL(res.data));
    } catch (err) {
      toast.error("حدث خطأ أثناء تحميل صورة السؤال");
    }
  };

  const handleOptionClick = (option) => {
    if (locked[currentQuestion]) return;

    const correctAnswer = answers[currentQuestion];
    const currentAttempts = attempts[currentQuestion] || 0;

    setSelectedOption(option);

    if (option === correctAnswer) {
      toast.success("إجابة صحيحة");
      setScore((prev) => prev + 1);
      setLocked((prev) => ({ ...prev, [currentQuestion]: true }));
    } else {
      if (currentAttempts === 0) {
        toast.warn("حاول مرة أخرى");
        setAttempts((prev) => ({ ...prev, [currentQuestion]: 1 }));
      } else {
        toast.error("الإجابة خاطئة");
        setLocked((prev) => ({ ...prev, [currentQuestion]: true }));
      }
    }
  };

  const handleNext = () => {
    if (currentQuestion + 1 < pageCount) {
      const nextIndex = currentQuestion + 1;
      setCurrentQuestion(nextIndex);
      setSelectedOption(null);
      loadQuestionImage(nextIndex, email);
    } else {
      finishQuiz();
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      const prevIndex = currentQuestion - 1;
      setCurrentQuestion(prevIndex);
      setSelectedOption(null);
      loadQuestionImage(prevIndex, email);
    }
  };

  const finishQuiz = () => {
    setQuizFinished(true);
    axios
      .post("https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/submit_score", {
        email: email,
        score: score,
      })
      .then(() => toast.success("تم إرسال نتيجتك بنجاح"))
      .catch(() => toast.error("حدث خطأ أثناء إرسال النتيجة"));
  };

  if (loading) return <div className="p-10 text-center">جاري التحميل...</div>;
if (quizFinished) {
  const date = new Date().toLocaleDateString("ar-EG");
  const percentage = Math.round((score / pageCount) * 100);

  let grade = "";
  if (percentage >= 90) grade = "أ+";
  else if (percentage >= 85) grade = "أ";
  else if (percentage >= 80) grade = "ب+";
  else if (percentage >= 75) grade = "ب";
  else if (percentage >= 70) grade = "ج+";
  else if (percentage >= 65) grade = "ج";
  else if (percentage >= 60) grade = "د";
  else grade = "راسب";

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md w-full">
        <h2 className="text-2xl font-bold text-green-700 mb-6">
           تم الانتهاء من الواجب
        </h2>
        <div className="text-right text-gray-800 text-lg leading-loose font-semibold">
          <p>الاسم: {userName}</p>
          <p>تاريخ الإكمال: {date}</p>
          <p>الدرجة: {score} من {pageCount}</p>
          <p>%النسبة المئوية: {percentage}</p>
          <p>التقدير: {grade}</p>
        </div>
      </div>
    </div>
  );
}


  return (
    <div dir="rtl" className="min-h-screen bg-gray-100 p-6 text-gray-800 font-sans">
      <ToastContainer />
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-4">اختبار رقم {quizNumber}</h1>
        <p className="text-center mb-4">
          السؤال {currentQuestion + 1} من {pageCount}
        </p>

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
          {[1, 2, 3, 4].map((opt) => (
            <button
              key={opt}
              onClick={() => handleOptionClick(opt)}
              disabled={locked[currentQuestion]}
              className={`p-3 rounded-xl font-bold border-2 transition-all duration-200 ${
                selectedOption === opt
                  ? opt === answers[currentQuestion]
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
