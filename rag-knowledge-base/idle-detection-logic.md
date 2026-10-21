# Idle Detection Logic and Calculation Principles

## Definition of Machine Idle State

In the **Pen Refill Work Station**, the machine is designated as **IDLE** (`MACHINE IDLE`) when:
1. The ultrasonic sensor detects no workpiece (`ultrasonic_distance_cm > 15.0 cm`), causing the dispenser motor to automatically pause.
2. The workstation is waiting for operator intervention to replace the pen refill workpiece or clear the collection tray.
3. The machine has paused dispensing between work cycles.

## Calculating Idle Duration and Total Idle Time

### Strict Prerequisites:
Idle durations and cumulative idle metrics must **ONLY** be computed when:
1. Valid, monotonically ordered **timestamps** are present in the dataset (ISO 8601, epoch seconds/milliseconds, or standard 24h clock strings).
2. Machine state transitions (`machine_status`, `state_code`, or explicit event markers) are recorded.
3. If only instantaneous snapshots exist without timestamps, duration cannot be computed and must be labeled as `Indeterminate / Lacks Timestamps`.

### Mathematical Formulation:
- **Interval Duration**: $\Delta t_i = t_{i+1} - t_i$
- **Total Idle Time**: $T_{\text{idle}} = \sum_{k \in \text{IDLE}} \Delta t_k$
- **Total Operating (Running) Time**: $T_{\text{running}} = \sum_{j \in \text{RUNNING}} \Delta t_j$
- **Total Monitored Time**: $T_{\text{total}} = T_{\text{idle}} + T_{\text{running}}$
- **Idle Ratio (Downtime Ratio)**: $R_{\text{idle}} = \frac{T_{\text{idle}}}{T_{\text{total}}} \times 100\%$
- **Productive Operational Duty Cycle**: $D = \frac{T_{\text{running}}}{T_{\text{total}}} \times 100\%$

## Idle Transition Triggers
- **Tool Removal**: Distance transitions from `<= 15 cm` to `> 15 cm`.
- **Cartridge Depletion**: Dispensing cycle completes, triggering automatic stop.
- **Unattended Operator Delay**: Machine remains idle for $> 120$ seconds, escalating buzzer alerts.
