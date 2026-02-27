import logging
import math
import os
from datetime import datetime, date
from typing import List, Dict, Any, Optional
from .embedding_service import get_embedding
from .vector_store import store
from config import settings

logger = logging.getLogger(__name__)

MAX_SIMILAR_CASES = 5
DECAY_LAMBDA = 0.1 

def build_summary(structured_data: Dict[str, Any]) -> str:
    """Turns structured financial metrics into a human-readable text summary."""
    delay = structured_data.get("avg_delay_score", 0.0)
    util = structured_data.get("utilization_score", 0.0)
    dispute = structured_data.get("dispute_score", 0.0)
    decline = structured_data.get("sales_decline_score", 0.0)
    
    summary = f"Distributor showing "
    
    if delay > 0.6:
        summary += "significant payment delays, "
    elif delay > 0.3:
        summary += "moderate payment delays, "
        
    if util > 0.8:
        summary += "critically high credit utilization, "
        
    if dispute > 0.5:
        summary += "active payment disputes, "
        
    if decline > 0.4:
        summary += "and a steep decline in sales trend."
    else:
        summary += "and stable sales patterns."

    return summary

def retrieve_similar_cases(summary: str) -> List[Dict[str, Any]]:
    """Retrieves top similar historical records from semantic memory."""
    logger.info("Searching semantic memory for similar business cases")
    
    if store.index.ntotal == 0:
        store.load_index(settings.FAISS_INDEX_PATH)
        
    query_vector = get_embedding(summary)
    results = store.search_vector(query_vector, k=MAX_SIMILAR_CASES)
    return results

def apply_temporal_decay(similar_cases: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Adjusts importance of past cases based on recency."""
    today = date.today()
    decayed_cases = []
    
    for case in similar_cases:
        processed_case = case.copy()
        case_date_str = case.get("timestamp")
        
        if not case_date_str:
            processed_case["temporal_weight"] = 1.0
            decayed_cases.append(processed_case)
            continue
            
        try:
            case_date = datetime.fromisoformat(case_date_str).date()
            days_diff = (today - case_date).days
            months_old = max(0, days_diff) / 30.0 
            
            weight = math.exp(-DECAY_LAMBDA * months_old)
            processed_case["temporal_weight"] = max(0.0001, min(1.0, weight))
            
        except Exception as e:
            logger.error(f"Error parsing date {case_date_str}: {str(e)}")
            processed_case["temporal_weight"] = 1.0
            
        decayed_cases.append(processed_case)
        
    return decayed_cases

def compute_semantic_risk(similar_cases: List[Dict[str, Any]]) -> float:
    """Calculates final semantic risk score (0-100) based on weighted similarities."""
    if not similar_cases:
        return 0.0

    total_weighted_severity = 0.0
    total_relevance_weight = 0.0
    
    for case in similar_cases:
        distance = case.get("distance", 1.0)
        base_similarity = 1.0 / (1.0 + distance)
        weight = case.get("temporal_weight", 1.0)
        
        decayed_similarity = base_similarity * weight
        raw_severity = case.get("severity_score", 0.0)
        decayed_severity = raw_severity * weight
        
        total_weighted_severity += (decayed_severity * decayed_similarity)
        total_relevance_weight += decayed_similarity
        
    if total_relevance_weight == 0:
        return 0.0
        
    final_score = (total_weighted_severity / total_relevance_weight) * 100
    return round(final_score, 2)

def calculate_semantic_risk(structured_metrics: Dict[str, Any]) -> Dict[str, Any]:
    """Service entry point for secondary risk intelligence layer."""
    try:
        summary = build_summary(structured_metrics)
        raw_cases = retrieve_similar_cases(summary)
        decayed_cases = apply_temporal_decay(raw_cases)
        risk_score = compute_semantic_risk(decayed_cases)
        
        formatted_cases = []
        for case in decayed_cases:
            dist = case.get("distance", 1.0)
            sim = round(1.0 / (1.0 + dist), 4)
            formatted_cases.append({
                "event": case.get("event_text", "Pattern detected"),
                "date": str(case.get("timestamp", "2024-01-01"))[:10],
                "severity": float(case.get("severity_score", 0.0)),
                "similarity": float(sim),
                "outcome": str(case.get("event_type", "Contextual"))
            })
            
        top_cases = sorted(formatted_cases, key=lambda x: x["similarity"], reverse=True)[:3]
        
        explanation = f"Business metrics indicate stability, but risk is compounded by {len(top_cases)} historically similar cases." if risk_score > 50 else "Business metrics appear stable."

        return {
            "semantic_risk": float(risk_score),
            "top_influential_cases": top_cases,
            "explanation": explanation,
            "influential_factors": [],
            "all_similar_cases": formatted_cases
        }
        
    except Exception as e:
        logger.error(f"Semantic risk calculation failed: {str(e)}")
        return {
            "semantic_risk": 0.0,
            "top_influential_cases": [],
            "explanation": "Semantic memory layer temporarily unavailable",
            "influential_factors": ["System error during memory retrieval"],
            "all_similar_cases": []
        }
