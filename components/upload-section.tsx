"use client";

import { useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import { archiveDocument } from "@/app/actions/process-document";
import { Upload, Link as LinkIcon, Loader2, FileText, X } from "lucide-react";
import { useRouter } from "next/navigation";

export function UploadSection() {
  const [urlInput, setUrlInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Initialize the hook
  const { startUpload } = useUploadThing("docUploader", {
    onUploadError: (error) => {
      alert(`Upload Error: ${error.message}`);
      setLoading(false);
    },
  });

  const handleArchive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput && !selectedFile) return alert("Please provide a link or a file.");

    setLoading(true);

    try {
      let finalUrl = urlInput;

      // 1. If there's a file, upload it first to get the URL
      if (selectedFile) {
        const uploadRes = await startUpload([selectedFile]);
        if (uploadRes && uploadRes[0]) {
          finalUrl = uploadRes[0].url;
        }
      }

      // 2. Send the URL (either pasted or uploaded) to your AI Processor
      if (finalUrl) {
        await archiveDocument(finalUrl);
        // Reset state
        setUrlInput("");
        setSelectedFile(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
      alert("Processing failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 mb-12">
      <form onSubmit={handleArchive} className="space-y-6">
        
        {/* CUSTOM FILE SELECTOR */}
        <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 transition-all hover:border-blue-400 hover:bg-blue-50/30 flex flex-col items-center justify-center min-h-[160px]">
          {selectedFile ? (
            <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm border border-blue-100 animate-in fade-in zoom-in duration-300">
              <FileText className="text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-bold truncate max-w-[200px]">{selectedFile.name}</p>
                <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
              </div>
              <button 
                type="button"
                onClick={() => setSelectedFile(null)}
                className="p-1 hover:bg-red-50 hover:text-red-500 rounded-full transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="text-slate-400 group-hover:text-blue-600" size={24} />
              </div>
              <p className="text-sm font-medium text-slate-600">Click to select or drag a file</p>
              <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max 4MB)</p>
              <input 
                type="file" 
                className="absolute inset-0 opacity-0 cursor-pointer" 
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </>
          )}
        </div>

        <div className="text-center text-slate-300 text-xs font-bold uppercase tracking-widest">or</div>

        {/* LINK INPUT */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Paste a secure document URL..." 
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className="bg-slate-900 hover:bg-black text-white px-10 py-3 rounded-xl font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Processing...</>
            ) : (
              "Archive Now"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}