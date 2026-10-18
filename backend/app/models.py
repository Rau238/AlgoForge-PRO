import datetime
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, JSON, Numeric, Index
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    accounts = relationship("Account", back_populates="user")
    trade_plans = relationship("TradePlan", back_populates="user")
    strategies = relationship("Strategy", back_populates="user")
    risk_settings = relationship("RiskSettings", back_populates="user", uselist=False)

class Account(Base):
    __tablename__ = "accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), default="Primary Trading Account")
    account_type = Column(String(20), default="PAPER")  # PAPER or LIVE
    currency = Column(String(10), default="USD")
    balance = Column(Float, default=25000.0)
    equity = Column(Float, default=26840.0)
    leverage = Column(Float, default=100.0)
    used_margin = Column(Float, default=1240.0)
    free_margin = Column(Float, default=25600.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="accounts")
    orders = relationship("Order", back_populates="account")
    positions = relationship("Position", back_populates="account")
    trades = relationship("Trade", back_populates="account")
    portfolio_snapshots = relationship("PortfolioSnapshot", back_populates="account")

class Instrument(Base):
    __tablename__ = "instruments"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(30), unique=True, index=True, nullable=False)
    name = Column(String(100), nullable=False)
    market_type = Column(String(20), nullable=False, index=True)  # FOREX or CRYPTO
    base_currency = Column(String(20), nullable=False)
    quote_currency = Column(String(20), nullable=False)
    pip_size = Column(Float, default=0.0001)
    min_lot = Column(Float, default=0.01)
    max_lot = Column(Float, default=100.0)
    lot_size = Column(Float, default=100000.0)  # Standard forex lot or 1 for crypto
    tick_size = Column(Float, default=0.00001)
    precision = Column(Integer, default=5)
    is_active = Column(Boolean, default=True)

class ForexPair(Base):
    __tablename__ = "forex_pairs"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(30), unique=True, index=True, nullable=False)
    category = Column(String(20), default="MAJOR")  # MAJOR or MINOR
    base_currency = Column(String(10), nullable=False)
    quote_currency = Column(String(10), nullable=False)
    spread_pips = Column(Float, default=1.2)

class CryptoPair(Base):
    __tablename__ = "crypto_pairs"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(30), unique=True, index=True, nullable=False)
    category = Column(String(30), default="LAYER1")
    base_asset = Column(String(20), nullable=False)
    quote_asset = Column(String(20), default="USDT")
    fee_rate = Column(Float, default=0.0004)

class MarketData(Base):
    __tablename__ = "market_data"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(30), unique=True, index=True, nullable=False)
    last_price = Column(Float, nullable=False)
    bid = Column(Float, nullable=False)
    ask = Column(Float, nullable=False)
    high_24h = Column(Float, nullable=False)
    low_24h = Column(Float, nullable=False)
    volume_24h = Column(Float, default=0.0)
    change_24h = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class Candle(Base):
    __tablename__ = "candles"
    
    id = Column(Integer, primary_key=True, index=True)
    symbol = Column(String(30), nullable=False, index=True)
    timeframe = Column(String(10), nullable=False, index=True)  # 1m, 5m, 15m, 1H, 4H, 1D
    timestamp = Column(DateTime, nullable=False, index=True)
    open = Column(Float, nullable=False)
    high = Column(Float, nullable=False)
    low = Column(Float, nullable=False)
    close = Column(Float, nullable=False)
    volume = Column(Float, default=0.0)

    __table_args__ = (
        Index("idx_candles_symbol_tf_ts", "symbol", "timeframe", "timestamp"),
    )

class Strategy(Base):
    __tablename__ = "strategies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String(100), nullable=False)
    description = Column(Text, default="")
    market_type = Column(String(20), default="CRYPTO")  # FOREX or CRYPTO
    symbol = Column(String(30), default="BTCUSDT")
    timeframe = Column(String(10), default="1H")
    is_active = Column(Boolean, default=True)
    script_code = Column(Text, nullable=True)
    rule_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="strategies")
    versions = relationship("StrategyVersion", back_populates="strategy")
    parameters = relationship("StrategyParameter", back_populates="strategy")
    backtests = relationship("Backtest", back_populates="strategy")

class StrategyVersion(Base):
    __tablename__ = "strategy_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    version_number = Column(Integer, default=1)
    code_or_config = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    strategy = relationship("Strategy", back_populates="versions")

