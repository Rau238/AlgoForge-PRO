import json
import logging
import asyncio
from typing import Dict, Any, Optional
import redis.asyncio as aioredis
from app.config import settings

logger = logging.getLogger("algoforge.redis")

class RedisBus:
    def __init__(self):
        self.redis: Optional[aioredis.Redis] = None
        self.is_connected = False
        self._local_subscribers = []
        self._local_cache: Dict[str, Any] = {}

    async def connect(self):
        try:
            self.redis = aioredis.from_url(
                settings.REDIS_URL,
                decode_responses=True,
                socket_connect_timeout=2.0
            )
            await self.redis.ping()
            self.is_connected = True
            logger.info("Connected to Redis successfully.")
        except Exception as e:
            self.is_connected = False
            logger.warning(f"Redis unavailable ({e}). Using in-memory real-time bus fallback.")

    async def disconnect(self):
        if self.redis:
            await self.redis.close()
            self.is_connected = False

    async def set_price(self, symbol: str, data: dict):
        key = f"price:{symbol.upper()}"
        payload = json.dumps(data)
        self._local_cache[key] = data
        if self.is_connected and self.redis:
            try:
                await self.redis.set(key, payload, ex=3600)
            except Exception as e:
                logger.error(f"Redis set_price error: {e}")

    async def get_price(self, symbol: str) -> Optional[dict]:
        key = f"price:{symbol.upper()}"
        if self.is_connected and self.redis:
            try:
                raw = await self.redis.get(key)
                if raw:
                    return json.loads(raw)
            except Exception as e:
                logger.error(f"Redis get_price error: {e}")
        return self._local_cache.get(key)

    async def set_position_state(self, position_id: int, data: dict):
        key = f"position:{position_id}"
        self._local_cache[key] = data
        if self.is_connected and self.redis:
            try:
                await self.redis.set(key, json.dumps(data), ex=86400)
            except Exception:
                pass

    async def publish(self, channel: str, message: dict):
        payload = json.dumps(message)
        # Notify local in-memory listeners
        for listener in list(self._local_subscribers):
            try:
                await listener(channel, message)
            except Exception as e:
                logger.error(f"Local subscriber callback error: {e}")

        # Broadcast over Redis if connected
        if self.is_connected and self.redis:
            try:
                await self.redis.publish(channel, payload)
            except Exception as e:
                logger.debug(f"Redis publish error: {e}")

    def add_local_subscriber(self, callback):
        self._local_subscribers.append(callback)

    def remove_local_subscriber(self, callback):
        if callback in self._local_subscribers:
            self._local_subscribers.remove(callback)

redis_bus = RedisBus()
