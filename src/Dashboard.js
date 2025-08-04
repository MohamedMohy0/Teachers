import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f7fa] p-6 text-gray-800 font-sans">
      <div className="max-w-md mx-auto mt-24">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 text-center">
          <h1 className="text-3xl font-bold mb-6 text-[#1e293b]">مرحباً بك </h1>

          <div className="space-y-4">
            <button
              onClick={() => navigate("/app")}
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow transition duration-300"
            >
              عرض الأسئلة
            </button>

            <button
              onClick={() => navigate("/quiz")}
              className="w-full border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full font-bold shadow transition duration-300"
            >
              بدء اختبار
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
