import DarkModeLogo from "../Images/Code_Reviewer_logo.png";
import LightModeLogo from "../Images/Code Reviewer Light Mode.png";
import { Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../components/themeContextCore.js";
import { toast } from "react-hot-toast";
import axios from "axios";
import { USER_API_END_POINT } from "../utils/apiEndpoint.js";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const titles = [
  { emoji: "🛡️", text: "Barun AI CodeGuard" },
  { emoji: "🤖", text: "AI-Assisted Code Review Platform" },
  { emoji: "⚙️", text: "Automated Code Review & Refactoring" },
];

const Navbar = () => {
  const { darkMode, setDarkMode } = useTheme();

  const navigate = useNavigate();

  const [titleIndex, setTitleIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTitleIndex((prev) => (prev + 1) % titles.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Read user from localstorage
  const user = JSON.parse(localStorage.getItem("user"));

  const displayName = user?.firstName || user?.name || "user";

  const LogoutHandler = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));

      // 🔥 1. Remove user-scoped editor code
      if (user?._id) {
        localStorage.removeItem(`user_code_${user._id}`);
      }

      // 🔥 2. Remove legacy/global editor code (VERY IMPORTANT)
      localStorage.removeItem("user_code");

      // Remove selected Langugage
      localStorage.removeItem("selected_language");

      // Remove AI Review output
      localStorage.removeItem("ai_review");

      // 🔹 Call backend logout
      const res = await axios.get(`${USER_API_END_POINT}/logout`, {
        withCredentials: true,
      });

      if (res?.data?.success) {
        // 🔥 3. Remove user session
        localStorage.removeItem("user");

        toast.success(`${displayName} logged out  successfully`);
        navigate("/login");
      }
    } catch (error) {
      console.error(error);
      toast.error("Logout failed");
    }
  };

  return (
    <nav
      className={`w-full  overflow-hidden mb-3 ${
        darkMode ? "bg-zinc-800 text-blue-50" : "bg-gray-200 text-black"
      }`}
    >
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between min-h-16">
          {/* LEFT */}
          <div className="flex items-center gap-3 sm:gap-5 ">
            <Link to="/" className="relative z-20">
              <img
                src={darkMode ? DarkModeLogo : LightModeLogo}
                alt="Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 lg:h-16 lg:w-16 rounded-full animate-ai-glow cursor-pointer"
              />
            </Link>

            {/* Mobile title */}
            <h2
              className={`md:hidden text-lg font-semibold font-sans flex items-center gap-2
  whitespace-nowrap overflow-hidden text-ellipsis ${
    darkMode ? "text-purple-400" : "text-[#6D28D9]"
  }`}
            >
              <span>{titles[titleIndex].emoji}</span>

              <span
                className={`bg-clip-text text-transparent ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "bg-gradient-to-r from-[#F83002] to-[#6D28D9]"
                }`}
              >
                {titles[titleIndex].text}
              </span>
            </h2>
          </div>

          {/* CENTER (Desktop only) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2">
            <h2
              className={`text-2xl lg:text-3xl font-semibold font-sans flex items-center gap-2 transition-opacity duration-500 ${
                darkMode ? "text-purple-400" : "text-[#6D28D9]"
              }`}
            >
              {/* Emoji (NORMAL TEXT COLOR) */}
              <span className="text-2xl lg:text-3xl">
                {titles[titleIndex].emoji}
              </span>

              {/* Gradient Text ONLY */}
              <span
                className={`bg-clip-text text-transparent ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-600 to-blue-600"
                    : "bg-gradient-to-r from-[#F83002] to-[#6D28D9]"
                }`}
              >
                {titles[titleIndex].text}
              </span>
            </h2>
          </div>

          {/* RIGHT */}
          <div className="flex items-center justify-end gap-18 ">
            {/* Theme toggle */}
            <div
              className="relative group cursor-pointer flex items-center justify-center h-10 w-10 mt-3 mr-3"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="text-yellow-500 hover:scale-110 transition" />
              ) : (
                <Moon className="text-[#F83002] hover:scale-110 transition" />
              )}

              {/* Tooltip */}
              <div className="absolute top-full mt-3 right-1 opacity-0 group-hover:opacity-100 pointer-events-none transition z-20">
                <div
                  className={`text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap ${
                    darkMode
                      ? "bg-[#6D28D9] text-white"
                      : "bg-[#541181] text-blue-50"
                  }`}
                >
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </div>
              </div>
            </div>

            {/* Logout (only if user exists)*/}
            {user && (
              <div className="relative group flex items-center justify-center">
                <button onClick={LogoutHandler} className="p-2 cursor-pointer">
                  <LogOut className="h-5 w-5 text-red-500 hover:scale-110 transition  " />
                </button>

                {/* Tooltip */}
                <div className="absolute top-full mt-3 right-1 opacity-0 group-hover:opacity-100 pointer-events-none transition z-20">
                  <div
                    className={`text-sm px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap ${
                      darkMode
                        ? "bg-[#6D28D9] text-white"
                        : "bg-[#541181] text-blue-50"
                    }`}
                  >
                    Logout
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
