from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
from app.schemas import OrderCreate, ModifyPositionRequest
from app.execution.paper_engine import paper_engine
from app.market_data.feed import market_feed

orders_router = APIRouter(prefix="/orders", tags=["Orders"])
positions_router = APIRouter(prefix="/positions", tags=["Positions"])

# --- ORDERS ---
@orders_router.get("")
async def get_orders():
    return paper_engine.orders

@orders_router.post("")
async def create_order(req: OrderCreate):
    res = paper_engine.create_order(req.model_dump())
    return res

@orders_router.delete("/{order_id}")
async def cancel_order(order_id: int):
    for i, o in enumerate(paper_engine.orders):
        if o["id"] == order_id:
            paper_engine.orders[i]["status"] = "CANCELLED"
            return {"status": "CANCELLED", "order_id": order_id}
    raise HTTPException(status_code=404, detail="Order not found")

# --- POSITIONS ---
@positions_router.get("")
async def get_positions():
    # Sync with live prices before returning
    paper_engine.update_live_pnl(market_feed.live_prices)
    return paper_engine.positions

@positions_router.post("/{pos_id}/modify")
async def modify_position(pos_id: int, req: ModifyPositionRequest):
    if req.action == "CLOSE":
        closed = paper_engine.close_position(pos_id, req.partial_pct)
        if not closed:
            raise HTTPException(status_code=404, detail="Position not found")
        return {"status": "SUCCESS", "action": "CLOSE", "position": closed}

    if req.action == "BREAKEVEN":
        be = paper_engine.move_to_breakeven(pos_id)
        if not be:
            raise HTTPException(status_code=404, detail="Position not found")
        return {"status": "SUCCESS", "action": "BREAKEVEN", "position": be}

    modified = paper_engine.modify_levels(pos_id, req.stop_loss, req.tp1, req.tp2)
    if not modified:
        raise HTTPException(status_code=404, detail="Position not found")
    return {"status": "SUCCESS", "action": "MODIFY", "position": modified}

# --- DELTA EXCHANGE & TRADING DATA MANAGEMENT ---
paper_router = APIRouter(prefix="/paper-trading", tags=["Paper Trading"])
delta_router = APIRouter(prefix="/delta-exchange", tags=["Delta Exchange"])

from app.execution.delta_exchange import delta_engine, DELTA_CONTRACT_SPECS

@paper_router.post("/reset")
async def reset_paper_trading(initial_balance: float = 25000.0):
    """Clean all previous data (orders, positions, P&L) and restart fresh with specified balance."""
    return paper_engine.reset_all_data(initial_balance)

@paper_router.post("/seed-delta-trades")
async def seed_delta_trades():
    """Populate fresh algorithmic trades strictly on Delta Exchange (Crypto & Commodities)."""
    paper_engine.seed_delta_exchange_trades()
    return {
        "status": "SUCCESS",
        "message": "Seeded 4 fresh Delta Exchange positions with proper leverage and SL/TP.",
        "positions": paper_engine.positions,
        "account": paper_engine.account,
    }

@paper_router.post("/test-algo-cycle")
async def test_algo_cycle(
    symbol: str = "BTCUSDT",
    strategy_name: str = "Delta Momentum Breakout",
    leverage: int = 25,
    direction: str = "LONG",
):
    """
    Execute full automated Delta Exchange algorithmic trade test cycle:
    calculates margin, moves SL to breakeven, takes profit, and updates balance dynamically.
    """
    quote = market_feed.live_prices.get(symbol.upper(), {})
    entry = quote.get("price", 81720.0 if "BTC" in symbol else 2745.5)
    result = paper_engine.test_algo_strategy_cycle(
        symbol=symbol,
        strategy_name=strategy_name,
        leverage=leverage,
        direction=direction,
        entry_price=entry,
    )
    return result

@delta_router.get("/specs")
async def get_delta_specs():
    """Return official Delta Exchange contract specifications for all tradable crypto & commodities."""
    return DELTA_CONTRACT_SPECS

@delta_router.get("/check")
async def check_delta_exchange():
    """Verify live connectivity and specifications with Delta Exchange API."""
    return await delta_engine.verify_connectivity()

@delta_router.get("/calculate-margin")
async def calculate_delta_margin(
    symbol: str,
    quantity: float,
    price: float,
    leverage: int = 20,
    margin_mode: str = "ISOLATED"
):
    """Calculate Delta Exchange required margin, fees, and liquidation price."""
    margin = delta_engine.calculate_margin(symbol, quantity, price, leverage, margin_mode)
    liq = delta_engine.calculate_liquidation_price(symbol, "LONG", price, leverage, margin_mode)
    return {**margin, **liq}

@delta_router.get("/markets-by-volume")
async def get_delta_markets_by_volume():
    """Return all Delta Exchange listed products sorted strictly by 24h volume/turnover USD."""
    return await delta_engine.get_live_markets_by_volume()
