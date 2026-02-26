from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from decimal import Decimal
from models.invoice import Invoice
from models.distributor import Distributor

class MemoryService:
    @staticmethod
    def get_immediate_memory(db: Session, distributor_id: int):
        """Fetches current outstanding and utilization metrics."""
        dist = db.query(Distributor).filter(Distributor.id == distributor_id).first()
        if not dist: return None
        util_pct = (float(dist.current_outstanding) / float(dist.credit_limit) * 100) if dist.credit_limit > 0 else 0
        return {
            "credit_limit": dist.credit_limit,
            "current_outstanding": dist.current_outstanding,
            "utilization_pct": min(util_pct, 100.0)
        }

    @staticmethod
    def get_historical_memory(db: Session, distributor_id: int):
        """Analyzes payment behavior and disputes over the last 90 days."""
        ninety_days_ago = date.today() - timedelta(days=90)
        invoices = db.query(Invoice).filter(
            Invoice.distributor_id == distributor_id,
            Invoice.due_date >= ninety_days_ago
        ).all()
        
        if not invoices:
            return {"avg_delay_days": 0.0, "delay_frequency": 0.0, "dispute_count": 0, "total_invoices": 0}
        
        avg_delay = sum(inv.delay_days for inv in invoices) / len(invoices)
        late_count = sum(1 for inv in invoices if inv.delay_days > 0 or inv.status == "overdue")
        dispute_count = sum(1 for inv in invoices if inv.dispute_flag)
        
        return {
            "avg_delay_days": float(avg_delay),
            "delay_frequency": float(late_count / len(invoices)),
            "dispute_count": dispute_count,
            "total_invoices": len(invoices)
        }

    @staticmethod
    def get_sales_trend(db: Session, distributor_id: int):
        """Calculates 30-day sales momentum compared to the prior period."""
        today = date.today()
        last_30 = db.query(func.sum(Invoice.amount)).filter(
            Invoice.distributor_id == distributor_id,
            Invoice.created_at >= (today - timedelta(days=30))
        ).scalar() or Decimal("0")
        
        prev_30 = db.query(func.sum(Invoice.amount)).filter(
            Invoice.distributor_id == distributor_id,
            Invoice.created_at >= (today - timedelta(days=60)),
            Invoice.created_at < (today - timedelta(days=30))
        ).scalar() or Decimal("0")
        
        if prev_30 == 0: return 0.0
        trend = (float(last_30) - float(prev_30)) / float(prev_30)
        return max(min(trend, 1.0), -1.0)
