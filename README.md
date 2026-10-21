# SMART-MACHINE-MONITORING-AND-IDLE-DETECTION-SYSTEM

A modern, responsive, multi-colored **Light Theme** IoT dashboard and **RAG-Powered AI Data Analyzer** for an automated **Pen Refill Work Station** equipped with **Tool/Object Presence & Machine Idle Detection**. Built with React, Vite, Tailwind CSS, Recharts, Firebase Realtime Database, FastAPI, and ChromaDB.

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
       +-----------------------------------+        +-----------------------------------+
       |   React Real-Time Dashboard       | <====> |   FastAPI RAG AI Data Analyzer    |
       |   (Vite + Tailwind + Recharts)    |  /api  |   (ChromaDB + Local ONNX / Gemini)|
       +-----------------------------------+        +-----------------+-----------------+
                                                                      |
                                                                      v
                                                    +-----------------------------------+
                                                    |  RAG Technical Knowledge Base     |
                                                    |  rag-knowledge-base/ & sample-data|
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
   - **Dispenser Motor**: `OFF (STOPPED)` — **Protective interlock halts motor to prevent dry dispensing or mechanical damage**
   - **Status LED**: `BLINKING (WARNING)`
   - **Safety Buzzer**: `ON (ALARM)` — Sounds proximity alert

---

## 🌟 Key Application Pages

### 1. 📊 Live Monitoring Dashboard
- **Direct Firebase Realtime Sync**: Zero backend server required for live monitoring. Listens directly to `/smart_machine` with `onValue()`.
- **Live Connection Detection**: Uses Firebase system node `/.info/connected` to dynamically indicate connection status.
- **Master Machine Status**: Prominent visual banner switching dynamically between **RUNNING** and **MACHINE IDLE**.
- **4 Key Operational KPI Cards**: Distance (cm), Presence (DETECTED vs NOT DETECTED), Motor (DISPENSING vs IDLE HALT), Safety Buzzer (STANDBY vs IDLE ALARM).
- **Proximity & Idle Gauge**: Horizontal interactive meter with marked 15 cm cut-off limit.
- **Live Distance Trend (Recharts)**: Real-time telemetry chart with 15 cm reference limit.
- **Hardware Actuators Panel**: Visual animation states for Motor, LED, and Buzzer.
- **Collapsible Raw JSON Viewer**: With 1-click clipboard copy.

### 2. 🤖 AI Data Analyzer (RAG-Powered)
- **Data Ingestion**: Drag-and-drop or browse CSV, JSON, and TXT sensor logs up to 10MB.
- **10 Synthetic Sample Datasets**: 1-click selector to immediately load and analyze any sample dataset.
- **RAG Data Classification**: Classifies telemetry into 10 target categories (or "Unknown / Insufficient Evidence") using local ChromaDB vector retrieval and workstation knowledge.
- **Deterministic Statistics**: Directly calculates record count, time range, min, max, mean, standard deviation, and categorical distribution without hallucination.
- **Adaptive Sensor Visualizations**: Dynamic Recharts (Distance vs Time, Running vs Idle timeline, Motor ON/OFF history, Buzzer events) that adapt strictly to available variables.
- **Workstation Operating Conditions Evaluation**: Evaluates compliance with the 15 cm tool presence boundary and protective motor halt interlock; detects anomalies and computes idle duration intervals.
- **“Why did AI classify this data?” Panel**: Transparent citations referencing `rag-knowledge-base/` documents, similarity scores, and model limitations.
- **Report Export**: Downloadable publication-quality HTML and print-ready PDF reports.

---

## 📁 Project Structure

```text
├── backend/
│   ├── app/
│   │   ├── analyzer/
│   │   │   ├── parser.py           # Multi-format CSV/JSON/TXT parser & preprocessor
│   │   │   ├── rules_engine.py     # 15cm threshold & safety interlock engine
│   │   │   └── statistics.py       # Deterministic numerical & categorical statistics
│   │   ├── rag/
│   │   │   ├── classifier.py       # RAG classification & reasoner module
│   │   │   ├── embeddings.py       # Local ONNX all-MiniLM-L6-v2 vector embeddings
│   │   │   └── vector_store.py     # ChromaDB persistence & semantic retrieval
│   │   ├── routes/
│   │   │   └── api.py              # FastAPI endpoints (/api/analyze-data, /api/sample-data, etc.)
│   │   ├── config.py               # Server & threshold configuration
│   │   └── main.py                 # FastAPI application entry point
│   ├── chroma_db/                  # Persistent ChromaDB vector collections
│   ├── ingest.py                   # Standalone CLI ingestion script
│   └── requirements.txt            # Python dependencies
├── rag-knowledge-base/             # Retrievable technical documentation
│   ├── anomaly-detection-guidelines.md
│   ├── data-schema-reference.md
│   ├── idle-detection-logic.md
│   ├── machine-operating-rules.md
│   ├── machine-state-classification.md
│   └── sensor-definitions.md
├── sample-data/                    # 10 realistic synthetic test datasets
│   ├── 01_ultrasonic_distance.csv
│   ├── 02_tool_presence.json
│   ├── 03_machine_running_idle.csv
│   ├── 04_dispenser_motor_status.json
│   ├── 05_buzzer_alert_logs.csv
│   ├── 06_status_led_logs.json
│   ├── 07_combined_machine_telemetry.csv
│   ├── 08_idle_duration_history.csv
│   ├── 09_anomalous_machine_events.json
│   ├── 10_unknown_sensor_dataset.csv
│   └── README.md
├── src/
│   ├── components/
│   │   ├── analyzer/               # AI Data Analyzer modular components
│   │   │   ├── AiDataAnalyzer.jsx
│   │   │   ├── ClassificationCard.jsx
│   │   │   ├── DataSummaryView.jsx
│   │   │   ├── MachineConditionCard.jsx
│   │   │   ├── RagEvidencePanel.jsx
│   │   │   ├── RawDataPreview.jsx
│   │   │   ├── ReportModal.jsx
│   │   │   ├── SensorChartsView.jsx
│   │   │   └── UploadZone.jsx
│   │   ├── Header.jsx              # Navigation tabs (Live Monitoring vs AI Data Analyzer)
│   │   ├── DistanceChart.jsx
│   │   ├── MachineComponents.jsx
│   │   ├── MachineStatus.jsx
│   │   ├── MetricCard.jsx
│   │   ├── RawFirebaseData.jsx
│   │   └── UltrasonicMonitor.jsx
│   ├── App.jsx                     # Root application
│   └── main.jsx
├── .env.example
├── package.json
└── vite.config.js                  # Includes /api proxy to FastAPI port 8000
```

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)

### 1. Start the Python RAG Backend
In terminal 1:
```bash
# Navigate to backend and install dependencies
cd backend
pip install -r requirements.txt

# (Optional) Rebuild the ChromaDB vector index
python ingest.py --rebuild

# Start the FastAPI service (runs on port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 2. Start the React Frontend
In terminal 2:
```bash
# Install Node dependencies
npm install

# Start Vite dev server (runs on port 5173 with /api proxy)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

- Use the top navigation bar to switch seamlessly between **Live Monitoring** and **AI Data Analyzer**.
