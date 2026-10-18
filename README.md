# AlgoForge-PRO

AlgoForge PRO is an institutional-grade algorithmic trading and quantitative execution platform dedicated exclusively to **CRYPTO & COMMODITIES (DELTA EXCHANGE)** derivatives and **FOREX** markets.

Designed with an original, dense, dark quantitative terminal user experience, AlgoForge combines the visual clarity of modern charting with institutional-grade risk planning, strategy backtesting, multi-target bracket executions, and live WebSocket streaming.

---

## Key Features & Highlights

- **Exclusive Forex & Crypto Architecture**:
  - Forex Majors: EURUSD, GBPUSD, USDJPY, USDCHF, AUDUSD, USDCAD, NZDUSD
  - Forex Minors: EURGBP, EURJPY, GBPJPY, AUDJPY, CHFJPY, EURAUD, GBPAUD
  - Crypto: BTCUSDT, ETHUSDT, SOLUSDT, BNBUSDT, XRPUSDT, ADAUSDT, DOGEUSDT, AVAXUSDT
  - Dynamic pair registration engine (no hardcoded restrictions).
  - Strictly zero Indian equity or commodity market pollution.
- **Chart-Centric Quantitative Workstation**:
  - Centerpiece TradingView `lightweight-charts` terminal on `/chart/[symbol]`.
  - Candlestick, Line, and Area modes across timeframes: `1m`, `3m`, `5m`, `15m`, `30m`, `1H`, `2H`, `4H`, `1D`, `1W`.
  - Technical indicators: EMA (20, 50, 200), SMA, VWAP, RSI, MACD, ATR, ADX, Bollinger Bands, Supertrend, Stochastic, and Volume.
  - Interactive Drawing Tools: Trend line, Horizontal line, Vertical line, Rectangle, Fibonacci retracement, Fibonacci extension, Support & Resistance zones.
  - Multi-Chart Workspaces: 1 Chart, 2 Charts (Split), or 4 Charts (Quad grid) with synchronized crosshair and symbols.
- **Visual On-Chart Trade Zones & Draggable Level Handles**:
  - Visually renders the complete trade setup directly across the chart.
  - Shaded **Risk Area** (Entry &rarr; Stop Loss in subtle crimson) and **Reward Zones** (Entry &rarr; TP1, TP2, TP3, TP4, TP5 in emerald).
  - Draggable handle lines for Entry, SL, TP1, TP2, TP3, TP4.
  - Dragging any level dynamically recalculates Price, Pip distance, Percentage, Risk amount ($), Max reward ($), Risk/Reward ratio, and Position size in real-time.
  - Seamlessly inverts geometry for **SHORT** trade setups.
- **Institutional Trade Planner & Position Sizing**:
  - Dedicated `/trade-planner` and slide-over quick drawer.
  - Exact formulaic position and lot sizing based on Account Balance, Risk % (e.g. 1% = $250), Stop distance, and Leverage.
  - Multi-tier take profit allocations (e.g. 25% TP1, 25% TP2, 25% TP3, 25% TP4).
  - Automated generation of the visual **Trade Plan Card**.
- **Python Strategy Engine & Visual Strategy Builder**:
  - Strategy Framework base class implementing `on_candle`, `generate_signal`, `calculate_entry`, `calculate_stop_loss`, `calculate_take_profits`, `calculate_position_size`.
  - Built-in strategies: EMA Crossover + RSI, Supertrend Volatility Breakout, London Session Breakout.
  - Visual block sequence builder on `/strategy-builder` (Indicators &rarr; Conditions &rarr; AND/OR &rarr; Entry &rarr; Exit &rarr; SL &rarr; TP &rarr; Position Size &rarr; Trailing Stop).
- **Event-Driven Backtester**:
  - Runs on `/backtesting` with capital, risk %, commission, spread, and slippage modeling.
  - Interactive Equity Curve, Drawdown curve, Win/Loss distribution, and full trade log.
- **Realistic Paper Trading & Position Management**:
  - Live tick-driven simulation on `/paper-trading` and `/positions`.
  - Automatic breakeven adjustment after TP1 hit ("✓ TP1 HIT", "Remaining: 75%").
  - Actions: Modify levels, Move SL to Breakeven, Partial close (e.g. 50%), Full market exit.
- **Live Trading Gateway & Adapters**:
  - Modular `ForexBrokerAdapter` (MetaTrader/FIX) and `CryptoExchangeAdapter` (Binance/Bybit/CCXT).
  - Secure credential storage on the backend (never exposed to the frontend).
- **Portfolio & Performance Analytics**:
  - Comprehensive metrics on `/portfolio` and `/analytics`: Win Rate, Profit Factor, Mathematical Expectancy, Average R:R, Max Drawdown, Sharpe Ratio, Sortino Ratio.
  - Performance attribution by Strategy, Symbol, Day of week, Session Hour (London/NY overlap), and Long vs Short.

