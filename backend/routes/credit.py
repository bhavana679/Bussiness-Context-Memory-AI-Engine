from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.credit_request import CreditRequest
from models.distributor import Distributor
from schemas.schemas import CreditRequestInput, CreditDecisionResponse
from services.structured_risk import StructuredRiskEngine
from decimal import Decimal

router = APIRouter(prefix="/credit")


@router.post("-request", response_model=CreditDecisionResponse)
def request_credit(data: CreditRequestInput, db: Session = Depends(get_db)):
    dist = db.query(Distributor).filter(Distributor.id == data.distributor_id).first()
    if not dist:
        raise HTTPException(status_code=404, detail="Distributor not found")

    # 1. Evaluate structured risk
    risk_breakdown = StructuredRiskEngine.evaluate(db, data.distributor_id)
    score = risk_breakdown.structured_risk

    # 2. Decision Logic
    decision = "reject"
    recommended_amount = Decimal("0")
    confidence = 0.9  # Fixed high confidence for structured part

    if score < 40:
        decision = "approve"
        recommended_amount = data.requested_amount
    elif score < 70:
        decision = "partial"
        recommended_amount = data.requested_amount * Decimal("0.6") # Approve 60%
    else:
        decision = "reject"
        recommended_amount = Decimal("0")

    # 3. Save request record
    credit_req = CreditRequest(
        distributor_id=data.distributor_id,
        requested_amount=data.requested_amount,
        structured_risk_score=score,
        decision=decision,
        recommended_credit=recommended_amount,
        confidence=confidence
    )
    db.add(credit_req)
    db.commit()
    db.refresh(credit_req)

    # 4. Determine influential factors
    factors = []
    if risk_breakdown.utilization_pct > 80:
        factors.append(f"High credit utilization ({risk_breakdown.utilization_pct:.1f}%)")
    if risk_breakdown.avg_delay_days > 10:
        factors.append(f"Recent average payment delay of {risk_breakdown.avg_delay_days:.1f} days")
    if risk_breakdown.dispute_count > 0:
        factors.append(f"Presence of payment disputes ({risk_breakdown.dispute_count} counts)")
    if risk_breakdown.sales_decline_score > 0.3:
        factors.append("Significant decline in sales trend detected")
    
    if not factors:
        factors.append("Overall healthy financial indicators and low delay score")

    return CreditDecisionResponse(
        distributor_id=data.distributor_id,
        requested_amount=data.requested_amount,
        structured_risk=score,
        decision=decision,
        recommended_credit=recommended_amount,
        confidence=confidence,
        influential_factors=factors,
        risk_breakdown=risk_breakdown
    )
