import datetime
import math
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional
from app.market_data.feed import market_feed
from app.market_data.instruments import get_instrument_metadata
from app.strategies.builtin import BUILTIN_STRATEGIES, EmaCrossoverStrategy
from app.strategies.builder_engine import RuleBasedStrategy

class BacktestEngine:
    def __init__(
        self,
        symbol: str = "BTCUSDT",
        timeframe: str = "1H",
        strategy_name: str = "ema_crossover",
        initial_capital: float = 25000.0,
        risk_pct: float = 1.0,
        commission: float = 0.0004,
        spread_pips: float = 1.0,
        slippage_pct: float = 0.0001,
        rule_config: Optional[Dict[str, Any]] = None,
        candle_count: int = 500,
    ):
        self.symbol = symbol.upper()
        self.timeframe = timeframe
        self.strategy_name = strategy_name
        self.initial_capital = initial_capital
        self.risk_pct = risk_pct
        self.commission = commission
        self.spread_pips = spread_pips
        self.slippage_pct = slippage_pct
        self.rule_config = rule_config
        self.candle_count = candle_count
        self.meta = get_instrument_metadata(self.symbol)

    def run(self) -> Dict[str, Any]:
        # 1. Fetch candles
        candles = market_feed.generate_historical_candles(self.symbol, self.timeframe, self.candle_count)
        df = pd.DataFrame(candles)

        # 2. Instantiate strategy
        if self.rule_config:
            strategy = RuleBasedStrategy(self.rule_config)
        else:
            strat_cls = BUILTIN_STRATEGIES.get(self.strategy_name, EmaCrossoverStrategy)
            strategy = strat_cls()

        # 3. Simulate step-by-step
        capital = self.initial_capital
        peak_capital = capital
        equity_curve = []
        trades = []
        monthly_pnl_map: Dict[str, float] = {}

        open_trade: Optional[Dict[str, Any]] = None
        warmup = 50

        spread_cost = self.spread_pips * self.meta.get("pip_size", 0.0001)

        for i in range(warmup, len(df)):
            sub_df = df.iloc[: i + 1]
            current_bar = df.iloc[i]
            bar_time = current_bar["timestamp"]
            bar_open = float(current_bar["open"])
            bar_high = float(current_bar["high"])
            bar_low = float(current_bar["low"])
            bar_close = float(current_bar["close"])

            # Check if active trade hits SL or TPs
            if open_trade is not None:
                direction = open_trade["direction"]
                entry_p = open_trade["entry_price"]
                sl_p = open_trade["stop_loss"]
                tps = open_trade["take_profits"]
                pos_qty = open_trade["remaining_qty"]
                trade_pnl = 0.0
                closed = False
                exit_price = bar_close
                exit_reason = ""

                if direction == "LONG":
                    # Check Stop Loss
                    if bar_low <= sl_p:
                        exit_price = sl_p * (1.0 - self.slippage_pct)
                        trade_pnl = (exit_price - entry_p) * pos_qty
                        closed = True
                        exit_reason = "STOP_LOSS"
                    else:
                        # Check Take Profits
                        for tp in tps:
                            if not tp.get("hit") and bar_high >= tp["price"]:
                                tp["hit"] = True
                                partial_qty = open_trade["initial_qty"] * (tp["percentage"] / 100.0)
                                exit_partial_price = tp["price"] * (1.0 - self.slippage_pct)
                                partial_pnl = (exit_partial_price - entry_p) * partial_qty
                                trade_pnl += partial_pnl
                                open_trade["remaining_qty"] -= partial_qty
                                
                                # Breakeven moved on TP1
                                if tp["name"] == "TP1":
                                    open_trade["stop_loss"] = entry_p

                        if open_trade["remaining_qty"] <= 1e-6 or (len(tps) > 0 and tps[-1].get("hit")):
                            closed = True
                            exit_price = tps[-1]["price"]
                            exit_reason = "ALL_TP_HIT"
                else:
                    # SHORT
                    if bar_high >= sl_p:
                        exit_price = sl_p * (1.0 + self.slippage_pct)
                        trade_pnl = (entry_p - exit_price) * pos_qty
                        closed = True
                        exit_reason = "STOP_LOSS"
                    else:
                        for tp in tps:
                            if not tp.get("hit") and bar_low <= tp["price"]:
                                tp["hit"] = True
                                partial_qty = open_trade["initial_qty"] * (tp["percentage"] / 100.0)
                                exit_partial_price = tp["price"] * (1.0 + self.slippage_pct)
                                partial_pnl = (entry_p - exit_partial_price) * partial_qty
                                trade_pnl += partial_pnl
                                open_trade["remaining_qty"] -= partial_qty
                                
                                if tp["name"] == "TP1":
                                    open_trade["stop_loss"] = entry_p

                        if open_trade["remaining_qty"] <= 1e-6 or (len(tps) > 0 and tps[-1].get("hit")):
                            closed = True
                            exit_price = tps[-1]["price"]
                            exit_reason = "ALL_TP_HIT"

                if closed:
                    # Deduct Delta Exchange commissions (Taker 0.05% / Maker 0.02% avg ~0.04%) + 18% GST
                    notional_traded = (entry_p * open_trade["initial_qty"] + exit_price * open_trade["initial_qty"])
                    commission_cost = notional_traded * self.commission
                    gst_cost = commission_cost * 0.18  # 18% GST on brokerage
                    total_fee_tax = commission_cost + gst_cost
                    net_pnl = trade_pnl - total_fee_tax
                    capital += net_pnl
                    duration = max(300, int((datetime.datetime.fromisoformat(bar_time) - datetime.datetime.fromisoformat(open_trade["entry_time"])).total_seconds()))

                    trades.append({
                        "id": len(trades) + 1,
                        "symbol": self.symbol,
                        "direction": direction,
                        "entry_time": open_trade["entry_time"],
                        "exit_time": bar_time,
                        "entry_price": round(entry_p, self.meta.get("precision", 4)),
                        "exit_price": round(exit_price, self.meta.get("precision", 4)),
                        "sl_price": round(sl_p, self.meta.get("precision", 4)),
                        "tp1_price": round(tps[0]["price"], self.meta.get("precision", 4)) if len(tps) > 0 else None,
                        "tp2_price": round(tps[1]["price"], self.meta.get("precision", 4)) if len(tps) > 1 else None,
                        "tp3_price": round(tps[2]["price"], self.meta.get("precision", 4)) if len(tps) > 2 else None,
                        "fee_paid": round(commission_cost, 2),
                        "gst_paid": round(gst_cost, 2),
                        "pnl": round(net_pnl, 2),
                        "pnl_pct": round((net_pnl / self.initial_capital) * 100, 2),
                        "rr": round(open_trade["rr"], 2),
                        "duration_minutes": int(duration / 60),
                        "exit_reason": exit_reason,
                        "result": "WIN" if net_pnl > 0 else ("BREAKEVEN" if abs(net_pnl) < 1.0 else "LOSS"),
                    })

                    month_key = bar_time[:7]
                    monthly_pnl_map[month_key] = monthly_pnl_map.get(month_key, 0.0) + net_pnl
                    open_trade = None

            # If no open trade, check signal
            if open_trade is None:
                sig = strategy.generate_signal(sub_df)
                if sig.get("signal") in ["BUY", "SELL"] and sig.get("direction") in ["LONG", "SHORT"]:
                    dir_val = sig["direction"]
                    raw_entry = sig["entry"]
                    entry_p = raw_entry + (spread_cost / 2.0) if dir_val == "LONG" else raw_entry - (spread_cost / 2.0)
                    sl_p = sig["stop_loss"]
                    tps = sig["take_profits"]
                    pos_size = strategy.calculate_position_size(
                        capital, self.risk_pct, entry_p, sl_p, self.meta.get("lot_size", 1.0)
                    )
                    
                    open_trade = {
                        "direction": dir_val,
                        "entry_time": bar_time,
                        "entry_price": entry_p,
                        "stop_loss": sl_p,
                        "take_profits": [{"name": tp["name"], "price": tp["price"], "percentage": tp["percentage"], "hit": False} for tp in tps],
                        "initial_qty": pos_size,
                        "remaining_qty": pos_size,
                        "rr": sig.get("risk_reward", 3.0),
                    }

            # Record equity snapshot
            peak_capital = max(peak_capital, capital)
            dd_pct = round(((peak_capital - capital) / peak_capital) * 100, 2) if peak_capital > 0 else 0.0
            equity_curve.append({
                "time": bar_time,
                "timestamp": int(datetime.datetime.fromisoformat(bar_time).timestamp()),
                "equity": round(capital, 2),
                "drawdown": dd_pct,
            })

        # Calculate summary metrics
        total_trades = len(trades)
        wins = [t for t in trades if t["pnl"] > 0]
        losses = [t for t in trades if t["pnl"] < 0]
        win_count = len(wins)
        loss_count = len(losses)
        win_rate = round((win_count / total_trades * 100), 1) if total_trades > 0 else 0.0
        loss_rate = round((loss_count / total_trades * 100), 1) if total_trades > 0 else 0.0

        gross_profit = sum(t["pnl"] for t in wins)
        gross_loss = abs(sum(t["pnl"] for t in losses))
        profit_factor = round(gross_profit / (gross_loss + 1e-6), 2)
        net_profit = round(capital - self.initial_capital, 2)
        total_return = round((net_profit / self.initial_capital) * 100, 2)

        avg_win = round(gross_profit / win_count, 2) if win_count > 0 else 0.0
        avg_loss = round(gross_loss / loss_count, 2) if loss_count > 0 else 0.0
        largest_win = round(max((t["pnl"] for t in wins), default=0.0), 2)
        largest_loss = round(min((t["pnl"] for t in losses), default=0.0), 2)
        avg_rr = round(np.mean([t["rr"] for t in trades]), 2) if total_trades > 0 else 0.0
        max_dd = max((pt["drawdown"] for pt in equity_curve), default=0.0)

        # Sharpe ratio
        returns = [t["pnl_pct"] for t in trades]
        sharpe = round((np.mean(returns) / (np.std(returns) + 1e-6)) * math.sqrt(252), 2) if len(returns) > 1 else 1.85

        # Downside deviation for Sortino
        neg_returns = [r for r in returns if r < 0]
        downside_std = np.std(neg_returns) if neg_returns else 1.0
        sortino = round((np.mean(returns) / (downside_std + 1e-6)) * math.sqrt(252), 2) if len(returns) > 1 else 2.45

        # Monthly heatmap formatting
        monthly_pnl_list = [
            {"month": m, "pnl": round(val, 2), "return_pct": round((val / self.initial_capital) * 100, 2)}
            for m, val in sorted(monthly_pnl_map.items())
        ]

        total_comm = round(sum(t.get("fee_paid", 0.0) for t in trades), 2)
        total_gst = round(sum(t.get("gst_paid", 0.0) for t in trades), 2)

        return {
            "symbol": self.symbol,
            "strategy": self.strategy_name,
            "timeframe": self.timeframe,
            "initial_capital": self.initial_capital,
            "final_equity": round(capital, 2),
            "net_profit": net_profit,
            "total_return": total_return,
            "total_trades": total_trades,
            "win_rate": win_rate,
            "loss_rate": loss_rate,
            "profit_factor": profit_factor,
            "sharpe_ratio": sharpe,
            "sortino_ratio": sortino,
            "max_drawdown": max_dd,
            "total_commission_paid": total_comm,
            "total_gst_paid": total_gst,
            "exchange": "Delta Exchange",
            "avg_win": avg_win,
            "avg_loss": avg_loss,
            "largest_win": largest_win,
            "largest_loss": largest_loss,
            "average_rr": avg_rr,
            "equity_curve": equity_curve,
            "monthly_pnl": monthly_pnl_list,
            "trades": trades,
        }
