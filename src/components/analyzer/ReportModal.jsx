import React from "react";
import {
  X,
  Printer,
  Download,
  FileText
} from "lucide-react";

export default function ReportModal({ isOpen, onClose, analysisData }) {
  if (!isOpen || !analysisData) return null;

  const {
    file_metadata,
    classification,
    statistics,
    condition_analysis
  } = analysisData;

  const reportDate = new Date().toLocaleString();
  const filename = file_metadata?.filename || "dataset.csv";
  const category = classification?.predicted_category || "Unclassified";
  const confidence = Math.round((classification?.confidence_score || 0.85) * 100);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>RAG Analysis Report - ${filename}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; line-height: 1.5; }
    h1 { color: #0f172a; margin-bottom: 4px; font-size: 24px; }
    .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 12px; font-weight: bold; background: #e0e7ff; color: #3730a3; }
    .section { margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; }
    .section-title { font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
    th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
    th { background: #f8fafc; font-weight: 600; }
    .anomaly-box { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px; margin-top: 8px; }
    .evidence-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin-top: 8px; }
    .footer { margin-top: 40px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 12px; }
  </style>
</head>
<body>
  <h1>SMART MACHINE MONITORING & IDLE DETECTION SYSTEM</h1>
  <div class="subtitle">Pen Refill Work Station &bull; AI Data Classification & Diagnostic Report</div>

  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <div style="font-size: 12px; color: #64748b;">PREDICTED DATA CATEGORY</div>
        <div style="font-size: 20px; font-weight: bold; color: #1e1b4b; margin: 4px 0;">${category}</div>
      </div>
      <div>
        <span class="badge">Confidence: ${confidence}% (${classification?.confidence_level || "High"})</span>
      </div>
    </div>
    <p style="margin-top: 12px; font-size: 13px; color: #334155;">${classification?.explanation || ""}</p>
  </div>

  <div class="section">
    <div class="section-title">1. File Metadata & Sampling Bounds</div>
    <table>
      <tr><th>Filename</th><td>${filename}</td><th>Format</th><td>${file_metadata?.format || "N/A"}</td></tr>
      <tr><th>Total Records</th><td>${file_metadata?.total_records || 0}</td><th>File Size</th><td>${Math.round((file_metadata?.file_size_bytes || 0) / 1024)} KB</td></tr>
      <tr><th>Generated At</th><td>${reportDate}</td><th>Time Span</th><td>${statistics?.time_range ? statistics.time_range.formatted_span : "Static / No timestamps"}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">2. Workstation Safety & Operating Rules Evaluation</div>
    <p style="font-size: 13px;"><strong>Tool Presence Status:</strong> ${condition_analysis?.tool_presence_summary || "N/A"}</p>
    <p style="font-size: 13px;"><strong>Idle Analysis:</strong> ${condition_analysis?.idle_duration_analysis?.supported ? condition_analysis.idle_duration_analysis.formatted_idle_time + ' idle (' + condition_analysis.idle_duration_analysis.operational_duty_cycle_pct + '% duty cycle)' : 'Not calculable'}</p>
    ${condition_analysis?.total_anomalies > 0 ? `
      <div class="anomaly-box">
        <strong>Detected Anomalies (${condition_analysis.total_anomalies}):</strong>
        <ul>
          ${(condition_analysis.anomalies_detected || []).map(a => `<li>[${a.severity}] Sample #${a.record_index}: ${a.message}</li>`).join("")}
        </ul>
      </div>
    ` : '<p style="color: #059669; font-size: 13px;">✓ Zero safety interlock violations or anomalous readings detected.</p>'}
  </div>

  <div class="section">
    <div class="section-title">3. Traceable RAG Evidence & Knowledge Citations</div>
    <div class="evidence-box">
      <strong>Supporting Diagnostic Evidence:</strong>
      <ul>
        ${(classification?.supporting_evidence || []).map(e => `<li>${e}</li>`).join("")}
      </ul>
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 8px;">
      Primary Retrieved Documents: ${(classification?.retrieved_documents || []).map(d => d.source_file + ' (' + Math.round(d.similarity_score * 100) + '%)').join(", ") || "None"}
    </p>
  </div>

  <div class="footer">
    Generated automatically by Smart Machine Monitoring System &bull; RAG Diagnostic Engine &bull; ${reportDate}
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Analysis_Report_${filename.replace(/\.[^/.]+$/, "")}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-base">
              RAG Diagnostic Analysis Report
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Printable Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm text-slate-800">
          
          <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
            <div className="text-xs font-mono font-bold text-indigo-600 uppercase">
              Predicted Classification
            </div>
            <div className="text-xl font-black text-indigo-950 mt-1">
              {category}
            </div>
            <div className="text-xs text-indigo-700 mt-1">
              Confidence: <strong>{confidence}%</strong> &bull; {classification?.confidence_level || "High"}
            </div>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              {classification?.explanation}
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider mb-2">
              File & Processing Scope
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Filename</span>
                <span className="font-bold text-slate-800 truncate block">{filename}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Records</span>
                <span className="font-bold text-slate-800">{file_metadata?.total_records || 0}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Format</span>
                <span className="font-bold text-slate-800">{file_metadata?.format || "N/A"}</span>
              </div>
              <div className="p-2 rounded bg-slate-50 border border-slate-200">
                <span className="text-slate-500 block text-[10px]">Timestamp</span>
                <span className="font-bold text-slate-800 truncate block">{reportDate.split(",")[0]}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 text-xs font-mono uppercase tracking-wider mb-2">
              Workstation Safety & Operating Rules
            </h4>
            <div className="text-xs space-y-1 text-slate-700">
              <div>&bull; <strong>Tool Proximity:</strong> {condition_analysis?.tool_presence_summary}</div>
              <div>&bull; <strong>Operating Duty Cycle:</strong> {condition_analysis?.idle_duration_analysis?.supported ? `${condition_analysis.idle_duration_analysis.operational_duty_cycle_pct}% running, ${condition_analysis.idle_duration_analysis.idle_ratio_pct}% idle` : "Indeterminate (no time series)"}</div>
              <div>&bull; <strong>Anomalies:</strong> {condition_analysis?.total_anomalies || 0} candidate events found.</div>
            </div>
          </div>

        </div>

        {/* Modal Footer with Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Ready to download or print
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              Print / Save PDF
            </button>
            <button
              onClick={handleDownloadHtml}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report (.html)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
