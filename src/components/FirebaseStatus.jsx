import React from "react";
import { Database, Radio, Server, Activity, ArrowUpRight } from "lucide-react";

export default function FirebaseStatus({
  isConnected,
  lastUpdateAgo,
  packetCount,
  updatePing
}) {
  return (
    <div className="industrial-card rounded-xl p-5 border flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold">
              Firebase RTDB Data
            </h4>
          </div>
          
          {/* Data Reception Ping Indicator */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                updatePing
                  ? "bg-emerald-400 shadow-[0_0_10px_#34d399] scale-125"
                  : isConnected
                  ? "bg-emerald-600"
                  : "bg-red-500"
              }`}
            />
            <span className="text-[10px] font-mono text-slate-400">
              {updatePing ? "RX RECV" : isConnected ? "SYNCED" : "OFFLINE"}
            </span>
          </div>
        </div>

        {/* Data Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
          
          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">
              Database
            </span>
            <span
              className={`font-bold flex items-center gap-1.5 ${
                isConnected ? "text-emerald-400" : "text-red-400"
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">
              Path
            </span>
            <span className="text-blue-400 font-semibold truncate block" title="/smart_machine">
              /smart_machine
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">
              Last Update
            </span>
            <span className="text-slate-200 font-semibold">
              {lastUpdateAgo || "Awaiting..."}
            </span>
          </div>

          <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] uppercase text-slate-500 block mb-1">
              Packets Received
            </span>
            <span className="text-cyan-400 font-semibold">
              {packetCount} RX
            </span>
          </div>

        </div>
      </div>

      {/* Sub Footer */}
      <div className="pt-3 border-t border-slate-800/60 mt-4 flex items-center justify-between text-[10px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Server className="w-3 h-3 text-slate-500" />
          smartirrigation-c0009
        </span>
        <span className="text-slate-400 flex items-center gap-0.5">
          WebSocket RTDB <ArrowUpRight className="w-2.5 h-2.5" />
        </span>
      </div>
    </div>
  );
}
