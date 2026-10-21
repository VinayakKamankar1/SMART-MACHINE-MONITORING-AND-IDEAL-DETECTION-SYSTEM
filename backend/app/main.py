"""
Main FastAPI Application Entry Point for Smart Machine Monitoring RAG Backend.
"""
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import HOST, PORT, DEBUG
from app.routes.api import router as api_router
from app.rag.vector_store import vector_store

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("rag-backend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    On startup, verify ChromaDB vector store health and auto-ingest if empty.
    """
    logger.info("Initializing RAG vector store...")
    try:
        status = vector_store.get_status()
        if status.get("total_indexed_chunks", 0) == 0:
            logger.info("Vector store is empty. Auto-ingesting knowledge base and sample metadata...")
            vector_store.ingest_knowledge_base()
            vector_store.ingest_sample_metadata()
            logger.info("Auto-ingestion completed successfully.")
        else:
            logger.info(f"Vector store ready: {status.get('total_indexed_chunks')} chunks indexed.")
    except Exception as e:
        logger.error(f"Error during startup vector store check: {e}")
    yield
    logger.info("Shutting down RAG backend...")

app = FastAPI(
    title="Smart Machine Monitoring - AI Data Analyzer RAG API",
    description="RAG-Based Machine Data Classification & Analysis for Pen Refill Work Station",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "service": "Smart Machine Monitoring AI Data Analyzer RAG Service",
        "status": "operational",
        "docs_url": "/docs",
        "health_check": "/api/rag/status"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=DEBUG)
