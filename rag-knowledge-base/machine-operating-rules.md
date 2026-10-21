# Smart Machine Monitoring: Workstation Operating Rules

## Primary Workstation Logic & Safety Rules

For the automated **Pen Refill Work Station**, the system enforces rigorous automation and protective interlock rules:

### Rule 1: Ultrasonic Distance Thresholding for Tool Presence
- **Threshold Limit**: Exactly `15.0 cm`.
- **Condition A (Present)**: If `ultrasonic_distance_cm <= 15.0`, then `object_detected` MUST be evaluated as `true`. Tool or pen cartridge is physically positioned inside the dispenser receiver slot.
- **Condition B (Absent)**: If `ultrasonic_distance_cm > 15.0`, then `object_detected` MUST be evaluated as `false`. Tool or pen cartridge is removed, missing, or improperly seated.

### Rule 2: Automatic Dispenser Motor Protective Interlock
- **When Object Present (`object_detected == true`)**:
  - The dispenser motor is PERMITTED to run (`motor_status == true` or `"ON"`), provided machine is in `RUNNING` status and no manual emergency halt is invoked.
- **When Object Absent (`object_detected == false`)**:
  - The dispenser motor MUST BE FORCIBLY STOPPED (`motor_status == false` or `"OFF"`).
  - Dry dispensing without a nested workpiece causes ink spillage, mechanical nozzle clogs, and component wear.
  - **Severe Safety Violation**: Any record exhibiting `motor_status == true` while `object_detected == false` or `ultrasonic_distance_cm > 15.0` is an immediate critical anomaly and protective interlock failure candidate!

### Rule 3: Machine State Progression & Actuator Coordination
- **State: `RUNNING`**:
  - Distance: `<= 15.0 cm`
  - Object Detected: `true`
  - Motor Status: `true` (ON)
  - LED Status: `true` (SOLID illumination)
  - Buzzer Status: `false` (Silent)
- **State: `MACHINE IDLE`**:
  - Distance: `> 15.0 cm` (or operator paused)
  - Object Detected: `false`
  - Motor Status: `false` (Halted)
  - LED Status: `true` (Flashing/Blinking alert)
  - Buzzer Status: `true` (Acoustic alarm active)

### Rule 4: Data Applicability Boundary
- These operating rules apply ONLY when the uploaded data actually contains the necessary sensor variables.
- An arbitrary numeric column must NOT be assumed to represent distance unless explicitly identified.
- A missing motor field must NEVER be assumed to mean the motor is OFF; absence of data must be recorded as missing/unobserved.
