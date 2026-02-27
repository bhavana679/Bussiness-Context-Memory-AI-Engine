import logging
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from .structured_risk import calculate_structured_risk
from .semantic_risk import calculate_semantic_risk

logger = logging.getLogger(__name__)

def make_credit_decision(db: Session, distributor_id: int, requested_amount: float) -> Dict:
    """Hybrid credit decision engine combining financial math with AI business memory."""
    
    logger.info(f"Processing hybrid credit decision for distributor {distributor_id}")

    structured_data = calculate_structured_risk(db, distributor_id)
    structured_risk = structured_data["structured_risk"]
    
    semantic_data = calculate_semantic_risk(structured_data)
    semantic_risk = semantic_data["semantic_risk"]

    recency_adjustment = structured_data["avg_delay_score"] * 100
    
    final_risk = (
        (0.6 * structured_risk) + 
        (0.3 * semantic_risk) + 
        (0.1 * recency_adjustment)
    )
    final_risk = round(max(0.0, min(100.0, final_risk)), 2)
    
    if final_risk < 40:
        decision = "APPROVE"
    elif final_risk < 70:
        decision = "PARTIAL"
    else:
        decision = "REJECT"

    confidence_score = min(0.95, (final_risk / 100.0) + 0.3)

    combined_factors = []
    if structured_data["utilization_score"] > 0.7:
        combined_factors.append({"description": "High credit utilization", "impact": "negative", "weight": 40})
    if structured_data["avg_delay_score"] > 0.5:
        combined_factors.append({"description": "Persistent payment delays", "impact": "negative", "weight": 50})
        
    if not combined_factors:
        combined_factors.append({"description": "Stable performance history", "impact": "positive", "weight": 90})

    return {
        "distributor_id": distributor_id,
        "requested_amount": float(requested_amount),
        "structured_risk": float(structured_risk),
        "final_risk": float(final_risk),
        "decision": decision,
        "confidence_score": float(round(confidence_score, 4)),
        "influential_factors": combined_factors,
        "explanation": semantic_data.get("explanation", "Standard financial analysis."),
        "top_influential_cases": semantic_data.get("top_influential_cases", []),
        "similar_cases": semantic_data.get("all_similar_cases", [])
    }
