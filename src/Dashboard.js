import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Player } from "@lottiefiles/react-lottie-player";
import loadingAnim from "./Loading.json";       // Loading screen animation
import welcomeAnim from "./Welcome.json";       // New top animation (place your file here)
function Dashboard() {
  const navigate = useNavigate();
  const [initialLoading, setInitialLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/");
      return;
    }

    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigate]);

  const handleNavigate = (path) => {
    setButtonLoading(true);
    setTimeout(() => {
      navigate(path);
    }, 1200);
  };

  if (initialLoading || buttonLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-900 z-50">
        <Player autoplay loop src={loadingAnim} style={{ height: 150, width: 150 }} />
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f5f7fa] dark:bg-gray-900 p-6 text-gray-800 dark:text-gray-100 font-sans transition-colors duration-300"
    >
      <div className="max-w-md mx-auto mt-24">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 text-center">
          
          {/* 🔽 TOP LOTTIE ANIMATION */}
          <div className="flex justify-center mb-4">
            <Player
              autoplay
              loop
              src={welcomeAnim}
              style={{ height: 120, width: 120 }}
            />
          </div>

          <h1 className="text-3xl font-bold mb-6 text-center text-blue-700 dark:text-blue-400">
            مرحباً بك
          </h1>

          <div className="space-y-4">
            <button
              onClick={() => handleNavigate("/app")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 rounded-full font-bold text-lg shadow-md transition duration-300 flex items-center justify-center"
            >
              عرض الاجابات
            </button>

            <button
              onClick={() => handleNavigate("/quiz")}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 rounded-full font-bold text-lg shadow-md transition duration-300 flex items-center justify-center"
            >
              بدء الواجب
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
