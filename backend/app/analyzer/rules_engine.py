"""
Workstation Operating Rules Engine & Anomaly Detector.
Applies Pen Refill Work Station rules:
- Distance <= 15cm: tool/object present
- Distance > 15cm: tool/object absent
- Object absent => dispenser motor MUST stop
Calculates idle duration ONLY if timestamps and status fields exist.
"""
from typing import Dict, List, Any, Optional
from datetime import datetime

class RulesEngine:
    @staticmethod
    def evaluate(records: List[Dict[str, Any]], field_mapping: Dict[str, str], threshold_cm: float = 15.0) -> Dict[str, Any]:
        """
        Evaluates machine state consistency, anomalies, and idle periods based on available variables.
        """
        rev_mapping = {v: k for k, v in field_mapping.items()}
        dist_col = rev_mapping.get("ultrasonic_distance_cm")
        obj_col = rev_mapping.get("object_detected")
        motor_col = rev_mapping.get("motor_status")
        status_col = rev_mapping.get("machine_status")
        buzzer_col = rev_mapping.get("buzzer_status")
        ts_col = rev_mapping.get("timestamp")

        # Find columns by loose name if not explicitly mapped
        if not dist_col:
            for k in field_mapping.keys():
                if "distance" in k.lower():
                    dist_col = k
                    break

        anomalies = []
        rule_violations = []
        evaluated_records_count = len(records)
        
        tool_present_count = 0
        tool_absent_count = 0
        running_count = 0
        idle_count = 0

        # 1. Per-record rule evaluation
        for idx, rec in enumerate(records):
            rec_id = idx + 1
            dist_val = rec.get(dist_col) if dist_col else None
            obj_val = rec.get(obj_col) if obj_col else None
            motor_val = rec.get(motor_col) if motor_col else None
            status_val = str(rec.get(status_col)).upper() if status_col and rec.get(status_col) is not None else None
            buzzer_val = rec.get(buzzer_col) if buzzer_col else None

            # Evaluate distance sanity
            if dist_val is not None and isinstance(dist_val, (int, float)):
                if dist_val < 0.0:
                    anomalies.append({
                        "record_index": rec_id,
                        "type": "SENSOR_IMPOSSIBLE_VALUE",
                        "severity": "HIGH",
                        "message": f"Negative distance reading ({dist_val} cm) in record #{rec_id}. HC-SR04 ultrasonic echo timing failure or sensor glitch."
                    })
                elif dist_val > 400.0:
                    anomalies.append({
                        "record_index": rec_id,
                        "type": "SENSOR_OUT_OF_BOUNDS",
                        "severity": "MEDIUM",
                        "message": f"Distance reading {dist_val} cm exceeds physical HC-SR04 maximum 400 cm range (echo timeout)."
                    })

                # Presence count
                if dist_val <= threshold_cm:
                    tool_present_count += 1
                else:
                    tool_absent_count += 1

            elif obj_val is not None:
                if bool(obj_val):
                    tool_present_count += 1
                else:
                    tool_absent_count += 1

            # Machine status counts
            if status_val:
                if "RUN" in status_val:
                    running_count += 1
                elif "IDLE" in status_val or "STOP" in status_val:
                    idle_count += 1

            # Core Safety Rule: Motor MUST stop if tool is absent
            # Check if both motor and distance or presence exist
            is_object_absent = None
            if dist_val is not None and isinstance(dist_val, (int, float)):
                is_object_absent = dist_val > threshold_cm
            elif obj_val is not None:
                is_object_absent = (obj_val is False)

            is_motor_on = None
            if motor_val is not None:
                if isinstance(motor_val, bool):
                    is_motor_on = motor_val
                elif isinstance(motor_val, str):
                    is_motor_on = motor_val.upper() in ["ON", "TRUE", "RUNNING", "1"]
                elif isinstance(motor_val, (int, float)):
                    is_motor_on = motor_val > 0

            if is_object_absent is True and is_motor_on is True:
                anomalies.append({
                    "record_index": rec_id,
                    "type": "CRITICAL_INTERLOCK_VIOLATION",
                    "severity": "CRITICAL",
                    "message": f"Record #{rec_id}: Dispenser motor is ON while tool/workpiece is ABSENT (Distance: {dist_val} cm > {threshold_cm} cm). Severe safety risk: dry dispensing without workpiece!"
                })
                rule_violations.append(f"Record #{rec_id}: Motor ON during tool absence")

            # Unexpected combination: Buzzer ON while Machine is RUNNING with Tool present
            is_buzzer_on = None
            if buzzer_val is not None:
                if isinstance(buzzer_val, bool):
                    is_buzzer_on = buzzer_val
                elif isinstance(buzzer_val, str):
                    is_buzzer_on = buzzer_val.upper() in ["ON", "TRUE", "ACTIVE", "1"]
                elif isinstance(buzzer_val, (int, float)):
                    is_buzzer_on = buzzer_val > 0

            if is_buzzer_on is True and status_val and "RUN" in status_val and is_object_absent is False:
                anomalies.append({
                    "record_index": rec_id,
                    "type": "UNEXPECTED_ALARM_COMBINATION",
                    "severity": "MEDIUM",
                    "message": f"Record #{rec_id}: Safety buzzer sounding during normal RUNNING operation with tool present (possible nuisance alarm or relay pin glitch)."
                })

        # 2. Idle duration calculation (ONLY if timestamps and status or presence data exist)
        idle_analysis = None
        if ts_col and (status_col or dist_col or obj_col):
            idle_analysis = RulesEngine._compute_idle_intervals(
                records, ts_col, status_col, dist_col, obj_col, threshold_cm
            )

        # 3. Overall condition summary
        presence_summary = "Indeterminate (no distance or presence sensor column)"
        if tool_present_count + tool_absent_count > 0:
            pct_present = round((tool_present_count / (tool_present_count + tool_absent_count)) * 100, 1)
            presence_summary = f"Tool Present in {tool_present_count} samples ({pct_present}%), Absent in {tool_absent_count} samples"

        return {
            "applicable_rules": [
                f"Tool presence cut-off threshold configured at <= {threshold_cm} cm",
                "Workpiece present permits dispenser motor operation",
                "Workpiece absent requires dispenser motor forced halt (protective interlock)"
            ],
            "tool_presence_summary": presence_summary,
            "tool_present_count": tool_present_count,
            "tool_absent_count": tool_absent_count,
            "running_count": running_count,
            "idle_count": idle_count,
            "anomalies_detected": anomalies,
            "total_anomalies": len(anomalies),
            "safety_rule_violations": rule_violations,
            "idle_duration_analysis": idle_analysis
        }

    @staticmethod
    def _compute_idle_intervals(
        records: List[Dict[str, Any]], ts_col: str, status_col: Optional[str],
        dist_col: Optional[str], obj_col: Optional[str], threshold: float
    ) -> Dict[str, Any]:
        """
        Parses timestamps and identifies idle intervals, total idle time, and duty cycle.
        """
        time_series = []
        for r in records:
            raw_ts = r.get(ts_col)
            if not raw_ts:
                continue
            
            dt = None
            if isinstance(raw_ts, str):
                for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%H:%M:%S"):
                    try:
                        dt = datetime.strptime(raw_ts, fmt)
                        break
                    except ValueError:
                        pass
            if dt:
                # Determine state: IDLE vs RUNNING
                is_idle = False
                if status_col and r.get(status_col):
                    s_str = str(r.get(status_col)).upper()
                    is_idle = "IDLE" in s_str or "STOP" in s_str or "0" == s_str
                elif dist_col and r.get(dist_col) is not None:
                    try:
                        is_idle = float(r.get(dist_col)) > threshold
                    except Exception:
                        pass
                elif obj_col and r.get(obj_col) is not None:
                    is_idle = not bool(r.get(obj_col))

                time_series.append({"dt": dt, "is_idle": is_idle, "ts_str": str(raw_ts)})

        if len(time_series) < 2:
            return {
                "supported": False,
                "reason": "Insufficient valid timestamps to compute transition intervals (minimum 2 timestamps required)."
            }

        total_idle_sec = 0.0
        total_running_sec = 0.0
        idle_intervals = []
        current_idle_start = None

        for i in range(len(time_series) - 1):
            curr = time_series[i]
            nxt = time_series[i + 1]
            diff_sec = (nxt["dt"] - curr["dt"]).total_seconds()
            if diff_sec < 0 or diff_sec > 86400: # sanity check
                continue

            if curr["is_idle"]:
                total_idle_sec += diff_sec
                if current_idle_start is None:
                    current_idle_start = curr["ts_str"]
            else:
                total_running_sec += diff_sec
                if current_idle_start is not None:
                    idle_intervals.append({
                        "start": current_idle_start,
                        "end": curr["ts_str"],
                        "duration_sec": round((curr["dt"] - datetime.fromisoformat(current_idle_start.replace("Z", ""))).total_seconds(), 1) if "T" in current_idle_start else "N/A"
                    })
                    current_idle_start = None

        total_tracked = total_idle_sec + total_running_sec
        idle_ratio = round((total_idle_sec / total_tracked) * 100, 1) if total_tracked > 0 else 0.0
        duty_cycle = round((total_running_sec / total_tracked) * 100, 1) if total_tracked > 0 else 0.0

        return {
            "supported": True,
            "total_monitored_seconds": round(total_tracked, 1),
            "total_idle_seconds": round(total_idle_sec, 1),
            "total_running_seconds": round(total_running_sec, 1),
            "idle_ratio_pct": idle_ratio,
            "operational_duty_cycle_pct": duty_cycle,
            "formatted_idle_time": f"{round(total_idle_sec, 1)}s ({round(total_idle_sec/60, 2)}m)",
            "formatted_running_time": f"{round(total_running_sec, 1)}s ({round(total_running_sec/60, 2)}m)",
            "idle_intervals_recorded": len(idle_intervals)
        }
