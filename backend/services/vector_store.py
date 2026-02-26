import faiss
import numpy as np
import logging
import pickle
import os
import time
from typing import List, Dict, Any, Tuple, Optional
from config import settings

logger = logging.getLogger(__name__)
DIMENSION = 384

class VectorStore:
    """Manages a local FAISS index for high-speed similarity search."""
    def __init__(self, dimension: int = DIMENSION):
        self.dimension = dimension
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata: List[Dict[str, Any]] = []

    def add_vector(self, vector: np.ndarray, metadata: Dict[str, Any]) -> bool:
        """Inserts a single vector and its associated metadata into the store."""
        try:
            vec = np.array(vector).astype('float32').reshape(1, -1)
            
            if vec.shape[1] != self.dimension:
                logger.error(f"AI-Memory: Dimension mismatch. Target: {self.dimension}, Actual: {vec.shape[1]}")
                return False

            self.index.add(vec)
            self.metadata.append(metadata)
            return True
        except Exception as e:
            logger.error(f"AI-Memory: Failed to index vector: {str(e)}")
            return False

    def search_vector(self, query_vector: np.ndarray, k: int = 5) -> List[Dict[str, Any]]:
        """Searches for the top K closest vectors in the index with performance timing."""
        if self.index.ntotal == 0:
            logger.warning("AI-Memory: Search ignored. Semantic index is currently empty.")
            return []

        start_time = time.time()
        try:
            query = np.array(query_vector).astype('float32').reshape(1, -1)
            actual_k = min(k, self.index.ntotal)
            
            distances, indices = self.index.search(query, actual_k)
            
            results = []
            for i, idx in enumerate(indices[0]):
                if idx != -1:
                    info = self.metadata[idx].copy()
                    info["distance"] = float(distances[0][i])
                    results.append(info)
            
            duration = (time.time() - start_time) * 1000
            logger.info(f"AI-Memory: Semantic search completed in {duration:.2f}ms. Results: {len(results)}")
            return results
        except Exception as e:
            logger.error(f"AI-Memory: Search failed: {str(e)}")
            return []

    def save_index(self, filepath: str) -> bool:
        """Saves the FAISS index and metadata to disk."""
        try:
            os.makedirs(os.path.dirname(filepath), exist_ok=True)
            faiss.write_index(self.index, f"{filepath}.index")
            with open(f"{filepath}.meta", 'wb') as f:
                pickle.dump(self.metadata, f)
            logger.info(f"AI-Memory: Persistence successful. Saved to {filepath}")
            return True
        except Exception as e:
            logger.error(f"AI-Memory: Save failed: {str(e)}")
            return False

    def load_index(self, filepath: str) -> bool:
        """Loads the FAISS index and metadata from disk."""
        try:
            faiss_path = f"{filepath}.index"
            meta_path = f"{filepath}.meta"
            if not os.path.exists(faiss_path) or not os.path.exists(meta_path):
                logger.warning(f"AI-Memory: Checkpoint not found at {filepath}.")
                return False
                
            self.index = faiss.read_index(faiss_path)
            with open(meta_path, 'rb') as f:
                self.metadata = pickle.load(f)
            logger.info(f"AI-Memory: Successfully loaded {self.index.ntotal} records.")
            return True
        except Exception as e:
            logger.error(f"AI-Memory: Load failed: {str(e)}")
            return False

    def rebuild_from_db(self, db_session, index_path: str):
        """Full rebuild of the vector index from database events."""
        from models.contextual_event import ContextualEvent
        from services.embedding_service import get_embedding
        
        logger.info("AI-Memory: Initiating full index rebuild from database...")
        self.index = faiss.IndexFlatL2(self.dimension)
        self.metadata = []
        
        try:
            events = db_session.query(ContextualEvent).all()
            if not events:
                logger.warning("AI-Memory: Database empty. Index remains empty.")
                return

            for event in events:
                vector = get_embedding(event.event_text)
                meta = {
                    "event_id": event.id,
                    "distributor_id": event.distributor_id,
                    "event_text": event.event_text,
                    "severity_score": float(event.severity_score),
                    "timestamp": event.timestamp.isoformat() if event.timestamp else None
                }
                self.add_vector(vector, meta)
            self.save_index(index_path)
            logger.info(f"AI-Memory: Rebuild complete. Ready to serve {self.index.ntotal} records.")
        except Exception as e:
            logger.error(f"AI-Memory: Rebuild aborted: {str(e)}")

store = VectorStore()

def initialize_vector_engine():
    """Ensures AI Engine is operational on startup."""
    from database import SessionLocal
    index_path = settings.FAISS_INDEX_PATH
    if not store.load_index(index_path):
        with SessionLocal() as db:
            store.rebuild_from_db(db, index_path)
    logger.info("AI-Memory: Engine online.")
