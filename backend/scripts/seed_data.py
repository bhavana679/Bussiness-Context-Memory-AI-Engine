import sys
import os
import random
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy.orm import Session
from database import SessionLocal, engine, Base
from models.distributor import Distributor
from models.invoice import Invoice
from models.contextual_event import ContextualEvent

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

def seed_data():
    """Initializes the database with sample business data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Distributor).first():
            print("Database already contains data. Skipping seed.")
            return

        print("Seeding production sample data...")
        dist_data = [
            ("Tech Corp Solutions", "Hardware", "Mumbai", 5000000),
            ("Global Logistics Ltd", "Logistics", "Delhi", 2500000),
            ("Sun Retailers", "Retail", "Bangalore", 1000000),
            ("Alpha Manufacturing", "Manufacturing", "Pune", 7500000),
            ("Evergreen Exports", "Agriculture", "Nashik", 1500000),
        ]

        distributors = []
        for name, ind, city, limit in dist_data:
            d = Distributor(name=name, industry=ind, city=city, credit_limit=Decimal(str(limit)), current_outstanding=Decimal("0"))
            db.add(d)
            distributors.append(d)
        db.flush()

        for dist in distributors:
            running_total = Decimal("0")
            for i in range(20):
                amt = Decimal(str(random.randint(50000, 500000)))
                due = date.today() - timedelta(days=random.randint(-30, 180))
                paid, paid_date, delay, status = random.choice([True, True, False]), None, 0, "pending"

                if paid:
                    paid_date = due + timedelta(days=random.randint(-5, 15))
                    delay, status = max(0, (paid_date - due).days), "paid"
                elif due < date.today():
                    delay, status = (date.today() - due).days, "overdue"
                    running_total += amt
                else: 
                    running_total += amt

                db.add(Invoice(
                    distributor_id=dist.id, invoice_number=f"INV-{dist.id}-{i:03d}",
                    amount=amt, due_date=due, paid_date=paid_date, delay_days=delay,
                    status=status, dispute_flag=random.random() < 0.1
                ))
            dist.current_outstanding = running_total

        events = [
            (distributors[0], "Reported 20% defective items in recent shipment.", 0.6, "quality_issue"),
            (distributors[0], "Negotiated early payment discount of 2% last quarter.", 0.1, "payment_pattern"),
            (distributors[1], "Warehouse location experienced flooding; logistics delayed by 5 days.", 0.4, "logistics"),
            (distributors[3], "Distributor defaulted on a small credit line with another vendor 6 months ago.", 0.8, "market_intelligence"),
            (distributors[4], "Excellent payment record consistently for 2 years.", 0.0, "payment_record"),
        ]
        for dist, text, sev, etype in events:
            db.add(ContextualEvent(distributor_id=dist.id, event_text=text, severity_score=sev, event_type=etype))

        db.commit()
        print("Success: 5 distributors and 100 invoices seeded.")
    except Exception as e:
        db.rollback()
        print(f"Seed failed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
