# Machine Data Classification Taxonomy & Category Profiles

## Supported Target Categories

The RAG classification pipeline recognizes and categorizes machine datasets into one of the following primary categories:

1. **Ultrasonic distance readings**:
   - Characteristics: High-frequency or periodic numeric distance measurements (typically `cm`, `mm`, or `inches`). Columns: `ultrasonic_distance_cm`, `distance_cm`, `distance`, `echo_time`. Primary sensor: HC-SR04.
2. **Tool/object presence detection data**:
   - Characteristics: Binary detection flags (`object_detected`, `tool_present`, `presence`) paired with distance measurements or threshold evaluations (`15.0 cm`).
3. **Machine running and idle status logs**:
   - Characteristics: Categorical machine state transitions (`RUNNING`, `MACHINE IDLE`, `PAUSED`, `STOPPED`), state codes (`1` / `0`), and state trigger labels.
4. **Dispenser motor ON/OFF data**:
   - Characteristics: Actuator state logs for the ink dispenser mechanism (`motor_status`, `motor_state`, `rpm`, `current_draw_ma`, `duty_cycle`).
5. **Safety buzzer activation logs**:
   - Characteristics: Acoustic alarm activation records (`buzzer_status`, `buzzer_active`, `alert_reason`, `frequency_hz`, `sound_level_db`).
6. **Status LED state logs**:
   - Characteristics: Visual state indicator records (`led_status`, `led_mode`, `blink_rate`, `brightness_pct`).
7. **Combined machine telemetry**:
   - Characteristics: Comprehensive multimodal record sets combining distance, object detection, machine status, motor status, LED status, and buzzer status simultaneously.
8. **Time-series machine sensor data / Idle duration history**:
   - Characteristics: Continuous temporal sequences tracking state shifts, idle intervals, interval durations, and cumulative runtime.
9. **Machine event and alert logs / Anomalous events**:
   - Characteristics: Operational event feeds containing fault codes, unexpected state combinations, or safety interlock violations.
10. **Unknown / Insufficient Evidence**:
    - Characteristics: Files containing data unrelated to the workstation (e.g. atmospheric humidity, optical lux, gas sensor readings, generic financial or sales records) or datasets with insufficient columns/records to make a reliable determination.
    - **System Directive**: The classifier must NEVER force unknown data into a workstation category. When matching evidence is below certainty thresholds or variables are foreign, the system MUST return **"Unknown / Insufficient Evidence"**.
