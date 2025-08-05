import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function QuestionPage() {
  const [grade, setGrade] = useState("");
  const [lecture, setLecture] = useState("");
  const [question, setQuestion] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedLevel = localStorage.getItem("Level");
    if (savedEmail && savedLevel) {
      setEmail(savedEmail);
      setGrade(savedLevel);
    } else {
      toast.error("يجب تسجيل الدخول أولاً");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate]);

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

      const imageUrl = URL.createObjectURL(res.data);
      setImageUrl(imageUrl);
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

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f7fa] p-6 text-gray-800 font-sans">
      <ToastContainer />
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#1e293b]">
            منصة الأسئلة التعليمية
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">الصف الدراسي:</label>
              <input
                type="text"
                value={grade}
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 cursor-not-allowed"
                readOnly
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">رقم المحاضرة:</label>
              <input
                type="number"
                value={lecture}
                onChange={(e) => setLecture(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl"
                placeholder="مثال: 2"
                required
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">رقم السؤال:</label>
              <input
                type="number"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl"
                placeholder="مثال: 5"
                required
              />
            </div>

            <div className="text-center">
              <button
                type="submit"
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"
              >
                {loading ? "جاري التحميل..." : "عرض الحل"}
              </button>
            </div>
          </form>

          {imageUrl && (
            <div className="mt-8 text-center">
              <h2 className="text-xl font-semibold mb-4 text-[#1e293b]">حل السؤال:</h2>
              <img
                src={imageUrl}
                alt="حل السؤال"
                className="mx-auto max-w-full shadow-lg border"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default QuestionPage;
