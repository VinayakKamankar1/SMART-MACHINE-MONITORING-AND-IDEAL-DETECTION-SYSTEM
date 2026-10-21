import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileText,
  Search,
  ExternalLink,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";

export default function RagEvidencePanel({ classification }) {
  const [isOpen, setIsOpen] = useState(true);

  if (!classification) return null;

  const docs = classification.retrieved_documents || [];
  const supporting = classification.supporting_evidence || [];
  const conflicting = classification.conflicting_evidence || [];
  const limitations = classification.confidence_limitations || [];

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white shadow-xs overflow-hidden transition-all">
      
      {/* Accordion Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between text-left bg-gradient-to-r from-slate-50 via-white to-indigo-50/20 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-100/70 text-indigo-700 border border-indigo-200/80">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Why did AI classify this data?
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                RAG Evidence & Technical Citations
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Traceable evidence retrieved from local ChromaDB vector store
            </p>
          </div>
        </div>

        <div className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-5 border-t border-slate-200/80 space-y-5 bg-white">
          
          {/* Supporting & Conflicting Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Supporting Evidence */}
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider mb-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Supporting Diagnostic Evidence
              </div>
              {supporting.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {supporting.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-400 italic">No explicit supporting evidence found.</p>
              )}
            </div>

            {/* Conflicting Evidence & Anomalies */}
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-4">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-800 uppercase tracking-wider mb-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Conflicting Evidence & Discrepancies
              </div>
              {conflicting.length > 0 ? (
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {conflicting.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-600">No conflicting sensor evidence detected. Reading ranges match nominal specifications.</p>
              )}
            </div>

          </div>

          {/* Model Limitations Notice */}
          {limitations.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 text-xs text-slate-600 flex items-start gap-2.5">
              <HelpCircle className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-slate-700 font-mono uppercase text-[10px] tracking-wider block mb-0.5">
                  Confidence Scope & Limitations
                </span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {limitations.join(" ")}
                </p>
              </div>
            </div>
          )}

          {/* Retrieved Knowledge Base Chunks (ChromaDB Vector Matches) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-indigo-500" />
                Retrieved Technical Documents & Operating Guidelines ({docs.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                Source: rag-knowledge-base/ & sample-data/
              </span>
            </div>

            {docs.length > 0 ? (
              <div className="space-y-2.5">
                {docs.map((doc, idx) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200/90 bg-slate-50/50 p-3 text-xs hover:bg-white hover:border-indigo-200 transition-colors shadow-2xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <span className="font-bold text-slate-800 font-mono">
                          {doc.title || doc.source_file}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-slate-200/80 text-[10px] font-mono text-slate-600">
                          {doc.source_file}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                        <span>Similarity:</span>
                        <span>{Math.round(doc.similarity_score * 100)}%</span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 font-mono whitespace-pre-wrap leading-relaxed line-clamp-4 hover:line-clamp-none transition-all">
                      {doc.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 p-4 text-center text-xs text-slate-400 italic">
                No matching documents retrieved from vector index.
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
