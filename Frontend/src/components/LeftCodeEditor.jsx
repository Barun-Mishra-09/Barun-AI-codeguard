import Select from "react-select";
import { useState, useEffect, useRef } from "react";
import { Sparkles, Wrench } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  tomorrow,
  prism as prismLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import axios from "axios";
import { useTheme } from "../components/themeContextCore.js";

const isMobile = window.innerWidth < 768;

const CustomCodeEditor = ({ code, onChange, language, darkMode }) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);

  const handleScroll = (e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  const handleChange = (e) => {
    onChange(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + "  " + code.substring(end);
      onChange(newValue);

      setTimeout(() => {
        textareaRef.current.selectionStart = textareaRef.current.selectionEnd =
          start + 2;
      }, 0);
    }
  };

  if (isMobile) {
    return (
      <div className="relative w-full h-full overflow-hidden rounded-md">
        <div
          ref={highlightRef}
          className="absolute inset-0 overflow-auto pointer-events-none p-4"
          style={{ zIndex: 0 }}
        >
          <SyntaxHighlighter
            language={language}
            style={tomorrow}
            customStyle={{
              margin: 0,
              padding: 0,
              background: "transparent",
              fontSize: "15px",
              lineHeight: "1.7",
              fontFamily:
                "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
              color: darkMode ? "#d4d4d4" : "#24292e",
            }}
            wrapLines={true}
            PreTag="div"
          >
            {code || ""}
          </SyntaxHighlighter>
        </div>

        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleChange}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`absolute inset-0 w-full h-[100vh] resize-none font-mono bg-transparent focus:outline-none p-4 overflow-auto`}
          style={{
            fontSize: "15px",
            lineHeight: "1.7",
            fontFamily:
              "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
            tabSize: 2,
            color: "transparent",
            WebkitTextFillColor: "transparent",
            caretColor: darkMode ? "#ffffff" : "#000000",
            zIndex: 10,
            position: "relative",
          }}
          placeholder="// Write your code here..."
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full overflow-hidden rounded-md">
      <div
        ref={highlightRef}
        className="absolute inset-0 overflow-auto pointer-events-none p-4"
      >
        <SyntaxHighlighter
          language={language}
          style={tomorrow}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "15px",
            lineHeight: "1.7",
            fontFamily:
              "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
            color: darkMode ? "#d4d4d4" : "#24292e",
          }}
          wrapLines={true}
          PreTag="div"
        >
          {code || ""}
        </SyntaxHighlighter>
      </div>

      <textarea
        ref={textareaRef}
        value={code}
        onChange={handleChange}
        onScroll={handleScroll}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={`absolute inset-0 w-full h-[100vh] resize-none font-mono bg-transparent focus:outline-none p-4 overflow-auto`}
        style={{
          fontSize: "15px",
          lineHeight: "1.7",
          fontFamily:
            "'Fira Code', 'Consolas', 'Monaco', 'Courier New', monospace",
          tabSize: 2,
          color: "transparent",
          WebkitTextFillColor: "transparent",
          caretColor: darkMode ? "#ffffff" : "#000000",
        }}
        placeholder="// Write your code here..."
      />
    </div>
  );
};

const extractImprovedCode = (reviewText) => {
  if (!reviewText) return null;

  const regex =
    /##\s*✨\s*Improved[\s\S]*?Code[\s\S]*?```[\w+-]*\n([\s\S]*?)```/i;

  const match = reviewText.match(regex);
  return match ? match[1].trim() : null;
};

