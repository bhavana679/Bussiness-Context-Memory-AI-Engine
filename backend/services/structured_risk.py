from sqlalchemy.orm import Session
from .memory_service import MemoryService
from schemas.schemas import StructuredRiskBreakdown


class StructuredRiskEngine:
    @staticmethod
    def evaluate(db: Session, distributor_id: int) -> StructuredRiskBreakdown:
        # 1. Fetch memories
        immediate = MemoryService.get_immediate_memory(db, distributor_id)
        if not immediate:
            raise ValueError("Distributor not found")
            
        historical = MemoryService.get_historical_memory(db, distributor_id)
        sales_trend = MemoryService.get_sales_trend(db, distributor_id)
        
        # 2. Normalize components (0.0 - 1.0)
        
        # Utilization: 0-100% -> 0.0-1.0
        util_score = min(immediate["utilization_pct"] / 100.0, 1.0)
        
        # Avg Delay: 0-30 days -> 0.0-1.0 (clamped at 30 days)
        delay_score = min(historical["avg_delay_days"] / 30.0, 1.0)
        
        # Dispute Score: Counts -> 0.0-1.0 (clamped at 5 disputes)
        dispute_score = min(historical["dispute_count"] / 5.0, 1.0)
        
        # Sales Decline: Trend < 0 is risk. 
        # If trend is -0.5 (50% decline), score is 0.5.
        sales_decline_score = max(0.0, -sales_trend)
        
        # 3. Apply weights
        # Formula: 0.4*delay + 0.3*util + 0.2*dispute + 0.1*sales_decline
        weighted_score = (
            (0.40 * delay_score) +
            (0.30 * util_score) +
            (0.20 * dispute_score) +
            (0.10 * sales_decline_score)
        )
        
        # 4. Final results (scale weighted score to 0-100)
        return StructuredRiskBreakdown(
            avg_delay_score=delay_score,
            utilization_score=util_score,
            dispute_score=dispute_score,
            sales_decline_score=sales_decline_score,
            structured_risk=round(weighted_score * 100, 2),
            utilization_pct=immediate["utilization_pct"],
            avg_delay_days=historical["avg_delay_days"],
            delay_frequency=historical["delay_frequency"],
            dispute_count=historical["dispute_count"]
        )
