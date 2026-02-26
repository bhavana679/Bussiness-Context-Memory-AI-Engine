import logging
import numpy as np
from typing import List
from functools import lru_cache
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

MODEL_NAME = 'all-MiniLM-L6-v2'
VECTOR_DIMENSION = 384 
MAX_TEXT_LENGTH = 510 

class EmbeddingModel:
    """Handles core NLP operations using SentenceTransformers."""
    def __init__(self):
        self._model = None

    def load(self):
        if self._model is None:
            logger.info(f"AI-Model: Initializing {MODEL_NAME}")
            self._model = SentenceTransformer(MODEL_NAME)
            self._model.max_seq_length = MAX_TEXT_LENGTH

    @lru_cache(maxsize=1024)
    def generate_single(self, text: str) -> np.ndarray:
        if not text or not text.strip():
            return np.zeros(VECTOR_DIMENSION)
        self.load()
        return self._model.encode(text, convert_to_numpy=True)

    def generate_batch(self, texts: List[str]) -> List[np.ndarray]:
        if not texts: return []
        self.load()
        return [self.generate_single(t) for t in texts]

_engine = EmbeddingModel()

def get_embedding(text: str) -> np.ndarray:
    """Singleton wrapper for generating a single vector."""
    return _engine.generate_single(text)

def get_embeddings_batch(texts: List[str]) -> List[np.ndarray]:
    """Singleton wrapper for batch vector generation."""
    return _engine.generate_batch(texts)
