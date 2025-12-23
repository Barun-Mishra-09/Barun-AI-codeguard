// import aiGemini from "../AIGemini/ai.gemini.js";

import { generateContent } from "../AIGemini/ai.gemini.js";

export const aiGetReview = async (req, res) => {
  const codePrompt = req.query.codePrompt;

  if (!codePrompt) {
    return res.status(400).send("Prompt is required");
  }

  const response = await generateContent(codePrompt);

  res.send(response);
};
