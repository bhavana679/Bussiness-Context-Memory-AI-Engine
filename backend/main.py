from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
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
import models.user  # noqa

from routes import distributors, dashboard, credit, alerts, auth
from services.vector_store import initialize_vector_engine
from services.alert_service import generate_risk_alerts
from services.jwt_service import decode_access_token
from database import SessionLocal
import asyncio
import anyio

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception:
                self.disconnect(connection)

manager = ConnectionManager()

from contextlib import asynccontextmanager

def start_ai_engine():
    logger.info("AI-Engine: Initializing background services...")
    initialize_vector_engine()
    logger.info("AI-Engine: Ready.")

async def websocket_alert_runner():
    last_alerts = {}
    while True:
        await asyncio.sleep(300)
        if not manager.active_connections:
            last_alerts.clear()
            continue
        try:
            with SessionLocal() as db:
                generated_alerts = await anyio.to_thread.run_sync(generate_risk_alerts, db)
                current_alert_ids = set()

                for alert in generated_alerts:
                    alert_id = alert.get("id")
                    current_alert_ids.add(alert_id)

                    prev_alert = last_alerts.get(alert_id)
                    if not prev_alert or prev_alert.get("message") != alert.get("message"):
                        await manager.broadcast(alert)
                        last_alerts[alert_id] = alert

                for old_id in set(last_alerts.keys()) - current_alert_ids:
                    del last_alerts[old_id]

        except Exception as e:
            logger.error(f"WebSocket runner error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    threading.Thread(target=start_ai_engine, daemon=True).start()
    asyncio.create_task(websocket_alert_runner())
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="Business Context Memory AI Engine Backend",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "https://bussinesscontextmemoryaiengine.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api", tags=["Dashboard"])
app.include_router(distributors.router, prefix="/api", tags=["Distributors"])
app.include_router(credit.router, prefix="/api", tags=["Credit"])
app.include_router(alerts.router, prefix="/api", tags=["Alerts"])
app.include_router(auth.router, prefix="/api", tags=["Authentication"])

@app.websocket("/ws/alerts")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(default=None)
):
    """Authenticated WebSocket endpoint. Requires a valid JWT token as a query param."""
    if not token:
        await websocket.close(code=4001, reason="Authentication required")
        logger.warning("WS rejected: no token provided")
        return

    payload = decode_access_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Invalid or expired token")
        logger.warning("WS rejected: invalid or expired token")
        return

    await manager.connect(websocket)
    logger.info(f"WS authenticated: {payload.get('sub')}")
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")
        manager.disconnect(websocket)

@app.get("/", tags=["Health"])
def root():
    return {"status": "running", "app": settings.APP_NAME}

@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
