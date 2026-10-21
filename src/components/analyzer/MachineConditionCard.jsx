import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  HelpCircle,
  Activity,
  Zap,
  Info
} from "lucide-react";

export default function MachineConditionCard({ conditionAnalysis }) {
  if (!conditionAnalysis) return null;

  const {
    applicable_rules = [],
    tool_presence_summary,
    tool_present_count = 0,
    tool_absent_count = 0,
    running_count = 0,
    idle_count = 0,
    anomalies_detected = [],
    total_anomalies = 0,
    safety_rule_violations = [],
    idle_duration_analysis
  } = conditionAnalysis;

  const hasAnomalies = total_anomalies > 0;
  const hasViolations = safety_rule_violations && safety_rule_violations.length > 0;

  return (
    <div className="space-y-4">
      
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg border ${hasViolations ? "bg-rose-50 border-rose-200 text-rose-600" : "bg-emerald-50 border-emerald-200 text-emerald-600"}`}>
          {hasViolations ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
        </div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Workstation Safety & Operational Condition Analysis
        </h3>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
          hasViolations
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : hasAnomalies
            ? "bg-amber-50 text-amber-700 border-amber-200"
            : "bg-emerald-50 text-emerald-700 border-emerald-200"
        }`}>
          {hasViolations ? "SAFETY VIOLATIONS FOUND" : hasAnomalies ? "ANOMALIES DETECTED" : "NOMINAL OPERATING RULES"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Card 1: Tool / Workpiece Presence Ratio */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Workpiece Proximity Status</span>
            <span className="text-[10px] text-blue-600 font-bold">&le; 15.0 cm rule</span>
          </div>
          <div className="text-sm font-semibold text-slate-800">
            {tool_presence_summary}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden flex">
              {tool_present_count + tool_absent_count > 0 ? (
                <>
                  <div
                    style={{ width: `${(tool_present_count / (tool_present_count + tool_absent_count)) * 100}%` }}
                    className="bg-emerald-500"
                    title={`Present: ${tool_present_count}`}
                  />
                  <div
                    style={{ width: `${(tool_absent_count / (tool_present_count + tool_absent_count)) * 100}%` }}
                    className="bg-amber-500"
                    title={`Absent: ${tool_absent_count}`}
                  />
                </>
              ) : (
                <div className="w-full bg-slate-200" />
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span className="text-emerald-700 font-semibold">Present: {tool_present_count}</span>
            <span className="text-amber-700 font-semibold">Absent: {tool_absent_count}</span>
          </div>
        </div>

        {/* Card 2: Idle Duration & Duty Cycle */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Workstation Idle Duration</span>
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          
          {idle_duration_analysis && idle_duration_analysis.supported ? (
            <div className="space-y-1.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Idle Time:</span>
                <span className="font-bold text-amber-600">{idle_duration_analysis.formatted_idle_time}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Total Running Time:</span>
                <span className="font-bold text-emerald-600">{idle_duration_analysis.formatted_running_time}</span>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                <span className="text-slate-500">Operational Duty Cycle:</span>
                <span className="font-bold text-indigo-600">{idle_duration_analysis.operational_duty_cycle_pct}%</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 italic py-2">
              {idle_duration_analysis?.reason || "Not calculable: dataset lacks chronological timestamps or status transitions."}
            </div>
          )}
        </div>

        {/* Card 3: Interlock Consistency Summary */}
        <div className="rounded-xl bg-white border border-slate-200/90 p-4 shadow-xs">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-500 uppercase tracking-wider mb-2">
            <span>Protective Interlock Status</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          
          {hasViolations ? (
            <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-rose-800 text-xs">
              <div className="font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                Interlock Violation Detected!
              </div>
              <p className="mt-0.5 text-[11px] leading-snug">
                Dispenser motor was active while workpiece was confirmed absent!
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2 text-emerald-800 text-xs">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                No Interlock Violations
              </div>
              <p className="mt-0.5 text-[11px] leading-snug">
                Dispenser motor state is fully consistent with workpiece detection boundaries.
              </p>
            </div>
          )}

          <div className="mt-2 text-[11px] text-slate-500">
            Total Anomalies Found: <strong className="font-mono text-slate-800">{total_anomalies}</strong>
          </div>
        </div>

      </div>

      {/* Anomalies List (if any detected) */}
      {anomalies_detected.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4 shadow-xs mt-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-200/80 mb-3">
            <span className="text-xs font-mono font-bold text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Potential Machine Anomalies & Out-of-Spec Excursions ({anomalies_detected.length})
            </span>
            <span className="text-[10px] text-rose-700 font-mono">
              Candidates for Technical Investigation
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {anomalies_detected.map((a, idx) => (
              <div
                key={idx}
                className="rounded-lg bg-white border border-rose-200/90 p-2.5 text-xs text-slate-800 flex items-start gap-2.5 shadow-2xs"
              >
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 ${
                  a.severity === "CRITICAL"
                    ? "bg-rose-100 text-rose-800 border border-rose-300"
                    : "bg-amber-100 text-amber-800 border border-amber-300"
                }`}>
                  {a.severity}
                </span>
                <div className="flex-1">
                  <div className="font-mono font-bold text-slate-900 text-[11px]">
                    {a.type} &bull; Sample #{a.record_index}
                  </div>
                  <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed">
                    {a.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
