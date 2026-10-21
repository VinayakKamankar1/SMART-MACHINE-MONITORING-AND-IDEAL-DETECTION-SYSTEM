"""
Parser and Preprocessor for machine data uploads (CSV, JSON, TXT).
Normalizes headers, detects schemas, and extracts raw data safely without mutation of measurements.
"""
import csv
import json
import io
import re
from typing import Dict, List, Any, Tuple, Optional
from datetime import datetime

# Known canonical field mappings
CANONICAL_SYNONYMS = {
    "ultrasonic_distance_cm": [
        "ultrasonic_distance_cm", "ultrasonic_distance", "distance_cm", "distance",
        "ultra_dist", "ultrasonic_cm", "dist_cm", "dist", "range_cm"
    ],
    "object_detected": [
        "object_detected", "tool_detected", "tool_present", "presence",
        "object_present", "is_tool_present", "workpiece_detected"
    ],
    "machine_status": [
        "machine_status", "status", "state", "machine_state", "operating_state",
        "operating_status", "workstation_status"
    ],
    "motor_status": [
        "motor_status", "motor_state", "dispenser_motor", "motor", "actuator_state",
        "dispenser_status", "pump_status"
    ],
    "buzzer_status": [
        "buzzer_status", "buzzer", "alarm", "alarm_status", "buzzer_active",
        "buzzer_alarm", "safety_buzzer"
    ],
    "led_status": [
        "led_status", "led", "indicator", "led_state", "led_mode", "status_led"
    ],
    "timestamp": [
        "timestamp", "time", "datetime", "ts", "date_time", "recorded_at", "clock"
    ],
    "rpm": ["rpm", "motor_rpm", "dispenser_rpm", "speed"],
    "current_draw_ma": ["current_draw_ma", "current", "current_ma", "amps_ma", "power_ma"],
    "alert_reason": ["alert_reason", "alarm_reason", "reason", "event_reason", "notes", "operator_note"]
}

