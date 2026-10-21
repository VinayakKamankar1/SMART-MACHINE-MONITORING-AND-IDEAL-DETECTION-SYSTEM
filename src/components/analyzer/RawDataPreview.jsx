import React, { useState } from "react";
import {
  Code,
  Table as TableIcon,
  Copy,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react";

export default function RawDataPreview({ records, fileMetadata }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'json'
  const [copied, setCopied] = useState(false);

  if (!records || records.length === 0) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(records, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const columns = Object.keys(records[0] || {});

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden">
      
      {/* Header bar */}
      <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 font-bold text-slate-800 text-sm hover:text-indigo-600 transition-colors"
          >
            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            <span>Raw Data & Preprocessed Records</span>
          </button>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-600 font-semibold">
            Showing {records.length} samples
          </span>
        </div>

        {isOpen && (
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-mono">
              <button
                onClick={() => setViewMode("table")}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  viewMode === "table" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <TableIcon className="w-3 h-3" />
                Table
              </button>
              <button
                onClick={() => setViewMode("json")}
                className={`px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                  viewMode === "json" ? "bg-indigo-50 text-indigo-700 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Code className="w-3 h-3" />
                JSON
              </button>
            </div>

            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-mono flex items-center gap-1 transition-colors shadow-2xs"
              title="Copy JSON Payload"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span className="hidden sm:inline">Copy</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {isOpen && (
        <div className="p-4 bg-slate-900 text-slate-100">
          {viewMode === "table" ? (
            <div className="overflow-x-auto max-h-72">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-800 text-slate-300 border-b border-slate-700 sticky top-0">
                  <tr>
                    <th className="px-3 py-2 text-slate-400">#</th>
                    {columns.map((c, i) => (
                      <th key={i} className="px-3 py-2 font-semibold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {records.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-3 py-1.5 text-slate-500">{rIdx + 1}</td>
                      {columns.map((c, cIdx) => (
                        <td key={cIdx} className="px-3 py-1.5 text-slate-300 truncate max-w-xs">
                          {row[c] === null ? (
                            <span className="text-slate-600 italic">null</span>
                          ) : typeof row[c] === "boolean" ? (
                            <span className={row[c] ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>
                              {String(row[c])}
                            </span>
                          ) : (
                            String(row[c])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <pre className="max-h-72 overflow-y-auto text-xs font-mono text-emerald-400 p-2 leading-relaxed">
              {JSON.stringify(records, null, 2)}
            </pre>
          )}
        </div>
      )}

    </div>
  );
}
