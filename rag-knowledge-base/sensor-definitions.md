# Sensor and Hardware Peripheral Definitions

## 1. HC-SR04 Ultrasonic Distance Sensor
- **Model**: HC-SR04 Ultrasonic Ranging Module
- **Measured Variable**: `ultrasonic_distance_cm` or `distance_cm` or `distance`
- **Measurement Unit**: Centimetres (cm)
- **Operational Range**: 2 cm to 400 cm (non-contact measurement)
- **Measuring Angle**: 15 degrees
- **Operating Voltage**: 5V DC via ESP8266 NodeMCU Vin pin
- **Trigger Pin**: NodeMCU GPIO D1 (10 microsecond TTL trigger pulse)
- **Echo Pin**: NodeMCU GPIO D2 (PWM pulse proportional to object distance, time / 58 = cm)
- **Workstation Physical Role**: Positioned directly above the pen refill slot to detect whether an ink pen barrel / refill workpiece is correctly nested in the holding clamp.
- **Normal Operating Values**: 10.0 cm to 14.5 cm when pen is nested; > 15.0 cm when empty or removed.
- **Out of Range / Error Values**: Distances < 0 cm (impossible, sensor glitch) or > 400 cm (timeout / invalid echo return).

## 2. Tool / Workpiece Presence Detection Subsystem
- **Variable**: `object_detected` or `tool_present` or `presence`
- **Data Type**: Boolean (`true` / `false`) or Binary (`1` / `0`)
- **Functional Definition**: Evaluates physical workpiece seating based on ultrasonic proximity.
- **Rule**: `object_detected = (ultrasonic_distance_cm <= 15.0)`
- **True State**: Tool or pen workpiece present in fixture; allows dispensing mechanism to engage.
- **False State**: No workpiece present; triggers automatic safety interlock to stop the dispenser motor immediately.

## 3. Dispenser Stepper Motor Actuator
- **Variable**: `motor_status` or `motor_state`
- **Data Type**: Boolean (`true` = ON, `false` = OFF) or String (`"ON"` / `"OFF"`)
- **Actuator Hardware**: 28BYJ-48 Stepper Motor with ULN2003 Darlington Driver or 5V DC peristaltic dispensing pump relay.
- **Operating Mode**: Rotates ink feed roller only when workpiece is confirmed present.
- **Associated Metrics**: RPM (nominal 100-140 RPM), Current Draw (nominal 300-380 mA active, < 20 mA idle), Duty Cycle (0% to 100%).
- **Crucial Interlock Constraint**: The dispenser motor must NEVER run when `object_detected` is false or `ultrasonic_distance_cm` exceeds 15.0 cm.

## 4. Workstation Status Indicator LED
- **Variable**: `led_status` or `led_mode`
- **Data Type**: Boolean (`true` / `false`) or Enum (`"SOLID"`, `"BLINKING"`, `"OFF"`)
- **Hardware**: High-brightness 5mm Amber / Green LED connected to ESP8266 GPIO D5.
- **Modes**:
  - `SOLID`: Machine actively running with tool detected.
  - `BLINKING`: Machine in IDLE or warning state (1 Hz to 2 Hz flash rate).
  - `OFF`: Workstation unpowered or deep sleep.

## 5. Industrial Safety Alert Buzzer
- **Variable**: `buzzer_status` or `buzzer_active`
- **Data Type**: Boolean (`true` = sounding, `false` = silent)
- **Hardware**: Active 5V Piezoelectric Buzzer connected to ESP8266 GPIO D6.
- **Resonant Frequency**: 2400 Hz (+/- 300 Hz), producing 75 - 85 dB acoustic alarm.
- **Activation Logic**: Sounds when workstation transitions into IDLE state due to missing workpiece, notifying the factory operator to insert a new refill cartridge or investigate line stoppage.