class StrategyParameter(Base):
    __tablename__ = "strategy_parameters"
    
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    param_name = Column(String(100), nullable=False)
    param_value = Column(String(255), nullable=False)
    param_type = Column(String(50), default="number")
    
    strategy = relationship("Strategy", back_populates="parameters")

class TradePlan(Base):
    __tablename__ = "trade_plans"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    symbol = Column(String(30), nullable=False, index=True)
    market_type = Column(String(20), default="CRYPTO")
    direction = Column(String(10), default="LONG")  # LONG or SHORT
    entry_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    risk_pct = Column(Float, default=1.0)
    risk_amount = Column(Float, default=250.0)
    reward_amount = Column(Float, default=750.0)
    risk_reward_ratio = Column(Float, default=3.0)
    position_size = Column(Float, default=0.25)
    lot_size = Column(Float, default=0.25)
    margin_required = Column(Float, default=500.0)
    confidence = Column(Float, default=78.0)
    strategy_name = Column(String(100), default="EMA + RSI Breakout")
    timeframe = Column(String(10), default="1H")
    notes = Column(Text, default="")
    status = Column(String(20), default="ACTIVE")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="trade_plans")
    levels = relationship("TradeLevel", back_populates="trade_plan", cascade="all, delete-orphan")

class TradeLevel(Base):
    __tablename__ = "trade_levels"
    
    id = Column(Integer, primary_key=True, index=True)
    trade_plan_id = Column(Integer, ForeignKey("trade_plans.id"), nullable=False)
    type = Column(String(20), nullable=False)  # ENTRY, SL, TP1, TP2, TP3, TP4, TP5
    level_number = Column(Integer, default=1)
    price = Column(Float, nullable=False)
    quantity = Column(Float, default=0.0)
    percentage = Column(Float, default=25.0)  # Allocation e.g. 25%
    status = Column(String(20), default="PENDING")  # PENDING, HIT, CANCELLED
    triggered_at = Column(DateTime, nullable=True)
    
    trade_plan = relationship("TradePlan", back_populates="levels")

class Backtest(Base):
    __tablename__ = "backtests"
    
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    strategy_name = Column(String(100), default="EMA Crossover")
    symbol = Column(String(30), nullable=False)
    timeframe = Column(String(10), default="1H")
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    initial_capital = Column(Float, default=25000.0)
    risk_pct = Column(Float, default=1.0)
    commission = Column(Float, default=0.0004)
    spread = Column(Float, default=0.0001)
    slippage = Column(Float, default=0.0001)
    total_return = Column(Float, default=0.0)
    net_profit = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    loss_rate = Column(Float, default=0.0)
    profit_factor = Column(Float, default=0.0)
    sharpe_ratio = Column(Float, default=0.0)
    sortino_ratio = Column(Float, default=0.0)
    max_drawdown = Column(Float, default=0.0)
    avg_win = Column(Float, default=0.0)
    avg_loss = Column(Float, default=0.0)
    largest_win = Column(Float, default=0.0)
    largest_loss = Column(Float, default=0.0)
    total_trades = Column(Integer, default=0)
    average_rr = Column(Float, default=0.0)
    equity_curve = Column(JSON, default=list)
    monthly_pnl = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    strategy = relationship("Strategy", back_populates="backtests")
    trades = relationship("BacktestTrade", back_populates="backtest", cascade="all, delete-orphan")

