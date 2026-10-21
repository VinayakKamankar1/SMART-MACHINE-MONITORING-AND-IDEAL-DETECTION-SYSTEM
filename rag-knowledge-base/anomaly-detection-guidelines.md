# Anomaly Detection and Safety Conflict Guidelines

## Diagnostic Rule Matrix for Pen Refill Work Station

The analyzer systematically detects anomalous operating states by cross-checking multi-sensor measurements against physical machine safety constraints:

### 1. Critical Protective Interlock Violation (Hazardous)
- **Condition**: `motor_status == true` AND (`ultrasonic_distance_cm > 15.0` OR `object_detected == false`)
- **Severity**: **CRITICAL**
- **Diagnostic Finding**: The dispenser motor is energized without a confirmed pen refill workpiece in the nest.
- **Risk**: Ink spillage onto guide rails, stepper mechanism over-travel, actuator burnout, contamination of assembly station.
- **Action Required**: Inspect physical relay contacts, verify ESP8266 interlock firmware routine, replace stuck-closed MOSFET/transistor driver.

### 2. Sensor Physical Impossibility & Noise Spikes
- **Condition A (Negative Reading)**: `ultrasonic_distance_cm < 0.0`
  - **Severity**: **HIGH**
  - **Diagnostic Finding**: Ultrasonic echo calculation returned negative time pulse (timing jitter or calculation underflow).
- **Condition B (Out of Physical Bounds)**: `ultrasonic_distance_cm > 400.0`
  - **Severity**: **MEDIUM**
  - **Diagnostic Finding**: Exceeds maximum 4-meter ultrasonic return window (no echo received / acoustic deflection).
- **Condition C (Unphysical Velocity Jump)**: $|\Delta \text{distance}| > 50\text{ cm}$ within $< 0.1\text{ s}$ without physical line indexing.

### 3. Alarm State Inconsistencies
- **Condition A (Muted Alert during Idle)**: `machine_status == "MACHINE IDLE"` AND `buzzer_status == false` after $> 30\text{ s}$ of idle condition.
  - **Severity**: **LOW - MEDIUM**
  - **Diagnostic Finding**: Operator may not be alerted to unserviced machine stoppage.
- **Condition B (Nuisance Alarm)**: `machine_status == "RUNNING"` AND `buzzer_status == true` AND `object_detected == true`.
  - **Severity**: **MEDIUM**
  - **Diagnostic Finding**: Buzzer pin misfiring or false alert triggered during active dispensing.

### 4. Telemetry Stream Irregularities
- **Condition**: Missing timestamps, out-of-order records, or large packet drop gaps ($> 30\text{ s}$).
- **Diagnostic Finding**: Communication latency between ESP8266 and Firebase Realtime Database or local logging agent.
