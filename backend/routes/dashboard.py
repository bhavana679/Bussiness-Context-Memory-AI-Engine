from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from database import get_db
from models.distributor import Distributor
from models.invoice import Invoice
from schemas.schemas import DashboardSummary
from services.structured_risk import StructuredRiskEngine
from services.dashboard_service import get_dashboard_summary

router = APIRouter(prefix="")

@router.get("/dashboard-summary")
def dashboard_status(db: Session = Depends(get_db)):
    """Returns core dashboard analytics."""
    return get_dashboard_summary(db)

@router.get("-summary", response_model=DashboardSummary)
def get_dashboard_legacy_summary(db: Session = Depends(get_db)):
    """Legacy endpoint for backward compatibility."""
    distributors = db.query(Distributor).all()
    total_exposure = db.query(func.sum(Distributor.current_outstanding)).scalar() or Decimal("0")
    total_limit = db.query(func.sum(Distributor.credit_limit)).scalar() or Decimal("0")
    overdue_count = db.query(Invoice).filter(Invoice.status == "overdue").count()
    total_invoices = db.query(Invoice).count()
    overdue_pct = (overdue_count / total_invoices * 100) if total_invoices > 0 else 0
    
    risk_scores, util_percentages = [], []
    high_risk_count = 0
    
    for dist in distributors:
        util_pct = (float(dist.current_outstanding) / float(dist.credit_limit) * 100) if dist.credit_limit > 0 else 0
        util_percentages.append(util_pct)
        try:
            risk_data = StructuredRiskEngine.evaluate(db, dist.id)
            score = risk_data.structured_risk
            risk_scores.append(score)
            if score > 70: high_risk_count += 1
        except: pass

    avg_util = sum(util_percentages) / len(util_percentages) if util_percentages else 0
    avg_risk = sum(risk_scores) / len(risk_scores) if risk_scores else 0

    return DashboardSummary(
        total_distributors=len(distributors),
        total_exposure=total_exposure,
        total_credit_limit=total_limit,
        avg_utilization_pct=avg_util,
        avg_risk_score=avg_risk,
        overdue_count=overdue_count,
        overdue_pct=overdue_pct,
        high_risk_count=high_risk_count
    )
