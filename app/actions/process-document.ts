"use server";

import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

// FIX: Standard import for pdf-parse that works in Next.js Server Actions
import pdf from "pdf-parse/lib/pdf-parse";

export async function archiveDocument(fileUrl: string, base64Data?: string) {
  try {
    let contentToAnalyze = "";

    // 1. PDF TEXT EXTRACTION
    if (fileUrl.toLowerCase().endsWith(".pdf")) {
      const response = await fetch(fileUrl);
      const buffer = await response.arrayBuffer();
      
      // This extracts the real text so the AI doesn't hallucinate IDs
      const data = await pdf(Buffer.from(buffer));
      contentToAnalyze = data.text.trim().substring(0, 3000); 
    }

    const messages: any[] = [
      { 
        role: "system", 
        content: `You are a professional document analyzer. 
        Categorize into: Receipt, ID, or Work.
        - ID: Gov-issued cards, passports.
        - Receipt: Bills, invoices.
        - Work: Everything else, including practice papers, reports, or Q&A.
        
        Provide a 2-3 sentence summary based ONLY on the actual text provided. 
        Respond ONLY in JSON format: { "category": "...", "summary": "..." }` 
      }
    ];

    // 2. SEND CONTENT TO AI
    if (base64Data && !fileUrl.toLowerCase().endsWith(".pdf")) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: "Analyze this image:" },
          { type: "image_url", image_url: { url: `data:image/jpeg;base64,${base64Data}` } }
        ]
      });
    } else {
      messages.push({ 
        role: "user", 
        content: contentToAnalyze 
          ? `Analyze this content: ${contentToAnalyze}` 
          : `Analyze this document: ${fileUrl}` 
      });
    }

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages,
      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content || "{}");
    
    // 3. DATABASE SYNC
    const valid = ["Receipt", "ID", "Work"];
    const finalCategory = valid.includes(aiResponse.category) ? aiResponse.category : "Work";

    await db.document.create({
      data: { 
        url: fileUrl, 
        summary: aiResponse.summary || "Document archived.", 
        category: finalCategory 
      },
    });

    revalidatePath("/");
    return { success: true };

  } catch (error: any) {
    console.error("Archive Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * DELETE: Required for your DocumentCard component
 */
export async function deleteDocument(id: string) {
  try {
    await db.document.delete({ where: { id } });
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}