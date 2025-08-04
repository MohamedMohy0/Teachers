import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function CompleteProfile({ user, setUser }) {
  const navigate = useNavigate();
  const email = user?.email || "";

  const [level, setLevel] = useState(user?.level || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [center, setCenter] = useState("");
  const [loading, setLoading] = useState(false);

  const centers = [ "سنتر الأوائل", "سنتر النجاح", "سنتر التفوق", "سنتر الأمل", "سنتر الزهراء" ];

  useEffect(() => {
    if (!email || !level) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/");
    }
  }, [email, level, navigate]);

  const handleSubmit = async () => {
    if (!name || !phone || !center) {
      toast.error("الرجاء إدخال جميع البيانات");
      return;
    }

    setLoading(true);
    try {
      await axios.post("https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/update_user_info", {
        email,
        name,
        phone,
        center,
        level,
      });

      toast.success("تم الحفظ بنجاح");
      setUser({ ...user, name });
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء حفظ البيانات");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f7fa] p-6 text-gray-800 font-sans">
      <ToastContainer rtl />
      <div className="max-w-md mx-auto mt-24">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-2xl font-bold mb-6 text-center text-[#1e293b]">
            استكمال البيانات
          </h1>

          <div className="space-y-5">
            <div>
              <label className="block mb-1 font-medium">المرحلة الدراسية:</label>
              <input
                type="text"
                value={level}
                disabled
                className="w-full p-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">الاسم الثلاثي:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمد أحمد علي"
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">رقم الهاتف:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className="w-full p-3 border border-gray-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block mb-1 font-medium">اختر اسم السنتر:</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl"
              >
                <option value="">-- اختر السنتر --</option>
                {centers.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full transition duration-300 font-bold shadow"
              >
                {loading ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CompleteProfile;
