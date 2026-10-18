import datetime
from fastapi import APIRouter
from typing import List, Dict, Any
from app.schemas import AlertCreate

router = APIRouter(prefix="/alerts", tags=["Alerts"])

ACTIVE_ALERTS: List[Dict[str, Any]] = [
    {
        "id": 1,
        "symbol": "BTCUSDT",
        "alert_type": "PRICE_LEVEL",
        "target_price": 82500.0,
        "message": "Key Resistance Level watch at $82,500.00",
        "is_active": True,
        "is_triggered": False,
        "created_at": datetime.datetime.utcnow().isoformat(),
    },
    {
        "id": 2,
        "symbol": "XAUUSD",
        "alert_type": "TP_HIT",
        "target_price": 4200.0,
        "message": "TP1 target reached (25% closed at profit)",
        "is_active": True,
        "is_triggered": True,
        "triggered_at": (datetime.datetime.utcnow() - datetime.timedelta(hours=1)).isoformat(),
    },
    {
        "id": 3,
        "symbol": "SOLUSDT",
        "alert_type": "STRATEGY_SIGNAL",
        "target_price": 105.5,
        "message": "Supertrend Volatility BUY signal confirmed",
        "is_active": True,
        "is_triggered": False,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
]

@router.get("")
async def get_alerts(symbol: str = None):
    if symbol:
        return [a for a in ACTIVE_ALERTS if a["symbol"] == symbol.upper()]
    return ACTIVE_ALERTS

@router.post("")
async def create_alert(req: AlertCreate):
    new_alert = {
        "id": len(ACTIVE_ALERTS) + 1,
        "symbol": req.symbol.upper(),
        "alert_type": req.alert_type,
        "target_price": req.target_price,
        "message": req.message,
        "is_active": True,
        "is_triggered": False,
        "created_at": datetime.datetime.utcnow().isoformat(),
    }
    ACTIVE_ALERTS.append(new_alert)
    return new_alert

@router.delete("/{alert_id}")
async def delete_alert(alert_id: int):
    global ACTIVE_ALERTS
    ACTIVE_ALERTS = [a for a in ACTIVE_ALERTS if a["id"] != alert_id]
    return {"status": "DELETED", "alert_id": alert_id}
