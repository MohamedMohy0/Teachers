import React, { useState, useEffect } from "react";
import { HashRouter, Routes, Route, useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

// صفحة تسجيل الدخول
function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/login", {
        email,
        password,
      });

      toast.success(res.data.message || "تم تسجيل الدخول بنجاح");

      // حفظ البريد في localStorage
      localStorage.setItem("email", email);
      // داخل handleLogin بعد نجاح تسجيل الدخول
      localStorage.setItem("Level", res.data.Level); // 👈 حفظ المستوى


      setTimeout(() => navigate("/app"), 1500);
    } catch (err) {
      toast.error(err.response?.data?.detail || "حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f7fa] p-6 text-gray-800 font-sans">
      <ToastContainer />
      <div className="max-w-md mx-auto mt-24">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#1e293b]">تسجيل الدخول</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">البريد الإلكتروني:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl"
                placeholder="example@email.com"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">كلمة المرور:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 border border-gray-300 rounded-xl"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow"
              >
                {loading ? "جاري الدخول..." : "دخول"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// صفحة الأسئلة
function QuestionPage() {
  const [grade, setGrade] = useState("الأول الثانوي");
  const [lecture, setLecture] = useState("");
  const [question, setQuestion] = useState("");
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const savedEmail = localStorage.getItem("email");
    const savedLevel = localStorage.getItem("Level");
    if (savedEmail) {
      setEmail(savedEmail);
      setGrade(savedLevel);
    } else {
      toast.error("يجب تسجيل الدخول أولاً");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!lecture || !question) {
      toast.warn("يرجى إدخال رقم المحاضرة ورقم السؤال");
      return;
    }

    setLoading(true);
    setPdfUrl(null);

    try {
      const res = await axios.get("https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/get_page", {
        params: {
          email,
          grade,
          lecture_number: lecture,
          question_number: question,
        },
        responseType: "blob",
      });

      const file = new Blob([res.data], { type: "application/pdf" });
      const fileURL = URL.createObjectURL(file);
      setPdfUrl(fileURL);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.warn(error.response.data.detail || "غير مسموح بعرض الحل الأن");
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
          <h1 className="text-3xl font-bold mb-6 text-center text-[#1e293b]">منصة الأسئلة التعليمية</h1>
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

          {pdfUrl && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 text-center text-[#1e293b]">حل السؤال:</h2>
              <iframe
            src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
            width="100%"
            height="600px"
            frameBorder="0"
            title="PDF Viewer"
          />

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// التطبيق الرئيسي
function App() {
  return (
<HashRouter>
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/app" element={<QuestionPage />} />
  </Routes>
</HashRouter>

  );
}

export default App;
