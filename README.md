# SMART-MACHINE-MONITORING-AND-IDEAL-DETECTION-SYSTEM

A modern, responsive, multi-colored **Light Theme** IoT dashboard for an automated **Pen Refill Work Station** equipped with **Tool/Object Presence & Machine Idle Detection**. Built with React, Vite, Tailwind CSS, Recharts, and Firebase Realtime Database.


---

## 🛠️ System Architecture

```text
       +-----------------------+
       |   ESP8266 NodeMCU     |
       |  (Sensors & Relays)   |
       +-----------+-----------+
                   |
                   v (WiFi HTTPS / JSON)
       +-----------------------------------+
       |   Firebase Realtime Database      |
       |   Path: /smart_machine            |
       +-----------------+-----------------+
                         |
                         v (WebSockets / onValue listener)
       +-----------------------------------+
       |   React Real-Time Dashboard       |
       |   (Vite + Tailwind + Recharts)    |
       +-----------------------------------+
```

---

## 💡 Core Machine Safety & Idle Logic

The workstation's primary automation and protection logic:

1. **Tool / Object In Position (&le; 15 cm)**:
   - **Machine State**: `RUNNING`
   - **Object Detection**: `TOOL DETECTED`
   - **Dispenser Motor**: `ON` (Actively dispensing ink into pen refill)
   - **Status LED**: `SOLID ON`
   - **Safety Buzzer**: `OFF (SILENT)`

2. **No Object / Tool Detected (> 15 cm)**:
   - **Machine State**: `MACHINE IDLE`
   - **Object Detection**: `NO OBJECT / TOOL DETECTED`
   - **Dispenser Motor**: `OFF (STOPPED)` — **Machine stops automatically to prevent dry dispensing or mechanical damage**
   - **Status LED**: `BLINKING (WARNING)`
   - **Safety Buzzer**: `ON (ALARM)` — Sounds proximity alert

---

## 🌟 Key Features

- **Multi-Colored Light Theme**: Clean, vibrant white card layout with color-coded accent borders, high-contrast typography, and smooth micro-interactions.
- **Direct Firebase Realtime Sync**: Zero backend server required. Listens directly to `/smart_machine` with `onValue()`.
- **Live Connection Detection**: Uses Firebase system node `/.info/connected` to dynamically indicate connection status.
- **Master Machine Status**: Prominent visual banner switching dynamically between **RUNNING** and **MACHINE IDLE**.
- **4 Key Operational KPI Cards**:
  - **Tool / Object Distance**: Current reading with limit indicator.
  - **Object / Tool Detection**: `TOOL PRESENT` vs `NO OBJECT (MACHINE STOPS)`.
  - **Dispenser Motor**: `DISPENSING` vs `IDLE HALT`.
  - **Safety Buzzer Alarm**: `IDLE ALARM` vs `STANDBY`.
- **Tool Proximity & Idle Detection Gauge**:
  - Horizontal gauge with marked **15 cm Cut-Off Threshold**.
  - Dynamic evaluation status badge.
- **Distance & Idle Threshold Line Chart (Recharts)**:
  - Real-time line chart tracking tool distance over time.
  - Clearly marked **15 cm Machine Stop Limit** reference line.
- **Hardware Peripherals Panel**:
  - Dispenser Motor: Displays active rotation animation when running.
  - Workstation LED: Displays solid illumination when RUNNING and warning flash when IDLE.
  - Alert Buzzer: Displays visual pulsing alarm animation when active.
- **Collapsible Raw JSON Viewer**:
  - Formatted JSON payload viewer with 1-click clipboard copy for viva and presentation verification.

---

## ⚙️ Firebase Data Schema

The dashboard connects to node `/smart_machine`:

```json
{
  "machine_status": "RUNNING",
  "ultrasonic_distance_cm": 12,
  "object_detected": true,
  "motor_status": true,
  "led_status": true,
  "buzzer_status": false
}
```

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.
