"""
Deterministic Numerical and Categorical Statistics Calculator.
Computes real statistical metrics directly from uploaded datasets using numpy/pandas/math.
Never hallucinates statistics.
"""
from typing import Dict, List, Any, Optional
import math
from datetime import datetime

class StatisticsCalculator:
    @staticmethod
    def compute(records: List[Dict[str, Any]], field_mapping: Dict[str, str]) -> Dict[str, Any]:
        if not records:
            return {
                "total_records": 0,
                "total_columns": 0,
                "numeric_stats": {},
                "categorical_stats": {},
                "missing_summary": {},
                "duplicates_count": 0,
                "time_range": None
            }

        total_records = len(records)
        all_columns = list(dict.fromkeys([k for r in records for k in r.keys()]))
        
        numeric_stats = {}
        categorical_stats = {}
        missing_summary = {}

        # 1. Column-by-column analysis
        for col in all_columns:
            vals = [r.get(col) for r in records]
            non_nulls = [v for v in vals if v is not None]
            missing_count = total_records - len(non_nulls)
            missing_pct = round((missing_count / total_records) * 100, 2)
            
            missing_summary[col] = {
                "missing_count": missing_count,
                "missing_pct": missing_pct,
                "present_count": len(non_nulls)
            }

            # Check if column is numeric
            num_vals = []
            for v in non_nulls:
                if isinstance(v, (int, float)) and not isinstance(v, bool):
                    if not math.isnan(v) and not math.isinf(v):
                        num_vals.append(float(v))

            if len(num_vals) > 0 and len(num_vals) >= len(non_nulls) * 0.7:
                # Numeric column
                n = len(num_vals)
                col_min = min(num_vals)
                col_max = max(num_vals)
                col_mean = sum(num_vals) / n
                if n > 1:
                    variance = sum((x - col_mean) ** 2 for x in num_vals) / (n - 1)
                    col_std = math.sqrt(variance)
                else:
                    col_std = 0.0

                numeric_stats[col] = {
                    "count": n,
                    "min": round(col_min, 3),
                    "max": round(col_max, 3),
                    "mean": round(col_mean, 3),
                    "std_dev": round(col_std, 3),
                    "canonical_name": field_mapping.get(col)
                }
            else:
                # Categorical / Boolean / String column
                str_vals = [str(v) for v in non_nulls]
                unique_set = set(str_vals)
                val_counts = {}
                for sv in str_vals:
                    val_counts[sv] = val_counts.get(sv, 0) + 1

                categorical_stats[col] = {
                    "count": len(non_nulls),
                    "unique_count": len(unique_set),
                    "unique_values": sorted(list(unique_set))[:20],
                    "value_distribution": val_counts,
                    "canonical_name": field_mapping.get(col)
                }

        # 2. Check for duplicate records
        str_rows = [str(sorted(r.items())) for r in records]
        duplicates_count = len(str_rows) - len(set(str_rows))

        # 3. Time range calculation (if timestamp field exists)
        time_range = None
        ts_field = None
        for col, canon in field_mapping.items():
            if canon == "timestamp":
                ts_field = col
                break
        if not ts_field:
            for col in all_columns:
                if "time" in col.lower() or "date" in col.lower():
                    ts_field = col
                    break

        if ts_field:
            ts_vals = [r.get(ts_field) for r in records if r.get(ts_field)]
            parsed_dates = []
            for t in ts_vals:
                if isinstance(t, str):
                    for fmt in ("%Y-%m-%dT%H:%M:%SZ", "%Y-%m-%dT%H:%M:%S", "%Y-%m-%d %H:%M:%S", "%H:%M:%S"):
                        try:
                            parsed_dates.append(datetime.strptime(t, fmt))
                            break
                        except ValueError:
                            pass
            if parsed_dates:
                min_dt = min(parsed_dates)
                max_dt = max(parsed_dates)
                span_sec = (max_dt - min_dt).total_seconds()
                time_range = {
                    "timestamp_field": ts_field,
                    "start_time": min_dt.isoformat(),
                    "end_time": max_dt.isoformat(),
                    "duration_seconds": round(span_sec, 2),
                    "formatted_span": f"{round(span_sec, 1)} seconds ({round(span_sec/60, 2)} minutes)"
                }

        return {
            "total_records": total_records,
            "total_columns": len(all_columns),
            "columns": all_columns,
            "numeric_stats": numeric_stats,
            "categorical_stats": categorical_stats,
            "missing_summary": missing_summary,
            "duplicates_count": duplicates_count,
            "time_range": time_range
        }