---

## Tech Stack

- **Frontend**:
  - Next.js 16 (App Router)
  - TypeScript
  - Tailwind CSS v4
  - Zustand (state management)
  - TanStack Query
  - Lightweight Charts (TradingView)
  - Recharts (Quantitative telemetry and equity curves)
  - Lucide Icons
  - Framer Motion
- **Backend**:
  - Python 3.12 + FastAPI
  - Pandas, NumPy, pandas-ta
  - SQLAlchemy 2.0 Async + asyncpg (PostgreSQL) with automatic zero-conf SQLite fallback
  - Redis (pub/sub & real-time latest quotes) with fallback memory bus
  - WebSockets (`/ws`) for live price ticks, order events, and position updates
- **Database & Services**:
  - PostgreSQL running directly on `localhost:5432` (`algoforge` database)
  - Redis running directly on `localhost:6379`
  - *No Docker, Kubernetes, or microservice bloat.*

---

## Project Structure

```
algo-trading/
├── .env.example              # Environment variables template
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # FastAPI entrypoint & WebSocket broadcaster
│   │   ├── config.py         # App settings & credentials
│   │   ├── database.py       # Async SQLAlchemy engine & session
│   │   ├── models.py         # PostgreSQL schemas for all 23 tables
│   │   ├── schemas.py        # Pydantic request/response models
│   │   ├── redis_bus.py      # Real-time pub/sub bus
│   │   ├── market_data/
│   │   │   ├── instruments.py# Forex & Crypto registry & dynamic pair engine
│   │   │   ├── indicators.py # Technical indicators (EMA, RSI, MACD, etc.)
│   │   │   └── feed.py       # Multi-timeframe historical & live feed
│   │   ├── strategies/
│   │   │   ├── engine.py     # BaseStrategy abstract class
│   │   │   ├── builtin.py    # Builtin quant strategies
│   │   │   └── builder_engine.py # Visual strategy evaluator
│   │   ├── backtester/
│   │   │   └── engine.py     # High-precision backtesting engine
│   │   ├── execution/
│   │   │   ├── paper_engine.py   # Paper trading simulator & position tracking
│   │   │   └── adapters/
│   │   │       ├── base.py
│   │   │       ├── forex_adapter.py
│   │   │       └── crypto_adapter.py
│   │   └── routes/
│   │       ├── market.py
│   │       ├── chart.py
│   │       ├── trade_planner.py
│   │       ├── orders.py
│   │       ├── positions.py
│   │       ├── strategies.py
│   │       ├── backtest.py
│   │       ├── portfolio.py
│   │       ├── analytics.py
│   │       ├── trade_history.py
│   │       ├── live.py
│   │       ├── alerts.py
│   │       └── settings.py
│   └── requirements.txt
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx         # Dark theme terminal layout with TopBar & Sidebar
    │   │   ├── page.tsx           # Workstation landing (direct to chart)
    │   │   ├── chart/[symbol]/    # Central Professional TradingView Chart
    │   │   ├── dashboard/         # Quant Dashboard
    │   │   ├── markets/           # Market Scanner
    │   │   ├── trade-planner/     # Institutional Trade Planner & Risk Sizing
    │   │   ├── strategies/        # Strategy Library
    │   │   ├── strategy-builder/  # Visual Rule Pipeline Builder
    │   │   ├── backtesting/       # Event-Driven Backtesting Workstation
    │   │   ├── paper-trading/     # Paper Simulator
    │   │   ├── live-trading/      # Live Broker/Exchange Gateways
    │   │   ├── orders/            # Order Management
    │   │   ├── positions/         # Open Positions Panel with Multi-TP Hits
    │   │   ├── portfolio/         # Equity & Margin Oversight
    │   │   ├── trade-history/     # Trade Journal Log
    │   │   ├── analytics/         # Quant Performance & Session Alpha
    │   │   └── settings/          # Risk Parameters & Governance
    │   ├── components/
    │   │   ├── chart/TradingViewChart.tsx
    │   │   ├── layout/TopBar.tsx
    │   │   ├── layout/LeftSidebar.tsx
    │   │   └── trade/
    │   │       ├── TradePlanCard.tsx
    │   │       └── TradePlannerDrawer.tsx
    │   └── lib/
    │       ├── api.ts             # Typed REST API client
    │       ├── store.ts           # Zustand trading state store
    │       ├── types.ts           # TypeScript interfaces
    │       └── websocket.ts       # Live WebSocket subscription client
    └── package.json
```

---

## Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ (tested on v24)
- **Python**: 3.11 or 3.12
- **PostgreSQL**: Running on `localhost:5432` (`algoforge` database)
- **Redis**: Running on `localhost:6379`

### 2. Running the Backend (FastAPI)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The backend API documentation is accessible at `http://localhost:8000/docs`.

### 3. Running the Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser.
