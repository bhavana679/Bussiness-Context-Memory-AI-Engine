from sqlalchemy import Column, Integer, ForeignKey, Text, Float, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class ContextualEvent(Base):
    __tablename__ = "contextual_events"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False, index=True)
    event_text = Column(Text, nullable=False)
    severity_score = Column(Float, nullable=False, default=0.0)
    event_type = Column(Text, nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    distributor = relationship("Distributor", back_populates="contextual_events")
