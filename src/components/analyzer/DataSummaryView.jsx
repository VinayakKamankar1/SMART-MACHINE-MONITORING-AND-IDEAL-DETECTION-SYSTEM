import React from "react";
import {
  BarChart3,
  Hash,
  Columns,
  Clock,
  AlertCircle,
  CopyCheck,
  CheckCircle2,
  Table
} from "lucide-react";

export default function DataSummaryView({ statistics }) {
  if (!statistics) return null;

  const totalRecords = statistics.total_records || 0;
  const totalColumns = statistics.total_columns || 0;
  const timeRange = statistics.time_range;
  const duplicatesCount = statistics.duplicates_count || 0;
  const numericStats = statistics.numeric_stats || {};
  const categoricalStats = statistics.categorical_stats || {};
  const missingSummary = statistics.missing_summary || {};

  // Total missing calculation
  let totalMissing = 0;
  Object.values(missingSummary).forEach(m => {
    totalMissing += m.missing_count || 0;
  });

  return (
    <div className="space-y-4">
      
      {/* 1. Header & Metric Tiles */}
      <div className="flex items-center gap-2 mb-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-600">
          <BarChart3 className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Deterministic Data Summary & Statistics
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Direct Numerical Evaluation
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        
        {/* Metric 1 */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
            <Hash className="w-3.5 h-3.5 text-indigo-500" />
            Total Records
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalRecords.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Logged samples</div>
        </div>

        {/* Metric 2 */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
            <Columns className="w-3.5 h-3.5 text-blue-500" />
            Variables / Columns
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalColumns}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Telemetry features</div>
        </div>

        {/* Metric 3 */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
            <Clock className="w-3.5 h-3.5 text-emerald-500" />
            Time Span
          </div>
          <div className="text-base font-bold text-slate-800 font-mono truncate">
            {timeRange ? timeRange.formatted_span.split(" ")[0] + " sec" : "Static"}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {timeRange ? `${timeRange.duration_seconds}s interval` : "No timestamps"}
          </div>
        </div>

        {/* Metric 4 */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
            <AlertCircle className={`w-3.5 h-3.5 ${totalMissing > 0 ? "text-amber-500" : "text-emerald-500"}`} />
            Missing Values
          </div>
          <div className={`text-2xl font-black font-mono ${totalMissing > 0 ? "text-amber-600" : "text-slate-900"}`}>
            {totalMissing}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {totalMissing === 0 ? "100% complete data" : `${totalMissing} null cells`}
          </div>
        </div>

        {/* Metric 5 */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-3.5 shadow-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-xs font-mono mb-1">
            <CopyCheck className="w-3.5 h-3.5 text-slate-400" />
            Duplicates
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {duplicatesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Identical rows</div>
        </div>

      </div>

      {/* 2. Numeric Statistics Table */}
      {Object.keys(numericStats).length > 0 && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs mt-4">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Table className="w-3.5 h-3.5 text-indigo-500" />
              Numeric Sensor Variables (Calculated Bounds)
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {Object.keys(numericStats).length} measured variables
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Variable Name</th>
                  <th className="px-3 py-2.5 font-bold">Mapped Role</th>
                  <th className="px-3 py-2.5 font-bold text-right">Min</th>
                  <th className="px-3 py-2.5 font-bold text-right">Max</th>
                  <th className="px-3 py-2.5 font-bold text-right">Mean</th>
                  <th className="px-3 py-2.5 font-bold text-right">Std Dev (&sigma;)</th>
                  <th className="px-3 py-2.5 font-bold text-right">Samples</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(numericStats).map(([col, data], idx) => (
                  <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{col}</td>
                    <td className="px-3 py-2.5">
                      {data.canonical_name ? (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-semibold">
                          {data.canonical_name}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unmapped</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{data.min}</td>
                    <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{data.max}</td>
                    <td className="px-3 py-2.5 text-right font-bold text-indigo-600">{data.mean}</td>
                    <td className="px-3 py-2.5 text-right text-slate-600">&plusmn;{data.std_dev}</td>
                    <td className="px-3 py-2.5 text-right text-slate-500">{data.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. Categorical & Boolean Variables Table */}
      {Object.keys(categoricalStats).length > 0 && (
        <div className="rounded-xl bg-white border border-slate-200/90 overflow-hidden shadow-xs mt-3">
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-200/70 flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Categorical / State Variables Distribution
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {Object.keys(categoricalStats).length} discrete fields
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-50/50 text-slate-500 border-b border-slate-200/60">
                <tr>
                  <th className="px-4 py-2.5 font-bold">Column</th>
                  <th className="px-3 py-2.5 font-bold">Unique States</th>
                  <th className="px-3 py-2.5 font-bold">Distinct Values & Frequencies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {Object.entries(categoricalStats).map(([col, data], idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2.5 font-bold text-slate-800">{col}</td>
                    <td className="px-3 py-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[10px]">
                        {data.unique_count} distinct
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1.5 max-w-xl">
                        {Object.entries(data.value_distribution || {}).slice(0, 8).map(([val, count], vIdx) => (
                          <span
                            key={vIdx}
                            className="px-2 py-0.5 rounded-md bg-slate-50 border border-slate-200/80 text-[11px] text-slate-700 font-mono"
                          >
                            <span className="font-semibold text-slate-900">{val}:</span> {count}
                          </span>
                        ))}
                        {Object.keys(data.value_distribution || {}).length > 8 && (
                          <span className="text-[10px] text-slate-400 py-0.5">
                            +{Object.keys(data.value_distribution).length - 8} more
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
