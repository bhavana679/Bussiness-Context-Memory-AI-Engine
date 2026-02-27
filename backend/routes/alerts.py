from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models.distributor import Distributor
from schemas.schemas import AlertsResponse, RiskAlert
from services.structured_risk import StructuredRiskEngine
from services.alert_service import generate_risk_alerts

class AlertItem(BaseModel):
    id: str
    message: str
    severity: str
    type: str
    distributor_name: str

router = APIRouter(prefix="")

@router.get("/risk-alerts", response_model=List[AlertItem])
def fetch_risk_alerts(db: Session = Depends(get_db)):
    """Fetches high-risk triggers and behavioral alerts as structured objects."""
    try:
        return generate_risk_alerts(db)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch risk alerts: {str(e)}")

@router.get("-risk", response_model=AlertsResponse)
def get_risk_alerts(db: Session = Depends(get_db)):
    """Legacy endpoint for identifying major risk alerts."""
    distributors = db.query(Distributor).all()
    alerts = []
    
    for dist in distributors:
        try:
            risk_data = StructuredRiskEngine.evaluate(db, dist.id)
            score = risk_data.structured_risk
            if score > 70:
                reason = "Multiple risk factors detected"
                if risk_data.avg_delay_days > 15:
                    reason = f"Severe payment delays (avg {risk_data.avg_delay_days:.1f} days)"
                elif risk_data.utilization_pct > 90:
                    reason = f"Critical credit utilization ({risk_data.utilization_pct:.1f}%)"
                elif risk_data.dispute_count >= 3:
                    reason = f"Frequent payment disputes ({risk_data.dispute_count})"
                
                alerts.append(RiskAlert(
                    distributor_id=dist.id, name=dist.name, city=dist.city,
                    risk_score=score, reason=reason
                ))
        except: pass

    alerts.sort(key=lambda x: x.risk_score, reverse=True)
    return AlertsResponse(alerts=alerts, total=len(alerts))
