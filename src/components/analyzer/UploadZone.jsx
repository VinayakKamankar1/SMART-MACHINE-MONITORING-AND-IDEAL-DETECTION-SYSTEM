import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  FileCode,
  Trash2,
  Download,
  AlertCircle,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function UploadZone({
  selectedFile,
  fileContent,
  metadata,
  onFileSelected,
  onSampleSelected,
  onClear,
  onAnalyze,
  isAnalyzing,
  analysisReady,
  onOpenReport,
  sampleList = [],
  errorMessage
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files) => {
    const file = files[0];
    const lower = file.name.toLowerCase();
    if (!lower.endsWith(".csv") && !lower.endsWith(".json") && !lower.endsWith(".txt")) {
      alert("Unsupported file format. Please upload a .csv, .json, or .txt file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      onFileSelected({
        name: file.name,
        size: file.size,
        type: file.type || (lower.endsWith(".csv") ? "text/csv" : lower.endsWith(".json") ? "application/json" : "text/plain"),
        content: event.target.result,
        rawFile: file
      });
    };
    reader.readAsText(file);
  };

  const handleDownloadSample = () => {
    if (!fileContent) return;
    const blob = new Blob([fileContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = metadata?.filename || "sample_machine_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs space-y-5">
      
      {/* 1. Header with Sample Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <UploadCloud className="w-5 h-5 text-indigo-600" />
            Machine Telemetry Dataset Ingestion
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload CSV, JSON, or TXT sensor logs or pick an approved sample file
          </p>
        </div>

        {/* Quick Sample Selector Dropdown */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <FolderOpen className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            onChange={(e) => {
              if (e.target.value) onSampleSelected(e.target.value);
            }}
            value={metadata?.isSample ? metadata.filename : ""}
            className="text-xs font-mono bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-semibold w-full sm:w-64 truncate"
          >
            <option value="">-- Load a Sample Dataset (10 Available) --</option>
            {sampleList.map((s, idx) => (
              <option key={idx} value={s.filename}>
                {s.filename} ({s.format})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Drag & Drop Upload Area or File Selected View */}
      {!metadata ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50/50 scale-[0.99]"
              : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept=".csv,.json,.txt"
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center space-y-2.5">
            <div className="p-3.5 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">
                Drag and drop your machine dataset here, or <span className="text-indigo-600 underline">browse files</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 font-mono">
                Supports .CSV, .JSON, and .TXT telemetry logs up to 10MB
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">CSV Tables</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">JSON Objects</span>
              <span className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200">Key-Value TXT Logs</span>
            </div>
          </div>
        </div>
      ) : (
        /* File Metadata Preview Box */
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-white border border-indigo-100 text-indigo-600 shadow-2xs">
              {metadata.format === "JSON" ? <FileCode className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-slate-900 truncate max-w-xs sm:max-w-md">
                  {metadata.filename}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                  {metadata.format}
                </span>
                {metadata.isSample && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                    SYNTHETIC SAMPLE
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Size: {(metadata.size_bytes / 1024).toFixed(1)} KB &bull; Validated Telemetry &bull; Ready for RAG Ingestion
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {metadata.isSample && (
              <button
                onClick={handleDownloadSample}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-xs font-mono flex items-center gap-1 transition-colors shadow-2xs"
                title="Download Sample File"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}
            <button
              onClick={onClear}
              disabled={isAnalyzing}
              className="px-3 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-mono font-semibold flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Error Message Display if malformed */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-3.5 flex items-center gap-2.5 text-xs text-rose-800 font-mono">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Action Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400 font-mono flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>RAG Retrieval & Rules Engine Active</span>
        </div>

        <div className="flex items-center gap-2.5">
          {analysisReady && (
            <button
              onClick={onOpenReport}
              className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-slate-500" />
              Download Report
            </button>
          )}

          <button
            onClick={onAnalyze}
            disabled={!metadata || isAnalyzing}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm ${
              !metadata || isAnalyzing
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20 active:scale-95"
            }`}
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span>RAG Reasoning in Progress...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Analyze Data</span>
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
