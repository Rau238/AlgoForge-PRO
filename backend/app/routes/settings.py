from fastapi import APIRouter
from typing import Dict, Any
from pydantic import BaseModel

router = APIRouter(prefix="/settings", tags=["Settings"])

class RiskSettingsUpdate(BaseModel):
    max_risk_per_trade_pct: float = 1.0
    max_daily_loss_pct: float = 3.0
    default_leverage: float = 100.0
    default_tp_allocation: list = [25, 25, 25, 25]
    breakeven_on_tp1: bool = True
    trailing_on_tp2: bool = True
    trailing_type: str = "ATR"
    trailing_value: float = 1.5
    email_notifications: bool = True
    in_app_notifications: bool = True

CURRENT_SETTINGS = {
    "account": {
        "username": "TraderAlgo",
        "email": "trader@algoforge.io",
        "role": "Quantitative Trader",
        "created_at": "2026-01-15T00:00:00Z"
    },
    "risk": {
        "max_risk_per_trade_pct": 1.0,
        "max_daily_loss_pct": 3.0,
        "default_leverage": 100.0,
        "default_tp_allocation": [25, 25, 25, 25],
        "breakeven_on_tp1": True,
        "trailing_on_tp2": True,
        "trailing_type": "ATR",
        "trailing_value": 1.5,
    },
    "notifications": {
        "in_app_notifications": True,
        "browser_notifications": True,
        "email_alerts": False,
        "webhook_url": "",
    }
}

@router.get("")
async def get_settings():
    return CURRENT_SETTINGS

@router.put("/risk")
async def update_risk_settings(req: RiskSettingsUpdate):
    CURRENT_SETTINGS["risk"].update(req.model_dump())
    return {"status": "UPDATED", "risk": CURRENT_SETTINGS["risk"]}
