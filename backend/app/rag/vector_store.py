"""
Vector Store Management using ChromaDB.
Provides persistent storage, semantic retrieval, and ingestion for the RAG Knowledge Base.
"""
import os
import re
import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings

from app.config import KNOWLEDGE_BASE_DIR, SAMPLE_DATA_DIR, CHROMA_PERSIST_DIR
from app.rag.embeddings import embedding_service

logger = logging.getLogger(__name__)

class VectorStoreManager:
    def __init__(self):
        self.persist_dir = str(CHROMA_PERSIST_DIR)
        os.makedirs(self.persist_dir, exist_ok=True)
        
        self.client = chromadb.PersistentClient(
            path=self.persist_dir,
            settings=Settings(anonymized_telemetry=False)
        )
        self.embedding_fn = embedding_service.get_embedding_function()
        
        # Two distinct collections separating authoritative rules from sample examples
        self.kb_collection = self.client.get_or_create_collection(
            name="rag_knowledge_base",
            embedding_function=self.embedding_fn,
            metadata={"description": "Authoritative workstation operating rules, sensor definitions, and schemas"}
        )
        
        self.samples_collection = self.client.get_or_create_collection(
            name="sample_datasets_metadata",
            embedding_function=self.embedding_fn,
            metadata={"description": "Sample dataset metadata and synthetic example signatures"}
        )

    def _chunk_markdown(self, text: str, source_file: str) -> List[Dict[str, Any]]:
        """
        Splits markdown documents into logical sections based on headers.
        Preserves header context and document source.
        """
        lines = text.split("\n")
        chunks = []
        current_header = Path(source_file).stem.replace("-", " ").title()
        current_content = []
        
        for line in lines:
            if re.match(r"^#{1,3}\s+", line):
                if current_content:
                    body = "\n".join(current_content).strip()
                    if len(body) > 40:
                        chunk_id = f"{Path(source_file).name}#{current_header}".lower().replace(" ", "-")
                        chunks.append({
                            "id": chunk_id,
                            "title": current_header,
                            "content": f"### Document: {source_file}\nSection: {current_header}\n\n{body}",
                            "source_file": Path(source_file).name,
                            "doc_type": "technical_knowledge"
                        })
                    current_content = []
                current_header = re.sub(r"^#{1,3}\s+", "", line).strip()
            else:
                current_content.append(line)
                
        if current_content:
            body = "\n".join(current_content).strip()
            if len(body) > 40:
                chunk_id = f"{Path(source_file).name}#{current_header}".lower().replace(" ", "-")
                chunks.append({
                    "id": chunk_id,
                    "title": current_header,
                    "content": f"### Document: {source_file}\nSection: {current_header}\n\n{body}",
                    "source_file": Path(source_file).name,
                    "doc_type": "technical_knowledge"
                })
                
        return chunks

    def ingest_knowledge_base(self, force_rebuild: bool = False) -> Dict[str, Any]:
        """
        Reads and indexes all markdown files in rag-knowledge-base/
        """
        if force_rebuild:
            try:
                self.client.delete_collection("rag_knowledge_base")
            except Exception:
                pass
            self.kb_collection = self.client.get_or_create_collection(
                name="rag_knowledge_base",
                embedding_function=self.embedding_fn
            )

        if not KNOWLEDGE_BASE_DIR.exists():
            logger.warning(f"Knowledge base directory {KNOWLEDGE_BASE_DIR} does not exist.")
            return {"status": "error", "message": f"Knowledge base directory not found at {KNOWLEDGE_BASE_DIR}"}

        md_files = list(KNOWLEDGE_BASE_DIR.glob("*.md"))
        total_chunks = 0
        indexed_files = []

        for md_path in md_files:
            try:
                content = md_path.read_text(encoding="utf-8")
                chunks = self._chunk_markdown(content, md_path.name)
                
                if chunks:
                    ids = [c["id"] for c in chunks]
                    docs = [c["content"] for c in chunks]
                    metadatas = [{
                        "source_file": c["source_file"],
                        "title": c["title"],
                        "doc_type": c["doc_type"]
                    } for c in chunks]
                    
                    self.kb_collection.upsert(
                        ids=ids,
                        documents=docs,
                        metadatas=metadatas
                    )
                    total_chunks += len(chunks)
                    indexed_files.append(md_path.name)
            except Exception as e:
                logger.error(f"Error indexing {md_path.name}: {e}")

        return {
            "status": "success",
            "indexed_files": indexed_files,
            "total_chunks": total_chunks,
            "collection_count": self.kb_collection.count()
        }

    def ingest_sample_metadata(self, force_rebuild: bool = False) -> Dict[str, Any]:
        """
        Indexes sample datasets descriptions and schemas to aid classification without confusing them with rules.
        """
        if force_rebuild:
            try:
                self.client.delete_collection("sample_datasets_metadata")
            except Exception:
                pass
            self.samples_collection = self.client.get_or_create_collection(
                name="sample_datasets_metadata",
                embedding_function=self.embedding_fn
            )

        readme_path = SAMPLE_DATA_DIR / "README.md"
        sample_entries = []

        if readme_path.exists():
            content = readme_path.read_text(encoding="utf-8")
            # Parse table rows from README.md
            for line in content.split("\n"):
                if line.startswith("| `") and "|" in line:
                    cols = [c.strip() for c in line.split("|")[1:-1]]
                    if len(cols) >= 5:
                        filename = cols[0].replace("`", "").strip()
                        fmt = cols[1].strip()
                        variables = cols[2].replace("`", "").strip()
                        expected_class = cols[3].replace("**", "").strip()
                        purpose = cols[4].strip()
                        sample_entries.append({
                            "id": f"sample_{filename}",
                            "filename": filename,
                            "format": fmt,
                            "variables": variables,
                            "expected_classification": expected_class,
                            "purpose": purpose,
                            "text": f"Sample dataset: {filename} (Format: {fmt})\nVariables: {variables}\nClassification: {expected_class}\nPurpose: {purpose}"
                        })

        if sample_entries:
            ids = [s["id"] for s in sample_entries]
            docs = [s["text"] for s in sample_entries]
            metadatas = [{
                "filename": s["filename"],
                "format": s["format"],
                "expected_classification": s["expected_classification"],
                "doc_type": "sample_reference"
            } for s in sample_entries]
            
            self.samples_collection.upsert(
                ids=ids,
                documents=docs,
                metadatas=metadatas
            )

        return {
            "status": "success",
            "sample_entries_indexed": len(sample_entries),
            "collection_count": self.samples_collection.count()
        }

    def query(self, query_text: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """
        Searches the knowledge base and sample metadata collections for matching evidence.
        Returns combined retrieved passages with distance, score, and source metadata.
        """
        results = []
        
        # 1. Query Knowledge Base
        try:
            kb_res = self.kb_collection.query(
                query_texts=[query_text],
                n_results=min(n_results, max(1, self.kb_collection.count()))
            )
            if kb_res and kb_res["documents"] and kb_res["documents"][0]:
                for i in range(len(kb_res["documents"][0])):
                    dist = kb_res["distances"][0][i] if "distances" in kb_res and kb_res["distances"] else 0.5
                    score = max(0.0, min(1.0, 1.0 - (dist / 2.0)))
                    meta = kb_res["metadatas"][0][i] if "metadatas" in kb_res and kb_res["metadatas"] else {}
                    results.append({
                        "source_file": meta.get("source_file", "knowledge-base"),
                        "title": meta.get("title", "Technical Rule"),
                        "doc_type": "Authoritative Rule",
                        "content": kb_res["documents"][0][i],
                        "similarity_score": round(score, 3),
                        "distance": round(dist, 4)
                    })
        except Exception as e:
            logger.error(f"Error querying knowledge base: {e}")

        # 2. Query Sample Reference
        try:
            if self.samples_collection.count() > 0:
                s_res = self.samples_collection.query(
                    query_texts=[query_text],
                    n_results=min(3, max(1, self.samples_collection.count()))
                )
                if s_res and s_res["documents"] and s_res["documents"][0]:
                    for i in range(len(s_res["documents"][0])):
                        dist = s_res["distances"][0][i] if "distances" in s_res and s_res["distances"] else 0.5
                        score = max(0.0, min(1.0, 1.0 - (dist / 2.0)))
                        meta = s_res["metadatas"][0][i] if "metadatas" in s_res and s_res["metadatas"] else {}
                        results.append({
                            "source_file": meta.get("filename", "sample-data"),
                            "title": f"Sample Signature: {meta.get('filename')}",
                            "doc_type": "Sample Example Reference",
                            "content": s_res["documents"][0][i],
                            "similarity_score": round(score, 3),
                            "distance": round(dist, 4)
                        })
        except Exception as e:
            logger.error(f"Error querying sample collection: {e}")

        # Sort by similarity score descending
        results.sort(key=lambda x: x["similarity_score"], reverse=True)
        return results[:n_results]

    def get_status(self) -> Dict[str, Any]:
        """
        Returns index health, collection counts, and persist dir.
        """
        kb_count = self.kb_collection.count()
        samples_count = self.samples_collection.count()
        return {
            "status": "ready" if kb_count > 0 else "needs_ingestion",
            "persist_dir": self.persist_dir,
            "knowledge_base_chunks": kb_count,
            "sample_reference_chunks": samples_count,
            "total_indexed_chunks": kb_count + samples_count,
            "embedding_model": "all-MiniLM-L6-v2 (ChromaDB Local ONNX)"
        }

vector_store = VectorStoreManager()
