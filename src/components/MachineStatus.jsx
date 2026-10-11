import React from "react";
import { PlayCircle, StopCircle, AlertCircle, Cog, ShieldCheck, Gauge, CheckCircle2, AlertTriangle } from "lucide-react";

export default function MachineStatus({ status, rawData, isConnected }) {
  const isAvailable = Boolean(rawData);
  const statusUpper = (status || "").toString().trim().toUpperCase();
  const isRunning = statusUpper === "RUNNING";
  const isIdle = statusUpper === "IDLE";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 shadow-sm ${
        !isAvailable
          ? "bg-white border-slate-200 text-slate-500"
          : isRunning
          ? "bg-gradient-to-r from-emerald-50/90 via-teal-50/40 to-white border-emerald-300/80 shadow-emerald-500/5 ring-1 ring-emerald-400/20"
          : "bg-gradient-to-r from-amber-50/90 via-orange-50/40 to-white border-amber-300/80 shadow-amber-500/5 ring-1 ring-amber-400/20"
      }`}
    >
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        
        {/* Left Side: Status Icon & Machine State */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl flex items-center justify-center shrink-0 border transition-all shadow-sm ${
              !isAvailable
                ? "bg-slate-100 border-slate-200 text-slate-400"
                : isRunning
                ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/30 ring-4 ring-emerald-100"
                : "bg-amber-500 text-white border-amber-400 shadow-amber-500/30 ring-4 ring-amber-100"
            }`}
          >
            {!isAvailable ? (
              <AlertCircle className="w-8 h-8 text-slate-400" />
            ) : isRunning ? (
              <PlayCircle className="w-9 h-9 sm:w-10 sm:h-10 animate-pulse" />
            ) : (
              <StopCircle className="w-9 h-9 sm:w-10 sm:h-10" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                Work Station Idle & Safety Monitor
              </span>
              <span
                className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border ${
                  !isAvailable
                    ? "bg-slate-100 text-slate-500 border-slate-200"
                    : isRunning
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {!isAvailable ? "OFFLINE" : isRunning ? "TOOL IN PLACE" : "NO OBJECT DETECTED"}
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-mono">
                {!isAvailable ? (
                  <span className="text-slate-400">WAITING TELEMETRY</span>
                ) : isRunning ? (
                  <span className="text-emerald-700 font-black">
                    RUNNING
                  </span>
                ) : isIdle ? (
                  <span className="text-amber-700 font-black">
                    MACHINE IDLE
                  </span>
                ) : (
                  <span className="text-slate-700">{status || "--"}</span>
                )}
              </h2>
            </div>

            <p className="text-sm font-medium mt-1">
              {!isAvailable ? (
                <span className="text-slate-400">Machine Data Unavailable</span>
              ) : isRunning ? (
                <span className="text-emerald-800 flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Tool detected in workstation &bull; Refill motor active
                </span>
              ) : (
                <span className="text-amber-900 flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  No tool or object detected &bull; Machine stopped to prevent dry run
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right Side: Quick Diagnostic Telemetry Details */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-200/80">
          
          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 min-w-[140px] shadow-xs">
            <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold flex items-center gap-1">
              <Cog className="w-3.5 h-3.5 text-indigo-500" />
              Dispenser Drive
            </div>
            <div className="text-sm font-mono font-bold mt-0.5">
              {!isAvailable ? (
                <span className="text-slate-400">--</span>
              ) : isRunning ? (
                <span className="text-emerald-600">MOTOR ON</span>
              ) : (
                <span className="text-rose-600">STOPPED (IDLE)</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-2.5 min-w-[140px] shadow-xs">
            <div className="text-[11px] font-mono uppercase text-slate-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              Safety Interlock
            </div>
            <div className="text-sm font-mono font-bold mt-0.5">
              {!isAvailable ? (
                <span className="text-slate-400">--</span>
              ) : isRunning ? (
                <span className="text-emerald-600">NORMAL RUN</span>
              ) : (
                <span className="text-amber-600">SAFETY HALT</span>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
