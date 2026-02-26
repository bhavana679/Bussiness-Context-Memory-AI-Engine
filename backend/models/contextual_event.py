from sqlalchemy import Column, Integer, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class ContextualEvent(Base):
    """
    Stub table for Person 2 (AI/Semantic layer).
    Person 1 creates the table and can add events via seed_data.
    Person 2 will build the embedding + FAISS layer on top of this table.
    """
    __tablename__ = "contextual_events"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False, index=True)
    event_text = Column(Text, nullable=False)        # Natural language description of event
    severity_score = Column(Float, nullable=False, default=0.0)  # 0.0 (low) – 1.0 (critical)
    event_type = Column(Text, nullable=True)         # e.g., "quality_issue", "late_payment", "dispute"
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    distributor = relationship("Distributor", back_populates="contextual_events")
