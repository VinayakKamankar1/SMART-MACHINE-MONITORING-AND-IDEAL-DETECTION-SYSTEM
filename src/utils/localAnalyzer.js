/**
 * Client-Side Fallback Analyzer & Parser.
 * Ensures the AI Data Analyzer page remains fully functional even if the Python
 * RAG backend is temporarily stopped or compiling.
 */

export function parseClientFile(text, filename) {
  const lowerName = filename.toLowerCase();
  let records = [];
  let format = "unknown";

  if (lowerName.endsWith(".json")) {
    format = "JSON";
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) records = parsed;
    else if (parsed && typeof parsed === "object") {
      if (Array.isArray(parsed.data)) records = parsed.data;
      else if (Array.isArray(parsed.records)) records = parsed.records;
      else records = [parsed];
    }
  } else if (lowerName.endsWith(".csv") || lowerName.endsWith(".txt")) {
    format = lowerName.endsWith(".csv") ? "CSV" : "TXT";
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    if (lines.length > 1) {
      const delim = lines[0].includes(",") ? "," : (lines[0].includes("\t") ? "\t" : "|");
      const headers = lines[0].split(delim).map(h => h.replace(/^["']|["']$/g, "").trim());
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(delim).map(p => p.replace(/^["']|["']$/g, "").trim());
        const row = {};
        headers.forEach((h, idx) => {
          let val = parts[idx];
          if (val === "" || val === undefined) val = null;
          else if (val.toLowerCase() === "true") val = true;
          else if (val.toLowerCase() === "false") val = false;
          else if (!isNaN(Number(val))) val = Number(val);
          row[h] = val;
        });
        records.push(row);
      }
    }
  }

  const allFields = Array.from(new Set(records.flatMap(r => Object.keys(r))));
  const fieldMapping = {};

  const synonyms = {
    ultrasonic_distance_cm: ["ultrasonic_distance_cm", "ultrasonic_distance", "distance_cm", "distance", "dist_cm"],
    object_detected: ["object_detected", "tool_detected", "tool_present", "presence"],
    machine_status: ["machine_status", "status", "state", "machine_state"],
    motor_status: ["motor_status", "motor_state", "dispenser_motor", "motor"],
    buzzer_status: ["buzzer_status", "buzzer", "alarm", "buzzer_active"],
    led_status: ["led_status", "led", "indicator", "led_mode"],
    timestamp: ["timestamp", "time", "datetime", "ts", "clock"]
  };

  allFields.forEach(field => {
    const norm = field.toLowerCase().replace(/[^a-z0-9_]/g, "_");
    for (const [canon, synList] of Object.entries(synonyms)) {
      if (synList.includes(norm)) {
        fieldMapping[field] = canon;
        break;
      }
    }
  });

  return {
    filename,
    format,
    total_records: records.length,
    raw_fields: allFields,
    field_mapping: fieldMapping,
    records
  };
}

export function computeLocalStats(records, fieldMapping) {
  if (!records || records.length === 0) return { total_records: 0, numeric_stats: {}, categorical_stats: {} };

  const allColumns = Array.from(new Set(records.flatMap(r => Object.keys(r))));
  const numericStats = {};
  const categoricalStats = {};

  allColumns.forEach(col => {
    const vals = records.map(r => r[col]).filter(v => v !== null && v !== undefined);
    const nums = vals.filter(v => typeof v === "number" && !isNaN(v));

    if (nums.length > 0 && nums.length >= vals.length * 0.7) {
      const min = Math.min(...nums);
      const max = Math.max(...nums);
      const mean = nums.reduce((a, b) => a + b, 0) / nums.length;
      const variance = nums.length > 1 ? nums.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (nums.length - 1) : 0;
      numericStats[col] = {
        count: nums.length,
        min: Number(min.toFixed(2)),
        max: Number(max.toFixed(2)),
        mean: Number(mean.toFixed(2)),
        std_dev: Number(Math.sqrt(variance).toFixed(2)),
        canonical_name: fieldMapping[col] || null
      };
    } else {
      const counts = {};
      vals.forEach(v => {
        const s = String(v);
        counts[s] = (counts[s] || 0) + 1;
      });
      categoricalStats[col] = {
        count: vals.length,
        unique_count: Object.keys(counts).length,
        value_distribution: counts,
        canonical_name: fieldMapping[col] || null
      };
    }
  });

  return {
    total_records: records.length,
    total_columns: allColumns.length,
    columns: allColumns,
    numeric_stats: numericStats,
    categorical_stats: categoricalStats
  };
}
