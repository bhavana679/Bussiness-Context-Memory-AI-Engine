from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models.distributor import Distributor
from models.invoice import Invoice
from schemas.schemas import DistributorSummary, DistributorProfile, InvoiceSummary
from services.memory_service import MemoryService
from services.structured_risk import StructuredRiskEngine, calculate_structured_risk
from services.semantic_risk import calculate_semantic_risk

router = APIRouter(prefix="")

@router.get("/distributors", response_model=List[DistributorSummary])
def list_distributors(
    search: Optional[str] = None,
    risk_filter: Optional[str] = None,
    industry: Optional[str] = None,
    page: int = 1,
    limit: int = 8,
    sort_by_risk: Optional[bool] = False,
    db: Session = Depends(get_db)
):
    """Lists all distributors with advanced server-side search and filtering."""
    query = db.query(Distributor)
    
    if search:
        query = query.filter(Distributor.name.ilike(f"%{search}%"))
    
    if industry:
        query = query.filter(Distributor.industry == industry)
    
    distributors = query.offset((page - 1) * limit).limit(limit).all()
    results = []
    
    for dist in distributors:
        risk_data = StructuredRiskEngine.evaluate(db, dist.id)

        score = risk_data.structured_risk
        category = "low"
        if score >= 80: category = "high"
        elif score >= 40: category = "medium"

        if risk_filter and risk_filter.lower() != category:
            continue

        results.append(DistributorSummary(
            id=dist.id, name=dist.name, industry=dist.industry, city=dist.city,
            credit_limit=float(dist.credit_limit), current_outstanding=float(dist.current_outstanding),
            utilization_pct=float((dist.current_outstanding / dist.credit_limit) * 100) if dist.credit_limit > 0 else 0,
            risk_score=score
        ))
    
    if sort_by_risk:
        results.sort(key=lambda x: x.risk_score, reverse=True)
        
    return results

@router.get("/distributor/{distributor_id}", response_model=DistributorProfile)
def get_distributor(distributor_id: int, db: Session = Depends(get_db)):
    """Returns a profile of a single distributor with risk diagnostics."""
    dist = db.query(Distributor).filter(Distributor.id == distributor_id).first()
    if not dist:
        raise HTTPException(status_code=404, detail="Distributor not found")
    
    risk_data_obj = StructuredRiskEngine.evaluate(db, distributor_id)
    risk_data_dict = calculate_structured_risk(db, distributor_id)
    semantic_data = calculate_semantic_risk(risk_data_dict)
    
    return DistributorProfile(
        id=dist.id,
        name=dist.name,
        industry=dist.industry,
        city=dist.city,
        credit_limit=float(dist.credit_limit),
        current_utilization=float(dist.current_outstanding),
        final_risk=float((0.6 * risk_data_obj.structured_risk) + (0.4 * semantic_data["semantic_risk"])),
        structured_risk=risk_data_obj.structured_risk,
        semantic_risk=semantic_data["semantic_risk"],
        risk_trend=[
            {"date": "2024-03", "score": risk_data_obj.structured_risk}
        ],
        explanation=semantic_data["explanation"],
        breakdown={
            "Utilization": risk_data_obj.utilization_score * 100,
            "Delay_History": risk_data_obj.avg_delay_score * 100,
            "Dispute_Intensity": risk_data_obj.dispute_score * 100,
            "Sales_Momentum": (1.0 + MemoryService.get_sales_trend(db, distributor_id)) * 50
        },
        similar_cases=semantic_data["all_similar_cases"]
    )
