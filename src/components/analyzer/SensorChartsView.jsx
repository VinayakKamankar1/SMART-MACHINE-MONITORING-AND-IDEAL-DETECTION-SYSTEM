import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from "recharts";
import {
  Activity,
  Ruler,
  RotateCw,
  Volume2,
  Info
} from "lucide-react";

export default function SensorChartsView({ chartData }) {
  if (!chartData || !chartData.points || chartData.points.length === 0) {
    return null;
  }

  const {
    points,
    has_distance,
    has_status,
    has_motor,
    has_buzzer,
    distance_field,
    status_field,
    motor_field,
    buzzer_field,
    threshold_cm = 15.0
  } = chartData;

  const hasAnyChart = has_distance || has_status || has_motor || has_buzzer;

  if (!hasAnyChart) {
    return (
      <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-center text-xs text-slate-500 font-mono flex items-center justify-center gap-2">
        <Info className="w-4 h-4 text-slate-400" />
        No standard workstation physical series (distance, motor, buzzer, or state) detected in dataset to visualize.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-blue-50 border border-blue-200 text-blue-600">
          <Activity className="w-4 h-4" />
        </div>
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          Physical Sensor Visualizations & Chronology
        </h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          Adapts to Detected Variables Only
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* 1. Distance Over Time Line Chart */}
        {has_distance && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Ruler className="w-4 h-4 text-blue-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Ultrasonic Distance Telemetry
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  Column: {distance_field}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Live readings tracking tool proximity. Red dashed line indicates the <strong>15.0 cm</strong> workstation protective stop threshold.
              </p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    domain={[0, "auto"]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                    unit="cm"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                    }}
                    formatter={(val) => [`${val} cm`, "Tool Distance"]}
                  />
                  <ReferenceLine
                    y={threshold_cm}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Stop Limit (${threshold_cm} cm)`,
                      fill: "#ef4444",
                      fontSize: 10,
                      position: "insideTopRight"
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={points.length < 35 ? { r: 3, fill: "#2563eb" } : false}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 2. Machine Running vs Idle Timeline */}
        {has_status && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Machine Operating State Timeline
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  Column: {status_field}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Operational state transitions: <strong>1 = RUNNING</strong> (normal dispensing), <strong>0 = MACHINE IDLE</strong> (safety halt).
              </p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    domain={[0, 1.2]}
                    ticks={[0, 1]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                    tickFormatter={(val) => (val === 1 ? "RUN" : "IDLE")}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px"
                    }}
                    formatter={(val, name, item) => [item.payload.status_label || (val === 1 ? "RUNNING" : "IDLE"), "Machine State"]}
                  />
                  <Area
                    type="stepAfter"
                    dataKey="status_val"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 3. Dispenser Motor State History */}
        {has_motor && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <RotateCw className="w-4 h-4 text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Dispenser Motor Actuation History
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                  Column: {motor_field}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Dispenser feed motor state: <strong>1 = ON</strong> (ink dispensing), <strong>0 = OFF</strong> (stopped).
              </p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    domain={[0, 1.2]}
                    ticks={[0, 1]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                    tickFormatter={(val) => (val === 1 ? "ON" : "OFF")}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px"
                    }}
                    formatter={(val, name, item) => [item.payload.motor_label || (val === 1 ? "ON" : "OFF"), "Motor State"]}
                  />
                  <Area
                    type="stepAfter"
                    dataKey="motor_val"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* 4. Safety Buzzer Alert Timeline */}
        {has_buzzer && (
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-rose-600" />
                  <h4 className="text-sm font-bold text-slate-800">
                    Safety Buzzer Alert Trigger Events
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold">
                  Column: {buzzer_field}
                </span>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Acoustic alarm activations: <strong>1 = ALARM ACTIVE</strong>, <strong>0 = SILENT</strong> (normal operating condition).
              </p>
            </div>

            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={points} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                  />
                  <YAxis
                    domain={[0, 1.2]}
                    ticks={[0, 1]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    stroke="#cbd5e1"
                    tickFormatter={(val) => (val === 1 ? "ALARM" : "OFF")}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      borderRadius: "8px",
                      border: "1px solid #cbd5e1",
                      fontSize: "11px"
                    }}
                    formatter={(val, name, item) => [item.payload.buzzer_label || (val === 1 ? "ACTIVE" : "SILENT"), "Buzzer Alarm"]}
                  />
                  <Bar
                    dataKey="buzzer_val"
                    fill="#f43f5e"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
