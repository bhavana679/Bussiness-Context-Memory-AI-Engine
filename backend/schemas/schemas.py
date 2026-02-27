from datetime import datetime, date
from typing import Optional, List, Dict, Literal
from pydantic import BaseModel, field_validator, EmailStr
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

class RiskTrendItem(BaseModel):
    date: str
    score: float

class SimilarCase(BaseModel):
    event: str
    date: str
    severity: float
    similarity: float
    outcome: Optional[str] = "Observed"

class DistributorProfile(BaseModel):
    id: int
    name: str
    industry: str
    city: str
    credit_limit: float
    current_utilization: float
    final_risk: float
    structured_risk: float
    semantic_risk: float
    risk_trend: List[RiskTrendItem]
    explanation: str
    breakdown: Dict[str, float]
    similar_cases: List[SimilarCase]

class CreditRequestInput(BaseModel):
    distributor_id: int
    requested_amount: Decimal
    reason: Optional[str] = None

    @field_validator('requested_amount')
    @classmethod
    def amount_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('requested_amount must be greater than zero')
        return v

    @field_validator('distributor_id')
    @classmethod
    def id_must_be_positive(cls, v):
        if v <= 0:
            raise ValueError('distributor_id must be a positive integer')
        return v

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

class InfluentialFactor(BaseModel):
    description: str
    impact: str
    weight: float

class CreditDecisionResponse(BaseModel):
    distributor_id: int
    requested_amount: float
    structured_risk: float
    final_risk: float
    decision: str
    confidence_score: float
    influential_factors: List[InfluentialFactor]
    explanation: Optional[str] = "Standard analysis."
    top_influential_cases: Optional[List[SimilarCase]] = []
    similar_cases: Optional[List[SimilarCase]] = []

class RiskDistributionItem(BaseModel):
    name: str
    value: int

class ExposureTrendItem(BaseModel):
    name: str
    exposure: float

class DashboardSummary(BaseModel):
    total_exposure: float
    avg_risk_score: float
    overdue_count: int
    active_count: int
    risk_distribution: List[RiskDistributionItem]
    exposure_trend: List[ExposureTrendItem]
    high_risk_distributors: List[Dict]

class RiskAlert(BaseModel):
    distributor_id: int
    name: str
    city: str
    risk_score: float
    reason: str

class AlertsResponse(BaseModel):
    alerts: List[RiskAlert]
    total: int

class CreditHistoryItem(BaseModel):
    id: int
    distributor_name: Optional[str] = "Unknown"
    requested_amount: float
    decision: str
    risk_score: float
    confidence: float
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    password: str
    role: str

    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        v = v.strip().lower()
        if '@' not in v or '.' not in v.split('@')[-1]:
            raise ValueError('A valid email address is required')
        return v

    @field_validator('password')
    @classmethod
    def password_minimum_strength(cls, v):
        if len(v) < 6:
            raise ValueError('Password must be at least 6 characters')
        return v

    @field_validator('role')
    @classmethod
    def role_must_be_valid(cls, v):
        allowed = {'Admin', 'RiskOfficer', 'Viewer'}
        if v not in allowed:
            raise ValueError(f'Role must be one of: {allowed}')
        return v

class UserLogin(BaseModel):
    email: str
    password: str

    @field_validator('email')
    @classmethod
    def email_must_be_valid(cls, v):
        return v.strip().lower()

class AuthResponse(BaseModel):
    token: str
    role: str
    email: str
