import OpenAI from "openai";

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  // OpenRouter requires these extra headers for their rankings
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:3000", // Your site URL
    "X-Title": "Smart Vault", // Your site Name
  }
});