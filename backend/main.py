from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging
import threading
import uvicorn

from config import settings
from database import Base, engine
import models.distributor  # noqa
import models.invoice  # noqa
import models.credit_request  # noqa
import models.contextual_event  # noqa

from routes import distributors, dashboard, credit, alerts
from services.vector_store import initialize_vector_engine

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def start_ai_engine():
    logger.info("AI-Engine: Initializing background services...")
    initialize_vector_engine()
    logger.info("AI-Engine: Ready.")

app = FastAPI(
    title=settings.APP_NAME,
    description="Business Context Memory AI Engine Backend",
    version="1.0.0"
)

@app.on_event("startup")
def on_startup():
    threading.Thread(target=start_ai_engine, daemon=True).start()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(distributors.router, tags=["Distributors"])
app.include_router(credit.router, tags=["Credit"])
app.include_router(alerts.router, tags=["Alerts"])

@app.get("/", tags=["Health"])
def root():
    return {"status": "running", "app": settings.APP_NAME}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
