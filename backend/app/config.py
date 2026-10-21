import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
KNOWLEDGE_BASE_DIR = BASE_DIR / "rag-knowledge-base"
SAMPLE_DATA_DIR = BASE_DIR / "sample-data"
CHROMA_PERSIST_DIR = BASE_DIR / "backend" / "chroma_db"

# Load .env file from workspace root or backend directory
load_dotenv(BASE_DIR / ".env")
load_dotenv(BASE_DIR / "backend" / ".env")

# API Keys & LLM settings
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "auto") # auto, gemini, openai, local
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-2.5-flash")

# Server settings
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", "8000"))
DEBUG = os.getenv("DEBUG", "true").lower() == "true"

# Workstation Operating Thresholds
DISTANCE_PRESENT_THRESHOLD_CM = float(os.getenv("DISTANCE_PRESENT_THRESHOLD_CM", "15.0"))
MAX_UPLOAD_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_BYTES", str(10 * 1024 * 1024))) # 10MB limit
