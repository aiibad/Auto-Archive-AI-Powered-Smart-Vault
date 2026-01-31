export function DocumentCard({ doc }: { doc: any }) {
  return (
    <div className="p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex justify-between mb-2">
        <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {doc.category}
        </span>
      </div>
      <p className="text-sm text-gray-600 mb-3">{doc.summary}</p>
      <a href={doc.url} target="_blank" className="text-xs text-blue-500 hover:underline">
        View Original File →
      </a>
    </div>
  );
}