const LeftCodeEditor = () => {
  const { darkMode } = useTheme();
  const [apiLimitError, setApiLimitError] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const LANGUAGE_KEY = "selected_language";
  const REVIEW_KEY = "ai_review";
  const CODE_KEY = "user_code";

  const options = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "jsx", label: "React (JSX)" },

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
    { value: "solidity", label: "Solidity" },
    { value: "sql", label: "SQL" },
  ];

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    const saved = localStorage.getItem(LANGUAGE_KEY);
    return saved ? JSON.parse(saved) : options[0];
  });

  const [code, setCode] = useState(() => {
    return localStorage.getItem(CODE_KEY) || "// Write your code here...";
  });

  const [review, setReview] = useState(() => {
    return localStorage.getItem(REVIEW_KEY) || "";
  });

  const [loading, setLoading] = useState(false);
  const [reviewMessageIndex, setReviewMessageIndex] = useState(0);

  const displayLanguage =
    selectedLanguage?.label || selectedLanguage?.value || "code";
  const displayName =
    user?.firstName ||
    user?.name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "user";

  const reviewMessages = [
    `🔍 Reviewing ${displayName}'s ${displayLanguage} code…`,
    `✨ Analyzing code quality and best practices…`,
    `🧠 Checking for optimizations and issues…`,
  ];

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setReviewMessageIndex((prev) => (prev + 1) % reviewMessages.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading, reviewMessages.length]);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    localStorage.setItem(CODE_KEY, newCode);
  };

  const handleLanguageChange = (option) => {
    setSelectedLanguage(option);
    localStorage.setItem(LANGUAGE_KEY, JSON.stringify(option));
  };

  // ✅ RESTORED: Original API calling function
  const reviewCode = async () => {
    try {
      setLoading(true);
      setApiLimitError(false);
      setReview("");
      localStorage.removeItem(REVIEW_KEY);

      const res = await axios.post("/ai/codeReview", {
        code: code,
        language: selectedLanguage.value,
      });

      setReview(res.data.review);
      localStorage.setItem(REVIEW_KEY, res.data.review);
    } catch (err) {
      const status = err?.response?.status;
      const type = err?.response?.data?.type;

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

  const handleFixCode = () => {
    const improvedCode = extractImprovedCode(review);
    if (!improvedCode) {
      alert("No improved code found. Please click Review first.");
      return;
    }
    setCode(improvedCode);
    localStorage.setItem(CODE_KEY, improvedCode);
  };

  const darkSelectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: "#18181b",
      borderColor: state.isFocused ? "#a855f7" : "#A78BFA",
      color: "white",
      boxShadow: "none",
      borderRadius: "13px",
      minHeight: "42px",
      "&:hover": { borderColor: "#a855f7", cursor: "pointer" },
    }),
    menu: (base) => ({ ...base, backgroundColor: "#18181b" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#27272a" : "#18181b",
      color: "white",
      "&:hover": { cursor: "pointer" },
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
      borderRadius: "13px",
      minHeight: "42px",
      "&:hover": { borderColor: "#F97316", cursor: "pointer" },
    }),
    menu: (base) => ({ ...base, backgroundColor: "white" }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? "#f4f4f5" : "white",
      color: "black",
      "&:hover": { cursor: "pointer" },
    }),
    singleValue: (base) => ({ ...base, color: "black" }),
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-5 mt-3 lg:mt-4 px-3 sm:px-5 lg:h-[calc(100vh-90px)] lg:overflow-hidden">
        <div className="w-full lg:w-1/2 flex flex-col pt-4 pb-4 gap-3 lg:gap-4">
          <div className="flex items-center gap-4 pb-3 px-2 sm:px-5 flex-wrap mt-3 lg:mt-10">
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              options={options}
              styles={{
                ...(darkMode ? darkSelectStyles : lightSelectStyles),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              menuPosition="fixed"
              className="min-w-[180px]"
            />

            <button
              onClick={handleFixCode}
              className={`flex items-center justify-center h-[38px] lg:h-[42px] rounded-md font-bold text-white gap-2 hover:scale-105 cursor-pointer px-4 sm:px-7 lg:px-8 text-sm sm:text-base lg:text-lg transition min-w-[100px] lg:min-w-[115px]
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

          <div
            className={`relative flex-1 rounded-md border overflow-hidden pb-20 mt-3 lg:mt-6 min-h-[400px] sm:min-h-[500px]
              ${
                darkMode
                  ? "border-purple-400 bg-[#1e1e1e]"
                  : "border-orange-500 bg-white"
              }`}
          >
            <CustomCodeEditor
              code={code}
              onChange={handleCodeChange}
              language={selectedLanguage.value}
              darkMode={darkMode}
            />

            <div className="absolute bottom-1 left-0 right-1 lg:right-4 lg:bottom-2 z-20">
              <div className="flex justify-end">
                <button
                  onClick={reviewCode}
                  disabled={loading}
                  className={`pointer-events-auto h-[38px] lg:h-[48px] min-w-[110px] lg:min-w-[120px] px-4 sm:px-7 lg:px-12 mr-4 mb-4 lg:mr-6 lg:mb-6 rounded-md lg:rounded-lg font-bold text-white flex items-center justify-center gap-2 lg:gap-3 text-sm sm:text-base lg:text-lg transition-all
                    ${
                      loading
                        ? "opacity-80 cursor-not-allowed"
                        : "hover:scale-105 cursor-pointer"
                    }
                    ${
                      darkMode
                        ? "bg-gradient-to-r from-indigo-500 to-purple-600"
                        : "bg-gradient-to-r from-orange-500 to-purple-600"
                    }`}
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span className="hidden sm:inline">Reviewing...</span>
                      <span className="sm:hidden">Reviewing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} className="opacity-90" />
                      <span className="hidden sm:inline">Review</span>
                      <span className="sm:hidden">Review</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          className={`w-full lg:w-1/2 rounded-lg mt-3 lg:mt-8 lg:h-full lg:overflow-y-auto
            ${
              darkMode
                ? "bg-[#170427] text-white border border-purple-500"
                : "bg-gray-200 text-black border border-orange-600"
            }`}
        >
          <div className="px-6 sm:px-8 py-8">
            <div className="max-w-[780px] mx-auto">
              <h1
                className={`text-lg sm:text-xl font-bold mb-4 text-center
                  ${
                    darkMode
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-transparent bg-clip-text"
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
                    You've reached the maximum free requests for this AI model.
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
                        <h1 className="text-xl font-bold mb-3 mt-4">
                          {children}
                        </h1>
                      );
                    },
                    h2({ children }) {
                      return (
                        <h2 className="text-lg font-semibold mb-2 mt-3">
                          {children}
                        </h2>
                      );
                    },
                    h3({ children }) {
                      return (
                        <h3 className="text-base font-semibold mb-2 mt-2">
                          {children}
                        </h3>
                      );
                    },
                    ul({ children }) {
                      return (
                        <ul className="list-disc ml-5 mb-3">{children}</ul>
                      );
                    },
                    ol({ children }) {
                      return (
                        <ol className="list-decimal ml-5 mb-3">{children}</ol>
                      );
                    },
                    li({ children }) {
                      return <li className="mb-1">{children}</li>;
                    },
                    code({ inline, className, children }) {
                      const match = /language-(\w+)/.exec(className || "");
                      return !inline ? (
                        <div className="my-4">
                          <SyntaxHighlighter
                            style={tomorrow}
                            language={match?.[1] || selectedLanguage.value}
                            customStyle={{
                              borderRadius: "0.5rem",
                              padding: "1rem",
                              fontSize: "14px",
                            }}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      ) : (
                        <code
                          className={`px-2 py-1 rounded ${
                            darkMode ? "bg-black/20" : "bg-gray-300"
                          }`}
                        >
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
