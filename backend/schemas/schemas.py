from datetime import datetime, date
from typing import Optional, List, Dict
from pydantic import BaseModel
from decimal import Decimal

class DistributorBase(BaseModel):
    name: str
    industry: str
    city: str
    credit_limit: Decimal
    current_outstanding: Decimal = Decimal("0")

class DistributorCreate(DistributorBase):
    pass

class DistributorSummary(BaseModel):
    id: int
    name: str
    industry: str
    city: str
    credit_limit: Decimal
    current_outstanding: Decimal
    utilization_pct: float
    risk_score: Optional[float]

    class Config:
        from_attributes = True

class InvoiceSummary(BaseModel):
    id: int
    invoice_number: str
    amount: Decimal
    due_date: date
    paid_date: Optional[date]
    delay_days: int
    status: str
    dispute_flag: bool

    class Config:
        from_attributes = True

class DistributorProfile(BaseModel):
    id: int
    name: str
    industry: str
    city: str
    credit_limit: Decimal
    current_outstanding: Decimal
    utilization_pct: float
    risk_score: float
    avg_delay_90d: float
    delay_frequency: float
    dispute_count: int
    sales_trend_score: float
    recent_invoices: List[InvoiceSummary]

    class Config:
        from_attributes = True

class CreditRequestInput(BaseModel):
    distributor_id: int
    requested_amount: Decimal

class StructuredRiskBreakdown(BaseModel):
    avg_delay_score: float         
    utilization_score: float       
    dispute_score: float           
    sales_decline_score: float     
    structured_risk: float         
    utilization_pct: float         
    avg_delay_days: float          
    delay_frequency: float         
    dispute_count: int

class CreditDecisionResponse(BaseModel):
    distributor_id: int
    requested_amount: float
    structured_risk: float
    final_risk: float
    decision: str
    confidence_score: float
    influential_factors: List[str]
    explanation: Optional[str] = "Standard analysis."
    top_influential_cases: Optional[List[Dict]] = []
    similar_cases: Optional[List[Dict]] = []

    class Config:
        from_attributes = True

class DashboardSummary(BaseModel):
    total_distributors: int
    total_exposure: Decimal         
    total_credit_limit: Decimal
    avg_utilization_pct: float
    avg_risk_score: Optional[float]
    overdue_count: int
    overdue_pct: float
    high_risk_count: int            

class RiskAlert(BaseModel):
    distributor_id: int
    name: str
    city: str
    risk_score: float
    reason: str

class AlertsResponse(BaseModel):
    alerts: List[RiskAlert]
    total: int
