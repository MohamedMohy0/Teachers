import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

import loadingAnim from "./Loading.json";
import topAnim from "./Member.json";       // Your top card animation
import completeAnim from "./Complete.json"; // Your success animation

import "react-toastify/dist/ReactToastify.css";

function CompleteProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [level, setLevel] = useState(location.state?.level || "");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [center, setCenter] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCompleteAnimation, setShowCompleteAnimation] = useState(false);
  const [, setDarkMode] = useState(false);
  const centers = [
    "سنتر الأوائل",
    "سنتر النجاح",
    "سنتر التفوق",
    "سنتر الأمل",
    "سنتر الزهراء",
  ];

  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);

    if (!level && email) {
      axios
        .get(
          `https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/get_user_info?email=${email}`
        )
        .then((res) => {
          setLevel(res.data.level || "");
        })
        .catch((err) => {
          console.error("فشل في تحميل بيانات الطالب:", err);
        });
    }
  }, [email, level]);

 const handleSubmit = async () => {
  if (!name || !phone || !center) {
    toast.error("الرجاء إدخال جميع البيانات");
    return;
  }

  setLoading(true);
  try {
    await axios.post(
      "https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/update_user_info",
      {
        email,
        name,
        phone,
        center,
        level,
      }
    );

    // Show the success animation overlay
    setShowCompleteAnimation(true);

    // Keep loading ON during animation, then hide both animation and loading & navigate
    setTimeout(() => {
      setShowCompleteAnimation(false);
      setLoading(false);
      navigate("/dashboard", { state: { email, level } });
    }, 2000);
  } catch (err) {
    console.error(err);
    toast.error("حدث خطأ أثناء حفظ البيانات");
    setLoading(false);  // hide loading immediately on error
  }
};
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
            number: { value: 50 },
            color: { value: "#3b82f6" },
            shape: { type: "circle" },
            opacity: { value: 0.3 },
            size: { value: { min: 1, max: 5 } },
            move: { enable: true, speed: 1 },
          },
        }}
      />

      <ToastContainer rtl />

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Player autoplay loop src={loadingAnim} style={{ height: 150, width: 150 }} />
        </div>
      )}

      {/* Success Animation Overlay */}
      {showCompleteAnimation && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-60 pointer-events-none">
          <Player autoplay src={completeAnim} style={{ height: 200, width: 200 }} />
        </div>
      )}

      <div className="max-w-md mx-auto pt-24 z-10 relative px-6">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-700"
        >
          {/* Top Lottie animation */}
          <div className="flex justify-center mb-6">
            <Player autoplay loop src={topAnim} style={{ height: 120, width: 120 }} />
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            استكمال البيانات
          </h1>

          <div className="space-y-5">
            <div>
              <label className="block mb-2 font-semibold">المرحلة الدراسية:</label>
              <input
                type="text"
                value={level}
                disabled
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">الاسم الثلاثي:</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: محمد أحمد علي"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">رقم الهاتف:</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="مثال: 01012345678"
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">اختر اسم السنتر:</label>
              <select
                value={center}
                onChange={(e) => setCenter(e.target.value)}
                className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- اختر السنتر --</option>
                {centers.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-4 rounded-full font-bold text-xl shadow-md transition duration-300"
              >
                {loading ? "جاري الحفظ..." : "حفظ"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default CompleteProfile;