class DataParser:
    @staticmethod
    def parse_file(content_bytes: bytes, filename: str) -> Dict[str, Any]:
        """
        Parses uploaded file content (CSV, JSON, or TXT).
        Returns normalized rows, raw fields, detected canonical mappings, and errors.
        """
        lower_name = filename.lower()
        if not (lower_name.endswith('.csv') or lower_name.endswith('.json') or lower_name.endswith('.txt')):
            raise ValueError(f"Unsupported file format for '{filename}'. Allowed formats: .csv, .json, .txt")

        # Decode content with UTF-8 fallback to latin-1
        try:
            text = content_bytes.decode('utf-8')
        except UnicodeDecodeError:
            try:
                text = content_bytes.decode('latin-1')
            except Exception as e:
                raise ValueError(f"Unable to decode file encoding: {str(e)}")

        text = text.strip()
        if not text:
            raise ValueError("Uploaded file is empty.")

        records = []
        raw_format = "unknown"

        if lower_name.endswith('.json'):
            raw_format = "JSON"
            try:
                parsed_json = json.loads(text)
                if isinstance(parsed_json, list):
                    records = parsed_json
                elif isinstance(parsed_json, dict):
                    # Check if wrapped in data or records key
                    if "data" in parsed_json and isinstance(parsed_json["data"], list):
                        records = parsed_json["data"]
                    elif "records" in parsed_json and isinstance(parsed_json["records"], list):
                        records = parsed_json["records"]
                    else:
                        records = [parsed_json]
                else:
                    raise ValueError("JSON must contain an array of objects or a single telemetry object.")
            except json.JSONDecodeError as e:
                raise ValueError(f"Malformed JSON content: {str(e)}")

        elif lower_name.endswith('.csv'):
            raw_format = "CSV"
            try:
                # Use csv.Sniffer to detect delimiter
                sample = text[:4096]
                try:
                    dialect = csv.Sniffer().sniff(sample, delimiters=',;\t|')
                    delimiter = dialect.delimiter
                except Exception:
                    delimiter = ','

                reader = csv.DictReader(io.StringIO(text), delimiter=delimiter)
                for row in reader:
                    # Strip whitespace from keys and values
                    cleaned_row = {str(k).strip(): v.strip() if isinstance(v, str) else v for k, v in row.items() if k is not None}
                    records.append(cleaned_row)
            except Exception as e:
                raise ValueError(f"Malformed CSV content: {str(e)}")

        elif lower_name.endswith('.txt'):
            raw_format = "TXT"
            # Try parsing as JSON first
            if text.startswith('[') or text.startswith('{'):
                try:
                    parsed_json = json.loads(text)
                    records = parsed_json if isinstance(parsed_json, list) else [parsed_json]
                except Exception:
                    pass

            if not records:
                # Try parsing as delimited or key-value log lines
                lines = [l.strip() for l in text.split('\n') if l.strip()]
                # Check if first line looks like header
                if len(lines) > 1 and (',' in lines[0] or '\t' in lines[0] or '|' in lines[0]):
                    delim = ',' if ',' in lines[0] else ('\t' if '\t' in lines[0] else '|')
                    reader = csv.DictReader(io.StringIO(text), delimiter=delim)
                    records = [r for r in reader]
                else:
                    # Key-value parse line by line: e.g. "timestamp=2026-10-20 distance=12.5 status=RUNNING"
                    for line in lines:
                        row_dict = {}
                        kv_pairs = re.findall(r'(\w+)[=:]\s*([^\s,]+)', line)
                        for k, v in kv_pairs:
                            row_dict[k] = v
                        if row_dict:
                            records.append(row_dict)

            if not records:
                raise ValueError("Could not extract structured telemetry records from TXT log.")

        if not records or not isinstance(records, list) or len(records) == 0:
            raise ValueError("No valid records found in file.")

        # Ensure all records are dicts
        valid_records = []
        for r in records:
            if isinstance(r, dict):
                valid_records.append(r)
        
        if not valid_records:
            raise ValueError("File does not contain key-value telemetry records.")

        # Discover all field names
        all_raw_fields = list(dict.fromkeys([k for r in valid_records for k in r.keys()]))

        # Canonical mapping detection
        field_mapping = {}
        for canonical, synonyms in CANONICAL_SYNONYMS.items():
            for raw_col in all_raw_fields:
                norm_col = re.sub(r'[^a-zA-Z0-9_]', '_', raw_col.strip().lower())
                if norm_col in synonyms:
                    field_mapping[raw_col] = canonical
                    break

        # Convert values gently: convert numeric strings to float/int, booleans, but preserve raw measurements
        converted_records = []
        for r in valid_records:
            conv_row = {}
            for k, v in r.items():
                conv_row[k] = DataParser._parse_val(v)
            converted_records.append(conv_row)

        return {
            "format": raw_format,
            "filename": filename,
            "total_records": len(converted_records),
            "raw_fields": all_raw_fields,
            "field_mapping": field_mapping,
            "records": converted_records
        }

    @staticmethod
    def _parse_val(val: Any) -> Any:
        if val is None or val == "" or str(val).lower() in ["null", "none", "nan", "na"]:
            return None
        if isinstance(val, (int, float, bool)):
            return val
        s = str(val).strip()
        # Boolean check
        if s.lower() in ["true", "on", "yes", "high"]:
            return True
        if s.lower() in ["false", "off", "no", "low"]:
            return False
        # Number check
        try:
            if "." in s or "e" in s.lower():
                return float(s)
            return int(s)
        except ValueError:
            pass
        return s

    @staticmethod
    def create_rag_representation(parsed_data: Dict[str, Any]) -> str:
        """
        Creates a descriptive technical summary of the dataset schema, detected variables,
        and value samples for vector embedding search.
        """
        filename = parsed_data.get("filename", "")
        fields = parsed_data.get("raw_fields", [])
        mapping = parsed_data.get("field_mapping", {})
        records = parsed_data.get("records", [])
        n = len(records)
        
        sample_rows = records[:3]
        
        lines = [
            f"Dataset Name: {filename}",
            f"Total Records: {n}",
            f"Detected Columns: {', '.join(fields)}",
            f"Mapped Canonical Variables: {json.dumps(mapping)}"
        ]
        
        if sample_rows:
            lines.append("Sample Records Preview:")
            for i, row in enumerate(sample_rows):
                lines.append(f"  Record {i+1}: {json.dumps(row)}")
                
        return "\n".join(lines)
