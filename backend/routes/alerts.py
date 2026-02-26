from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.distributor import Distributor
from schemas.schemas import AlertsResponse, RiskAlert
from services.structured_risk import StructuredRiskEngine

router = APIRouter(prefix="/alerts")


@router.get("-risk", response_model=AlertsResponse)
def get_risk_alerts(db: Session = Depends(get_db)):
    distributors = db.query(Distributor).all()
    alerts = []
    
    for dist in distributors:
        try:
            risk_data = StructuredRiskEngine.evaluate(db, dist.id)
            score = risk_data.structured_risk
            
            if score > 70:
                # Find most likely reason for high risk
                reason = "Multiple risk factors detected"
                if risk_data.avg_delay_days > 15:
                    reason = f"Severe payment delays (avg {risk_data.avg_delay_days:.1f} days)"
                elif risk_data.utilization_pct > 90:
                    reason = f"Critical credit utilization ({risk_data.utilization_pct:.1f}%)"
                elif risk_data.dispute_count >= 3:
                    reason = f"Frequent payment disputes ({risk_data.dispute_count})"
                
                alerts.append(RiskAlert(
                    distributor_id=dist.id,
                    name=dist.name,
                    city=dist.city,
                    risk_score=score,
                    reason=reason
                ))
        except:
            pass

    # Sort alerts by risk score descending
    alerts.sort(key=lambda x: x.risk_score, reverse=True)

    return AlertsResponse(
        alerts=alerts,
        total=len(alerts)
    )
