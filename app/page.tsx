import { db } from "@/lib/db";
import { DocumentCard } from "@/components/document-card";
import { UploadSection } from "@/components/upload-section";
import { FolderOpen, LayoutGrid, Search } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; query?: string }>;
}) {
  const { category, query } = await searchParams;

  const docs = await db.document.findMany({
    where: {
      AND: [
        category ? { category: { equals: category, mode: 'insensitive' } } : {},
        query ? { summary: { contains: query, mode: 'insensitive' } } : {},
      ]
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900">
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-2 mb-10 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FolderOpen className="text-white w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">Vault.ai</span>
        </div>
        <nav className="space-y-1">
          <Link href="/" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium bg-blue-50 text-blue-600">
            <LayoutGrid size={20} /> Dashboard
          </Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 md:p-10 max-w-6xl mx-auto w-full">
        <header className="mb-10">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Archive</h1>
        </header>

        {/* This replaces your old form and input */}
        <UploadSection />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {docs.map((doc) => (
            <DocumentCard key={doc.id} doc={doc} />
          ))}
        </div>
      </main>
    </div>
  );
}