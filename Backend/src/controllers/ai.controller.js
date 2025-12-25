import { generateCodeReview } from "../AI/ai.openrouter.js";

export const aiGetReview = async (req, res) => {
  try {
    const { code, language } = req.body;

    // Validation
    if (!code || typeof code !== "string" || code.trim().length === 0) {
      return res.status(400).json({ message: "Code is required" });
    }

    if (!language || typeof language !== "string") {
      return res.status(400).json({ message: "Language is required" });
    }

    const isSnippet =
      code.split("\n").length < 200 || // small blocks
      (!code.includes("class ") &&
        !code.includes("function main") &&
        !code.includes("public static void main"));

    const isJSX =
      /<\/?[A-Za-z]/.test(code) &&
      (code.includes("className=") || code.includes("{"));

    let effectiveLanguage = language;

    if (language === "JavaScript" && isJSX) {
      effectiveLanguage = "JSX / React";
    }

    // Language-aware system prompt
    const systemPrompt = `
You are a senior ${effectiveLanguage} developer and professional code reviewer.

IMPORTANT:
- The provided code MAY be a PARTIAL SNIPPET, not a full file
- Missing imports, exports, or wrappers are acceptable
- Review logic, structure, readability, and best practices

STRICT RULE:
- Do NOT reject partial snippets
- Do NOT require full program structure

ONLY reject if:
- The syntax clearly belongs to a completely different language family

If language mismatch occurs, respond ONLY with:

❌ Language mismatch detected

Expected **${effectiveLanguage}**, but detected **<detected_language>**

Key indicators:
- <bullet points>

NORMAL REVIEW FORMAT:

## 🔍 Issues Found
## 🛠️ Fixes & Suggestions
## ✨ Improved Code (snippet-friendly)
## 📈 Why This Is Better
## 🚀 Extra Recommendations
`;

    const review = await generateCodeReview(code, systemPrompt);

    res.status(200).json({ success: true, review });
  } catch (error) {
    console.error("AI Review Error:", error?.message || error);

    const status = error?.response?.status;
    const errorData = error?.response?.data;

    // 🔴 OpenRouter / LLM Rate Limit Handling
    if (
      status === 429 ||
      errorData?.error?.includes("rate limit") ||
      errorData?.error?.includes("quota") ||
      errorData?.error?.includes("exceeded")
    ) {
      return res.status(429).json({
        success: false,
        type: "RATE_LIMIT",
        message:
          "Free AI request limit reached for this model. Please try again later.",
      });
    }

    // 🔴 Invalid API Key / Auth issue
    if (status === 401 || status === 403) {
      return res.status(status).json({
        success: false,
        type: "AUTH_ERROR",
        message: "AI service authentication failed.",
      });
    }

    // 🔴 Generic AI failure
    return res.status(500).json({
      success: false,
      type: "AI_ERROR",
      message: "AI review failed. Please try again later.",
    });
  }
};
