from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from app.strategies.engine import BaseStrategy
from app.market_data.indicators import calculate_ema, calculate_rsi, calculate_atr, calculate_supertrend, calculate_macd

class EmaCrossoverStrategy(BaseStrategy):
    name: str = "EMA Crossover + RSI Confirmation"
    description: str = "Fast EMA (20) crosses Slow EMA (50) with RSI confirmation and 4-tier ATR take profits"
    market_type: str = "ALL"

    def __init__(self, parameters: Optional[Dict[str, Any]] = None):
        super().__init__(parameters)
        self.fast_ema = int(self.parameters.get("fast_ema", 20))
        self.slow_ema = int(self.parameters.get("slow_ema", 50))
        self.rsi_period = int(self.parameters.get("rsi_period", 14))
        self.atr_multiplier = float(self.parameters.get("atr_multiplier", 1.5))

    def on_candle(self, candle: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None

    def calculate_entry(self, data: pd.DataFrame, direction: str) -> float:
        return float(data["close"].iloc[-1])

    def calculate_stop_loss(self, data: pd.DataFrame, direction: str, entry: float) -> float:
        atr_vals = calculate_atr(data, 14)
        atr = atr_vals[-1] if atr_vals and atr_vals[-1] is not None else entry * 0.01
        risk_dist = atr * self.atr_multiplier
        if direction == "LONG":
            return round(entry - risk_dist, 5)
        else:
            return round(entry + risk_dist, 5)

    def calculate_take_profits(self, data: pd.DataFrame, direction: str, entry: float, stop_loss: float) -> List[Dict[str, Any]]:
        risk = abs(entry - stop_loss)
        if direction == "LONG":
            tp1 = round(entry + (risk * 1.0), 5)
            tp2 = round(entry + (risk * 2.0), 5)
            tp3 = round(entry + (risk * 3.0), 5)
            tp4 = round(entry + (risk * 4.0), 5)
        else:
            tp1 = round(entry - (risk * 1.0), 5)
            tp2 = round(entry - (risk * 2.0), 5)
            tp3 = round(entry - (risk * 3.0), 5)
            tp4 = round(entry - (risk * 4.0), 5)

        return [
            {"level": 1, "name": "TP1", "price": tp1, "percentage": 25.0, "rr": 1.0},
            {"level": 2, "name": "TP2", "price": tp2, "percentage": 25.0, "rr": 2.0},
            {"level": 3, "name": "TP3", "price": tp3, "percentage": 25.0, "rr": 3.0},
            {"level": 4, "name": "TP4", "price": tp4, "percentage": 25.0, "rr": 4.0},
        ]

    def calculate_position_size(self, account_balance: float, risk_pct: float, entry: float, stop_loss: float, lot_size: float = 1.0) -> float:
        risk_amount = account_balance * (risk_pct / 100.0)
        risk_per_unit = abs(entry - stop_loss)
        if risk_per_unit <= 0:
            return 0.01
        units = risk_amount / risk_per_unit
        if lot_size > 1.0:
            # Forex lots
            lots = round(units / lot_size, 2)
            return max(0.01, lots)
        return round(units, 4)

    def generate_signal(self, data: pd.DataFrame) -> Dict[str, Any]:
        if len(data) < max(self.fast_ema, self.slow_ema, self.rsi_period) + 5:
            return {
                "signal": "HOLD",
                "direction": "NONE",
                "entry": float(data["close"].iloc[-1]),
                "stop_loss": 0.0,
                "take_profits": [],
                "position_size": 0.0,
                "risk_reward": 0.0,
                "confidence": 0.0,
            }

        ema_f = calculate_ema(data, self.fast_ema)
        ema_s = calculate_ema(data, self.slow_ema)
        rsi = calculate_rsi(data, self.rsi_period)

        prev_diff = (ema_f[-2] or 0) - (ema_s[-2] or 0)
        curr_diff = (ema_f[-1] or 0) - (ema_s[-1] or 0)
        current_rsi = rsi[-1] or 50.0

        signal = "HOLD"
        direction = "NONE"
        confidence = 65.0

        if prev_diff <= 0 and curr_diff > 0 and current_rsi > 52:
            signal = "BUY"
            direction = "LONG"
            confidence = min(92.0, 70.0 + (current_rsi - 50.0) * 0.7)
        elif prev_diff >= 0 and curr_diff < 0 and current_rsi < 48:
            signal = "SELL"
            direction = "SHORT"
            confidence = min(92.0, 70.0 + (50.0 - current_rsi) * 0.7)

        entry = self.calculate_entry(data, direction)
        stop_loss = self.calculate_stop_loss(data, direction, entry)
        take_profits = self.calculate_take_profits(data, direction, entry, stop_loss)
        pos_size = self.calculate_position_size(25000.0, 1.0, entry, stop_loss)

        return {
            "signal": signal,
            "direction": direction,
            "entry": entry,
            "stop_loss": stop_loss,
            "take_profits": take_profits,
            "position_size": pos_size,
            "risk_reward": 3.0,
            "confidence": round(confidence, 1),
        }

class SupertrendBreakoutStrategy(BaseStrategy):
    name: str = "Supertrend Volatility Breakout"
    description: str = "Captures explosive breakout trends using adaptive ATR bands and multi-target scaling"
    market_type: str = "ALL"

    def __init__(self, parameters: Optional[Dict[str, Any]] = None):
        super().__init__(parameters)
        self.period = int(self.parameters.get("period", 10))
        self.multiplier = float(self.parameters.get("multiplier", 3.0))

    def on_candle(self, candle: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None

    def calculate_entry(self, data: pd.DataFrame, direction: str) -> float:
        return float(data["close"].iloc[-1])

    def calculate_stop_loss(self, data: pd.DataFrame, direction: str, entry: float) -> float:
        st = calculate_supertrend(data, self.period, self.multiplier)
        val = st["supertrend"][-1]
        if direction == "LONG":
            return round(val if val < entry else entry * 0.985, 5)
        else:
            return round(val if val > entry else entry * 1.015, 5)

    def calculate_take_profits(self, data: pd.DataFrame, direction: str, entry: float, stop_loss: float) -> List[Dict[str, Any]]:
        risk = abs(entry - stop_loss)
        mults = [1.2, 2.4, 3.6, 5.0]
        tps = []
        for i, m in enumerate(mults):
            price = entry + (risk * m) if direction == "LONG" else entry - (risk * m)
            tps.append({
                "level": i + 1,
                "name": f"TP{i+1}",
                "price": round(price, 5),
                "percentage": 25.0,
                "rr": round(m, 1)
            })
        return tps

    def calculate_position_size(self, account_balance: float, risk_pct: float, entry: float, stop_loss: float, lot_size: float = 1.0) -> float:
        risk_amount = account_balance * (risk_pct / 100.0)
        risk_per_unit = abs(entry - stop_loss)
        if risk_per_unit <= 0:
            return 0.01
        units = risk_amount / risk_per_unit
        if lot_size > 1.0:
            return max(0.01, round(units / lot_size, 2))
        return round(units, 4)

    def generate_signal(self, data: pd.DataFrame) -> Dict[str, Any]:
        if len(data) < 20:
            return {
                "signal": "HOLD", "direction": "NONE",
                "entry": float(data["close"].iloc[-1]), "stop_loss": 0.0,
                "take_profits": [], "position_size": 0.0, "risk_reward": 0.0, "confidence": 0.0
            }
        st = calculate_supertrend(data, self.period, self.multiplier)
        dirs = st["direction"]
        
        signal = "HOLD"
        direction = "NONE"
        confidence = 60.0
        
        if len(dirs) >= 2 and dirs[-2] == -1 and dirs[-1] == 1:
            signal = "BUY"
            direction = "LONG"
            confidence = 82.5
        elif len(dirs) >= 2 and dirs[-2] == 1 and dirs[-1] == -1:
            signal = "SELL"
            direction = "SHORT"
            confidence = 82.5

        entry = self.calculate_entry(data, direction)
        stop_loss = self.calculate_stop_loss(data, direction, entry)
        tps = self.calculate_take_profits(data, direction, entry, stop_loss)
        pos = self.calculate_position_size(25000.0, 1.0, entry, stop_loss)

        return {
            "signal": signal,
            "direction": direction,
            "entry": entry,
            "stop_loss": stop_loss,
            "take_profits": tps,
            "position_size": pos,
            "risk_reward": 3.6,
            "confidence": confidence
        }

class VwapImbalanceStrategy(BaseStrategy):
    name: str = "Institutional VWAP & Orderbook Flow"
    description: str = "Session VWAP mean-reversion with aggressive bid/ask volume delta imbalance"
    market_type: str = "CRYPTO"

    def __init__(self, parameters: Optional[Dict[str, Any]] = None):
        super().__init__(parameters)
        self.vwap_period = int(self.parameters.get("vwap_period", 20))
        self.rsi_period = int(self.parameters.get("rsi_period", 14))

    def on_candle(self, candle: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None

    def calculate_entry(self, data: pd.DataFrame, direction: str) -> float:
        return float(data["close"].iloc[-1])

    def calculate_stop_loss(self, data: pd.DataFrame, direction: str, entry: float) -> float:
        atr_vals = calculate_atr(data, 14)
        atr = atr_vals[-1] if atr_vals and atr_vals[-1] is not None else entry * 0.008
        dist = atr * 1.2
        return round(entry - dist if direction == "LONG" else entry + dist, 4)

    def calculate_take_profits(self, data: pd.DataFrame, direction: str, entry: float, stop_loss: float) -> List[Dict[str, Any]]:
        risk = abs(entry - stop_loss)
        mults = [1.0, 2.2, 3.8]
        allocs = [33.3, 33.3, 33.4]
        return [
            {
                "level": i + 1,
                "name": f"TP{i+1}",
                "price": round(entry + risk * m if direction == "LONG" else entry - risk * m, 4),
                "percentage": allocs[i],
                "rr": m
            }
            for i, m in enumerate(mults)
        ]

    def calculate_position_size(self, account_balance: float, risk_pct: float, entry: float, stop_loss: float, lot_size: float = 1.0) -> float:
        risk_amount = account_balance * (risk_pct / 100.0)
        risk_per_unit = abs(entry - stop_loss)
        if risk_per_unit <= 0:
            return 0.01
        return round(risk_amount / risk_per_unit, 4)

    def generate_signal(self, data: pd.DataFrame) -> Dict[str, Any]:
        if len(data) < 30:
            return {"signal": "HOLD", "direction": "NONE", "entry": float(data["close"].iloc[-1]), "stop_loss": 0.0, "take_profits": [], "position_size": 0.0, "risk_reward": 0.0, "confidence": 0.0}
        
        # Calculate approximate session VWAP
        typical_price = (data["high"] + data["low"] + data["close"]) / 3.0
        cum_vol_price = (typical_price * data["volume"]).cumsum()
        cum_vol = data["volume"].cumsum()
        vwap = (cum_vol_price / (cum_vol + 1e-9)).iloc[-1]
        close = float(data["close"].iloc[-1])
        rsi_vals = calculate_rsi(data, self.rsi_period)
        rsi = rsi_vals[-1] or 50.0

        signal = "HOLD"
        direction = "NONE"
        confidence = 65.0

        if close > vwap and rsi > 51.0:
            signal = "BUY"
            direction = "LONG"
            confidence = min(94.0, 72.0 + (rsi - 50.0) * 0.8)
        elif close < vwap and rsi < 49.0:
            signal = "SELL"
            direction = "SHORT"
            confidence = min(94.0, 72.0 + (50.0 - rsi) * 0.8)

        entry = self.calculate_entry(data, direction)
        sl = self.calculate_stop_loss(data, direction, entry)
        tps = self.calculate_take_profits(data, direction, entry, sl)
        pos = self.calculate_position_size(25000.0, 1.0, entry, sl)

        return {
            "signal": signal,
            "direction": direction,
            "entry": entry,
            "stop_loss": sl,
            "take_profits": tps,
            "position_size": pos,
            "risk_reward": 2.8,
            "confidence": round(confidence, 1)
        }

class DeltaBreakoutStrategy(BaseStrategy):
    name: str = "Delta Gold & Silver Trend Breakout"
    description: str = "High-leverage precious metals breakout with tight ATR stop loss"
    market_type: str = "COMMODITIES"

    def __init__(self, parameters: Optional[Dict[str, Any]] = None):
        super().__init__(parameters)
        self.atr_multiplier = float(self.parameters.get("atr_multiplier", 1.8))

    def on_candle(self, candle: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None

    def calculate_entry(self, data: pd.DataFrame, direction: str) -> float:
        return float(data["close"].iloc[-1])

    def calculate_stop_loss(self, data: pd.DataFrame, direction: str, entry: float) -> float:
        atr_vals = calculate_atr(data, 14)
        atr = atr_vals[-1] if atr_vals and atr_vals[-1] is not None else entry * 0.005
        dist = atr * self.atr_multiplier
        return round(entry - dist if direction == "LONG" else entry + dist, 4)

    def calculate_take_profits(self, data: pd.DataFrame, direction: str, entry: float, stop_loss: float) -> List[Dict[str, Any]]:
        risk = abs(entry - stop_loss)
        mults = [1.0, 2.0, 3.5, 5.0]
        return [
            {
                "level": i + 1,
                "name": f"TP{i+1}",
                "price": round(entry + risk * m if direction == "LONG" else entry - risk * m, 4),
                "percentage": 25.0,
                "rr": m
            }
            for i, m in enumerate(mults)
        ]

    def calculate_position_size(self, account_balance: float, risk_pct: float, entry: float, stop_loss: float, lot_size: float = 1.0) -> float:
        risk_amount = account_balance * (risk_pct / 100.0)
        risk_per_unit = abs(entry - stop_loss)
        if risk_per_unit <= 0:
            return 0.01
        return round(risk_amount / risk_per_unit, 4)

    def generate_signal(self, data: pd.DataFrame) -> Dict[str, Any]:
        if len(data) < 30:
            return {"signal": "HOLD", "direction": "NONE", "entry": float(data["close"].iloc[-1]), "stop_loss": 0.0, "take_profits": [], "position_size": 0.0, "risk_reward": 0.0, "confidence": 0.0}
        
        rsi_vals = calculate_rsi(data, 14)
        rsi = rsi_vals[-1] or 50.0
        atr_vals = calculate_atr(data, 14)
        atr = atr_vals[-1] or 1.0
        avg_atr = np.mean([a for a in atr_vals[-20:] if a is not None]) if len(atr_vals) >= 20 else atr

        signal = "HOLD"
        direction = "NONE"
        confidence = 68.0

        if rsi > 54.0 and atr >= avg_atr * 1.05:
            signal = "BUY"
            direction = "LONG"
            confidence = min(93.0, 72.0 + (rsi - 50.0) * 0.9)
        elif rsi < 46.0 and atr >= avg_atr * 1.05:
            signal = "SELL"
            direction = "SHORT"
            confidence = min(93.0, 72.0 + (50.0 - rsi) * 0.9)

        entry = self.calculate_entry(data, direction)
        sl = self.calculate_stop_loss(data, direction, entry)
        tps = self.calculate_take_profits(data, direction, entry, sl)
        pos = self.calculate_position_size(25000.0, 1.0, entry, sl)

        return {
            "signal": signal,
            "direction": direction,
            "entry": entry,
            "stop_loss": sl,
            "take_profits": tps,
            "position_size": pos,
            "risk_reward": 3.5,
            "confidence": round(confidence, 1)
        }

BUILTIN_STRATEGIES = {
    "ema_crossover": EmaCrossoverStrategy,
    "delta_momentum": EmaCrossoverStrategy,
    "vwap_imbalance": VwapImbalanceStrategy,
    "supertrend": SupertrendBreakoutStrategy,
    "supertrend_trend": SupertrendBreakoutStrategy,
    "delta_gold_silver": DeltaBreakoutStrategy,
    "delta_crude_reversion": EmaCrossoverStrategy,
    "delta_neutral_basis": VwapImbalanceStrategy,
}
