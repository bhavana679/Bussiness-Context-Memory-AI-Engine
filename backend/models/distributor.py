from sqlalchemy import Column, Integer, String, Numeric, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Distributor(Base):
    __tablename__ = "distributors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, unique=True)
    industry = Column(String(100), nullable=False)
    city = Column(String(100), nullable=False)
    credit_limit = Column(Numeric(15, 2), nullable=False, default=0)
    current_outstanding = Column(Numeric(15, 2), nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    invoices = relationship("Invoice", back_populates="distributor")
    credit_requests = relationship("CreditRequest", back_populates="distributor")
    contextual_events = relationship("ContextualEvent", back_populates="distributor")
