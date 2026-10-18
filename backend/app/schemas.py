from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class InstrumentSchema(BaseModel):
    symbol: str
    name: str
    market_type: str
    base_currency: str
    quote_currency: str
    category: str
    pip_size: float
    tick_size: float
    precision: int
    lot_size: float
    base_price: float
    spread_pips: float

class CandleSchema(BaseModel):
    time: int
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float
    symbol: str
    timeframe: str

class TradeLevelItem(BaseModel):
    type: str  # ENTRY, SL, TP1, TP2, TP3, TP4, TP5
    level_number: int = 1
    price: float
    quantity: float = 0.0
    percentage: float = 25.0
    status: str = "PENDING"

class TradePlanCreate(BaseModel):
    symbol: str
    market_type: str = "CRYPTO"
    direction: str = "LONG"
    account_balance: float = 25000.0
    risk_pct: float = 1.0
    entry: float
    stop_loss: float
    tp1: Optional[float] = None
    tp2: Optional[float] = None
    tp3: Optional[float] = None
    tp4: Optional[float] = None
    tp5: Optional[float] = None
    tp_allocations: Optional[List[float]] = None
    leverage: float = 100.0
    contract_lot_size: float = 1.0
    strategy_name: Optional[str] = "Manual Trade Plan"
    notes: Optional[str] = ""

class TradePlanResponse(BaseModel):
    id: Optional[int] = None
    symbol: str
    direction: str
    entry: float
    stop_loss: float
    stop_distance_points: float
    stop_distance_pips: float
    stop_distance_pct: float
    risk_amount: float
    potential_reward: float
    risk_reward: str
    risk_reward_ratio: float
    position_size: float
    lot_size: float
    units: float
    margin_required: float
    confidence: float
    strategy_name: str
    levels: List[Dict[str, Any]]

class OrderCreate(BaseModel):
    symbol: str
    side: str  # BUY or SELL
    order_type: str = "MARKET"  # MARKET, LIMIT, STOP
    quantity: float
    price: float
    stop_loss: Optional[float] = None
    tp1: Optional[float] = None
    tp2: Optional[float] = None
    tp3: Optional[float] = None
    tp4: Optional[float] = None
    strategy: Optional[str] = "Manual"
    rr: Optional[float] = 2.5
    leverage: Optional[int] = 20
    margin_mode: Optional[str] = "ISOLATED"

class ModifyPositionRequest(BaseModel):
    stop_loss: Optional[float] = None
    tp1: Optional[float] = None
    tp2: Optional[float] = None
    partial_pct: Optional[float] = None
    action: Optional[str] = None  # BREAKEVEN, CLOSE, MODIFY

class BacktestRequest(BaseModel):
    market: str = "CRYPTO"
    symbol: str = "BTCUSDT"
    timeframe: str = "1H"
    strategy: str = "ema_crossover"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    initial_capital: float = 25000.0
    risk_pct: float = 1.0
    commission: float = 0.0004
    spread: float = 1.0
    slippage: float = 0.0001
    rule_config: Optional[Dict[str, Any]] = None

class AlertCreate(BaseModel):
    symbol: str
    alert_type: str = "PRICE_LEVEL"
    target_price: float
    message: str

class StrategyCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    market_type: str = "CRYPTO"
    symbol: str = "BTCUSDT"
    timeframe: str = "1H"
    default_leverage: Optional[int] = 25
    rules: List[Dict[str, Any]] = []
    logic: str = "AND"
    action: str = "BUY"
    sl_type: str = "ATR"
    sl_value: float = 1.5
    tp_rrs: List[float] = [1.0, 2.0, 3.0, 4.0]
    tp_allocations: List[float] = [25.0, 25.0, 25.0, 25.0]
