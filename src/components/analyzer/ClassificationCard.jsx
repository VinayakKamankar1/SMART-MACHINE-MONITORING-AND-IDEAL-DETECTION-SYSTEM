import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  HelpCircle,
  Copy,
  Check,
  Cpu,
  Ruler,
  Clock
} from "lucide-react";

export default function ClassificationCard({ classification }) {
  const [copied, setCopied] = useState(false);

  if (!classification) return null;

  const category = classification.predicted_category || "Unclassified Data";
  const confidence = typeof classification.confidence_score === "number" ? classification.confidence_score : 0.85;
  const confidencePct = Math.round(confidence * 100);
  const confidenceLevel = classification.confidence_level || (confidencePct >= 90 ? "High" : confidencePct >= 70 ? "Medium" : "Low (Uncertain)");
  const isUnknown = category.toLowerCase().includes("unknown") || category.toLowerCase().includes("insufficient");

  const handleCopySummary = () => {
    const text = `Classification: ${category}\nConfidence: ${confidencePct}% (${confidenceLevel})\nExplanation: ${classification.explanation}\nSensors: ${(classification.detected_sensors || []).join(", ")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Color theme according to category
  let badgeTheme = "bg-indigo-50 text-indigo-700 border-indigo-200";
  let borderTheme = "border-indigo-200";
  let bgGradient = "from-indigo-50/70 via-white to-blue-50/40";

  if (isUnknown) {
    badgeTheme = "bg-amber-50 text-amber-800 border-amber-300";
    borderTheme = "border-amber-300";
    bgGradient = "from-amber-50/60 via-white to-orange-50/30";
  } else if (category.includes("Combined")) {
    badgeTheme = "bg-purple-50 text-purple-700 border-purple-200";
    borderTheme = "border-purple-200";
    bgGradient = "from-purple-50/60 via-white to-indigo-50/30";
  } else if (category.includes("Presence") || category.includes("Distance")) {
    badgeTheme = "bg-blue-50 text-blue-700 border-blue-200";
    borderTheme = "border-blue-200";
    bgGradient = "from-blue-50/60 via-white to-sky-50/30";
  } else if (category.includes("Anomalous") || category.includes("Alert")) {
    badgeTheme = "bg-rose-50 text-rose-700 border-rose-200";
    borderTheme = "border-rose-200";
    bgGradient = "from-rose-50/60 via-white to-amber-50/30";
  }

  return (
    <div className={`rounded-2xl border ${borderTheme} bg-gradient-to-br ${bgGradient} p-5 sm:p-6 shadow-xs relative overflow-hidden transition-all`}>
      
      {/* Decorative top badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-white shadow-xs border border-slate-200/80">
            {isUnknown ? (
              <HelpCircle className="w-5 h-5 text-amber-500" />
            ) : (
              <Sparkles className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500">
                RAG Data Classification
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
                {classification.rag_synthesis_method || "ChromaDB RAG Engine"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
              {category}
            </h2>
          </div>
        </div>

        {/* Confidence Pill & Copy Button */}
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 shadow-xs ${badgeTheme}`}>
            <span className={`w-2 h-2 rounded-full ${confidencePct >= 80 ? "bg-emerald-500" : confidencePct >= 50 ? "bg-amber-500" : "bg-rose-500"} animate-pulse`} />
            <span>Confidence: {confidencePct}%</span>
            <span className="text-[10px] opacity-75 font-normal">({confidenceLevel})</span>
          </div>

          <button
            onClick={handleCopySummary}
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Copy Classification Summary"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>

      {/* Explanation Narrative */}
      <div className="mt-4">
        <p className="text-sm text-slate-700 leading-relaxed font-normal">
          {classification.explanation}
        </p>
      </div>

      {/* Detected Variables and Sensor Mapping Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        
        {/* Card 1: Identified Sensor Subsystems */}
        <div className="rounded-xl bg-white/90 border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-500" />
            Detected Sensors
          </div>
          {classification.detected_sensors && classification.detected_sensors.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {classification.detected_sensors.map((s, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-md bg-indigo-50/80 text-indigo-700 border border-indigo-200/60 font-semibold flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3 h-3 text-indigo-500 shrink-0" />
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">None of the known workstation sensors detected.</p>
          )}
        </div>

        {/* Card 2: Units & Data Types */}
        <div className="rounded-xl bg-white/90 border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Ruler className="w-3.5 h-3.5 text-blue-500" />
            Detected Units & Fields
          </div>
          {classification.detected_units && Object.keys(classification.detected_units).length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(classification.detected_units).map(([col, unit], idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-md bg-blue-50/80 text-blue-700 border border-blue-200/60 font-mono"
                >
                  <span className="font-semibold">{col}:</span> {unit}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Standard generic units (no workstation units identified).</p>
          )}
        </div>

        {/* Card 3: Time & Telemetry Format */}
        <div className="rounded-xl bg-white/90 border border-slate-200/80 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            Temporal Indexing
          </div>
          <div className="text-xs text-slate-600 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Timestamp Field:</span>
              <span className="font-mono font-semibold text-slate-800">
                {classification.time_column || "Not present (Static records)"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Total Variables:</span>
              <span className="font-mono font-semibold text-slate-800">
                {(classification.detected_variables || []).length} columns
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
