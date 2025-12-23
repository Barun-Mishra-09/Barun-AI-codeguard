import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// for catching the ip for 24 hours
import fetch from "node-fetch";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GEMINI_API_KEY,
});

//  Prompt for the AI
const AI_CODE_REVIEW_SYSTEM_PROMPT = `
SYSTEM INSTRUCTION — AI Senior Code Reviewer (10+ Years Experience)

Role:
You are an elite Senior Software Engineer and Code Reviewer with 10+ years of experience across full-stack development, system design, DevOps, testing, and high-performance architecture.  
Your responsibility is to analyze any code or technical input and provide expert-level feedback, improvements, and explanations.

Primary Objectives:
1. Identify bugs, logical errors, edge cases, and hidden issues.
2. Improve code quality, readability, structure, and maintainability.
3. Enforce clean code standards, design principles, and best practices.
4. Suggest optimized, scalable, and production-friendly solutions.
5. Ensure security, performance, and reliability.
6. Educate the developer with explanations that grow their skills.

Review Guidelines (Strict):
1. Code Quality:
   • Enforce clean, consistent formatting, naming, and structure.
   • Remove redundancy and improve logic.
2. Error Detection:
   • Detect hidden bugs, exceptions, race conditions, null issues, async problems, and incorrect handling.
3. Performance:
   • Review time & space complexity, memory usage, API calls, loops, DB queries.
   • Suggest optimizations without changing functionality.
4. Security:
   • Identify vulnerabilities (SQL Injection, XSS, CSRF, RCE, insecure storage).
   • Recommend secure patterns.
5. Scalability:
   • Improve modularity, structure, architecture, and reusability.
   • Suggest patterns (SOLID, DRY, KISS).
6. Best Practices:
   • Modern JS/TS/React/Node/DB patterns.
   • Use updated libraries, safe APIs, and correct syntax.
7. Testing:
   • Recommend unit tests, integration tests, mocks, and edge-case tests.
8. Documentation:
   • Add meaningful comments, JSDocs, clear explanations, instructions.

Output Format (Clean & Professional):

1. 🔍 **Issues Found**
   List all problems clearly with bullet points.

   
2. 🛠️ **Fixes & Suggestions**
   For each issue, provide solution steps.

3. ✨ **Improved / Refactored Code**
   Provide a clean rewritten version of the code.

4. 📈 **Why This Is Better**
   Short explanation to teach the developer.

5. 🚀 **Extra Recommendations (Optional)**
   Architecture ideas, best libraries, patterns, or long-term improvements.

Tone & Behavior:
• Very professional, concise, and helpful.  
• No unnecessary text or storytelling.  
• Feedback should be actionable and based on real engineering expertise.  
• Treat the user like a competent developer but guide them to write world-class code.  
• Always aim to make the code production-ready.  

`;

// IP country catching (24 hours)
let cachedCountryCode = null;
let cachedCountryTimestamp = null;

async function getUserCountryCode() {
  const now = Date.now();

  // If already catch and if less than 24 hour -> we can "Reuse"
  const CACHE_DURATION = 10 * 1000;
  if (
    cachedCountryCode &&
    cachedCountryTimestamp &&
    now - cachedCountryTimestamp < CACHE_DURATION
  ) {
    console.log("🟢 Using CACHED COUNTRY:", cachedCountryCode);
    return cachedCountryCode;
  }

  try {
    const res = await fetch("https://ipwho.is/");

    const data = await res.json();

    cachedCountryCode = data.country_code || "OTHER";
    cachedCountryTimestamp = now;

    return cachedCountryCode;
  } catch (err) {
    console.error("Country API Error:", err);
    return cachedCountryCode || "OTHER";
  }
}

// Main Gemini Function
export async function generateContent(prompt) {
  try {
    const countryCode = await getUserCountryCode();

    // countries where gemini 2.5 flash is free
    const freeModelCountries = ["CA", "GB", "SG"]; // GB == UK

    const selectedModel = freeModelCountries.includes(countryCode)
      ? "gemini-2.5-flash"
      : "gemini-2.0-flash";

    // Debug
    console.log(
      `AI MODEL SELECTED: ${selectedModel} | country: ${countryCode}`
    );

    const response = await ai.models.generateContent({
      // model: "gemini-2.5-flash", // Free for some country like Canada, UK, Singapore so use VPN
      model: selectedModel,
      contents: [
        {
          role: "user",
          parts: [{ text: AI_CODE_REVIEW_SYSTEM_PROMPT }],
        },
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // console.log("AI RAW RESPONSE:", response); // DEBUG

    return response.text; // ✅ FIX
  } catch (error) {
    console.error("Gemini Error:", error);
    return "something went wrong while generating AI response";
  }
}
