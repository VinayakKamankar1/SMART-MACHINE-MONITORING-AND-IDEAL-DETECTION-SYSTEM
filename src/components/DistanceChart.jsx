import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { Activity, ShieldAlert, TrendingDown } from "lucide-react";

// Custom Tooltip for Light Theme UI
function CustomChartTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const isUnderThreshold = val <= 15;
    return (
      <div className="bg-white border border-slate-200 p-3.5 rounded-xl shadow-xl font-mono text-xs ring-1 ring-slate-900/5">
        <p className="text-slate-500 mb-1 flex items-center justify-between gap-4 font-medium">
          <span>Timestamp:</span>
          <span className="text-slate-800 font-semibold">{label}</span>
        </p>
        <p className="text-slate-900 font-bold flex items-center justify-between gap-4">
          <span>Tool Distance:</span>
          <span className="text-indigo-600 text-sm">{val} cm</span>
        </p>
        <p className="mt-1.5 pt-1.5 border-t border-slate-100 text-[11px] flex items-center justify-between gap-2">
          <span>Machine Status:</span>
          <span className={isUnderThreshold ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
            {isUnderThreshold ? "TOOL PRESENT &bull; RUNNING" : "NO OBJECT &bull; MACHINE IDLE"}
          </span>
        </p>
      </div>
    );
  }
  return null;
}

export default function DistanceChart({ history = [] }) {
  const latestVal = history.length > 0 ? history[history.length - 1].distance : null;

  return (
    <div className="light-card rounded-2xl p-6 border border-slate-200/90 flex flex-col justify-between shadow-xs">
      <div>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-bold font-mono tracking-tight text-slate-900 flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
                <Activity className="w-4 h-4" />
              </span>
              TOOL DISTANCE & IDLE THRESHOLD HISTORY
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Workpiece proximity trace &bull; Above 15 cm halts machine automatically
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
              <span>15 cm Stop Limit</span>
            </div>
            <div className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              Current: <span className="text-indigo-600 font-bold">{latestVal !== null ? `${latestVal} cm` : "--"}</span>
            </div>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="h-64 sm:h-72 w-full pt-2">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 font-mono text-xs">
              <Activity className="w-8 h-8 mb-2 text-slate-300 animate-pulse" />
              <span>Awaiting telemetry stream to populate chart...</span>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="time"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  interval="preserveStartEnd"
                  fontFamily="JetBrains Mono, monospace"
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: "#e2e8f0" }}
                  domain={[0, (dataMax) => Math.max(Math.ceil((dataMax + 10) / 10) * 10, 40)]}
                  unit="cm"
                  fontFamily="JetBrains Mono, monospace"
                />
                <Tooltip content={<CustomChartTooltip />} />

                {/* 15 cm Trigger Threshold Reference Line */}
                <ReferenceLine
                  y={15}
                  stroke="#f59e0b"
                  strokeDasharray="4 4"
                  strokeWidth={2}
                  label={{
                    value: "15 cm Limit: Machine Stops Above",
                    fill: "#d97706",
                    fontSize: 10,
                    fontWeight: 700,
                    position: "right",
                    fontFamily: "JetBrains Mono, monospace",
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="distance"
                  stroke="#4f46e5"
                  strokeWidth={2.5}
                  dot={{ r: 2.5, fill: "#4f46e5", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-2 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <TrendingDown className="w-3.5 h-3.5 text-indigo-500" />
          Proximity Trend: &le;15cm = Tool Present, &gt;15cm = Machine Stops
        </span>
        <span className="font-semibold text-slate-600">Continuous FIFO Stream</span>
      </div>
    </div>
  );
}
