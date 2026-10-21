"""
FastAPI Routes for AI Data Analyzer RAG Pipeline.
Endpoints:
- POST /api/analyze-data: Upload & analyze CSV/JSON/TXT datasets
- GET  /api/sample-data: List the 10 approved sample datasets
- GET  /api/sample-data/{filename}: Load validated sample dataset
- POST /api/rag/ingest: Rebuild or refresh ChromaDB vector indices
- GET  /api/rag/status: Health and chunk counts of vector store
"""
import os
import json
import logging
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import APIRouter, File, UploadFile, HTTPException, Query, Body
from fastapi.responses import JSONResponse, PlainTextResponse

from app.config import SAMPLE_DATA_DIR, KNOWLEDGE_BASE_DIR, MAX_UPLOAD_SIZE_BYTES, DISTANCE_PRESENT_THRESHOLD_CM
from app.analyzer.parser import DataParser
from app.analyzer.statistics import StatisticsCalculator
from app.analyzer.rules_engine import RulesEngine
from app.rag.vector_store import vector_store
from app.rag.classifier import RAGClassifier

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["RAG Data Analyzer"])

# Approved sample datasets whitelist for secure path validation
APPROVED_SAMPLE_FILES = {
    "01_ultrasonic_distance.csv": {"format": "CSV", "expected": "Ultrasonic distance readings"},
    "02_tool_presence.json": {"format": "JSON", "expected": "Tool/object presence detection data"},
    "03_machine_running_idle.csv": {"format": "CSV", "expected": "Machine running and idle status logs"},
    "04_dispenser_motor_status.json": {"format": "JSON", "expected": "Dispenser motor ON/OFF data"},
    "05_buzzer_alert_logs.csv": {"format": "CSV", "expected": "Safety buzzer activation logs"},
    "06_status_led_logs.json": {"format": "JSON", "expected": "Status LED state logs"},
    "07_combined_machine_telemetry.csv": {"format": "CSV", "expected": "Combined machine telemetry"},
    "08_idle_duration_history.csv": {"format": "CSV", "expected": "Time-series machine sensor data"},
    "09_anomalous_machine_events.json": {"format": "JSON", "expected": "Machine event and alert logs"},
    "10_unknown_sensor_dataset.csv": {"format": "CSV", "expected": "Unknown / Insufficient Evidence"}
}

