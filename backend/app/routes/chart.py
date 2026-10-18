from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional
import pandas as pd
from app.market_data.feed import market_feed
from app.market_data.instruments import get_instrument_metadata
from app.market_data.indicators import (
    calculate_ema, calculate_sma, calculate_vwap, calculate_rsi,
    calculate_macd, calculate_atr, calculate_adx, calculate_bollinger_bands,
    calculate_supertrend, calculate_stochastic
)

router = APIRouter(prefix="/chart", tags=["Chart"])

# In-memory drawings store per symbol
DRAWINGS_STORE: Dict[str, List[Dict[str, Any]]] = {}

@router.get("/{symbol}/candles")
async def get_candles(
    symbol: str,
    timeframe: str = Query("1H", description="1m, 3m, 5m, 15m, 30m, 1H, 2H, 4H, 1D, 1W"),
    count: int = Query(250, ge=10, le=1000)
):
    sym = symbol.upper()
    candles = await market_feed.get_candles(sym, timeframe, count)
    return {
        "symbol": sym,
        "timeframe": timeframe,
        "count": len(candles),
        "candles": candles
    }

@router.get("/{symbol}/indicators")
async def get_indicators(
    symbol: str,
    timeframe: str = Query("1H"),
    count: int = Query(250)
):
    sym = symbol.upper()
    candles = await market_feed.get_candles(sym, timeframe, count)
    df = pd.DataFrame(candles)

    # Compute all requested indicators
    ema20 = calculate_ema(df, 20)
    ema50 = calculate_ema(df, 50)
    ema200 = calculate_ema(df, 200)
    sma50 = calculate_sma(df, 50)
    vwap = calculate_vwap(df)
    rsi14 = calculate_rsi(df, 14)
    macd = calculate_macd(df, 12, 26, 9)
    atr14 = calculate_atr(df, 14)
    adx14 = calculate_adx(df, 14)
    bbands = calculate_bollinger_bands(df, 20, 2.0)
    supertrend = calculate_supertrend(df, 10, 3.0)
    stoch = calculate_stochastic(df, 14, 3)

    times = [c["time"] for c in candles]

    return {
        "symbol": sym,
        "timeframe": timeframe,
        "times": times,
        "indicators": {
            "ema20": ema20,
            "ema50": ema50,
            "ema200": ema200,
            "sma50": sma50,
            "vwap": vwap,
            "rsi14": rsi14,
            "macd": macd,
            "atr14": atr14,
            "adx14": adx14,
            "bollinger": bbands,
            "supertrend": supertrend,
            "stochastic": stoch,
            "volume": df["volume"].tolist()
        }
    }

@router.post("/{symbol}/drawings")
async def save_drawings(symbol: str, drawings: List[Dict[str, Any]]):
    sym = symbol.upper()
    DRAWINGS_STORE[sym] = drawings
    return {"status": "saved", "count": len(drawings)}

@router.get("/{symbol}/drawings")
async def get_drawings(symbol: str):
    sym = symbol.upper()
    return DRAWINGS_STORE.get(sym, [])
