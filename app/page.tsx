import { db } from "@/lib/db";
import { archiveDocument } from "./actions/process-document";
import { DocumentCard } from "@/components/document-card";
export const dynamic = "force-dynamic";

export default async function Page() {
  const docs = await db.document.findMany({ orderBy: { createdAt: "desc" } });

  async function handleAction(formData: FormData) {
    "use server";
    const url = formData.get("url") as string;
    await archiveDocument(url);
  }

  return (
    <main className="max-w-4xl mx-auto p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold mb-2">My Smart Vault</h1>
        <p className="text-gray-500">AI-powered organization for your digital life.</p>
      </header>

      <form action={handleAction} className="flex gap-2 mb-12">
        <input name="url" placeholder="Paste file URL..." className="flex-1 p-3 border rounded-lg" required />
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">Archive</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {docs.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
      </div>
    </main>
  );
}