"use client";

import { DocumentCard } from "./document-card";
import { Trash2 } from "lucide-react";
import { UploadDropzone } from "@uploadthing/react";
import { OurFileRouter } from "@/app/api/uploadthing/core";
import { archiveDocument, deleteDocument } from "@/app/actions/process-document";

export function DocumentGrid({ docs }: { docs: any[] }) {
  return (
    <>
      {/* UPLOAD ZONE */}
      <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
        <UploadDropzone<OurFileRouter, "docUploader">
          endpoint="docUploader"
          onClientUploadComplete={async (res) => {
            if (res?.[0]) await archiveDocument(res[0].url);
          }}
          className="ut-label:text-blue-600 ut-button:bg-slate-900 border-slate-200 bg-slate-50/50 rounded-2xl h-44"
        />
      </section>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {docs.length > 0 ? (
          docs.map((doc) => (
            <div key={doc.id} className="relative group">
              <DocumentCard doc={doc} />
              <button 
                onClick={async () => await deleteDocument(doc.id)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all z-20"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 rounded-3xl text-slate-400 italic">
            No documents found.
          </div>
        )}
      </div>
    </>
  );
}