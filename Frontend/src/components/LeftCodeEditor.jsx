import Editor from "@monaco-editor/react";
import Select from "react-select";
import { useState, useEffect } from "react";
import { useTheme } from "../components/themeContextCore.js";
import { Sparkles } from "lucide-react";
import { Wrench } from "lucide-react";

import axios from "axios";

// For right output
import "prismjs/themes/prism-tomorrow.css";
import prism from "prismjs";

import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";

// ✅ Helper function (PLACE THIS ABOVE COMPONENT)
const extractImprovedCode = (reviewText) => {
  if (!reviewText) return null;

  const regex =
    /✨\s*Improved\s*\/\s*Refactored\s*Code[\s\S]*?```[\w+-]*\n([\s\S]*?)```/i;

  const match = reviewText.match(regex);
  return match ? match[1].trim() : null;
};

// Read User from localStorage
// const user = JSON.parse(localStorage.getItem("user"));

const LeftCodeEditor = () => {
  const { darkMode } = useTheme();

  const [apiLimitError, setApiLimitError] = useState(false);

  // Read User from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // Persist selected language and review
  const LANGUAGE_KEY = "selected_language";
  const REVIEW_KEY = "ai_review";

  const options = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "c", label: "C" },
    { value: "cpp", label: "C++" },
    { value: "csharp", label: "C#" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "swift", label: "Swift" },
    { value: "kotlin", label: "Kotlin" },
    { value: "dart", label: "Dart" },
    { value: "r", label: "R" },
    { value: "scala", label: "Scala" },
    { value: "perl", label: "Perl" },
    { value: "haskell", label: "Haskell" },
    { value: "lua", label: "Lua" },
    { value: "bash", label: "Bash / Shell" },
    { value: "powershell", label: "PowerShell" },
    { value: "objective-c", label: "Objective-C" },
    { value: "groovy", label: "Groovy" },
    { value: "elixir", label: "Elixir" },
    { value: "clojure", label: "Clojure" },
    { value: "fortran", label: "Fortran" },
    { value: "cobol", label: "COBOL" },
    { value: "assembly", label: "Assembly" },
    { value: "solidity", label: "Solidity" },
    { value: "matlab", label: "MATLAB" },
  ];

  const [selectedOptions, setSelectedOptions] = useState(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved ? JSON.parse(saved) : options[0];
  });

  // For integrating frontend and backend
  const [codePrompt, setCodePrompt] = useState(() => {
    return localStorage.getItem("user_code") || "// write your code here";
  });

  const [review, setReview] = useState(() => {
    return localStorage.getItem(REVIEW_KEY) || "";
  });
  const [loading, setLoading] = useState(false);

  const darkSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#18181b",
      borderColor: state.isFocused ? "#a855f7" : "#A78BFA",
      color: "white",
      boxShadow: "none",
      borderRadius: "13px",

      "&:hover": {
        borderColor: "#a855f7",
        cursor: "pointer",
      },
    }),
    menu: (base) => ({ ...base, backgroundColor: "#18181b" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#27272a" : "#18181b",
      color: "white",
      "&:hover": {
        cursor: "pointer",
      },
    }),
    singleValue: (base) => ({ ...base, color: "white" }),
    placeholder: (base) => ({ ...base, color: "#a1a1aa" }),
  };

  const lightSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "white",
      borderColor: state.isFocused ? "#F97316" : "#FB923C",
      color: "black",
      boxShadow: "none",
      "&:hover": {
        borderColor: "#F97316",
        cursor: "pointer",
      },
    }),
    menu: (base) => ({ ...base, backgroundColor: "white" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f4f4f5" : "white",
      color: "black",
      "&:hover": {
        cursor: "pointer",
      },
    }),
    singleValue: (base) => ({ ...base, color: "black" }),
  };

  // for Right side code review
  useEffect(() => {
    prism.highlightAll();
  });

  // Function to review code
  const reviewCode = async () => {
    try {
      setLoading(true);
      setApiLimitError(false);
      setReview("");
      localStorage.removeItem(REVIEW_KEY);

      const res = await axios.post("/ai/codeReview", {
        code: codePrompt,
        language: selectedOptions.value,
      });

      setReview(res.data.review);
      localStorage.setItem(REVIEW_KEY, res.data.review);
    } catch (err) {
      const status = err?.response?.status;
      const type = err?.response?.data?.type;

      // 🔴 FREE MODEL LIMIT HIT
      if (status === 429 && type === "RATE_LIMIT") {
        setApiLimitError(true);
        return;
      }

      const msg =
        err?.response?.data?.message || err?.message || "AI review failed";

      setReview(`❌ ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const displayLanguage =
    selectedOptions?.label || selectedOptions?.value || "code";

  // Display name for the user name
  const displayName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "user";

  // Review Messages
  const reviewMessages = [
    `🔍 Reviewing ${displayName}'s ${displayLanguage} code…`,
    `✨ Analyzing code quality and best practices…`,
    `🧠 Checking for optimizations and issues…`,
  ];

  // Add state to tract the current messages
  const [reviewMessageIndex, setReviewMessageIndex] = useState(0);

  useEffect(() => {
    if (!loading) return;

    const interval = setInterval(() => {
      setReviewMessageIndex((prev) => (prev + 1) % reviewMessages.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [loading]);

  return (
    <>
      <div
        className="
  flex flex-col lg:flex-row
  gap-5 mt-3 lg:mt-4
  px-3 sm:px-5
  lg:h-[calc(100vh-90px)]
  lg:overflow-hidden
"
      >
        {/* Left Panel */}
        <div className="w-full lg:w-1/2 flex flex-col pt-4 pb-4 gap-3 lg:gap-4 ">
          {/* Toolbar */}
          {/* Responsive:- after px-2 */}
          <div className="flex  items-center gap-4 pb-3 px-2 sm:px-5 flex-wrap mt-3 lg:mt-10">
            <Select
              value={selectedOptions}
              onChange={(option) => {
                setSelectedOptions(option);
                localStorage.setItem(LANGUAGE_KEY, JSON.stringify(option));
              }}
              options={options}
              styles={darkMode ? darkSelectStyles : lightSelectStyles}
              className="min-w-[180px]"
            />

            <button
              onClick={() => {
                const improvedCode = extractImprovedCode(review);

                if (!improvedCode) {
                  alert("No improved code found. Please click Review first.");
                  return;
                }

                setCodePrompt(improvedCode);
                localStorage.setItem("user_code", improvedCode);
              }}
              className={`flex items-center justify-center h-[38px] lg:h-[42px] 
     rounded-md font-bold text-white gap-2 hover:scale-105 cursor-pointer px-4 sm:px-7 lg:px-8  text-sm sm:text-base lg:text-lg transition min-w-[100px] lg:min-w-[115px] 
    ${
      darkMode
        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
        : "bg-gradient-to-r from-orange-500 to-purple-600"
    }`}
            >
              <Wrench size={18} />
              Fix Code
            </button>
          </div>

          {/* Code Editor */}
          <div
            className={`relative flex-1 rounded-md border overflow-hidden  pb-20 mt-3 lg:mt-6
    ${darkMode ? "border-purple-400" : "border-orange-500"}`}
          >
            <Editor
              height="100%"
              theme={darkMode ? "vs-dark" : "light"}
              language={selectedOptions.value}
              value={codePrompt}
              onChange={(value) => {
                const code = value || "";
                setCodePrompt(code);
                localStorage.setItem("user_code", code);
              }}
            />

            {/*  Review Button */}
            <div className="absolute bottom-1 left-0 right-1 lg:right-4 lg:bottom-2 z-20 pointer-events-none">
              <div className="flex justify-end ">
                <button
                  onClick={reviewCode}
                  disabled={loading}
                  className={`
    pointer-events-auto
    h-[38px] lg:h-[48px]
    min-w-[110px] lg:min-w-[120px]
    px-4 sm:px-7 lg:px-12
    mr-4 mb-4 lg:mr-6 lg:mb-6
    rounded-md lg:rounded-lg
    font-bold text-white flex items-center justify-center
    gap-2 lg:gap-3 text-sm sm:text-base lg:text-lg
    transition-all

    ${
      loading
        ? "opacity-80 cursor-not-allowed"
        : "hover:scale-105 cursor-pointer"
    }

    ${
      darkMode
        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
        : "bg-gradient-to-r from-orange-500 to-purple-600"
    }
  `}
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Reviewing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="opacity-90" />
                      Review
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Code Review show  */}

        <div
          className={`
    w-full lg:w-1/2
    rounded-lg
    mt-3 lg:mt-8
    lg:h-full lg:overflow-y-auto
    ${
      darkMode
        ? "bg-[#170427] text-white border border-purple-500"
        : "bg-gray-200 text-black border border-orange-600"
    }
  `}
        >
          {/* 🔥 INNER CONTENT WRAPPER */}
          <div className="px-6 sm:px-8 py-8">
            <div className="max-w-[780px] mx-auto">
              <h1
                className={`text-lg sm:text-xl  font-bold mb-4  text-center ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-600  to-blue-600 text-transparent bg-clip-text"
                    : "bg-gradient-to-r from-[#F83002] to-[#6D28D9] text-transparent bg-clip-text"
                }`}
              >
                AI Code Review
              </h1>

              {loading ? (
                <p className="animate-pulse text-purple-400">
                  {reviewMessages[reviewMessageIndex]}
                </p>
              ) : apiLimitError ? (
                <div className="mt-6 p-6 rounded-lg border border-yellow-500 bg-yellow-100/10 text-center">
                  <h2 className="text-lg font-semibold text-yellow-400 mb-2">
                    ⚠️ Free AI Usage Limit Reached
                  </h2>

                  <p className="text-sm opacity-90">
                    You’ve reached the maximum free requests for this AI model.
                  </p>

                  <p className="text-sm mt-2 opacity-80">
                    Please try again later or upgrade to continue reviewing
                    code.
                  </p>

                  <button
                    disabled
                    className="mt-4 px-6 py-2 rounded-md bg-gray-500 text-white opacity-70 cursor-not-allowed"
                  >
                    Upgrade (Coming Soon)
                  </button>
                </div>
              ) : review ? (
                <ReactMarkdown
                  components={{
                    p({ children }) {
                      return <p className="mb-3 leading-relaxed">{children}</p>;
                    },
                    h1({ children }) {
                      return (
                        <h1 className="text-xl font-bold mb-3">{children}</h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-lg font-semibold mb-2">
                          {children}
                        </h2>
                      );
                    },
                    li({ children }) {
                      return (
                        <li className="list-disc ml-5 mb-2">{children}</li>
                      );
                    },
                    code({ inline, className, children }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <SyntaxHighlighter
                          style={tomorrow}
                          language={match?.[1] || "javascript"}
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      ) : (
                        <code className="bg-black/20 px-5 rounded">
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {review}
                </ReactMarkdown>
              ) : (
                <div className="m-2 p-2">
                  <p
                    className={`opacity-80 pl-6 pr-2 py-2 ${
                      darkMode ? "text-gray-200" : "text-gray-800"
                    }`}
                  >
                    Paste code and click{" "}
                    <b className="text-green-500 font-semibold">Review</b>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LeftCodeEditor;
