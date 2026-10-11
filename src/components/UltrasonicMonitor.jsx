import React from "react";
import { Waves, Target, CheckCircle2, AlertOctagon, Info, ShieldAlert, PauseCircle } from "lucide-react";

export default function UltrasonicMonitor({ distanceCm, isObjectDetected, isAvailable }) {
  const distance = typeof distanceCm === "number" ? distanceCm : null;
  const threshold = 15;
  const maxRange = 100;

  // Percentage for progress gauge (clamped 0 to 100)
  const percentage = distance !== null ? Math.min(Math.max((distance / maxRange) * 100, 0), 100) : 0;
  const thresholdPercentage = (threshold / maxRange) * 100; // 15%

  const detected = distance !== null ? distance <= threshold : isObjectDetected;

  return (
    <div className="light-card rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-xs">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold font-mono tracking-tight text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <Waves className="w-4 h-4" />
              </span>
              TOOL / OBJECT PROXIMITY & IDLE DETECTION
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workpiece proximity sensing &bull; Automatically stops machine if tool is absent
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold">
            0 - 100 CM SCALE
          </span>
        </div>

        {/* Big Value Display & Detection Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 items-center">
          
          {/* Distance Numerical Reading */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Tool / Workpiece Distance
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-slate-900">
                {distance !== null ? distance : "--"}
              </span>
              <span className="text-lg font-bold font-mono text-indigo-600">cm</span>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-600 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-indigo-500" />
              <span>Presence Cut-off:</span>
              <span className="text-amber-700 font-bold">&le; 15 cm</span>
            </div>
          </div>

          {/* Target Status Banner */}
          <div
            className={`rounded-2xl p-5 border flex flex-col justify-center transition-all shadow-xs ${
              !isAvailable
                ? "bg-slate-50 border-slate-200"
                : detected
                ? "bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/20 shadow-emerald-500/5"
                : "bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/20 shadow-amber-500/5"
            }`}
          >
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold block mb-1">
              Workstation Presence Logic
            </span>
            <div className="flex items-center gap-3">
              {!isAvailable ? (
                <div className="text-base font-mono font-bold text-slate-400">
                  WAITING SENSOR...
                </div>
              ) : detected ? (
                <>
                  <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0 shadow-sm shadow-emerald-500/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black font-mono tracking-tight text-emerald-800 block">
                      TOOL DETECTED
                    </span>
                    <p className="text-xs text-emerald-700 font-medium mt-0.5">
                      Pen refill in place &bull; Machine RUNNING
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-sm shadow-amber-500/30">
                    <PauseCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-base sm:text-lg font-black font-mono tracking-tight text-amber-800 block">
                      NO OBJECT / TOOL DETECTED
                    </span>
                    <p className="text-xs text-amber-800 font-medium mt-0.5">
                      MACHINE STOPS &bull; IDLE protection active
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>

        {/* Horizontal Distance Gauge Bar */}
        <div className="mt-4 bg-slate-50/90 p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex justify-between items-center text-xs font-mono text-slate-600 mb-2">
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              Distance Gauge & Cut-Off
            </span>
            <span className="text-amber-800 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              Machine Stops Above: 15 cm
            </span>
          </div>

          {/* Bar track */}
          <div className="relative h-6 bg-slate-200/80 rounded-xl overflow-hidden border border-slate-300">
            {/* Active filled indicator */}
            {distance !== null && (
              <div
                className={`h-full transition-all duration-300 ${
                  detected
                    ? "bg-gradient-to-r from-emerald-500 to-teal-400"
                    : "bg-gradient-to-r from-indigo-500 via-amber-500 to-rose-500"
                }`}
                style={{ width: `${percentage}%` }}
              />
            )}

            {/* Threshold Reference Indicator Line */}
            <div
              className="absolute top-0 bottom-0 w-1 bg-amber-500 z-10 shadow-[0_0_6px_rgba(245,158,11,0.9)]"
              style={{ left: `${thresholdPercentage}%` }}
              title="Cut-Off Threshold (15 cm)"
            />

            {/* Trigger zone background tint (0 - 15 cm) */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-emerald-500/15 pointer-events-none border-r border-dashed border-emerald-600"
              style={{ width: `${thresholdPercentage}%` }}
            />
          </div>

          {/* Scale Labels */}
          <div className="relative flex justify-between text-[11px] font-mono text-slate-500 font-semibold mt-2 px-0.5">
            <span>0 cm</span>
            <span
              className="absolute text-amber-700 font-black transform -translate-x-1/2"
              style={{ left: `${thresholdPercentage}%` }}
            >
              15 cm (Stop Threshold)
            </span>
            <span>25 cm</span>
            <span>50 cm</span>
            <span>75 cm</span>
            <span>100 cm</span>
          </div>
        </div>
      </div>

      {/* Sensor Specification Subtext */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          Sensor: HC-SR04 Proximity Transducer
        </span>
        <span className="text-amber-700 font-semibold">No Tool = Machine Stops Automatically</span>
      </div>
    </div>
  );
}