class BacktestTrade(Base):
    __tablename__ = "backtest_trades"
    
    id = Column(Integer, primary_key=True, index=True)
    backtest_id = Column(Integer, ForeignKey("backtests.id"), nullable=False)
    symbol = Column(String(30), nullable=False)
    direction = Column(String(10), nullable=False)
    entry_time = Column(DateTime, nullable=False)
    exit_time = Column(DateTime, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    sl_price = Column(Float, nullable=False)
    tp1_price = Column(Float, nullable=True)
    tp2_price = Column(Float, nullable=True)
    tp3_price = Column(Float, nullable=True)
    pnl = Column(Float, nullable=False)
    pnl_pct = Column(Float, nullable=False)
    rr = Column(Float, default=0.0)
    duration_seconds = Column(Integer, default=3600)
    exit_reason = Column(String(50), default="TP2_HIT")
    
    backtest = relationship("Backtest", back_populates="trades")

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol = Column(String(30), nullable=False, index=True)
    order_type = Column(String(20), default="MARKET")  # MARKET, LIMIT, STOP, STOP_LIMIT
    side = Column(String(10), nullable=False)  # BUY, SELL
    quantity = Column(Float, nullable=False)
    price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    strategy = Column(String(100), default="Manual Discretionary")
    status = Column(String(20), default="FILLED")  # PENDING, FILLED, CANCELLED, REJECTED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    filled_at = Column(DateTime, nullable=True)
    
    account = relationship("Account", back_populates="orders")
    events = relationship("OrderEvent", back_populates="order")

class OrderEvent(Base):
    __tablename__ = "order_events"
    
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    event_type = Column(String(50), nullable=False)
    message = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    
    order = relationship("Order", back_populates="events")

class Position(Base):
    __tablename__ = "positions"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol = Column(String(30), nullable=False, index=True)
    direction = Column(String(10), nullable=False)  # LONG, SHORT
    quantity = Column(Float, nullable=False)
    original_quantity = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    tp1 = Column(Float, nullable=True)
    tp2 = Column(Float, nullable=True)
    tp3 = Column(Float, nullable=True)
    tp4 = Column(Float, nullable=True)
    tp5 = Column(Float, nullable=True)
    tp1_hit = Column(Boolean, default=False)
    tp2_hit = Column(Boolean, default=False)
    tp3_hit = Column(Boolean, default=False)
    tp4_hit = Column(Boolean, default=False)
    remaining_pct = Column(Float, default=100.0)
    breakeven_moved = Column(Boolean, default=False)
    trailing_stop = Column(Boolean, default=False)
    pnl = Column(Float, default=0.0)
    pnl_pct = Column(Float, default=0.0)
    rr = Column(Float, default=1.0)
    status = Column(String(20), default="OPEN")  # OPEN, CLOSED, PARTIALLY_CLOSED
    strategy = Column(String(100), default="Manual Plan")
    opened_at = Column(DateTime, default=datetime.datetime.utcnow)
    closed_at = Column(DateTime, nullable=True)
    
    account = relationship("Account", back_populates="positions")
    levels = relationship("PositionLevel", back_populates="position")

class PositionLevel(Base):
    __tablename__ = "position_levels"
    
    id = Column(Integer, primary_key=True, index=True)
    position_id = Column(Integer, ForeignKey("positions.id"), nullable=False)
    type = Column(String(20), nullable=False)  # TP1, TP2, TP3, TP4, SL, ENTRY
    price = Column(Float, nullable=False)
    percentage = Column(Float, default=25.0)
    is_hit = Column(Boolean, default=False)
    hit_at = Column(DateTime, nullable=True)
    
    position = relationship("Position", back_populates="levels")

class Trade(Base):
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol = Column(String(30), nullable=False, index=True)
    direction = Column(String(10), nullable=False)  # LONG, SHORT
    strategy = Column(String(100), default="Manual Plan")
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=False)
    take_profit = Column(Float, nullable=False)
    risk_amount = Column(Float, default=250.0)
    reward_amount = Column(Float, default=750.0)
    pnl = Column(Float, nullable=False)
    rr = Column(Float, default=0.0)
    duration_minutes = Column(Integer, default=60)
    result = Column(String(20), default="WIN")  # WIN, LOSS, BREAKEVEN
    opened_at = Column(DateTime, nullable=False)
    closed_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    account = relationship("Account", back_populates="trades")

class PortfolioSnapshot(Base):
    __tablename__ = "portfolio_snapshots"
    
    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, index=True)
    balance = Column(Float, nullable=False)
    equity = Column(Float, nullable=False)
    drawdown = Column(Float, default=0.0)
    daily_pnl = Column(Float, default=0.0)
    
    account = relationship("Account", back_populates="portfolio_snapshots")

class RiskSettings(Base):
    __tablename__ = "risk_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    max_risk_per_trade_pct = Column(Float, default=1.0)
    max_daily_loss_pct = Column(Float, default=3.0)
    default_leverage = Column(Float, default=100.0)
    default_tp_allocation = Column(JSON, default=lambda: [25, 25, 25, 25])
    breakeven_on_tp1 = Column(Boolean, default=True)
    trailing_on_tp2 = Column(Boolean, default=True)
    
    user = relationship("User", back_populates="risk_settings")

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, default=1)
    symbol = Column(String(30), nullable=False, index=True)
    alert_type = Column(String(50), default="PRICE_LEVEL")  # PRICE_LEVEL, TP_HIT, SL_HIT, STRATEGY_SIGNAL, BREAKOUT
    target_price = Column(Float, nullable=True)
    message = Column(String(255), nullable=False)
    is_triggered = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    triggered_at = Column(DateTime, nullable=True)

class Log(Base):
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    level = Column(String(20), default="INFO")
    source = Column(String(100), default="SYSTEM")
    message = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
