import { useState } from "react";
import Navbar from "./Navbar";
import { useTheme } from "../components/themeContextCore.js";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import Input from "./Input.jsx";
import axios from "axios";
import { USER_API_END_POINT } from "../utils/apiEndpoint.js";
import { toast } from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

// For googleLogin
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "./api.js";

const Login = () => {
  const { darkMode } = useTheme();

  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  // for login
  const [input, setInput] = useState({
    email: "",
    password: "",
  });

  const changeEventHandler = (e) => {
    const { name, value } = e.target;

    setInput((prevInput) => ({
      ...prevInput,
      [name]: value,
    }));
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(
        `${USER_API_END_POINT}/login`,
        {
          email: input.email,
          password: input.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      if (res?.data?.success) {
        const loggedInUser = res.data.user;

        const displayName =
          loggedInUser?.firstName || loggedInUser?.name || "user";
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        toast.success(`${displayName} logged in successfully `);
        navigate("/");
        console.log(res.data);
      }
    } catch (error) {
      console.error(
        error?.response?.data?.message ||
          "Network error, Please try again later."
      );
      toast.error(error?.response?.data?.message);
    } finally {
      setLoading(false);
    }
  };

  // For google login
  const responseGoogle = async (authResult) => {
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult["code"]);

        const { email, firstName } = result.data.user;

        const loggedInUser = {
          email,
          firstName,
          authProvider: "google",
        };

        // const token = result.data.token;
        // const name = firstName;

        // const obj = { email, name, token };
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        toast.success(`${firstName} logged in with Google successfully`);

        navigate("/");
        // console.log("result.data.user :-", result.data.user);
        // console.log(token);
      }
    } catch (error) {
      console.error("Error while requesting google code: ", error);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  return (
    <>
      <Navbar />

      {/* PAGE */}
      <div className="h-[calc(100vh-64px)] overflow-hidden flex items-center justify-center ">
        {/* CONTAINER */}
        <div className="w-full px-4 sm:px-8 md:px-16 lg:px-24">
          <div className="flex justify-center">
            {/* CARD */}
            <div
              className={`w-full max-w-md sm:max-w-lg lg:max-w-xl rounded-2xl shadow-2xl backdrop-blur-md ${
                darkMode
                  ? "bg-white/5 border border-white/10 text-white"
                  : "bg-white border border-gray-200 text-black"
              }`}
            >
              {/* INNER */}
              <div className="!p-7 sm:p-10 md:p-12 lg:p-7 xl:p-7">
                {/* HEADER */}
                <div className="mb-8 text-center">
                  <h2
                    className={`text-xl sm:text-2xl md:text-3xl font-semibold bg-clip-text text-transparent ${
                      darkMode
                        ? "bg-gradient-to-r from-purple-600 to-blue-600"
                        : "bg-gradient-to-r from-[#F83002] to-[#6D28D9]"
                    }`}
                  >
                    Login your account
                  </h2>

                  <p
                    className={`!mt-3 !mb-3 text-sm sm:text-base bg-clip-text text-transparent ${
                      darkMode
                        ? "bg-gradient-to-r from-purple-400 to-blue-300"
                        : "bg-gradient-to-r from-[#F83002] to-[#6D28D9]"
                    }`}
                  >
                    Start reviewing code like a professional
                  </p>
                </div>

                {/* FORM */}
                <form onSubmit={submitHandler} className="flex flex-col gap-5">
                  {/* EMAIL */}
                  <div className="flex flex-col gap-2">
                    <label
                      className={`text-sm font-medium ${
                        darkMode ? "text-violet-400" : "text-[#F83002]"
                      }`}
                    >
                      Email address
                    </label>

                    <Input
                      type="email"
                      name="email"
                      onChange={changeEventHandler}
                      value={input.email}
                      placeholder="Enter your email"
                      className={
                        darkMode
                          ? "border-violet-400 focus:border-violet-500"
                          : "border-[#cb634c] focus:border-[#F83002]"
                      }
                    />
                  </div>

                  {/* PASSWORD */}
                  <div className="flex flex-col gap-1.5">
                    <label
                      className={`text-sm font-medium ${
                        darkMode ? "text-violet-400" : "text-[#F83002]"
                      }`}
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        onChange={changeEventHandler}
                        value={input.password}
                        placeholder="Enter your password"
                        className={`pr-12 ${
                          darkMode
                            ? "border-violet-400 focus:border-violet-500"
                            : "border-[#cb634c] focus:border-[#F83002]"
                        }`}
                      />
                      <span
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-3 text-gray-400 cursor-pointer select-none"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </span>
                    </div>
                  </div>

                  {/* LOGIN BUTTON */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full h-11 rounded-lg font-medium transition
    flex items-center justify-center gap-2
    ${
      loading
        ? "opacity-70 cursor-not-allowed"
        : "hover:opacity-80 cursor-pointer"
    }
    ${
      darkMode
        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white"
        : "bg-gradient-to-r from-[#F83002] to-[#6D28D9] text-white"
    }`}
                  >
                    {loading && (
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    <span>{loading ? "Logging in... " : "Login"}</span>
                  </button>

                  {/* DIVIDER */}
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-1 h-px ${
                        darkMode ? "bg-violet-500" : "bg-orange-500"
                      }`}
                    />
                    <span className="text-xs opacity-60">OR</span>
                    <div
                      className={`flex-1 h-px ${
                        darkMode ? "bg-violet-500" : "bg-orange-500"
                      }`}
                    />
                  </div>

                  {/* GOOGLE BUTTON */}
                  <button
                    type="button"
                    onClick={googleLogin}
                    className={`w-full h-11 rounded-lg flex items-center justify-center gap-3 font-medium cursor-pointer transition hover:opacity-80 ${
                      darkMode
                        ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white"
                        : "bg-gradient-to-r from-[#F83002] to-[#6D28D9] text-white"
                    }`}
                  >
                    <FcGoogle size={20} className="bg-white rounded-full p-1" />
                    Continue with Google
                  </button>
                </form>

                {/* FOOTER */}
                <p className="text-sm text-center !mt-2  opacity-70">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className={`font-semibold underline ${
                      darkMode ? "text-blue-300" : "text-[#F83002]"
                    }`}
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
