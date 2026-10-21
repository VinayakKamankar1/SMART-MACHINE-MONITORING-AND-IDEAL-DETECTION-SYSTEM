"""
Embeddings utility module for RAG semantic search.
Uses ChromaDB's local ONNX all-MiniLM-L6-v2 or SentenceTransformer for generating vector embeddings.
"""
from typing import List
import logging

logger = logging.getLogger(__name__)

class EmbeddingService:
    def __init__(self):
        self._model = None
        self._provider = "chroma_default"

    def get_embedding_function(self):
        """
        Returns ChromaDB compatible embedding function.
        ChromaDB's default embedding function uses all-MiniLM-L6-v2 via ONNX runtime,
        which runs fully locally, fast, and does not require external API calls.
        """
        try:
            import chromadb.utils.embedding_functions as ef
            return ef.DefaultEmbeddingFunction()
        except Exception as e:
            logger.warning(f"Failed to load Chroma default embedding function: {e}. Using SentenceTransformer.")
            try:
                from sentence_transformers import SentenceTransformer
                st_model = SentenceTransformer('all-MiniLM-L6-v2')
                class STEmbeddingFunction:
                    def __call__(self, input: List[str]) -> List[List[float]]:
                        return st_model.encode(input).tolist()
                return STEmbeddingFunction()
            except Exception as e2:
                logger.error(f"Fallback to ST embedding also failed: {e2}")
                raise e2

embedding_service = EmbeddingService()
