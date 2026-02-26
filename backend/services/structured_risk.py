import logging
from typing import Dict
from sqlalchemy.orm import Session
from .memory_service import MemoryService

logger = logging.getLogger(__name__)

WEIGHT_DELAY = 0.40
WEIGHT_UTILIZATION = 0.30
WEIGHT_DISPUTE = 0.20
WEIGHT_SALES_DECLINE = 0.10

MAX_EXPECTED_DELAY_DAYS = 30.0
MAX_EXPECTED_DISPUTES = 5.0

def calculate_structured_risk(db: Session, distributor_id: int) -> Dict:
    """Calculates structured risk score (0-100) based on financial metrics."""
    logger.info(f"Starting risk calculation for distributor ID: {distributor_id}")

    try:
        immediate = MemoryService.get_immediate_memory(db, distributor_id)
        if not immediate:
            logger.warning(f"No distributor found for ID: {distributor_id}. Defaulting to zero risk.")
            return {
                "avg_delay_score": 0.0,
                "utilization_score": 0.0,
                "dispute_score": 0.0,
                "sales_decline_score": 0.0,
                "structured_risk": 0.0
            }

        historical = MemoryService.get_historical_memory(db, distributor_id)
        sales_trend = MemoryService.get_sales_trend(db, distributor_id)

        utilization_pct = immediate.get("utilization_pct", 0.0)
        utilization_score = min(utilization_pct / 100.0, 1.0)
        
        avg_delay_days = historical.get("avg_delay_days", 0.0)
        avg_delay_score = min(avg_delay_days / MAX_EXPECTED_DELAY_DAYS, 1.0)
        
        dispute_count = historical.get("dispute_count", 0)
        dispute_score = min(dispute_count / MAX_EXPECTED_DISPUTES, 1.0)
        
        sales_decline_score = max(0.0, -sales_trend)

        total_weighted_score = (
            (WEIGHT_DELAY * avg_delay_score) +
            (WEIGHT_UTILIZATION * utilization_score) +
            (WEIGHT_DISPUTE * dispute_score) +
            (WEIGHT_SALES_DECLINE * sales_decline_score)
        )
        
        structured_risk = round(total_weighted_score * 100, 2)

        result = {
            "avg_delay_score": float(round(avg_delay_score, 4)),
            "utilization_score": float(round(utilization_score, 4)),
            "dispute_score": float(round(dispute_score, 4)),
            "sales_decline_score": float(round(sales_decline_score, 4)),
            "structured_risk": float(structured_risk)
        }

        logger.info(f"Risk calculation complete for ID {distributor_id}. Score: {structured_risk}")
        return result

    except Exception as e:
        logger.error(f"Error calculating risk for ID {distributor_id}: {str(e)}")
        return {
            "avg_delay_score": 0.0,
            "utilization_score": 0.0,
            "dispute_score": 0.0,
            "sales_decline_score": 0.0,
            "structured_risk": 0.0
        }

class StructuredRiskEngine:
    """Wrapper for backward compatibility."""
    @staticmethod
    def evaluate(db: Session, distributor_id: int):
        from schemas.schemas import StructuredRiskBreakdown
        risk_data = calculate_structured_risk(db, distributor_id)
        
        immediate = MemoryService.get_immediate_memory(db, distributor_id)
        historical = MemoryService.get_historical_memory(db, distributor_id)
        
        return StructuredRiskBreakdown(
            avg_delay_score=risk_data["avg_delay_score"],
            utilization_score=risk_data["utilization_score"],
            dispute_score=risk_data["dispute_score"],
            sales_decline_score=risk_data["sales_decline_score"],
            structured_risk=risk_data["structured_risk"],
            utilization_pct=immediate["utilization_pct"] if immediate else 0.0,
            avg_delay_days=historical["avg_delay_days"] if historical else 0.0,
            delay_frequency=historical["delay_frequency"] if historical else 0.0,
            dispute_count=historical["dispute_count"] if historical else 0
        )
