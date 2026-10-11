import React, { useState, useEffect } from "react";
import { Factory, Wifi, WifiOff, Clock, Activity, Cpu } from "lucide-react";

export default function Header({ isConnected, lastUpdateTime, updatePing }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });

  const formattedDate = currentTime.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <header className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Left: Branding & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-md shadow-indigo-500/20">
              <Factory className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  SMART MACHINE MONITORING
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold hidden md:inline-block">
                    Idle Detection System
                  </span>
                </h1>
              </div>
              <p className="text-xs sm:text-sm font-medium text-slate-500 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                IoT-Based Pen Refill Work Station
              </p>
            </div>
          </div>

          {/* Right: Status Indicators & Time */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
            
            {/* Firebase Connection Indicator */}
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                isConnected
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 shadow-xs shadow-emerald-500/10"
                  : "bg-rose-50 text-rose-700 border-rose-200 shadow-xs shadow-rose-500/10"
              }`}
            >
              {isConnected ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Firebase Connected</span>
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600" />
                  <span>Firebase Disconnected</span>
                </>
              )}
            </div>

            {/* Last Data Sync Ping */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-100 text-slate-700 border border-slate-200/90 shadow-xs">
              <span
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  updatePing ? "bg-blue-600 scale-125 shadow-xs shadow-blue-500" : "bg-slate-400"
                }`}
                title="Data Packet Ping"
              />
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-slate-500">Sync:</span>
              <span className="text-slate-800 font-semibold">{lastUpdateTime || "Waiting..."}</span>
            </div>

            {/* Clock */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono bg-slate-50 text-slate-600 border border-slate-200/80 shadow-xs">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDate}</span>
              <span className="text-slate-300">|</span>
              <span className="text-indigo-600 font-bold">{formattedTime}</span>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
