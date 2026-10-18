from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional

class BaseBrokerAdapter(ABC):
    name: str = "Base Broker"
    market_type: str = "ALL"  # FOREX or CRYPTO

    def __init__(self, api_key: Optional[str] = None, api_secret: Optional[str] = None, testnet: bool = True):
        self.api_key = api_key
        self.api_secret = api_secret
        self.testnet = testnet
        self.is_connected = False

    @abstractmethod
    async def connect(self) -> bool:
        pass

    @abstractmethod
    async def disconnect(self) -> None:
        pass

    @abstractmethod
    async def get_account_summary(self) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def place_order(self, order_req: Dict[str, Any]) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def cancel_order(self, order_id: str) -> bool:
        pass

    @abstractmethod
    async def get_open_positions(self) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    async def close_position(self, position_id: str, quantity: Optional[float] = None) -> Dict[str, Any]:
        pass
