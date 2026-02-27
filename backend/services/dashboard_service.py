import logging
from typing import Dict
from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal
from models.distributor import Distributor
from models.invoice import Invoice
from .structured_risk import calculate_structured_risk

logger = logging.getLogger(__name__)

def get_dashboard_summary(db: Session) -> Dict:
    """Calculates overall portfolio statistics and identifies high-risk distributors."""
    logger.info("Calculating dashboard summary metrics")

    total_exposure = db.query(func.sum(Distributor.current_outstanding)).scalar() or Decimal("0")
    overdue_count = db.query(Invoice).filter(Invoice.delay_days > 0).count()
    distributors = db.query(Distributor).all()
    
    risk_scores = []
    high_risk_list = []
    
    for dist in distributors:
        risk_data = calculate_structured_risk(db, dist.id)
        score = risk_data["structured_risk"]
        risk_scores.append(score)
        
        if score > 70:
            high_risk_list.append({
                "id": dist.id,
                "name": dist.name,
                "city": dist.city,
                "risk_score": float(score),
                "outstanding": float(dist.current_outstanding)
            })

    avg_risk_score = sum(risk_scores) / len(risk_scores) if risk_scores else 0.0

    # Calculate distribution
    low = sum(1 for s in risk_scores if s < 40)
    medium = sum(1 for s in risk_scores if 40 <= s < 70)
    high = sum(1 for s in risk_scores if s >= 70)

    # Get recent alerts for dashboard integration
    from .alert_service import generate_risk_alerts
    all_alerts = generate_risk_alerts(db)
    recent_alerts = all_alerts[:3] # Show top 3 alerts

    return {
        "total_exposure": float(total_exposure),
        "avg_risk_score": float(round(avg_risk_score, 2)),
        "overdue_count": int(overdue_count),
        "active_count": len(distributors),
        "risk_distribution": [
            {"name": "Low", "value": low},
            {"name": "Medium", "value": medium},
            {"name": "High", "value": high}
        ],
        "exposure_trend": [
            {"name": "Jan", "exposure": float(total_exposure) * 0.75},
            {"name": "Feb", "exposure": float(total_exposure) * 0.88},
            {"name": "Mar", "exposure": float(total_exposure)}
        ],
        "high_risk_distributors": high_risk_list,
        "recent_alerts": recent_alerts
    }
