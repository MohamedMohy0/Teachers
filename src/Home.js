import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Player } from "@lottiefiles/react-lottie-player";
import { motion } from "framer-motion";
import { Eye, EyeOff, Moon, Sun } from "lucide-react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import loginAnim from "./progerss.json"; // Your main login animation (in card)
import loadingAnim from "./Loading.json"; // Loading overlay animation
import successAnim from "./Success.json"; // Success overlay animation
import errorAnim from "./Fail.json";     // Error overlay animation

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [status, setStatus] = useState(""); // "", "loading", "success", "error"
  
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // tsparticles init function
  const particlesInit = useCallback(async (engine) => {
    await loadFull(engine);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus("loading");

    try {
      const response = await axios.post(
        "https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/login",
        { email, password }
      );

      const { name, level } = response.data;
      localStorage.setItem("email", email);
      localStorage.setItem("Level", level);

      setStatus("success");
      toast.success("تم تسجيل الدخول بنجاح!");

      setTimeout(() => {
        navigate(name?.trim() === "" ? "/complete-profile" : "/dashboard", {
          state: { email, level },
        });
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      toast.error(
        error.response?.status === 401
          ? "البريد الإلكتروني غير موجود"
          : "حدث خطأ أثناء تسجيل الدخول"
      );

      setTimeout(() => {
        setStatus("");
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 transition-all relative overflow-hidden`}
    >
      {/* Background Particles */}
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

      {/* Toast Notifications */}
      <ToastContainer />

      {/* Dark/Light Mode Toggle Button */}
      <motion.button
        onClick={() => setDarkMode(!darkMode)}
        whileHover={{ scale: 1.2, rotate: 15 }}
        whileTap={{ scale: 0.95 }}
        className="fixed top-5 right-5 z-50 bg-blue-500 dark:bg-yellow-400 text-white dark:text-black p-3 rounded-full shadow-xl transition"
        aria-label="Toggle Dark Mode"
      >
        {darkMode ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      {/* Login Card */}
      <div className="max-w-md mx-auto pt-24 z-10 relative px-4">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120 }}
          className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl border border-blue-100 dark:border-gray-700"
        >
          {/* Lottie Animation on Card */}
          <div className="flex justify-center mb-4">
            <Player autoplay loop src={loginAnim} style={{ height: "120px" }} />
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            تسجيل الدخول
          </h1>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold">البريد الإلكتروني:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                placeholder="example@email.com"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold">كلمة المرور:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-300"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-center">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 rounded-full font-bold text-lg shadow-md transition duration-300 flex items-center justify-center"
              >
                {loading && (
                  <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                )}
                {loading ? "جاري الدخول..." : "دخول"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Lottie Status Overlay */}
      {status && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 pointer-events-none">
          <Player
            autoplay
            loop={status === "loading"}
            src={
              status === "loading"
                ? loadingAnim
                : status === "success"
                ? successAnim
                : errorAnim
            }
            style={{ height: "200px", width: "200px" }}
          />
        </div>
      )}
    </div>
  );
}

export default Home;
