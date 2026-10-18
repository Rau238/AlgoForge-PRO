from typing import Dict, Any, List

DEFAULT_INSTRUMENTS: List[Dict[str, Any]] = [

    # CRYPTO
    {
        "symbol": "BTCUSDT",
        "name": "Bitcoin / Tether",
        "market_type": "CRYPTO",
        "base_currency": "BTC",
        "quote_currency": "USDT",
        "category": "LAYER1",
        "pip_size": 0.1,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 1.0,
        "base_price": 81720.00,
        "spread_pips": 1.0,
    },
    {
        "symbol": "ETHUSDT",
        "name": "Ethereum / Tether",
        "market_type": "CRYPTO",
        "base_currency": "ETH",
        "quote_currency": "USDT",
        "category": "LAYER1",
        "pip_size": 0.01,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 1.0,
        "base_price": 3820.00,
        "spread_pips": 0.5,
    },
    {
        "symbol": "SOLUSDT",
        "name": "Solana / Tether",
        "market_type": "CRYPTO",
        "base_currency": "SOL",
        "quote_currency": "USDT",
        "category": "LAYER1",
        "pip_size": 0.01,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 1.0,
        "base_price": 105.00,
        "spread_pips": 0.05,
    },
    {
        "symbol": "BNBUSDT",
        "name": "BNB / Tether",
        "market_type": "CRYPTO",
        "base_currency": "BNB",
        "quote_currency": "USDT",
        "category": "LAYER1",
        "pip_size": 0.01,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 1.0,
        "base_price": 680.40,
        "spread_pips": 0.1,
    },
    {
        "symbol": "XRPUSDT",
        "name": "XRP / Tether",
        "market_type": "CRYPTO",
        "base_currency": "XRP",
        "quote_currency": "USDT",
        "category": "PAYMENT",
        "pip_size": 0.0001,
        "tick_size": 0.0001,
        "precision": 4,
        "lot_size": 1.0,
        "base_price": 1.8450,
        "spread_pips": 0.0005,
    },
    {
        "symbol": "ADAUSDT",
        "name": "Cardano / Tether",
        "market_type": "CRYPTO",
        "base_currency": "ADA",
        "quote_currency": "USDT",
        "category": "LAYER1",
        "pip_size": 0.0001,
        "tick_size": 0.0001,
        "precision": 4,
        "lot_size": 1.0,
        "base_price": 0.8850,
        "spread_pips": 0.0004,
    },
    {
        "symbol": "DOGEUSDT",
        "name": "Dogecoin / Tether",
        "market_type": "CRYPTO",
        "base_currency": "DOGE",
        "quote_currency": "USDT",
        "category": "MEME",
        "pip_size": 0.00001,
        "tick_size": 0.00001,
        "precision": 5,
        "lot_size": 1.0,
        "base_price": 0.38200,
        "spread_pips": 0.00005,
    },
    {
        "symbol": "AVAXUSDT",
        "name": "Avalanche / Tether",
        "market_type": "CRYPTO",
        "base_currency": "AVAX",
        "quote_currency": "USDT",
        "category": "LAYER1",
        "pip_size": 0.01,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 1.0,
        "base_price": 42.60,
        "spread_pips": 0.02,
    },
    # COMMODITIES & PRECIOUS METALS
    {
        "symbol": "XAUUSD",
        "name": "Gold / US Dollar",
        "market_type": "COMMODITIES",
        "base_currency": "XAU",
        "quote_currency": "USD",
        "category": "PRECIOUS_METALS",
        "pip_size": 0.01,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 100.0,
        "base_price": 4180.00,
        "spread_pips": 1.2,
    },
    {
        "symbol": "XAGUSD",
        "name": "Silver / US Dollar",
        "market_type": "COMMODITIES",
        "base_currency": "XAG",
        "quote_currency": "USD",
        "category": "PRECIOUS_METALS",
        "pip_size": 0.001,
        "tick_size": 0.001,
        "precision": 3,
        "lot_size": 5000.0,
        "base_price": 31.85,
        "spread_pips": 1.5,
    },
    {
        "symbol": "USOIL",
        "name": "Crude Oil (WTI)",
        "market_type": "COMMODITIES",
        "base_currency": "USOIL",
        "quote_currency": "USD",
        "category": "ENERGY",
        "pip_size": 0.01,
        "tick_size": 0.01,
        "precision": 2,
        "lot_size": 1000.0,
        "base_price": 99.00,
        "spread_pips": 2.0,
    },
]

# In-memory dynamic registry allowing runtime additions
DYNAMIC_REGISTRY: Dict[str, Dict[str, Any]] = {
    inst["symbol"]: inst for inst in DEFAULT_INSTRUMENTS
}

def get_instrument_metadata(symbol: str) -> Dict[str, Any]:
    sym = symbol.upper()
    if sym in DYNAMIC_REGISTRY:
        return DYNAMIC_REGISTRY[sym]
    is_commodity = sym in ["XAUUSD", "XAGUSD", "USOIL"]
    market_type = "COMMODITIES" if is_commodity else "CRYPTO"
    meta = {
        "symbol": sym,
        "name": f"{sym[:3]} / {sym[3:]}" if len(sym) == 6 else sym,
        "market_type": market_type,
        "base_currency": sym[:3],
        "quote_currency": sym[3:],
        "category": "DYNAMIC",
        "pip_size": 0.01 if is_commodity else 0.01,
        "tick_size": 0.01 if is_commodity else 0.01,
        "precision": 2 if is_commodity else 2,
        "lot_size": 100.0 if is_commodity else 1.0,
        "base_price": 2000.0 if is_commodity else 100.0,
        "spread_pips": 1.5,
    }
    DYNAMIC_REGISTRY[sym] = meta
    return meta

def register_instrument(meta: Dict[str, Any]) -> Dict[str, Any]:
    sym = meta["symbol"].upper()
    DYNAMIC_REGISTRY[sym] = meta
    return meta
