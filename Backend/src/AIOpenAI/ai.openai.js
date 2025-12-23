import dotenv from "dotenv";
dotenv.config(); // ✅ force env load here

import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateAIResponse(prompt) {
  try {
    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    return response.output_text;
  } catch (err) {
    console.error("OpenAI Error:", err);
    throw err;
  }
}
