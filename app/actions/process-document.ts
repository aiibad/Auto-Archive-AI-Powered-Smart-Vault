"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string) {
  try {
    const completion = await openai.chat.completions.create({
      // 1. Updated to use the paid DeepSeek model
      model: "deepseek-chat", 
      messages: [
        { 
          role: "system", 
          content: "You are a document analyzer. Categorize the file as Receipt, ID, or Work and provide a 1-sentence summary. Respond strictly in JSON format." 
        },
        { role: "user", content: `Analyze this document: ${fileUrl}` }
      ],
      // 2. Enable JSON Mode for better reliability
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    // 3. Robust JSON parsing
    const content = JSON.parse(completion.choices[0].message.content || "{}");
    const category = content.category || "General";
    const summary = content.summary || "Document archived successfully.";

    // 4. Save to Database
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: summary, 
        category: category 
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Archive Error:", error);
    
    // Fallback: Save as 'General' so the file isn't lost, even if AI fails
    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: "Document archived (AI analysis unavailable).", 
        category: "General" 
      },
    });
    
    revalidatePath("/");
    return { success: false, error: error.message };
  }
}

export async function deleteDocument(id: string) {
  try {
    await db.document.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error);
    return { success: false, error: error.message };
  }
}