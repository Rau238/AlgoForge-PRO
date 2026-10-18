from typing import Dict, Any, List, Optional
import pandas as pd
from app.strategies.engine import BaseStrategy
from app.market_data.indicators import calculate_ema, calculate_sma, calculate_rsi, calculate_atr, calculate_macd

class RuleBasedStrategy(BaseStrategy):
    name: str = "Custom Rule-Based Strategy"
    description: str = "User defined visual rule sequence"

    def __init__(self, rule_config: Dict[str, Any]):
        super().__init__(rule_config)
        self.rules = rule_config.get("rules", [])
        self.logic = rule_config.get("logic", "AND")  # AND / OR
        self.action = rule_config.get("action", "BUY")
        self.sl_type = rule_config.get("sl_type", "ATR")  # ATR, FIXED, PERCENT
        self.sl_value = float(rule_config.get("sl_value", 1.5))
        self.tp_rrs = rule_config.get("tp_rrs", [1.0, 2.0, 3.0, 4.0])
        self.tp_allocations = rule_config.get("tp_allocations", [25.0, 25.0, 25.0, 25.0])

    def on_candle(self, candle: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        return None

    def calculate_entry(self, data: pd.DataFrame, direction: str) -> float:
        return float(data["close"].iloc[-1])

    def calculate_stop_loss(self, data: pd.DataFrame, direction: str, entry: float) -> float:
        if self.sl_type == "ATR":
            atr_s = calculate_atr(data, 14)
            atr = atr_s[-1] if atr_s and atr_s[-1] is not None else entry * 0.01
            dist = atr * self.sl_value
        elif self.sl_type == "PERCENT":
            dist = entry * (self.sl_value / 100.0)
        else:
            dist = self.sl_value
            
        if direction == "LONG":
            return round(entry - dist, 5)
        else:
            return round(entry + dist, 5)

    def calculate_take_profits(self, data: pd.DataFrame, direction: str, entry: float, stop_loss: float) -> List[Dict[str, Any]]:
        risk = abs(entry - stop_loss)
        tps = []
        for i, (rr, alloc) in enumerate(zip(self.tp_rrs, self.tp_allocations)):
            price = entry + (risk * rr) if direction == "LONG" else entry - (risk * rr)
            tps.append({
                "level": i + 1,
                "name": f"TP{i+1}",
                "price": round(price, 5),
                "percentage": alloc,
                "rr": rr
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

    def _evaluate_condition(self, rule: Dict[str, Any], data: pd.DataFrame) -> bool:
        indicator_a = rule.get("indicator_a", "EMA")
        param_a = int(rule.get("param_a", 20))
        operator = rule.get("operator", "CROSS_ABOVE")
        target_type = rule.get("target_type", "INDICATOR")  # INDICATOR or VALUE
        indicator_b = rule.get("indicator_b", "EMA")
        param_b = int(rule.get("param_b", 50))
        value_b = float(rule.get("value_b", 50.0))

        # Compute Series A
        if indicator_a == "EMA":
            s_a = calculate_ema(data, param_a)
        elif indicator_a == "SMA":
            s_a = calculate_sma(data, param_a)
        elif indicator_a == "RSI":
            s_a = calculate_rsi(data, param_a)
        else:
            s_a = data["close"].tolist()

        # Compute Series B / Value B
        if target_type == "INDICATOR":
            if indicator_b == "EMA":
                s_b = calculate_ema(data, param_b)
            elif indicator_b == "SMA":
                s_b = calculate_sma(data, param_b)
            elif indicator_b == "RSI":
                s_b = calculate_rsi(data, param_b)
            else:
                s_b = data["close"].tolist()
        else:
            s_b = [value_b] * len(s_a)

        if len(s_a) < 2 or len(s_b) < 2:
            return False

        a_curr, a_prev = s_a[-1], s_a[-2]
        b_curr, b_prev = s_b[-1], s_b[-2]

        if a_curr is None or a_prev is None or b_curr is None or b_prev is None:
            return False

        if operator == "CROSS_ABOVE":
            return a_prev <= b_prev and a_curr > b_curr
        elif operator == "CROSS_BELOW":
            return a_prev >= b_prev and a_curr < b_curr
        elif operator == "GREATER_THAN":
            return a_curr > b_curr
        elif operator == "LESS_THAN":
            return a_curr < b_curr
        elif operator == "EQUALS":
            return abs(a_curr - b_curr) < 1e-4

        return False

    def generate_signal(self, data: pd.DataFrame) -> Dict[str, Any]:
        if len(data) < 30 or not self.rules:
            return {
                "signal": "HOLD", "direction": "NONE",
                "entry": float(data["close"].iloc[-1]), "stop_loss": 0.0,
                "take_profits": [], "position_size": 0.0, "risk_reward": 0.0, "confidence": 0.0
            }

        evaluations = [self._evaluate_condition(rule, data) for rule in self.rules]
        triggered = all(evaluations) if self.logic == "AND" else any(evaluations)

        direction = "LONG" if self.action == "BUY" else "SHORT"
        signal = self.action if triggered else "HOLD"
        confidence = 78.5 if triggered else 50.0

        entry = self.calculate_entry(data, direction)
        stop_loss = self.calculate_stop_loss(data, direction, entry)
        tps = self.calculate_take_profits(data, direction, entry, stop_loss)
        pos = self.calculate_position_size(25000.0, 1.0, entry, stop_loss)

        return {
            "signal": signal,
            "direction": direction if triggered else "NONE",
            "entry": entry,
            "stop_loss": stop_loss,
            "take_profits": tps,
            "position_size": pos,
            "risk_reward": self.tp_rrs[-1] if self.tp_rrs else 3.0,
            "confidence": confidence
        }
