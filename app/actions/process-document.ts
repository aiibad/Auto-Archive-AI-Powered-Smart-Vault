"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string) {
  try {
    // 1. Request AI Analysis from DeepSeek
    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { 
          role: "system", 
          content: "You are a helpful assistant that categorizes documents. Respond in the format 'Category: Summary'. Categories must be one of: Receipt, ID, or Work." 
        },
        { 
          role: "user", 
          content: `Please analyze this document URL: ${fileUrl}` 
        }
      ],
      temperature: 0.3, // Keeps the response consistent
    });

    const aiText = completion.choices[0].message.content || "Uncategorized: No summary available.";
    
    // 2. Extract Category and Summary logic
    // Expected format: "Receipt: This is a store purchase for electronics."
    let category = "General";
    let summary = aiText;

    if (aiText.includes(":")) {
      const parts = aiText.split(":");
      category = parts[0].trim();
      summary = parts.slice(1).join(":").trim();
    }

    // 3. Save to Neon Database via Prisma
    await db.document.create({
      data: {
        url: fileUrl,
        summary: summary,
        category: category,
      },
    });

    // 4. Refresh the UI
    revalidatePath("/");
    
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    
    // Fallback: Save the document even if the AI fails
    await db.document.create({
      data: {
        url: fileUrl,
        summary: "AI summary failed. Please check your API quota.",
        category: "Error",
      },
    });

    revalidatePath("/");
    return { success: false, error: error.message };
  }
}