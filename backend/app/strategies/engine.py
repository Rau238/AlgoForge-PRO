from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np

class BaseStrategy(ABC):
    name: str = "Base Strategy"
    description: str = "Base algorithmic trading strategy"
    version: str = "1.0.0"
    market_type: str = "ALL"  # FOREX, CRYPTO, or ALL

    def __init__(self, parameters: Optional[Dict[str, Any]] = None):
        self.parameters = parameters or {}

    @abstractmethod
    def on_candle(self, candle: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Invoked when a new candle closes."""
        pass

    @abstractmethod
    def generate_signal(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Evaluate market dataframe and return:
        signal: 'BUY', 'SELL', or 'HOLD'
        direction: 'LONG', 'SHORT', or 'NONE'
        entry: float
        stop_loss: float
        take_profits: list of dicts with price, percentage, rr
        position_size: float
        risk_reward: float
        confidence: float
        """
        pass

    @abstractmethod
    def calculate_entry(self, data: pd.DataFrame, direction: str) -> float:
        pass

    @abstractmethod
    def calculate_stop_loss(self, data: pd.DataFrame, direction: str, entry: float) -> float:
        pass

    @abstractmethod
    def calculate_take_profits(self, data: pd.DataFrame, direction: str, entry: float, stop_loss: float) -> List[Dict[str, Any]]:
        pass

    @abstractmethod
    def calculate_position_size(self, account_balance: float, risk_pct: float, entry: float, stop_loss: float, lot_size: float = 1.0) -> float:
        pass
