# Sample Datasets for AI Data Analyzer (RAG Classification)

> **⚠️ SYNTHETIC TEST DATA NOTICE**
> All files in this directory contain **synthetically generated test records** designed specifically to evaluate the RAG-based machine data classification, visualization, and anomaly detection pipeline for the **IoT Pen Refill Work Station**.
> None of these records represent actual real-time physical production hardware readings.

---

## Dataset Directory

| File | Format | Key Variables | Expected Classification | Purpose |
|------|--------|---------------|-------------------------|---------|
| `01_ultrasonic_distance.csv` | CSV | `timestamp`, `ultrasonic_distance_cm`, `sensor_model`, `echo_return_ms` | **Ultrasonic distance readings** | Validates distance series extraction, time-series plotting, and distance threshold bounds. |
| `02_tool_presence.json` | JSON | `timestamp`, `distance_cm`, `object_detected`, `confidence_score`, `threshold_limit_cm` | **Tool/object presence detection data** | Evaluates proximity thresholding (<= 15 cm) and binary detection flag parsing. |
| `03_machine_running_idle.csv` | CSV | `timestamp`, `machine_status`, `state_code`, `transition_trigger`, `operator_id` | **Machine running and idle status logs** | Evaluates machine state classification and operational transitions. |
| `04_dispenser_motor_status.json` | JSON | `timestamp`, `motor_status`, `motor_state`, `rpm`, `current_draw_ma`, `duty_cycle_pct` | **Dispenser motor ON/OFF data** | Evaluates motor actuator tracking, RPM statistics, and current draw analysis. |
| `05_buzzer_alert_logs.csv` | CSV | `timestamp`, `buzzer_status`, `alert_reason`, `frequency_hz`, `sound_level_db` | **Safety buzzer activation logs** | Evaluates acoustic warning tracking and alert rationale classification. |
| `06_status_led_logs.json` | JSON | `timestamp`, `led_status`, `led_mode`, `brightness_pct`, `state_meaning` | **Status LED state logs** | Evaluates visual indicator monitoring (SOLID vs BLINKING modes). |
| `07_combined_machine_telemetry.csv` | CSV | `timestamp`, `ultrasonic_distance_cm`, `object_detected`, `machine_status`, `motor_status`, `led_status`, `buzzer_status` | **Combined machine telemetry** | Full multimodal telemetry validation covering all 6 workstation variables simultaneously. |
| `08_idle_duration_history.csv` | CSV | `timestamp`, `machine_status`, `event_type`, `duration_seconds`, `cumulative_idle_seconds` | **Time-series machine sensor data / Idle history** | Evaluates idle interval calculation, cumulative idle duration, and operational duty cycle. |
| `09_anomalous_machine_events.json` | JSON | `timestamp`, `ultrasonic_distance_cm`, `object_detected`, `machine_status`, `motor_status`, `buzzer_status`, `notes` | **Machine event and alert logs / Anomalous events** | Evaluates anomaly detection (safety interlock violation when motor is ON but distance > 15 cm; negative distance; null packet). |
| `10_unknown_sensor_dataset.csv` | CSV | `timestamp`, `ambient_light_lux`, `relative_humidity_pct`, `barometric_pressure_hpa`, `chassis_vibration_g`, `voc_gas_index` | **Unknown / Insufficient Evidence** | Rigorously tests uncertainty detection; ensures analyzer rejects unfamiliar schemas without hallucinating workstation sensors. |

---

## Schema & Units Specification

- **Distances**: Measured in centimetres (`cm`). Cutoff threshold for pen presence is `15.0 cm`.
- **Timestamps**: Formatted as ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- **Motor States**: Boolean `true`/`false` or categorical `"ON"`/`"OFF"`.
- **Machine Status**: Categorical strings: `"RUNNING"` or `"MACHINE IDLE"`.
- **Buzzer States**: Boolean `true`/`false`. Active during idle warnings (`2400 Hz`).
