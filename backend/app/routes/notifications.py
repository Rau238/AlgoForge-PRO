from fastapi import APIRouter, HTTPException
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from app.notifications.service import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])

class NotificationCreate(BaseModel):
    category: str = "SIGNALS"  # SIGNALS, ORDERS, RISK, SYSTEM
    title: str
    message: str
    level: str = "info"  # info, success, warning, error
    symbol: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

@router.get("")
async def get_notifications(
    category: Optional[str] = None,
    unread_only: bool = False,
    limit: int = 50,
):
    items = notification_service.get_notifications(category, unread_only, limit)
    unread_count = notification_service.get_unread_count()
    return {
        "notifications": items,
        "unread_count": unread_count,
        "total": len(notification_service.notifications),
    }

@router.post("")
async def create_notification(req: NotificationCreate):
    item = await notification_service.add_notification(
        category=req.category,
        title=req.title,
        message=req.message,
        level=req.level,
        symbol=req.symbol,
        metadata=req.metadata,
    )
    return item

@router.post("/mark-all-read")
async def mark_all_read():
    count = notification_service.mark_as_read()
    return {"status": "SUCCESS", "marked_read": count}

@router.post("/{notification_id}/mark-read")
async def mark_single_read(notification_id: str):
    count = notification_service.mark_as_read(notification_id)
    return {"status": "SUCCESS", "notification_id": notification_id}

@router.delete("")
async def clear_notifications():
    notification_service.clear_all()
    return {"status": "CLEARED", "message": "All notifications cleared"}

@router.post("/test-trigger")
async def trigger_test_notification(symbol: str = "BTCUSDT"):
    """Trigger a live realistic notification for UI verification."""
    item = await notification_service.add_notification(
        category="SIGNALS",
        title=f"🚀 Real-Time Strategy Signal: {symbol.upper()}",
        message=f"Algorithmic breakout triggered on {symbol.upper()} 15m candle. Technical momentum confirmed.",
        level="success",
        symbol=symbol.upper(),
        metadata={"timeframe": "15m", "indicator": "EMA_CROSS"},
    )
    return {"status": "TRIGGERED", "notification": item}
