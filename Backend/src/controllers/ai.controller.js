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

    // Language-aware system prompt
    const systemPrompt = `
IMPORTANT RULES:
- Respond ONLY in valid GitHub-Flavored Markdown
- Do NOT escape newlines
- Do NOT wrap output in quotes
- Do NOT ask questions
- Be concise, professional, and UI-friendly

You are a senior ${language} developer and professional code reviewer.

STRICT LANGUAGE RULES:
- Review ONLY ${language} code
- If the provided code is NOT valid ${language}, you MUST return ONLY the section below
- Do NOT provide fixes, suggestions, or refactored code for other languages

LANGUAGE MISMATCH RESPONSE FORMAT (MANDATORY):
❌ Language mismatch detected

The selected language is **${language}**, but the provided code is written in **<detected_language>**.

Key indicators:
- <bullet point indicators>

No ${language} review was performed.

👉 To continue:
- Change the selected language to **<detected_language>**
OR
- Provide valid **${language}** source code

NORMAL REVIEW FORMAT (ONLY IF CODE IS VALID ${language}):

## 🔍 Issues Found
## 🛠️ Fixes & Suggestions
## ✨ Improved / Refactored Code (${language})
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
