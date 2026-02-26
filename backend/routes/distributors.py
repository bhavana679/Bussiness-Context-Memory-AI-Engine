from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from models.distributor import Distributor
from models.invoice import Invoice
from schemas.schemas import DistributorSummary, DistributorProfile, InvoiceSummary
from services.memory_service import MemoryService
from services.structured_risk import StructuredRiskEngine

router = APIRouter(prefix="/distributors")


@router.get("/", response_model=List[DistributorSummary])
def list_distributors(db: Session = Depends(get_db)):
    distributors = db.query(Distributor).all()
    results = []
    
    for dist in distributors:
        # Compute summary fields
        utilization_pct = (float(dist.current_outstanding) / float(dist.credit_limit) * 100) if dist.credit_limit > 0 else 0
        
        # Get latest risk score if available (simplified for list)
        try:
            risk_data = StructuredRiskEngine.evaluate(db, dist.id)
            risk_score = risk_data.structured_risk
        except:
            risk_score = None

        results.append(DistributorSummary(
            id=dist.id,
            name=dist.name,
            industry=dist.industry,
            city=dist.city,
            credit_limit=dist.credit_limit,
            current_outstanding=dist.current_outstanding,
            utilization_pct=utilization_pct,
            risk_score=risk_score
        ))
    
    return results


@router.get("/{distributor_id}", response_model=DistributorProfile)
def get_distributor(distributor_id: int, db: Session = Depends(get_db)):
    dist = db.query(Distributor).filter(Distributor.id == distributor_id).first()
    if not dist:
        raise HTTPException(status_code=404, detail="Distributor not found")
    
    # Fetch memory components
    immediate = MemoryService.get_immediate_memory(db, distributor_id)
    historical = MemoryService.get_historical_memory(db, distributor_id)
    sales_trend = MemoryService.get_sales_trend(db, distributor_id)
    
    # Get structured risk
    risk_data = StructuredRiskEngine.evaluate(db, distributor_id)
    
    # Get recent 5 invoices
    recent_invoices = db.query(Invoice).filter(
        Invoice.distributor_id == distributor_id
    ).order_by(Invoice.due_date.desc()).limit(5).all()
    
    invoice_schemas = [InvoiceSummary.from_attributes(inv) for inv in recent_invoices]

    return DistributorProfile(
        id=dist.id,
        name=dist.name,
        industry=dist.industry,
        city=dist.city,
        credit_limit=dist.credit_limit,
        current_outstanding=dist.current_outstanding,
        utilization_pct=immediate["utilization_pct"],
        risk_score=risk_data.structured_risk,
        created_at=dist.created_at,
        avg_delay_90d=historical["avg_delay_days"],
        delay_frequency=historical["delay_frequency"],
        dispute_count=historical["dispute_count"],
        sales_trend_score=sales_trend,
        recent_invoices=invoice_schemas
    )
