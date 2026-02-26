import sys
import os
from datetime import datetime, date, timedelta
from decimal import Decimal
import random

# Add parent directory to path so we can import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import SessionLocal, engine, Base
from models.distributor import Distributor
from models.invoice import Invoice
from models.contextual_event import ContextualEvent
from models.credit_request import CreditRequest


def seed_data():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if we already have data
        if db.query(Distributor).first():
            print("Database already seeded.")
            return

        print("Seeding database...")

        distributors_data = [
            {"name": "Tech Corp Solutions", "industry": "Hardware", "city": "Mumbai", "limit": 5000000},
            {"name": "Global Logistics Ltd", "industry": "Logistics", "city": "Delhi", "limit": 2500000},
            {"name": "Sun Retailers", "industry": "Retail", "city": "Bangalore", "limit": 1000000},
            {"name": "Alpha Manufacturing", "industry": "Manufacturing", "city": "Pune", "limit": 7500000},
            {"name": "Evergreen Exports", "industry": "Agriculture", "city": "Nashik", "limit": 1500000},
        ]

        distributors = []
        for d in distributors_data:
            distributor = Distributor(
                name=d["name"],
                industry=d["industry"],
                city=d["city"],
                credit_limit=Decimal(str(d["limit"])),
                current_outstanding=Decimal("0")
            )
            db.add(distributor)
            distributors.append(distributor)
        
        db.flush() # Get IDs

        # Create Invoices for each distributor
        for dist in distributors:
            total_outstanding = Decimal("0")
            for i in range(1, 21): # 20 invoices each
                amount = Decimal(str(random.randint(50000, 500000)))
                due_date = date.today() - timedelta(days=random.randint(-30, 180))
                
                # Some are paid, some are not
                is_paid = random.choice([True, True, False])
                paid_date = None
                delay_days = 0
                status = "pending"

                if is_paid:
                    # Paid either early, on time, or late
                    paid_date = due_date + timedelta(days=random.randint(-5, 15))
                    delay_days = max(0, (paid_date - due_date).days)
                    status = "paid"
                else:
                    if due_date < date.today():
                        status = "overdue"
                        delay_days = (date.today() - due_date).days
                        total_outstanding += amount
                    else:
                        status = "pending"
                        total_outstanding += amount

                invoice = Invoice(
                    distributor_id=dist.id,
                    invoice_number=f"INV-{dist.id}-{i:03d}",
                    amount=amount,
                    due_date=due_date,
                    paid_date=paid_date,
                    delay_days=delay_days,
                    status=status,
                    dispute_flag=random.random() < 0.1 # 10% chance of dispute
                )
                db.add(invoice)
            
            # Update distributor outstanding balance
            dist.current_outstanding = total_outstanding

        # Add some contextual events (Person 2 will use these)
        events = [
            {"dist": distributors[0], "text": "Reported 20% defective items in recent shipment.", "severity": 0.6, "type": "quality_issue"},
            {"dist": distributors[0], "text": "Negotiated early payment discount of 2% last quarter.", "severity": 0.1, "type": "payment_pattern"},
            {"dist": distributors[1], "text": "Warehouse location experienced flooding; logistics delayed by 5 days.", "severity": 0.4, "type": "logistics"},
            {"dist": distributors[3], "text": "Distributor defaulted on a small credit line with another vendor 6 months ago.", "severity": 0.8, "type": "market_intelligence"},
            {"dist": distributors[4], "text": "Excellent payment record consistently for 2 years.", "severity": 0.0, "type": "payment_record"},
        ]

        for e in events:
            event = ContextualEvent(
                distributor_id=e["dist"].id,
                event_text=e["text"],
                severity_score=e["severity"],
                event_type=e["type"]
            )
            db.add(event)

        db.commit()
        print("Success: Database seeded with 5 distributors, 100 invoices, and 5 events.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
