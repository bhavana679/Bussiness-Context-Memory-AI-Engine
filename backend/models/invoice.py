from sqlalchemy import Column, Integer, ForeignKey, Numeric, Date, DateTime, Boolean, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from database import Base


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    distributor_id = Column(Integer, ForeignKey("distributors.id"), nullable=False, index=True)
    invoice_number = Column(String(50), unique=True, nullable=False)
    amount = Column(Numeric(15, 2), nullable=False)
    due_date = Column(Date, nullable=False)
    paid_date = Column(Date, nullable=True)       # NULL means unpaid
    delay_days = Column(Integer, nullable=False, default=0)
    status = Column(String(20), nullable=False, default="pending")  # pending | paid | overdue
    dispute_flag = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    distributor = relationship("Distributor", back_populates="invoices")
