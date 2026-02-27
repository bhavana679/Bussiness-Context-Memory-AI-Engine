from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from decimal import Decimal
from database import get_db
from models.credit_request import CreditRequest
from models.distributor import Distributor
from schemas.schemas import CreditRequestInput, CreditDecisionResponse, CreditHistoryItem
from services.credit_service import make_credit_decision

router = APIRouter(prefix="")

@router.get("/credit-history", response_model=List[CreditHistoryItem])
def get_credit_history(db: Session = Depends(get_db)):
    """Retrieves a history of the last 10 credit decisions."""
    requests = db.query(CreditRequest).order_by(CreditRequest.created_at.desc()).limit(10).all()
    history = []
    for req in requests:
        history.append(CreditHistoryItem(
            id=req.id,
            distributor_name=req.distributor.name if req.distributor else "Unknown",
            requested_amount=float(req.requested_amount),
            decision=req.decision,
            risk_score=float(req.structured_risk_score or 0),
            confidence=float(req.confidence or 0),
            created_at=req.created_at
        ))
    return history

@router.post("/credit-request", response_model=CreditDecisionResponse)
def evaluate_credit(data: CreditRequestInput, db: Session = Depends(get_db)):
    """Processes a credit request and stores the resulting analysis."""
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
