from fastapi import APIRouter
from app.schemas import BacktestRequest
from app.backtester.engine import BacktestEngine

router = APIRouter(prefix="/backtest", tags=["Backtesting"])

@router.post("/run")
async def run_backtest(req: BacktestRequest):
    engine = BacktestEngine(
        symbol=req.symbol,
        timeframe=req.timeframe,
        strategy_name=req.strategy,
        initial_capital=req.initial_capital,
        risk_pct=req.risk_pct,
        commission=req.commission,
        spread_pips=req.spread,
        slippage_pct=req.slippage,
        rule_config=req.rule_config,
        candle_count=500,
    )
    results = engine.run()
    return results
