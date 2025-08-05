import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // يُستخدم للتحقق لاحقًا إن أردت
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("https://4339162f-ea5a-42f1-82eb-95a2625b145c-00-3pggxbtxrk63z.spock.replit.dev/login", {
        email,
        password,
      });

      const { name, level } = response.data;
      localStorage.setItem("email", email);
      localStorage.setItem("Level", level);
      if (!name || name.trim() === "") {
        navigate("/complete-profile", {
          state: {
            email,
            level,
          },
        });
      } else {
        navigate("/dashboard", {
          state: {
            email,
            level,
          },
        });
      }
    } catch (error) {
      console.error(error);
      if (error.response && error.response.status === 401) {
        toast.error("البريد الإلكتروني غير موجود");
      } else {
        toast.error("حدث خطأ أثناء تسجيل الدخول");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f5f7fa] p-6 text-gray-800 font-sans">
      <ToastContainer />
      <div className="max-w-md mx-auto mt-24">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200">
          <h1 className="text-3xl font-bold mb-6 text-center text-[#1e293b]">
            تسجيل الدخول
          </h1>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium">البريد الإلكتروني:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="bg-transparent border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 rounded-full transition duration-300 font-bold shadow"
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

export default Home;
