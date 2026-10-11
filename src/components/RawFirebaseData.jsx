import React, { useState } from "react";
import { ChevronDown, ChevronRight, Copy, Check, Terminal, Code } from "lucide-react";

export default function RawFirebaseData({ rawData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const formattedJson = rawData ? JSON.stringify(rawData, null, 2) : "{\n  \"message\": \"Waiting for Firebase machine data...\"\n}";

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="light-card rounded-2xl border border-slate-200/90 overflow-hidden mt-6 shadow-xs">
      {/* Accordion Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-slate-100 text-indigo-600 border border-slate-200">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono tracking-tight text-slate-900">
                Raw Firebase Live Payload
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-bold">
                JSON STREAM
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live payload stream from /smart_machine for demonstration & verification
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-500">
          <span className="text-xs font-mono font-semibold hidden sm:inline-block">
            {isOpen ? "Collapse" : "Expand"}
          </span>
          {isOpen ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5" />}
        </div>
      </button>

      {/* Expandable Content */}
      {isOpen && (
        <div className="p-6 pt-3 border-t border-slate-200/80 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-slate-600 flex items-center gap-1.5 font-medium">
              <Code className="w-3.5 h-3.5 text-indigo-500" />
              Source node: <code className="text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 font-bold">/smart_machine</code>
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs font-semibold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy JSON</span>
                </>
              )}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs sm:text-sm text-cyan-300 overflow-x-auto leading-relaxed shadow-inner">
            <code>{formattedJson}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
