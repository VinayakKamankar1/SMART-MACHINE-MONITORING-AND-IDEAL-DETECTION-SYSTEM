"""
Standalone Ingestion Script for RAG Knowledge Base and Sample Metadata.
Run with:
    python backend/ingest.py
or:
    python backend/ingest.py --rebuild
"""
import sys
import argparse
from pathlib import Path

# Add backend directory to sys.path so app imports work
backend_dir = Path(__file__).resolve().parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.rag.vector_store import vector_store

def run_ingestion(force_rebuild: bool = False):
    print("=" * 60)
    print("SMART MACHINE MONITORING: RAG KNOWLEDGE BASE INGESTION")
    print("=" * 60)
    print(f"Force Rebuild: {force_rebuild}")
    
    print("\n1. Indexing authoritative technical markdown documents...")
    kb_res = vector_store.ingest_knowledge_base(force_rebuild=force_rebuild)
    print(f"   Status: {kb_res.get('status')}")
    print(f"   Indexed Files: {kb_res.get('indexed_files')}")
    print(f"   Chunks Ingested: {kb_res.get('total_chunks')}")
    
    print("\n2. Indexing sample dataset schemas and signatures...")
    sample_res = vector_store.ingest_sample_metadata(force_rebuild=force_rebuild)
    print(f"   Status: {sample_res.get('status')}")
    print(f"   Sample Signatures Ingested: {sample_res.get('sample_entries_indexed')}")
    
    print("\n3. Verifying ChromaDB Index Health...")
    status = vector_store.get_status()
    print(f"   Total Indexed Chunks: {status.get('total_indexed_chunks')}")
    print(f"   ChromaDB Directory: {status.get('persist_dir')}")
    print(f"   Status: {status.get('status')}")
    print("=" * 60)
    print("Ingestion successfully completed!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest Knowledge Base into ChromaDB")
    parser.add_argument("--rebuild", action="store_true", help="Force rebuild vector store collections")
    args = parser.parse_args()
    run_ingestion(force_rebuild=args.rebuild)
