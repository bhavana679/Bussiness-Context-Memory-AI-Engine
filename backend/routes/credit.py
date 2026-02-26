from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from database import get_db
from models.credit_request import CreditRequest
from models.distributor import Distributor
from schemas.schemas import CreditRequestInput, CreditDecisionResponse
from services.credit_service import make_credit_decision

router = APIRouter(prefix="/credit")

@router.post("-request", response_model=CreditDecisionResponse)
def request_credit(data: CreditRequestInput, db: Session = Depends(get_db)):
    """Processes a hybrid credit request and stores the resulting analysis."""
    dist = db.query(Distributor).filter(Distributor.id == data.distributor_id).first()
    if not dist:
        raise HTTPException(status_code=404, detail="Distributor not found")

    analysis = make_credit_decision(db, data.distributor_id, float(data.requested_amount))
    
    credit_req = CreditRequest(
        distributor_id=analysis["distributor_id"],
        requested_amount=Decimal(str(analysis["requested_amount"])),
        structured_risk_score=analysis["structured_risk"],
        decision=analysis["decision"],
        recommended_credit=Decimal("0"),
        confidence=analysis["confidence_score"]
    )
    db.add(credit_req)
    db.commit()
    db.refresh(credit_req)

    return CreditDecisionResponse(**analysis)
