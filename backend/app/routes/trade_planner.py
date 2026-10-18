from fastapi import APIRouter
from typing import Dict, Any, List
from app.schemas import TradePlanCreate, TradePlanResponse
from app.market_data.instruments import get_instrument_metadata

router = APIRouter(prefix="/trade-planner", tags=["Trade Planner"])

@router.post("/calculate", response_model=TradePlanResponse)
async def calculate_trade_plan(req: TradePlanCreate):
    meta = get_instrument_metadata(req.symbol)
    pip_size = meta.get("pip_size", 0.0001)
    precision = meta.get("precision", 4)
    lot_multiplier = meta.get("lot_size", 1.0)
    market_type = meta.get("market_type", "FOREX")

    direction = req.direction.upper()
    entry = req.entry
    sl = req.stop_loss
    balance = req.account_balance
    risk_pct = req.risk_pct
    leverage = req.leverage

    # Stop distance
    stop_distance_points = abs(entry - sl)
    stop_distance_pips = round(stop_distance_points / pip_size, 1)
    stop_distance_pct = round((stop_distance_points / entry) * 100, 2)

    # Risk amount
    risk_amount = round(balance * (risk_pct / 100.0), 2)

    # Position size calculation
    if stop_distance_points > 0:
        if market_type == "FOREX":
            # For standard forex lots: 1 lot = 100,000 units. Pip value for 1 lot ~= $10 (for USD quotes)
            pip_value_per_lot = (pip_size / entry) * lot_multiplier if meta["quote_currency"] != "USD" else 10.0
            lots = risk_amount / (stop_distance_pips * pip_value_per_lot)
            lots = round(max(0.01, lots), 2)
            units = round(lots * lot_multiplier, 0)
            position_size = lots
        else:
            # Crypto units: risk_amount / stop_distance_points
            units = round(risk_amount / stop_distance_points, 4)
            lots = units
            position_size = units
    else:
        position_size = 0.01
        units = 1.0
        lots = 0.01

    # Margin required = (entry * units) / leverage
    margin_required = round((entry * units) / leverage, 2)

    # Take profits calculation
    tps = []
    provided_tps = [req.tp1, req.tp2, req.tp3, req.tp4, req.tp5]
    allocations = req.tp_allocations or [25.0, 25.0, 25.0, 25.0, 0.0]

    potential_rewards = []
    level_items = []

    # Stop Loss Level Item
    level_items.append({
        "type": "SL",
        "level_number": 0,
        "name": "Stop Loss",
        "price": round(sl, precision),
        "distance_pips": -stop_distance_pips,
        "distance_pct": -stop_distance_pct,
        "potential_pnl": -risk_amount,
        "rr": -1.0,
        "percentage": 100.0
    })

    # Entry Level Item
    level_items.append({
        "type": "ENTRY",
        "level_number": 0,
        "name": "Entry",
        "price": round(entry, precision),
        "distance_pips": 0.0,
        "distance_pct": 0.0,
        "potential_pnl": 0.0,
        "rr": 0.0,
        "percentage": 100.0
    })

    for i in range(5):
        tp_price = provided_tps[i]
        alloc = allocations[i] if i < len(allocations) else 0.0
        if alloc <= 0 and tp_price is None:
            continue

        if tp_price is None:
            # Default auto-projected R multiples (1R, 2R, 3R, 4R, 5R)
            r_multiple = i + 1.0
            if direction == "LONG":
                tp_price = entry + (stop_distance_points * r_multiple)
            else:
                tp_price = entry - (stop_distance_points * r_multiple)

        tp_price = round(tp_price, precision)
        tp_dist_pts = abs(tp_price - entry)
        tp_dist_pips = round(tp_dist_pts / pip_size, 1)
        tp_dist_pct = round((tp_dist_pts / entry) * 100, 2)
        r_ratio = round(tp_dist_pts / (stop_distance_points + 1e-8), 2)
        
        # PnL for this TP tier
        tier_pnl = round(risk_amount * r_ratio * (alloc / 100.0), 2)
        potential_rewards.append(tier_pnl)

        level_items.append({
            "type": f"TP{i+1}",
            "level_number": i + 1,
            "name": f"TP{i+1}",
            "price": tp_price,
            "distance_pips": tp_dist_pips,
            "distance_pct": tp_dist_pct,
            "potential_pnl": round(risk_amount * r_ratio, 2),
            "tier_pnl": tier_pnl,
            "rr": r_ratio,
            "percentage": alloc
        })

    max_reward = sum(potential_rewards) if potential_rewards else risk_amount * 3.0
    final_rr_ratio = round(max_reward / (risk_amount + 1e-6), 1)

    return TradePlanResponse(
        symbol=req.symbol.upper(),
        direction=direction,
        entry=round(entry, precision),
        stop_loss=round(sl, precision),
        stop_distance_points=round(stop_distance_points, precision),
        stop_distance_pips=stop_distance_pips,
        stop_distance_pct=stop_distance_pct,
        risk_amount=risk_amount,
        potential_reward=round(max_reward, 2),
        risk_reward=f"1 : {final_rr_ratio}",
        risk_reward_ratio=final_rr_ratio,
        position_size=position_size,
        lot_size=lots,
        units=units,
        margin_required=margin_required,
        confidence=78.0,
        strategy_name=req.strategy_name or "EMA + RSI Confluence",
        levels=level_items
    )
