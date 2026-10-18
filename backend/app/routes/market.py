from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any, Optional
from app.market_data.instruments import DEFAULT_INSTRUMENTS, DYNAMIC_REGISTRY, get_instrument_metadata, register_instrument
from app.market_data.feed import market_feed

router = APIRouter(prefix="", tags=["Markets"])

@router.get("/instruments")
async def get_instruments(market_type: Optional[str] = None):
    results = list(DYNAMIC_REGISTRY.values())
    if market_type:
        mtype = market_type.upper()
        results = [i for i in results if i["market_type"] == mtype]
    return results

@router.post("/instruments")
async def add_dynamic_instrument(meta: Dict[str, Any]):
    if not meta.get("symbol"):
        raise HTTPException(status_code=400, detail="Symbol is required")
    reg = register_instrument(meta)
    market_feed._initialize_prices()
    return reg

@router.get("/market/scanner")
async def get_market_scanner(
    market: Optional[str] = None,
    filter_type: Optional[str] = None,
):
    data = market_feed.get_scanner_data()
    if market:
        data = [d for d in data if d["market_type"] == market.upper()]
    
    if filter_type:
        ft = filter_type.upper()
        if ft == "BULLISH":
            data = [d for d in data if d["trend"] == "Bullish"]
        elif ft == "BEARISH":
            data = [d for d in data if d["trend"] == "Bearish"]
        elif ft == "OVERSOLD":
            data = [d for d in data if d["rsi"] < 35]
        elif ft == "OVERBOUGHT":
            data = [d for d in data if d["rsi"] > 65]
        elif ft == "HIGH_VOLUME":
            data = sorted(data, key=lambda x: x["volume"], reverse=True)[:10]

    return data

@router.get("/market/quote/{symbol}")
async def get_quote(symbol: str):
    sym = symbol.upper()
    quote = market_feed.live_prices.get(sym)
    if not quote:
        meta = get_instrument_metadata(sym)
        market_feed._initialize_prices()
        quote = market_feed.live_prices.get(sym)
    return quote
