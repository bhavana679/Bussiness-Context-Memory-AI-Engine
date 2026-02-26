from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel
from decimal import Decimal


# ──────────────────────── Distributor ────────────────────────
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
    utilization_pct: float       # computed field
    risk_score: Optional[float]  # latest structured risk

    class Config:
        from_attributes = True


class DistributorProfile(DistributorSummary):
    created_at: datetime
    avg_delay_90d: Optional[float]
    delay_frequency: Optional[float]
    dispute_count: Optional[int]
    sales_trend_score: Optional[float]
    recent_invoices: Optional[List["InvoiceSummary"]] = []

    class Config:
        from_attributes = True


# ──────────────────────── Invoice ────────────────────────
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


# ──────────────────────── Credit Request ────────────────────────
class CreditRequestInput(BaseModel):
    distributor_id: int
    requested_amount: Decimal


class StructuredRiskBreakdown(BaseModel):
    """Returned by structured_risk service — consumed by Person 2 as input."""
    avg_delay_score: float          # normalised 0–1
    utilization_score: float        # normalised 0–1
    dispute_score: float            # normalised 0–1
    sales_decline_score: float      # normalised 0–1
    structured_risk: float          # final weighted score 0–100
    utilization_pct: float          # raw %
    avg_delay_days: float           # raw days
    delay_frequency: float          # 0–1
    dispute_count: int


class CreditDecisionResponse(BaseModel):
    distributor_id: int
    requested_amount: Decimal
    structured_risk: float
    decision: str                   # approve | partial | reject
    recommended_credit: Decimal
    confidence: float
    influential_factors: List[str]
    risk_breakdown: StructuredRiskBreakdown


# ──────────────────────── Dashboard ────────────────────────
class DashboardSummary(BaseModel):
    total_distributors: int
    total_exposure: Decimal         # sum of current_outstanding
    total_credit_limit: Decimal
    avg_utilization_pct: float
    avg_risk_score: Optional[float]
    overdue_count: int
    overdue_pct: float
    high_risk_count: int            # risk > 70


# ──────────────────────── Alerts ────────────────────────
class RiskAlert(BaseModel):
    distributor_id: int
    name: str
    city: str
    risk_score: float
    reason: str


class AlertsResponse(BaseModel):
    alerts: List[RiskAlert]
    total: int


# Allow forward references (DistributorProfile → InvoiceSummary)
DistributorProfile.model_rebuild()
