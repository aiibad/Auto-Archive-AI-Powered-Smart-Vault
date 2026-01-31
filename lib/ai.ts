import OpenAI from "openai";

export const openai = new OpenAI({
  // Add this line to redirect the request to DeepSeek
  baseURL: "https://api.deepseek.com", 
  apiKey: process.env.DEEPSEEK_API_KEY 
});