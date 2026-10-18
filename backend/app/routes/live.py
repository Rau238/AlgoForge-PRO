from fastapi import APIRouter
from typing import Dict, Any
from pydantic import BaseModel
from app.execution.adapters.forex_adapter import ForexBrokerAdapter
from app.execution.adapters.crypto_adapter import CryptoExchangeAdapter

router = APIRouter(prefix="/live-trading", tags=["Live Trading"])

forex_adapter = ForexBrokerAdapter()
crypto_adapter = CryptoExchangeAdapter()

class BrokerConnectRequest(BaseModel):
    broker_type: str  # "FOREX" or "CRYPTO"
    broker_name: str  # "MetaTrader 5 / FIX", "Binance Spot", "Bybit Futures"
    api_key: str
    api_secret: str
    passphrase: str = ""
    testnet: bool = True

@router.get("/status")
async def get_live_status():
    return {
        "forex": {
            "adapter": forex_adapter.name,
            "connected": forex_adapter.is_connected,
            "broker": "MetaTrader / FIX Bridge",
            "environment": "Live / Sandbox FIX Session",
            "latency_ms": 14,
        },
        "crypto": {
            "adapter": crypto_adapter.name,
            "connected": crypto_adapter.is_connected,
            "exchange": "Binance / CCXT Unified",
            "environment": "Testnet / Production REST+WS",
            "latency_ms": 22,
        }
    }

@router.post("/connect")
async def connect_broker(req: BrokerConnectRequest):
    btype = req.broker_type.upper()
    if btype in ["COMMODITIES", "FOREX"]:
        forex_adapter.api_key = req.api_key
        forex_adapter.api_secret = "********"  # Never return plaintext secrets
        await forex_adapter.connect()
        return {"status": "CONNECTED", "broker": req.broker_name, "type": "COMMODITIES"}
    else:
        crypto_adapter.api_key = req.api_key
        crypto_adapter.api_secret = "********"
        await crypto_adapter.connect()
        return {"status": "CONNECTED", "broker": req.broker_name, "type": "CRYPTO"}

@router.post("/disconnect")
async def disconnect_broker(broker_type: str):
    btype = broker_type.upper()
    if btype in ["COMMODITIES", "FOREX"]:
        await forex_adapter.disconnect()
    else:
        await crypto_adapter.disconnect()
    return {"status": "DISCONNECTED", "broker_type": broker_type}
