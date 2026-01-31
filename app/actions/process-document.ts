"use server";
import { db } from "@/lib/db";
import { openai } from "@/lib/ai";
import { revalidatePath } from "next/cache";

export async function archiveDocument(fileUrl: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: "Categorize document: Receipt, ID, or Work. Provide 1-sentence summary." },
      { role: "user", content: `Analyze: ${fileUrl}` }
    ],
  });

  const aiText = completion.choices[0].message.content || "";
  await db.document.create({
    data: { url: fileUrl, summary: aiText, category: aiText.split(":")[0] }
  });

  revalidatePath("/");
}