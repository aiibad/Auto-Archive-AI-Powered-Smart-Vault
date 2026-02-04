"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

const categories = ["All", "Receipt", "ID", "Work", "General", "Error"];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get("category") || "All";

  const handleCategoryChange = (category: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    router.push(`/?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-3 bg-white border border-slate-200 p-2 rounded-2xl shadow-sm">
      <div className="flex items-center gap-2 px-3 text-slate-400">
        <Filter size={16} />
        <span className="text-xs font-bold uppercase tracking-wider">Filter</span>
      </div>
      <div className="flex gap-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              currentCategory === cat
                ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
}