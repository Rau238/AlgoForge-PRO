import asyncio
import datetime
import uuid
from typing import List, Dict, Any, Optional
import logging
from app.redis_bus import redis_bus

logger = logging.getLogger("algoforge.notifications")

class NotificationService:
    def __init__(self):
        self.notifications: List[Dict[str, Any]] = []
        self._seed_initial_notifications()

    def _seed_initial_notifications(self):
        # Initialized clean with no mock or test notifications
        self.notifications = []

    async def add_notification(
        self,
        category: str,
        title: str,
        message: str,
        level: str = "info",
        symbol: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        item = {
            "id": str(uuid.uuid4())[:8],
            "category": category.upper(),
            "title": title,
            "message": message,
            "level": level.lower(),  # "success", "warning", "info", "error"
            "symbol": symbol.upper() if symbol else "SYSTEM",
            "metadata": metadata or {},
            "read": False,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.notifications.insert(0, item)
        # Cap notifications list to 100 items
        if len(self.notifications) > 100:
            self.notifications = self.notifications[:100]

        # Broadcast via Redis / WebSocket
        try:
            await redis_bus.publish("notification", item)
        except Exception as e:
            logger.warning(f"Failed to publish notification to redis_bus: {e}")

        return item

    def add_notification_sync(
        self,
        category: str,
        title: str,
        message: str,
        level: str = "info",
        symbol: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        item = {
            "id": str(uuid.uuid4())[:8],
            "category": category.upper(),
            "title": title,
            "message": message,
            "level": level.lower(),
            "symbol": symbol.upper() if symbol else "SYSTEM",
            "metadata": metadata or {},
            "read": False,
            "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.notifications.insert(0, item)
        if len(self.notifications) > 100:
            self.notifications = self.notifications[:100]

        try:
            loop = asyncio.get_running_loop()
            loop.create_task(redis_bus.publish("notification", item))
        except RuntimeError:
            pass
        except Exception as e:
            logger.warning(f"Failed to publish notification in sync helper: {e}")

        return item

    def get_notifications(
        self,
        category: Optional[str] = None,
        unread_only: bool = False,
        limit: int = 50,
    ) -> List[Dict[str, Any]]:
        results = self.notifications
        if category and category.upper() != "ALL":
            results = [n for n in results if n.get("category") == category.upper()]
        if unread_only:
            results = [n for n in results if not n.get("read")]
        return results[:limit]

    def get_unread_count(self) -> int:
        return sum(1 for n in self.notifications if not n.get("read"))

    def mark_as_read(self, notification_id: Optional[str] = None) -> int:
        count = 0
        for n in self.notifications:
            if notification_id is None or n["id"] == notification_id:
                if not n.get("read"):
                    n["read"] = True
                    count += 1
        return count

    def clear_all(self):
        self.notifications.clear()

notification_service = NotificationService()
