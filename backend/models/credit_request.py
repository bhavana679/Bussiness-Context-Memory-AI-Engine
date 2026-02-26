from sqlalchemy import Column, Integer, ForeignKey, Numeric, String, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class CreditRequest(Base):
    __tablename__ = "credit_requests"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False, index=True)
    requested_amount = Column(Numeric(15, 2), nullable=False)
    structured_risk_score = Column(Float, nullable=True)   # filled after evaluation
    decision = Column(String(20), nullable=True)           # approve | partial | reject
    recommended_credit = Column(Numeric(15, 2), nullable=True)
    confidence = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    distributor = relationship("Distributor", back_populates="credit_requests")