def _build_chart_series(records: List[Dict[str, Any]], field_mapping: Dict[str, str]) -> Dict[str, Any]:
    """
    Extracts time-series data for distance, machine state, motor, and buzzer.
    Downsamples smoothly if over 120 points to ensure responsive frontend rendering.
    """
    rev_mapping = {v: k for k, v in field_mapping.items()}
    dist_col = rev_mapping.get("ultrasonic_distance_cm")
    status_col = rev_mapping.get("machine_status")
    motor_col = rev_mapping.get("motor_status")
    buzzer_col = rev_mapping.get("buzzer_status")
    ts_col = rev_mapping.get("timestamp")

    if not dist_col:
        for k in field_mapping.keys():
            if "dist" in k.lower():
                dist_col = k
                break

    step = max(1, len(records) // 100) if len(records) > 100 else 1
    sampled = records[::step]
    
    chart_points = []
    for idx, r in enumerate(sampled):
        time_label = str(r.get(ts_col)) if ts_col and r.get(ts_col) else f"#{idx * step + 1}"
        if "T" in time_label and "Z" in time_label:
            time_label = time_label.split("T")[-1].replace("Z", "")

        pt = {"time": time_label, "index": idx * step + 1}
        
        # Distance
        if dist_col and r.get(dist_col) is not None:
            try:
                pt["distance"] = round(float(r.get(dist_col)), 2)
            except Exception:
                pass

        # Machine Status
        if status_col and r.get(status_col) is not None:
            s_val = str(r.get(status_col)).upper()
            pt["status_val"] = 1 if "RUN" in s_val else 0
            pt["status_label"] = "RUNNING" if "RUN" in s_val else "IDLE"

        # Motor
        if motor_col and r.get(motor_col) is not None:
            m_val = r.get(motor_col)
            is_on = m_val is True or str(m_val).upper() in ["ON", "TRUE", "RUNNING", "1"]
            pt["motor_val"] = 1 if is_on else 0
            pt["motor_label"] = "ON" if is_on else "OFF"

        # Buzzer
        if buzzer_col and r.get(buzzer_col) is not None:
            b_val = r.get(buzzer_col)
            is_bz = b_val is True or str(b_val).upper() in ["ON", "TRUE", "ACTIVE", "1"]
            pt["buzzer_val"] = 1 if is_bz else 0
            pt["buzzer_label"] = "ALARM" if is_bz else "SILENT"

        chart_points.append(pt)

    return {
        "points": chart_points,
        "has_distance": dist_col is not None,
        "has_status": status_col is not None,
        "has_motor": motor_col is not None,
        "has_buzzer": buzzer_col is not None,
        "distance_field": dist_col,
        "status_field": status_col,
        "motor_field": motor_col,
        "buzzer_field": buzzer_col,
        "threshold_cm": DISTANCE_PRESENT_THRESHOLD_CM
    }

@router.get("/rag/status")
def get_rag_status():
    """
    Returns vector store health, collection counts, and indexed status.
    """
    try:
        status = vector_store.get_status()
        return status
    except Exception as e:
        logger.error(f"Error fetching RAG status: {e}")
        return {
            "status": "error",
            "message": str(e),
            "knowledge_base_chunks": 0,
            "sample_reference_chunks": 0
        }

@router.post("/rag/ingest")
def ingest_rag_knowledge(force_rebuild: bool = Query(False)):
    """
    Triggers re-indexing of knowledge base markdown documents and sample datasets metadata.
    """
    try:
        kb_res = vector_store.ingest_knowledge_base(force_rebuild=force_rebuild)
        sample_res = vector_store.ingest_sample_metadata(force_rebuild=force_rebuild)
        return {
            "status": "success",
            "knowledge_base": kb_res,
            "sample_datasets": sample_res,
            "total_indexed_chunks": vector_store.kb_collection.count() + vector_store.samples_collection.count()
        }
    except Exception as e:
        logger.error(f"Error during RAG ingestion: {e}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@router.get("/sample-data")
def list_sample_data():
    """
    Lists the 10 approved sample datasets with their format, expected classification, and file sizes.
    """
    datasets = []
    for filename, meta in APPROVED_SAMPLE_FILES.items():
        file_path = SAMPLE_DATA_DIR / filename
        exists = file_path.exists()
        size_bytes = file_path.stat().st_size if exists else 0
        datasets.append({
            "filename": filename,
            "format": meta["format"],
            "expected_classification": meta["expected"],
            "size_bytes": size_bytes,
            "available": exists
        })
    return {"samples": datasets, "total": len(datasets)}

@router.get("/sample-data/{filename}")
def get_sample_file(filename: str):
    """
    Returns the content of an approved sample dataset.
    Prevents path traversal attacks.
    """
    if filename not in APPROVED_SAMPLE_FILES:
        raise HTTPException(status_code=404, detail=f"File '{filename}' is not an approved sample dataset.")

    safe_path = (SAMPLE_DATA_DIR / filename).resolve()
    if not str(safe_path).startswith(str(SAMPLE_DATA_DIR.resolve())):
        raise HTTPException(status_code=403, detail="Access denied: Path traversal detected.")

    if not safe_path.exists():
        raise HTTPException(status_code=404, detail="Sample file not found on disk.")

    content = safe_path.read_text(encoding="utf-8")
    return {
        "filename": filename,
        "format": APPROVED_SAMPLE_FILES[filename]["format"],
        "expected_classification": APPROVED_SAMPLE_FILES[filename]["expected"],
        "content": content
    }

@router.post("/analyze-data")
async def analyze_data(
    file: Optional[UploadFile] = File(None),
    sample_filename: Optional[str] = Query(None),
    payload: Optional[Dict[str, Any]] = Body(None)
):
    """
    Main RAG Data Classification & Analysis endpoint.
    Accepts:
    1. Direct multipart file upload (CSV, JSON, TXT up to 10MB)
    2. Query param `sample_filename`
    3. JSON payload with `filename` and `content`
    """
    content_bytes = None
    filename = "uploaded_file.csv"

    # Case 1: Uploaded file
    if file:
        filename = file.filename or "uploaded_file"
        content_bytes = await file.read()
        if len(content_bytes) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Uploaded file exceeds maximum limit of {MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
            )

    # Case 2: Selected sample file
    elif sample_filename:
        if sample_filename not in APPROVED_SAMPLE_FILES:
            raise HTTPException(status_code=404, detail=f"Unknown sample file '{sample_filename}'.")
        safe_path = (SAMPLE_DATA_DIR / sample_filename).resolve()
        if not safe_path.exists():
            raise HTTPException(status_code=404, detail="Sample dataset file missing.")
        content_bytes = safe_path.read_bytes()
        filename = sample_filename

    # Case 3: JSON payload
    elif payload and "content" in payload:
        filename = payload.get("filename", "pasted_data.json")
        raw_text = payload.get("content", "")
        content_bytes = raw_text.encode("utf-8")

    if not content_bytes:
        raise HTTPException(status_code=400, detail="No file or data content provided for analysis.")

    # 1. Parse and preprocess
    try:
        parsed_data = DataParser.parse_file(content_bytes, filename)
    except Exception as e:
        logger.warning(f"File parsing error for '{filename}': {e}")
        raise HTTPException(status_code=422, detail=f"Data Parsing Error: {str(e)}")

    # 2. Compute deterministic statistics
    stats = StatisticsCalculator.compute(parsed_data["records"], parsed_data["field_mapping"])

    # 3. Evaluate workstation operating conditions and anomalies
    conditions = RulesEngine.evaluate(
        parsed_data["records"],
        parsed_data["field_mapping"],
        threshold_cm=DISTANCE_PRESENT_THRESHOLD_CM
    )

    # 4. RAG classification and reasoning
    rag_result = RAGClassifier.classify_and_reason(
        parsed_data=parsed_data,
        stats=stats,
        conditions=conditions,
        threshold_cm=DISTANCE_PRESENT_THRESHOLD_CM
    )

    # 5. Build dynamic chart data
    chart_data = _build_chart_series(parsed_data["records"], parsed_data["field_mapping"])

    # 6. Format final report payload
    return {
        "status": "success",
        "file_metadata": {
            "filename": filename,
            "format": parsed_data["format"],
            "file_size_bytes": len(content_bytes),
            "total_records": parsed_data["total_records"],
            "raw_fields": parsed_data["raw_fields"],
            "field_mapping": parsed_data["field_mapping"]
        },
        "classification": rag_result,
        "statistics": stats,
        "condition_analysis": conditions,
        "chart_data": chart_data,
        "preview_records": parsed_data["records"][:50]
    }
