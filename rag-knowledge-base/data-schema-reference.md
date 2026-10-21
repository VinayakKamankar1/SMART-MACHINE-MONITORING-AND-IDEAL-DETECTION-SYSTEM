# Workstation Data Schema Reference and Normalization Guidelines

## Canonical Field Mapping Table

When parsing CSV, JSON, or TXT telemetry files, the preprocessing pipeline maps incoming raw field names to the canonical schema without altering raw numeric values:

| Canonical Variable | Recognized Aliases / Synonyms | Data Type | Units / Valid Values | Description |
|--------------------|--------------------------------|-----------|----------------------|-------------|
| `timestamp` | `time`, `datetime`, `ts`, `date_time`, `recorded_at` | String / DateTime | ISO-8601, Epoch, HH:MM:SS | Telemetry capture timestamp |
| `ultrasonic_distance_cm` | `distance_cm`, `distance`, `ultra_dist`, `dist`, `ultrasonic` | Float | Centimetres (cm) | Distance to workpiece (HC-SR04) |
| `object_detected` | `tool_present`, `tool_detected`, `presence`, `object_present` | Boolean | `true` / `false` | True when distance <= 15.0 cm |
| `machine_status` | `status`, `state`, `machine_state`, `operating_status` | String | `"RUNNING"`, `"MACHINE IDLE"` | Overall machine automation state |
| `motor_status` | `motor`, `dispenser_motor`, `motor_state`, `actuator_on` | Boolean | `true` / `false`, `ON` / `OFF` | Ink dispenser motor state |
| `buzzer_status` | `buzzer`, `alarm`, `alarm_status`, `buzzer_active` | Boolean | `true` / `false` | Acoustic warning buzzer state |
| `led_status` | `led`, `indicator`, `led_state`, `led_mode` | Boolean / String | `true` / `false`, `"SOLID"`, `"BLINKING"` | Visual status indicator state |
| `rpm` | `speed`, `motor_rpm`, `dispenser_speed` | Float / Int | Revolutions per minute | Dispenser motor rotational speed |
| `current_draw_ma` | `current`, `amps_ma`, `current_ma` | Float / Int | Milliamperes (mA) | Motor current consumption |
| `alert_reason` | `alarm_reason`, `event_reason`, `trigger_cause` | String | Text description | Rationale for alarm activation |

## Boolean & State Normalization Rules
- **Boolean Truthy Values**: `true`, `"true"`, `1`, `"1"`, `"ON"`, `"HIGH"`, `"ACTIVE"`, `"YES"`
- **Boolean Falsy Values**: `false`, `"false"`, `0`, `"0"`, `"OFF"`, `"LOW"`, `"INACTIVE"`, `"NO"`
- **Machine Status Normalization**: Normalize to uppercase `"RUNNING"` or `"MACHINE IDLE"`.
- **Handling Missing Values**: Represent missing sensor records as `null` / `NaN`. Do not fill missing values with zeros or fabricated constants.
