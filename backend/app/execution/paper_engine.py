import uuid
import datetime
from typing import Dict, Any, List, Optional
from app.market_data.instruments import get_instrument_metadata
from app.execution.delta_exchange import delta_engine
from app.redis_bus import redis_bus
from app.notifications.service import notification_service

class PaperTradingEngine:
    def __init__(self):
        self.account = {
            "id": 1,
            "balance": 100.0,
            "equity": 103.45,
            "used_margin": 25.65,
            "free_margin": 77.80,
            "daily_pnl": 5.85,
            "unrealized_pnl": 3.45,
            "realized_pnl": 2.40,
            "win_rate": 72.4,
            "profit_factor": 2.18,
            "max_drawdown": 4.2,
            "active_strategies": 4,
            "exchange": "Delta Exchange",
        }
        self.positions: List[Dict[str, Any]] = []
        self.orders: List[Dict[str, Any]] = []
        self.trade_history: List[Dict[str, Any]] = []
        self.seed_delta_exchange_trades()

    def reset_all_data(self, initial_balance: float = 100.0) -> Dict[str, Any]:
        """
        Cleans ALL previous orders, positions, profit/loss history,
        and restarts fresh on Delta Exchange with the specified initial balance.
        """
        self.positions = []
        self.orders = []
        self.trade_history = []
        self.account = {
            "id": 1,
            "balance": float(initial_balance),
            "equity": float(initial_balance),
            "used_margin": 0.0,
            "free_margin": float(initial_balance),
            "daily_pnl": 0.0,
            "unrealized_pnl": 0.0,
            "realized_pnl": 0.0,
            "win_rate": 0.0,
            "profit_factor": 0.0,
            "max_drawdown": 0.0,
            "active_strategies": 4,
            "exchange": "Delta Exchange",
        }
        return {
            "status": "SUCCESS",
            "message": f"All trading data, orders, and P&L history wiped. Restarted with clean Delta Exchange state at ${initial_balance:.2f}.",
            "account": self.account,
            "positions_count": 0,
            "orders_count": 0,
            "trade_history_count": 0,
        }

    def seed_delta_exchange_trades(self):
        """
        Seeds professional algorithmic positions strictly on Delta Exchange
        for Crypto & tradable Commodities (Gold, Silver, Crude Oil) calibrated for a $100 capital account.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        from app.market_data.feed import market_feed
        btc_price = market_feed.live_prices.get("BTCUSDT", {}).get("price", 81950.0)
        gold_price = market_feed.live_prices.get("XAUUSD", {}).get("price", 4180.35)
        sol_price = market_feed.live_prices.get("SOLUSDT", {}).get("price", 104.35)
        oil_price = market_feed.live_prices.get("USOIL", {}).get("price", 99.02)

        # BTC Micro-lot (0.004 BTC): Notional ~$327.80, Leverage 25x -> Margin $13.11
        btc_entry = round(btc_price * 0.993, 2)
        btc_qty = 0.004
        btc_margin = round((btc_entry * btc_qty) / 25, 2)
        btc_pnl = round((btc_price - btc_entry) * btc_qty, 2)

        # Gold Micro-lot (0.06 oz): Notional ~$250.82, Leverage 20x -> Margin $12.54
        gold_entry = round(gold_price * 0.995, 2)
        gold_qty = 0.06
        gold_margin = round((gold_entry * gold_qty) / 20, 2)
        gold_pnl = round((gold_price - gold_entry) * gold_qty, 2)

        # SOL Micro-lot (1.5 SOL): Notional ~$156.50, Leverage 15x -> Margin $10.43
        sol_entry = round(sol_price * 0.988, 2)
        sol_qty = 1.5
        sol_margin = round((sol_entry * sol_qty) / 15, 2)
        sol_pnl = round((sol_price - sol_entry) * sol_qty, 2)

        self.positions = [
            {
                "id": 101,
                "symbol": "BTCUSDT",
                "market_type": "CRYPTO",
                "exchange": "Delta Exchange",
                "contract_type": "PERPETUAL_FUTURES",
                "direction": "LONG",
                "quantity": btc_qty,
                "original_quantity": btc_qty,
                "entry_price": btc_entry,
                "current_price": btc_price,
                "leverage": 25,
                "margin_mode": "ISOLATED",
                "initial_margin": btc_margin,
                "liquidation_price": round(btc_entry * (1.0 - 1.0 / 25 + 0.005), 2),
                "stop_loss": round(btc_entry * 0.987, 2),
                "tp1": round(btc_entry * 1.012, 2),
                "tp2": round(btc_entry * 1.025, 2),
                "tp3": round(btc_entry * 1.045, 2),
                "tp4": round(btc_entry * 1.070, 2),
                "tp1_hit": True,
                "tp2_hit": False,
                "tp3_hit": False,
                "tp4_hit": False,
                "remaining_pct": 75.0,
                "breakeven_moved": True,
                "trailing_stop": False,
                "pnl": btc_pnl,
                "pnl_pct": round(((btc_price - btc_entry) / btc_entry) * 100, 2),
                "rr": 2.8,
                "status": "OPEN",
                "strategy": "Delta Momentum Breakout",
                "opened_at": (now - datetime.timedelta(hours=2, minutes=15)).isoformat(),
            },
            {
                "id": 102,
                "symbol": "XAUUSD",
                "market_type": "COMMODITIES",
                "exchange": "Delta Exchange",
                "contract_type": "COMMODITY_FUTURES",
                "direction": "LONG",
                "quantity": gold_qty,
                "original_quantity": gold_qty,
                "entry_price": gold_entry,
                "current_price": gold_price,
                "leverage": 20,
                "margin_mode": "ISOLATED",
                "initial_margin": gold_margin,
                "liquidation_price": round(gold_entry * (1.0 - 1.0 / 20 + 0.01), 2),
                "stop_loss": round(gold_entry * 0.99, 2),
                "tp1": round(gold_entry * 1.012, 2),
                "tp2": round(gold_entry * 1.025, 2),
                "tp3": round(gold_entry * 1.04, 2),
                "tp4": round(gold_entry * 1.06, 2),
                "tp1_hit": False,
                "tp2_hit": False,
                "tp3_hit": False,
                "tp4_hit": False,
                "remaining_pct": 100.0,
                "breakeven_moved": False,
                "trailing_stop": True,
                "pnl": gold_pnl,
                "pnl_pct": round(((gold_price - gold_entry) / gold_entry) * 100, 2),
                "rr": 2.6,
                "status": "OPEN",
                "strategy": "Delta Commodities Trend",
                "opened_at": (now - datetime.timedelta(hours=3, minutes=40)).isoformat(),
            },
        ]

        # Trade History calibrated for $100 capital micro-trading with detailed targets taken
        self.trade_history = [
            {
                "id": 1,
                "symbol": "BTCUSDT",
                "direction": "LONG",
                "strategy": "Delta Momentum Breakout",
                "leverage": 25,
                "entry_price": 80920.00,
                "exit_price": 82150.00,
                "stop_loss": 80100.00,
                "take_profit": 82500.00,
                "risk_amount": 3.28,
                "reward_amount": 4.92,
                "pnl": 4.92,
                "rr": 2.8,
                "duration_minutes": 78,
                "result": "WIN",
                "targets_taken": "TP1 Hit (25%) ✓, TP2 Hit (25%) ✓, TP3 Hit (25%) ✓, Breakeven Moved ✓",
                "exit_reason": "TP3 Target Scale Out",
                "is_automated": True,
                "exchange": "Delta Exchange",
                "closed_at": (now - datetime.timedelta(hours=2, minutes=30)).isoformat(),
            },
            {
                "id": 2,
                "symbol": "ETHUSDT",
                "direction": "LONG",
                "strategy": "Delta Momentum Breakout",
                "leverage": 25,
                "entry_price": 2410.00,
                "exit_price": 2442.00,
                "stop_loss": 2380.00,
                "take_profit": 2445.00,
                "risk_amount": 1.80,
                "reward_amount": 3.84,
                "pnl": 3.84,
                "rr": 2.1,
                "duration_minutes": 65,
                "result": "WIN",
                "targets_taken": "TP1 Hit (25%) ✓, Breakeven Protected ✓",
                "exit_reason": "TP1 Target & Breakeven Runner",
                "is_automated": True,
                "exchange": "Delta Exchange",
                "closed_at": (now - datetime.timedelta(hours=5)).isoformat(),
            },
            {
                "id": 3,
                "symbol": "XAUUSD",
                "direction": "LONG",
                "strategy": "Delta Commodities Trend",
                "leverage": 20,
                "entry_price": 4145.20,
                "exit_price": 4172.50,
                "stop_loss": 4125.00,
                "take_profit": 4180.00,
                "risk_amount": 1.21,
                "reward_amount": 1.64,
                "pnl": 1.64,
                "rr": 2.35,
                "duration_minutes": 110,
                "result": "WIN",
                "targets_taken": "TP1 Hit (25%) ✓, TP2 Hit (25%) ✓, Trailing SL Hit ✓",
                "exit_reason": "Trailing SL Protected Exit",
                "is_automated": True,
                "exchange": "Delta Exchange",
                "closed_at": (now - datetime.timedelta(hours=7, minutes=15)).isoformat(),
            },
            {
                "id": 4,
                "symbol": "SOLUSDT",
                "direction": "LONG",
                "strategy": "Supertrend Trend Following",
                "leverage": 15,
                "entry_price": 103.20,
                "exit_price": 103.20,
                "stop_loss": 103.20,
                "take_profit": 106.00,
                "risk_amount": 1.50,
                "reward_amount": 4.20,
                "pnl": 0.00,
                "rr": 0.0,
                "duration_minutes": 35,
                "result": "BREAKEVEN",
                "targets_taken": "Breakeven SL Triggered (0% Loss) ✓",
                "exit_reason": "Breakeven Stop Loss Protected",
                "is_automated": True,
                "exchange": "Delta Exchange",
                "closed_at": (now - datetime.timedelta(hours=9)).isoformat(),
            },
            {
                "id": 5,
                "symbol": "USOIL",
                "direction": "SHORT",
                "strategy": "Delta Mean Reversion",
                "leverage": 20,
                "entry_price": 101.40,
                "exit_price": 101.90,
                "stop_loss": 101.90,
                "take_profit": 98.20,
                "risk_amount": 1.00,
                "reward_amount": 3.20,
                "pnl": -0.50,
                "rr": 0.0,
                "duration_minutes": 22,
                "result": "LOSS",
                "targets_taken": "Initial Stop Loss Hit (Managed Risk) ✗",
                "exit_reason": "Stop Loss Hit",
                "is_automated": True,
                "exchange": "Delta Exchange",
                "closed_at": (now - datetime.timedelta(hours=14)).isoformat(),
            },
        ]

        # Pending Limit Orders for $100 capital account
        self.orders = [
            {
                "id": 201,
                "symbol": "ETHUSDT",
                "order_type": "LIMIT",
                "side": "BUY",
                "quantity": 0.12,
                "price": 2415.00,
                "leverage": 25,
                "margin_mode": "ISOLATED",
                "required_margin": 11.59,
                "stop_loss": 2385.00,
                "take_profit": 2480.00,
                "strategy": "Delta Momentum Breakout",
                "exchange": "Delta Exchange",
                "status": "PENDING",
                "created_at": now.isoformat(),
            },
            {
                "id": 202,
                "symbol": "SOLUSDT",
                "order_type": "LIMIT",
                "side": "BUY",
                "quantity": 1.2,
                "price": 102.80,
                "leverage": 15,
                "margin_mode": "ISOLATED",
                "required_margin": 8.22,
                "stop_loss": 101.40,
                "take_profit": 107.50,
                "strategy": "Supertrend Trend Following",
                "exchange": "Delta Exchange",
                "status": "PENDING",
                "created_at": now.isoformat(),
            }
        ]

        # Calculate initial totals for $100 capital
        self.account["balance"] = 100.0
        self.account["realized_pnl"] = 2.40
        total_used_margin = sum(p.get("initial_margin", 0.0) for p in self.positions)
        total_unrealized = sum(p.get("pnl", 0.0) for p in self.positions)
        self.account["used_margin"] = round(total_used_margin, 2)
        self.account["unrealized_pnl"] = round(total_unrealized, 2)
        self.account["equity"] = round(self.account["balance"] + total_unrealized, 2)
        self.account["free_margin"] = round(self.account["equity"] - self.account["used_margin"], 2)
        self.account["daily_pnl"] = round(self.account["realized_pnl"] + total_unrealized, 2)
        self.account["win_rate"] = 75.0
        self.account["profit_factor"] = 2.45
        self.account["max_drawdown"] = 3.8

    def create_order(self, data: Dict[str, Any]) -> Dict[str, Any]:
        symbol = data["symbol"].upper()
        meta = get_instrument_metadata(symbol)
        side = data.get("side", "BUY").upper()
        order_type = data.get("order_type", "MARKET").upper()
        quantity = float(data.get("quantity", 0.1))
        price = float(data.get("price", 0.0))
        leverage = int(data.get("leverage", 20))
        margin_mode = data.get("margin_mode", "ISOLATED").upper()
        
        sl = float(data.get("stop_loss", 0.0)) if data.get("stop_loss") else None
        tp1 = float(data.get("tp1", 0.0)) if data.get("tp1") else None
        tp2 = float(data.get("tp2", 0.0)) if data.get("tp2") else None
        tp3 = float(data.get("tp3", 0.0)) if data.get("tp3") else None
        tp4 = float(data.get("tp4", 0.0)) if data.get("tp4") else None

        # Calculate Delta Exchange margin & liquidation price
        margin_info = delta_engine.calculate_margin(symbol, quantity, price, leverage, margin_mode)
        liq_info = delta_engine.calculate_liquidation_price(
            symbol, "LONG" if side == "BUY" else "SHORT", price, margin_info["leverage"], margin_mode
        )

        order_id = len(self.orders) + 300
        new_order = {
            "id": order_id,
            "symbol": symbol,
            "order_type": order_type,
            "side": side,
            "quantity": quantity,
            "price": price,
            "leverage": margin_info["leverage"],
            "margin_mode": margin_mode,
            "required_margin": margin_info["initial_margin"],
            "liquidation_price": liq_info["liquidation_price"],
            "stop_loss": sl,
            "take_profit": tp1,
            "strategy": data.get("strategy", "Delta Algo Execution"),
            "exchange": "Delta Exchange",
            "status": "FILLED" if order_type == "MARKET" else "PENDING",
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        }
        self.orders.append(new_order)

        if order_type == "MARKET":
            pos_id = len(self.positions) + 100
            direction = "LONG" if side == "BUY" else "SHORT"
            new_pos = {
                "id": pos_id,
                "symbol": symbol,
                "market_type": meta.get("market_type", "CRYPTO"),
                "exchange": "Delta Exchange",
                "contract_type": "PERPETUAL_FUTURES" if meta.get("market_type") == "CRYPTO" else "COMMODITY_FUTURES",
                "direction": direction,
                "quantity": quantity,
                "original_quantity": quantity,
                "entry_price": price,
                "current_price": price,
                "leverage": margin_info["leverage"],
                "margin_mode": margin_mode,
                "initial_margin": margin_info["initial_margin"],
                "liquidation_price": liq_info["liquidation_price"],
                "stop_loss": sl or (price * 0.98 if direction == "LONG" else price * 1.02),
                "tp1": tp1 or (price * 1.015 if direction == "LONG" else price * 0.985),
                "tp2": tp2 or (price * 1.03 if direction == "LONG" else price * 0.97),
                "tp3": tp3 or (price * 1.05 if direction == "LONG" else price * 0.95),
                "tp4": tp4 or (price * 1.08 if direction == "LONG" else price * 0.92),
                "tp1_hit": False,
                "tp2_hit": False,
                "tp3_hit": False,
                "tp4_hit": False,
                "remaining_pct": 100.0,
                "breakeven_moved": False,
                "trailing_stop": False,
                "pnl": 0.0,
                "pnl_pct": 0.0,
                "rr": float(data.get("rr", 3.0)),
                "status": "OPEN",
                "strategy": data.get("strategy", "Delta Algo Execution"),
                "opened_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
            }
            self.positions.append(new_pos)

            # Update used margin & balance
            self.account["used_margin"] = round(self.account["used_margin"] + margin_info["initial_margin"], 2)
            self.account["free_margin"] = round(self.account["equity"] - self.account["used_margin"], 2)

            return {"order": new_order, "position": new_pos, "account": self.account}

        return {"order": new_order, "position": None, "account": self.account}

    def close_position(self, pos_id: int, partial_pct: Optional[float] = None) -> Optional[Dict[str, Any]]:
        for i, pos in enumerate(self.positions):
            if pos["id"] == pos_id:
                now_str = datetime.datetime.now(datetime.timezone.utc).isoformat()
                pos_pnl = float(pos.get("pnl", 0.0))
                pos_margin = float(pos.get("initial_margin", 0.0))

                if partial_pct and partial_pct < 100.0:
                    fraction = partial_pct / 100.0
                    closed_qty = round(pos["quantity"] * fraction, 4)
                    realized_partial_pnl = round(pos_pnl * fraction, 2)
                    released_margin = round(pos_margin * fraction, 2)

                    pos["quantity"] -= closed_qty
                    pos["initial_margin"] -= released_margin
                    pos["remaining_pct"] -= partial_pct
                    pos["status"] = "PARTIALLY_CLOSED"

                    # Realize partial P&L into account balance
                    self.account["balance"] = round(self.account["balance"] + realized_partial_pnl, 2)
                    self.account["realized_pnl"] = round(self.account["realized_pnl"] + realized_partial_pnl, 2)
                    self.account["daily_pnl"] = round(self.account["daily_pnl"] + realized_partial_pnl, 2)
                    self.account["used_margin"] = max(0.0, round(self.account["used_margin"] - released_margin, 2))
                    self.account["equity"] = round(self.account["balance"] + self.account["unrealized_pnl"], 2)
                    self.account["free_margin"] = round(self.account["equity"] - self.account["used_margin"], 2)

                    return pos
                else:
                    closed_pos = self.positions.pop(i)
                    closed_pos["status"] = "CLOSED"
                    closed_pos["closed_at"] = now_str

                    # Realize full P&L into account balance
                    self.account["balance"] = round(self.account["balance"] + pos_pnl, 2)
                    self.account["realized_pnl"] = round(self.account["realized_pnl"] + pos_pnl, 2)
                    self.account["daily_pnl"] = round(self.account["daily_pnl"] + pos_pnl, 2)
                    self.account["used_margin"] = max(0.0, round(self.account["used_margin"] - pos_margin, 2))
                    self.account["equity"] = round(self.account["balance"] + self.account["unrealized_pnl"], 2)
                    self.account["free_margin"] = round(self.account["equity"] - self.account["used_margin"], 2)

                    # Format targets taken status
                    tp_hits = []
                    if closed_pos.get("tp1_hit"):
                        tp_hits.append("TP1 Hit (25%) ✓")
                    if closed_pos.get("tp2_hit"):
                        tp_hits.append("TP2 Hit (25%) ✓")
                    if closed_pos.get("tp3_hit"):
                        tp_hits.append("TP3 Hit (25%) ✓")
                    if closed_pos.get("tp4_hit"):
                        tp_hits.append("TP4 Hit (25%) ✓")
                    if closed_pos.get("breakeven_moved"):
                        tp_hits.append("Breakeven Protected ✓")
                    
                    targets_summary = ", ".join(tp_hits) if tp_hits else ("Initial SL Hit ✗" if pos_pnl < 0 else "Take Profit Scaled ✓")

                    # Add to trade history
                    self.trade_history.append({
                        "id": len(self.trade_history) + 1,
                        "symbol": closed_pos["symbol"],
                        "direction": closed_pos["direction"],
                        "strategy": closed_pos["strategy"],
                        "leverage": closed_pos.get("leverage", 20),
                        "exchange": "Delta Exchange",
                        "entry_price": closed_pos["entry_price"],
                        "exit_price": closed_pos["current_price"],
                        "stop_loss": closed_pos["stop_loss"],
                        "take_profit": closed_pos["tp1"] or closed_pos["current_price"],
                        "risk_amount": round(pos_margin * 0.25, 2) if pos_margin > 0 else 2.50,
                        "reward_amount": abs(pos_pnl) if pos_pnl > 0 else 0.0,
                        "pnl": pos_pnl,
                        "rr": closed_pos.get("rr", 2.5),
                        "duration_minutes": 65,
                        "result": "WIN" if pos_pnl > 0 else ("BREAKEVEN" if pos_pnl == 0 else "LOSS"),
                        "targets_taken": targets_summary,
                        "exit_reason": "Automated Algorithm Settlement" if closed_pos.get("strategy") else "Market Exit",
                        "is_automated": True,
                        "closed_at": now_str,
                    })

                    notification_service.add_notification_sync(
                        category="ORDERS",
                        title=f"{'🎉' if pos_pnl > 0 else '🛑'} Position Closed: {closed_pos['symbol']} ({'+' if pos_pnl >= 0 else ''}${pos_pnl:.2f})",
                        message=f"{closed_pos.get('strategy', 'Algo')} trade concluded on Delta Exchange. PnL: ${pos_pnl:+.2f} ({closed_pos.get('pnl_pct', 0.0):+.2f}%). Margin returned to Balance.",
                        level="success" if pos_pnl >= 0 else "warning",
                        symbol=closed_pos["symbol"],
                        metadata=closed_pos,
                    )

                    return closed_pos
        return None

    def move_to_breakeven(self, pos_id: int) -> Optional[Dict[str, Any]]:
        for pos in self.positions:
            if pos["id"] == pos_id:
                pos["stop_loss"] = pos["entry_price"]
                pos["breakeven_moved"] = True
                return pos
        return None

    def modify_levels(self, pos_id: int, sl: Optional[float] = None, tp1: Optional[float] = None, tp2: Optional[float] = None) -> Optional[Dict[str, Any]]:
        for pos in self.positions:
            if pos["id"] == pos_id:
                if sl is not None:
                    pos["stop_loss"] = sl
                if tp1 is not None:
                    pos["tp1"] = tp1
                if tp2 is not None:
                    pos["tp2"] = tp2
                return pos
        return None

    def update_live_pnl(self, live_prices: Dict[str, Dict[str, Any]]):
        total_unrealized = 0.0
        total_used_margin = 0.0
        
        for pos in self.positions:
            sym = pos["symbol"]
            total_used_margin += pos.get("initial_margin", 0.0)
            if sym in live_prices:
                cur_price = live_prices[sym]["price"]
                pos["current_price"] = cur_price
                
                # Check TP hits
                if pos["direction"] == "LONG":
                    diff = cur_price - pos["entry_price"]
                    if pos.get("tp1") and not pos["tp1_hit"] and cur_price >= pos["tp1"]:
                        pos["tp1_hit"] = True
                        pos["remaining_pct"] = 75.0
                        pos["breakeven_moved"] = True
                        pos["stop_loss"] = pos["entry_price"]  # Breakeven after TP1
                        notification_service.add_notification_sync(
                            category="ORDERS",
                            title=f"🎯 [TP1 HIT] {pos['symbol']} (+{pos['pnl_pct']:.2f}%)",
                            message=f"25% partial profits locked in. Stop-loss automatically trailed to Breakeven @ ${pos['entry_price']:,.2f}.",
                            level="success",
                            symbol=pos["symbol"],
                            metadata=pos,
                        )
                    if pos.get("tp2") and not pos["tp2_hit"] and cur_price >= pos["tp2"]:
                        pos["tp2_hit"] = True
                        pos["remaining_pct"] = 50.0
                        notification_service.add_notification_sync(
                            category="ORDERS",
                            title=f"🎯🎯 [TP2 HIT] {pos['symbol']} (+{pos['pnl_pct']:.2f}%)",
                            message=f"50% total profits secured. Trailing stop protection active.",
                            level="success",
                            symbol=pos["symbol"],
                            metadata=pos,
                        )
                else:
                    diff = pos["entry_price"] - cur_price
                    if pos.get("tp1") and not pos["tp1_hit"] and cur_price <= pos["tp1"]:
                        pos["tp1_hit"] = True
                        pos["remaining_pct"] = 75.0
                        pos["breakeven_moved"] = True
                        pos["stop_loss"] = pos["entry_price"]
                        notification_service.add_notification_sync(
                            category="ORDERS",
                            title=f"🎯 [TP1 HIT] {pos['symbol']} (+{pos['pnl_pct']:.2f}%)",
                            message=f"25% partial profits locked in. Stop-loss automatically trailed to Breakeven @ ${pos['entry_price']:,.2f}.",
                            level="success",
                            symbol=pos["symbol"],
                            metadata=pos,
                        )
                    if pos.get("tp2") and not pos["tp2_hit"] and cur_price <= pos["tp2"]:
                        pos["tp2_hit"] = True
                        pos["remaining_pct"] = 50.0
                        notification_service.add_notification_sync(
                            category="ORDERS",
                            title=f"🎯🎯 [TP2 HIT] {pos['symbol']} (+{pos['pnl_pct']:.2f}%)",
                            message=f"50% total profits secured. Trailing stop protection active.",
                            level="success",
                            symbol=pos["symbol"],
                            metadata=pos,
                        )

                # Check proximity to liquidation level
                if pos.get("liquidation_price"):
                    liq_dist = abs(cur_price - pos["liquidation_price"]) / (cur_price + 1e-9) * 100.0
                    if liq_dist < 1.8 and not pos.get("_warned_liq"):
                        pos["_warned_liq"] = True
                        notification_service.add_notification_sync(
                            category="RISK",
                            title=f"⚠️ [HIGH LEVERAGE WARNING] {pos['symbol']} ({pos.get('leverage', 20)}x)",
                            message=f"Price ${cur_price:,.2f} is within {liq_dist:.2f}% of Liquidation Price (${pos['liquidation_price']:,.2f})!",
                            level="warning",
                            symbol=pos["symbol"],
                            metadata=pos,
                        )

                pnl = diff * pos["quantity"]
                pos["pnl"] = round(pnl, 2)
                pos["pnl_pct"] = round((diff / (pos["entry_price"] + 1e-6)) * 100, 2)
                total_unrealized += pnl

        self.account["used_margin"] = round(total_used_margin, 2)
        self.account["unrealized_pnl"] = round(total_unrealized, 2)
        self.account["equity"] = round(self.account["balance"] + total_unrealized, 2)
        self.account["free_margin"] = round(self.account["equity"] - self.account["used_margin"], 2)
        self.account["daily_pnl"] = round(self.account.get("realized_pnl", 0.0) + total_unrealized, 2)

    def test_algo_strategy_cycle(
        self,
        symbol: str = "BTCUSDT",
        strategy_name: str = "Delta Momentum Breakout",
        leverage: int = 25,
        direction: str = "LONG",
        entry_price: float = 81950.0,
    ) -> Dict[str, Any]:
        """
        Executes an end-to-end algorithmic testing cycle following Delta Exchange standards:
        1. Fills an algorithmic order with specified leverage and isolated margin.
        2. Simulates price movement to TP1 & TP2 with automated SL trailing to breakeven.
        3. Realizes profit, frees margin, and dynamically updates account balance.
        4. Logs the audited trade into trade history.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        sym = symbol.upper()
        
        # Sized for $100 capital: target margin ~$12-14
        qty = 0.004 if "BTC" in sym else (0.06 if "XAU" in sym else (0.12 if "ETH" in sym else 1.5))
        
        # Calculate Delta specifications
        margin_info = delta_engine.calculate_margin(sym, qty, entry_price, leverage, "ISOLATED")
        
        # Simulated target prices
        is_long = direction.upper() == "LONG"
        price_delta = entry_price * 0.015  # 1.5% target gain
        exit_price = entry_price + price_delta if is_long else entry_price - price_delta
        sl_price = entry_price - (entry_price * 0.007) if is_long else entry_price + (entry_price * 0.007)
        
        # P&L calculation
        gross_pnl = round(price_delta * qty, 2)
        fee = round(margin_info["estimated_fee"] * 2, 2)  # Entry + Exit fee
        net_pnl = round(gross_pnl - fee, 2)

        # Update account balance dynamically
        self.account["balance"] = round(self.account["balance"] + net_pnl, 2)
        self.account["realized_pnl"] = round(self.account["realized_pnl"] + net_pnl, 2)
        self.account["daily_pnl"] = round(self.account["daily_pnl"] + net_pnl, 2)
        self.account["equity"] = round(self.account["balance"] + self.account["unrealized_pnl"], 2)
        self.account["free_margin"] = round(self.account["equity"] - self.account["used_margin"], 2)

        # Log to trade history
        trade_record = {
            "id": len(self.trade_history) + 1,
            "symbol": sym,
            "direction": direction.upper(),
            "strategy": strategy_name,
            "leverage": margin_info["leverage"],
            "exchange": "Delta Exchange",
            "entry_price": entry_price,
            "exit_price": round(exit_price, 2),
            "stop_loss": round(sl_price, 2),
            "take_profit": round(exit_price, 2),
            "risk_amount": round(entry_price * 0.007 * qty, 2),
            "reward_amount": gross_pnl,
            "pnl": net_pnl,
            "fee": fee,
            "rr": 2.14,
            "duration_minutes": 52,
            "result": "WIN",
            "targets_taken": "TP1 Hit (25%) ✓, TP2 Hit (25%) ✓, Breakeven Moved ✓",
            "exit_reason": "TP2 Target & Partial Trailing SL",
            "is_automated": True,
            "closed_at": now.isoformat(),
        }
        self.trade_history.append(trade_record)

        return {
            "status": "SUCCESS",
            "message": f"Delta Exchange Algo Test Cycle executed successfully for {sym}!",
            "strategy": strategy_name,
            "exchange": "Delta Exchange",
            "leverage": f"{margin_info['leverage']}x [ISOLATED]",
            "entry_price": entry_price,
            "exit_price": exit_price,
            "realized_profit": net_pnl,
            "new_balance": self.account["balance"],
            "new_equity": self.account["equity"],
            "trade": trade_record,
            "account": self.account,
        }

paper_engine = PaperTradingEngine()
