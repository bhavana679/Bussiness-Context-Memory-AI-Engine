from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database import Base, engine

# Import all models so SQLAlchemy registers them before creating tables
import models.distributor  # noqa
import models.invoice  # noqa
import models.credit_request  # noqa
import models.contextual_event  # noqa

from routes import distributors, dashboard, credit, alerts

# ─── Create all tables on startup ───────────────────────────────────────────
Base.metadata.create_all(bind=engine)

# ─── App initialization ──────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Business Context Memory AI Engine — Person 1 Backend.\n\n"
        "Handles structured data, immediate + historical memory, and risk engine."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ─── CORS (allow React frontend on any localhost port) ───────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ────────────────────────────────────────────────────────────────
app.include_router(dashboard.router, tags=["Dashboard"])
app.include_router(distributors.router, tags=["Distributors"])
app.include_router(credit.router, tags=["Credit"])
app.include_router(alerts.router, tags=["Alerts"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "running",
        "app": settings.APP_NAME,
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
