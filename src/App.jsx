import React, { useState, useEffect, useRef } from "react";
import { onValue } from "firebase/database";
import { machineRef, connectedRef } from "./firebase/firebaseConfig";

// Components
import Header from "./components/Header";
import MachineStatus from "./components/MachineStatus";
import MetricCard from "./components/MetricCard";
import MachineComponents from "./components/MachineComponents";
import UltrasonicMonitor from "./components/UltrasonicMonitor";
import DistanceChart from "./components/DistanceChart";
import RawFirebaseData from "./components/RawFirebaseData";

// Icons
import {
  Ruler,
  Target,
  RotateCw,
  Volume2,
  AlertCircle,
  RefreshCw,
  Cpu,
  ShieldAlert,
} from "lucide-react";

export default function App() {
  const [rawData, setRawData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdateTimestamp, setLastUpdateTimestamp] = useState(null);
  const [lastUpdateAgo, setLastUpdateAgo] = useState("");
  const [updatePing, setUpdatePing] = useState(false);

  // Client-side distance history for the graph
  const [distanceHistory, setDistanceHistory] = useState([]);

  // 1. Listen for Firebase connection status (/.info/connected)
  useEffect(() => {
    const unsubscribe = onValue(
      connectedRef,
      (snapshot) => {
        const connected = Boolean(snapshot.val());
        setIsConnected(connected);
      },
      (error) => {
        console.error("Firebase connection listener error:", error);
        setIsConnected(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Listen for Real-Time Machine Data (/smart_machine)
  useEffect(() => {
    const unsubscribe = onValue(
      machineRef,
      (snapshot) => {
        const data = snapshot.val();
        const now = new Date();
        const timeStr = now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

        setRawData(data);
        setLastUpdateTimestamp(now);

        // Flash ping indicator
        setUpdatePing(true);
        const timer = setTimeout(() => setUpdatePing(false), 500);

        if (data) {
          // Push to distance history (limit to last 50 readings)
          if (typeof data.ultrasonic_distance_cm === "number") {
            setDistanceHistory((prev) => {
              const updated = [
                ...prev,
                { time: timeStr, distance: data.ultrasonic_distance_cm },
              ];
              return updated.slice(-50);
            });
          }
        }

        return () => clearTimeout(timer);
      },
      (error) => {
        console.error("Firebase /smart_machine listener error:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  // 3. Update "Last Update" relative timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (!lastUpdateTimestamp) {
        setLastUpdateAgo("Awaiting data...");
        return;
      }

      const diffSec = Math.floor((new Date().getTime() - lastUpdateTimestamp.getTime()) / 1000);
      if (diffSec < 2) {
        setLastUpdateAgo("Just now");
      } else if (diffSec < 60) {
        setLastUpdateAgo(`${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setLastUpdateAgo(`${diffMin}m ago`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lastUpdateTimestamp]);

  // Safe field extraction with fallback defaults
  const isAvailable = rawData !== null && rawData !== undefined;
  const distance = isAvailable && typeof rawData.ultrasonic_distance_cm === "number" ? rawData.ultrasonic_distance_cm : null;
  const objectDetected = isAvailable && typeof rawData.object_detected === "boolean" ? rawData.object_detected : (distance !== null ? distance <= 15 : null);
  const motorStatus = isAvailable && typeof rawData.motor_status === "boolean" ? rawData.motor_status : null;
  const buzzerStatus = isAvailable && typeof rawData.buzzer_status === "boolean" ? rawData.buzzer_status : null;
  const ledStatus = isAvailable && typeof rawData.led_status === "boolean" ? rawData.led_status : null;
  const machineStatus = isAvailable && rawData.machine_status ? String(rawData.machine_status).toUpperCase() : null;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex flex-col colorful-mesh-bg relative overflow-x-hidden">
      
      {/* Ambient Multi-Colored Background Lighting Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/15 blur-3xl" />
        <div className="absolute top-20 -right-24 w-[400px] h-[400px] rounded-full bg-gradient-to-bl from-pink-500/18 to-rose-400/12 blur-3xl" />
        <div className="absolute top-1/3 left-1/3 w-[360px] h-[360px] rounded-full bg-gradient-to-tr from-sky-400/15 to-blue-500/10 blur-3xl" />
        <div className="absolute top-2/3 -right-16 w-[420px] h-[420px] rounded-full bg-gradient-to-tl from-emerald-400/18 to-teal-400/12 blur-3xl" />
        <div className="absolute bottom-10 -left-16 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-amber-400/18 to-orange-400/12 blur-3xl" />
      </div>

      {/* 1. Header */}
      <div className="relative z-10">
        <Header
          isConnected={isConnected}
          lastUpdateTime={lastUpdateAgo}
          updatePing={updatePing}
        />
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        
        {/* Offline / Waiting Banner if Firebase or Data not ready */}
        {!isAvailable && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 flex items-center justify-between text-amber-900 shadow-xs">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <h4 className="text-sm font-bold font-mono">
                  Connecting to Machine Stream...
                </h4>
                <p className="text-xs text-amber-800 mt-0.5">
                  Listening to Firebase node <code className="bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200 font-bold">/smart_machine</code>. Telemetry will automatically reflect once ESP8266 transmits.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-amber-700 font-semibold">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-600" />
              <span className="hidden sm:inline">Waiting for Data...</span>
            </div>
          </div>
        )}

        {/* 2. Main Machine Status Banner */}
        <section aria-label="Machine Status">
          <MachineStatus
            status={machineStatus}
            rawData={rawData}
            isConnected={isConnected}
          />
        </section>

        {/* 3. 4 Main KPI Cards Overview (Multi-Color Styled) */}
        <section aria-label="Key Performance Indicators">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Tool / Object Distance */}
            <MetricCard
              title="Tool / Object Distance"
              value={distance !== null ? distance : "--"}
              unit={distance !== null ? "cm" : ""}
              description={distance !== null && distance > 15 ? "Machine Stops: Beyond 15 cm threshold" : "Tool in range (&le; 15 cm)"}
              icon={Ruler}
              statusType={distance !== null ? (distance <= 15 ? "success" : "warning") : "offline"}
              isMissing={distance === null}
              extraBadge={
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  HC-SR04 SENSOR
                </span>
              }
            />

            {/* Card 2: Object / Tool Presence */}
            <MetricCard
              title="Object / Tool Detection"
              value={
                objectDetected === null
                  ? "--"
                  : objectDetected
                  ? "DETECTED"
                  : "NOT DETECTED"
              }
              description={objectDetected ? "Workpiece in position &bull; Active" : "No Object: Machine Enters IDLE"}
              icon={Target}
              statusType={
                objectDetected === null
                  ? "offline"
                  : objectDetected
                  ? "success"
                  : "danger"
              }
              isMissing={objectDetected === null}
              extraBadge={
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    objectDetected
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {objectDetected ? "TOOL PRESENT" : "NO OBJECT"}
                </span>
              }
            />

            {/* Card 3: Motor Status */}
            <MetricCard
              title="Dispenser Motor"
              value={
                motorStatus === null ? "--" : motorStatus ? "ON" : "OFF"
              }
              description={motorStatus ? "Actuator dispensing ink" : "Motor Stopped (No Tool Detected)"}
              icon={RotateCw}
              statusType={
                motorStatus === null
                  ? "offline"
                  : motorStatus
                  ? "success"
                  : "warning"
              }
              isMissing={motorStatus === null}
              extraBadge={
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    motorStatus
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-800 border-amber-200"
                  }`}
                >
                  {motorStatus ? "DISPENSING" : "IDLE HALT"}
                </span>
              }
            />

            {/* Card 4: Buzzer Alarm */}
            <MetricCard
              title="Safety Buzzer Alarm"
              value={
                buzzerStatus === null ? "--" : buzzerStatus ? "ON" : "OFF"
              }
              description={buzzerStatus ? "Alarm: Workstation Idle / No Object" : "Silent: Machine in normal operation"}
              icon={Volume2}
              statusType={
                buzzerStatus === null
                  ? "offline"
                  : buzzerStatus
                  ? "danger"
                  : "success"
              }
              isMissing={buzzerStatus === null}
              extraBadge={
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full border font-bold ${
                    buzzerStatus
                      ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {buzzerStatus ? "IDLE ALARM" : "STANDBY"}
                </span>
              }
            />

          </div>
        </section>

        {/* 4. Tool/Object Proximity Gauge & Distance History Chart */}
        <section aria-label="Tool Presence Telemetry & Trend" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5">
            <UltrasonicMonitor
              distanceCm={distance}
              isObjectDetected={objectDetected}
              isAvailable={isAvailable}
            />
          </div>
          <div className="lg:col-span-7">
            <DistanceChart history={distanceHistory} />
          </div>
        </section>

        {/* 5. Hardware Actuators Visual Panel */}
        <section aria-label="Machine Peripherals & Relays">
          <MachineComponents
            motorStatus={motorStatus}
            buzzerStatus={buzzerStatus}
            ledStatus={ledStatus}
            machineStatus={machineStatus}
            rawDataAvailable={isAvailable}
          />
        </section>

        {/* 6. Raw Sensor Data (Collapsible) */}
        <section aria-label="Raw Firebase Payload">
          <RawFirebaseData rawData={rawData} />
        </section>

      </main>

      {/* Modern Light Theme Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 bg-white/80 backdrop-blur-md py-4 text-xs font-mono text-slate-500 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span className="font-semibold text-slate-700">IoT Pen Refill Work Station &bull; Machine Idle & Tool Detection</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>ESP8266 &bull; Firebase RTDB</span>
            <span className="text-indigo-600 font-bold">Auto-Stop Protective Interlock</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
