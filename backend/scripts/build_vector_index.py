import sys
import os
import logging
from sqlalchemy.orm import Session
from database import SessionLocal
from models.contextual_event import ContextualEvent
from services.embedding_service import get_embedding
from services.vector_store import VectorStore
from config import settings

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def build_vector_index():
    """Rebuilds the AI vector index from the database state."""
    logger.info("Starting vector index synchronization...")
    new_store = VectorStore(dimension=384)
    os.makedirs(os.path.dirname(settings.FAISS_INDEX_PATH), exist_ok=True)

    db: Session = SessionLocal()
    try:
        events = db.query(ContextualEvent).all()
        if not events:
            logger.warning("No events found. Index will be empty.")
            return

        logger.info(f"Processing {len(events)} events...")
        for i, event in enumerate(events):
            if (i + 1) % 10 == 0: logger.info(f"Progress: {i + 1}/{len(events)}")
            vector = get_embedding(event.event_text)
            metadata = {
                "event_id": event.id,
                "distributor_id": event.distributor_id,
                "event_text": event.event_text,
                "severity_score": float(event.severity_score),
                "event_type": event.event_type,
                "timestamp": event.timestamp.isoformat() if event.timestamp else None
            }
            new_store.add_vector(vector, metadata)

        if new_store.save_index(settings.FAISS_INDEX_PATH):
            logger.info("Index successfully built and persisted.")
        else:
            logger.error("Failed to persist index to disk.")
    except Exception as e:
        logger.error(f"Critical build failure: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    build_vector_index()
