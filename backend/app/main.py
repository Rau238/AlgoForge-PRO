import json
import logging
import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_engine, Base
from app.redis_bus import redis_bus
from app.market_data.feed import market_feed

# Import routers
from app.routes.market import router as market_router
from app.routes.chart import router as chart_router
from app.routes.trade_planner import router as trade_planner_router
from app.routes.orders import orders_router, positions_router, paper_router, delta_router
from app.routes.strategies import router as strategies_router
from app.routes.backtest import router as backtest_router
from app.routes.portfolio import router as portfolio_router
from app.routes.analytics import router as analytics_router
from app.routes.trade_history import router as trade_history_router
from app.routes.live import router as live_router
from app.routes.alerts import router as alerts_router
from app.routes.settings import router as settings_router
from app.routes.notifications import router as notifications_router
from app.routes.auto_trader import router as auto_trader_router
from app.routes.crypto_intelligence import router as crypto_intelligence_router
from app.execution.auto_trader import auto_trader

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("algoforge.main")

# WebSocket Connection Manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"WebSocket client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"WebSocket client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        dead = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead.append(connection)
        for d in dead:
            if d in self.active_connections:
                self.active_connections.remove(d)

ws_manager = ConnectionManager()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Connect to Database & Create Tables
    engine = await init_engine()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database schemas verified.")

    # 2. Connect to Redis
    await redis_bus.connect()

    # 3. Hook Redis Bus into WebSocket Broadcaster
    async def redis_to_ws_listener(channel: str, message: dict):
        await ws_manager.broadcast({
            "type": channel,
            "data": message
        })
    redis_bus.add_local_subscriber(redis_to_ws_listener)

    # 4. Start Market Feed
    market_feed.start()
    logger.info("Market feed engine started.")

    # 5. Start AutoTrader Monitoring Loop
    auto_trader.start_background_loop()
    logger.info("Autonomous Algorithmic Trader started ($100 Capital).")

    yield

    # Teardown
    auto_trader.stop_background_loop()
    market_feed.stop()
    await redis_bus.disconnect()
    logger.info("AlgoForge backend shut down cleanly.")

app = FastAPI(
    title="AlgoForge Quantitative Algorithmic Trading API",
    description="Professional algorithmic trading workstation API for Forex & Crypto",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under API_V1_PREFIX
prefix = settings.API_V1_PREFIX
app.include_router(market_router, prefix=prefix)
app.include_router(chart_router, prefix=prefix)
app.include_router(trade_planner_router, prefix=prefix)
app.include_router(orders_router, prefix=prefix)
app.include_router(positions_router, prefix=prefix)
app.include_router(paper_router, prefix=prefix)
app.include_router(delta_router, prefix=prefix)
app.include_router(strategies_router, prefix=prefix)
app.include_router(backtest_router, prefix=prefix)
app.include_router(portfolio_router, prefix=prefix)
app.include_router(analytics_router, prefix=prefix)
app.include_router(trade_history_router, prefix=prefix)
app.include_router(live_router, prefix=prefix)
app.include_router(alerts_router, prefix=prefix)
app.include_router(settings_router, prefix=prefix)
app.include_router(notifications_router, prefix=prefix)
app.include_router(auto_trader_router, prefix=prefix)
app.include_router(crypto_intelligence_router, prefix=prefix)

@app.get("/")
async def root():
    return {
        "platform": "AlgoForge",
        "status": "ONLINE",
        "exchange": "Delta Exchange",
        "markets": ["CRYPTO", "COMMODITIES"],
        "version": "1.0.0"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        # Send initial snapshot immediately upon connect
        await websocket.send_text(json.dumps({
            "type": "welcome",
            "data": {
                "message": "Connected to AlgoForge Real-time WebSocket Feed",
                "markets": ["FOREX", "CRYPTO"]
            }
        }))
        while True:
            # Receive client ping or subscribe messages
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("action") == "ping":
                    await websocket.send_text(json.dumps({"type": "pong"}))
            except Exception:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WebSocket error: {e}")
        ws_manager.disconnect(websocket)
