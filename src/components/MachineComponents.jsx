import React from "react";
import { RotateCw, Lightbulb, Volume2, Cpu, CheckCircle2, AlertTriangle, Power } from "lucide-react";

export default function MachineComponents({
  motorStatus,
  buzzerStatus,
  ledStatus,
  machineStatus,
  rawDataAvailable
}) {
  const isAvailable = Boolean(rawDataAvailable);
  const isRunning = (machineStatus || "").toString().trim().toUpperCase() === "RUNNING";

  // Motor state
  const isMotorOn = isAvailable && Boolean(motorStatus);

  // Buzzer state
  const isBuzzerOn = isAvailable && Boolean(buzzerStatus);

  // LED state
  const isLedActive = isAvailable && (Boolean(ledStatus) || !isAvailable);
  const ledDisplayMode = !isAvailable ? "--" : isRunning ? "SOLID ON" : "BLINKING";

  return (
    <div className="light-card rounded-2xl p-6 border border-slate-200/90 shadow-xs">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
        <div>
          <h3 className="text-base font-bold font-mono tracking-tight text-slate-900 flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600 border border-purple-200/60">
              <Cpu className="w-4 h-4" />
            </span>
            MACHINE ACTUATORS & ALARM PERIPHERALS
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Hardware output relays: Motor stops automatically when tool is absent
          </p>
        </div>
        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
          3 CHANNELS
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* COMPONENT 1: Motor */}
        <div
          className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-xs ${
            !isAvailable
              ? "bg-slate-50 border-slate-200"
              : isMotorOn
              ? "bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400/20"
              : "bg-slate-50/80 border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border transition-all shadow-xs ${
                  !isAvailable
                    ? "bg-slate-100 text-slate-400 border-slate-200"
                    : isMotorOn
                    ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-500/20"
                    : "bg-slate-200 text-slate-600 border-slate-300"
                }`}
              >
                <RotateCw
                  className={`w-6 h-6 ${isMotorOn ? "animate-spin-slow text-white" : ""}`}
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Dispenser Motor</h4>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">Ink Pump Actuator</span>
              </div>
            </div>

            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                !isAvailable
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : isMotorOn
                  ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              {!isAvailable ? "--" : isMotorOn ? "ON" : "OFF"}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Operation:</span>
            <span className={isMotorOn ? "text-emerald-700 font-bold" : "text-rose-600 font-bold"}>
              {!isAvailable ? "Offline" : isMotorOn ? "Refilling Pen..." : "Stopped (No Tool)"}
            </span>
          </div>
        </div>

        {/* COMPONENT 2: LED */}
        <div
          className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-xs ${
            !isAvailable
              ? "bg-slate-50 border-slate-200"
              : isRunning
              ? "bg-indigo-50/90 border-indigo-300 ring-1 ring-indigo-400/20"
              : "bg-amber-50/90 border-amber-300 ring-1 ring-amber-400/20"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border transition-all shadow-xs ${
                  !isAvailable
                    ? "bg-slate-100 text-slate-400 border-slate-200"
                    : isRunning
                    ? "bg-indigo-500 text-white border-indigo-400 shadow-indigo-500/20"
                    : "bg-amber-500 text-white border-amber-400 shadow-amber-500/20"
                }`}
              >
                <Lightbulb
                  className={`w-6 h-6 ${
                    !isRunning && isAvailable
                      ? "animate-led-blink text-amber-200"
                      : isRunning
                      ? "text-white"
                      : "text-slate-400"
                  }`}
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Workstation LED</h4>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">Visual Indicator</span>
              </div>
            </div>

            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                !isAvailable
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : isRunning
                  ? "bg-indigo-100 text-indigo-800 border-indigo-300"
                  : "bg-amber-100 text-amber-800 border-amber-300"
              }`}
            >
              {ledDisplayMode}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Indicator Mode:</span>
            <span
              className={
                !isAvailable
                  ? "text-slate-400 font-semibold"
                  : isRunning
                  ? "text-indigo-700 font-bold"
                  : "text-amber-800 font-bold"
              }
            >
              {!isAvailable ? "Offline" : isRunning ? "Normal Operation" : "Idle Warning Flash"}
            </span>
          </div>
        </div>

        {/* COMPONENT 3: Buzzer */}
        <div
          className={`rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between shadow-xs ${
            !isAvailable
              ? "bg-slate-50 border-slate-200"
              : isBuzzerOn
              ? "bg-rose-50/90 border-rose-300 ring-1 ring-rose-400/20"
              : "bg-slate-50/80 border-slate-200/90"
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-xl border transition-all shadow-xs ${
                  !isAvailable
                    ? "bg-slate-100 text-slate-400 border-slate-200"
                    : isBuzzerOn
                    ? "bg-rose-500 text-white border-rose-400 shadow-rose-500/20"
                    : "bg-slate-200 text-slate-600 border-slate-300"
                }`}
              >
                <Volume2
                  className={`w-6 h-6 ${
                    isBuzzerOn ? "animate-buzzer text-white" : "text-slate-600"
                  }`}
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Alert Buzzer</h4>
                <span className="text-[10px] font-mono text-slate-500 font-semibold">Idle Safety Alarm</span>
              </div>
            </div>

            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border ${
                !isAvailable
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : isBuzzerOn
                  ? "bg-rose-100 text-rose-800 border-rose-300 animate-pulse"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {!isAvailable ? "--" : isBuzzerOn ? "ON (ALARM)" : "OFF (SILENT)"}
            </span>
          </div>

          <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-500">Alarm State:</span>
            <span className={isBuzzerOn ? "text-rose-700 font-bold" : "text-emerald-700 font-bold"}>
              {!isAvailable ? "Offline" : isBuzzerOn ? "Alerting: No Object" : "Silent (Normal)"}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
