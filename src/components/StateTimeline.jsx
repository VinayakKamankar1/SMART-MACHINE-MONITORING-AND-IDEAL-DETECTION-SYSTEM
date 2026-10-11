import React from "react";
import { History, Clock, ArrowRight } from "lucide-react";

export default function StateTimeline({ stateHistory = [] }) {
  return (
    <div className="industrial-card rounded-xl p-5 border flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              State Transitions
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            {stateHistory.length} events logged
          </span>
        </div>

        {/* State log list */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {stateHistory.length === 0 ? (
            <div className="py-6 text-center text-xs font-mono text-slate-500">
              No state changes recorded yet
            </div>
          ) : (
            stateHistory.map((item, index) => {
              const isRunning = item.status === "RUNNING";
              return (
                <div
                  key={`${item.time}-${index}`}
                  className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-mono hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{item.time}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-block w-2 h-2 rounded-full ${
                        isRunning ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" : "bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]"
                      }`}
                    />
                    <span
                      className={`font-bold ${
                        isRunning ? "text-emerald-400" : "text-amber-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="pt-3 border-t border-slate-800/60 mt-3 text-[10px] font-mono text-slate-500 flex items-center justify-between">
        <span>Session Client-Side Memory</span>
        <span className="flex items-center gap-1 text-slate-400">
          Real-time FIFO <ArrowRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
}
