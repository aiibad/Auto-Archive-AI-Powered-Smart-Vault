"use client";

import { DocumentCard } from "./document-card";
import { Trash2 } from "lucide-react";
import { deleteDocument, archiveDocument } from "@/app/actions/process-document";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";

export function DocumentGrid({ docs }: { docs: any[] }) {
  return (
    <>
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
        <UploadDropzone<OurFileRouter, "docUploader">
          endpoint="docUploader"
          onClientUploadComplete={async (res) => {
            if (res?.[0]) await archiveDocument(res[0].url);
          }}
          className="ut-label:text-blue-600 ut-button:bg-slate-900 border-slate-200 bg-slate-50/50 rounded-2xl h-44"
        />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.map((doc) => (
          <div key={doc.id} className="relative group">
            <DocumentCard doc={doc} />
            {/* The Delete logic is now safely handled here */}
            <button 
              onClick={async () => {
                if(confirm("Delete this document?")) {
                  await deleteDocument(doc.id);
                }
              }}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all z-20"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}