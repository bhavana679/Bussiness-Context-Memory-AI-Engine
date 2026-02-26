import logging
from typing import List, Dict
from sqlalchemy.orm import Session
from datetime import date, timedelta
from models.distributor import Distributor
from models.invoice import Invoice
from .structured_risk import calculate_structured_risk
from .memory_service import MemoryService

logger = logging.getLogger(__name__)

def generate_risk_alerts(db: Session) -> List[Dict]:
    """Scans for high risk, critical utilization, or negative trends and generates alerts."""
    logger.info("Starting system-wide risk alert generation")
    
    distributors = db.query(Distributor).all()
    all_alerts = []
    
    today = date.today()
    thirty_days_ago = today - timedelta(days=30)
    sixty_days_ago = today - timedelta(days=60)

    for dist in distributors:
        try:
            # 1. High Risk Score Alert
            risk_data = calculate_structured_risk(db, dist.id)
            if risk_data["structured_risk"] > 70:
                all_alerts.append({
                    "distributor_id": dist.id,
                    "alert_type": "HIGH_RISK_SCORE",
                    "message": f"Critical risk level: {risk_data['structured_risk']}/100"
                })

            # 2. Critical Utilization Alert
            immediate_data = MemoryService.get_immediate_memory(db, dist.id)
            if immediate_data and immediate_data.get("utilization_pct", 0) > 90:
                all_alerts.append({
                    "distributor_id": dist.id,
                    "alert_type": "CRITICAL_UTILIZATION",
                    "message": f"Credit almost exhausted: {immediate_data['utilization_pct']:.1f}% used"
                })

            # 3. Delay Trend Alert
            recent_invoices = db.query(Invoice).filter(
                Invoice.distributor_id == dist.id,
                Invoice.due_date >= thirty_days_ago
            ).all()
            
            past_invoices = db.query(Invoice).filter(
                Invoice.distributor_id == dist.id,
                Invoice.due_date >= sixty_days_ago,
                Invoice.due_date < thirty_days_ago
            ).all()

            if recent_invoices and past_invoices:
                recent_late = sum(1 for inv in recent_invoices if inv.delay_days > 0 or inv.status == "overdue")
                recent_freq = recent_late / len(recent_invoices)

                past_late = sum(1 for inv in past_invoices if inv.delay_days > 0 or inv.status == "overdue")
                past_freq = past_late / len(past_invoices)

                if (recent_freq - past_freq) > 0.15:
                    all_alerts.append({
                        "distributor_id": dist.id,
                        "alert_type": "RISING_DELAY_TREND",
                        "message": "Significant increase in late payment frequency"
                    })

        except Exception as e:
            logger.error(f"Failed to generate alert for distributor {dist.id}: {str(e)}")
            continue

    logger.info(f"Generated {len(all_alerts)} alerts")
    return all_alerts
