from fastapi import APIRouter
from app.execution.auto_trader import auto_trader
from app.execution.paper_engine import paper_engine

router = APIRouter(prefix="/auto-trader", tags=["Auto Trader"])

@router.get("/status")
async def get_auto_trader_status():
    return auto_trader.get_status()

@router.post("/toggle")
async def toggle_auto_trader():
    auto_trader.is_enabled = not auto_trader.is_enabled
    return {
        "status": "SUCCESS",
        "is_enabled": auto_trader.is_enabled,
        "message": f"Auto-Pilot Algorithmic Execution is now {'ENABLED' if auto_trader.is_enabled else 'DISABLED'}"
    }

@router.post("/scan-now")
async def trigger_scan_now():
    """Immediately runs real-time technical scan and executes any valid algorithmic trades."""
    res = await auto_trader.scan_and_execute()
    return res

@router.get("/deployed-strategies")
async def get_deployed_strategies():
    """Returns the live status, condition checklist, accuracy, and earnings for all deployed algorithms."""
    return auto_trader.get_deployed_strategies_status()

@router.post("/deploy-all")
async def deploy_all_strategies():
    """Activates and deploys all 12 quantitative algorithmic strategies across all markets."""
    from app.notifications.service import notification_service
    auto_trader.deploy_all_fleet()
    auto_trader.start_background_loop()
    scan_res = await auto_trader.scan_and_execute()
    
    await notification_service.add_notification(
        category="SYSTEM",
        title="🚀 [FLEET DEPLOYED] All 12 Quant Algorithms Armed",
        message="Active fleet includes 100x Flash Scalper, 50x Liquidation Squeeze, and Delta Top-Volume Flow on $100 capital account.",
        level="info",
        symbol="FLEET",
    )

    return {
        "status": "SUCCESS",
        "message": "All 12 Quantitative Strategies successfully deployed and armed for autonomous execution!",
        "deployed_count": len(auto_trader.active_strategy_ids),
        "strategies": auto_trader.get_deployed_strategies_status(),
        "scan_results": scan_res,
    }

@router.post("/toggle-strategy")
async def toggle_strategy(strategy_id: str):
    """Deploy or pause an individual quantitative strategy."""
    return auto_trader.toggle_strategy_deployment(strategy_id)

@router.post("/undeploy-all")
async def undeploy_all_strategies():
    """Pauses deployment for all algorithmic strategies."""
    return auto_trader.undeploy_all_fleet()

@router.post("/execute-risky-trade")
async def execute_risky_trade(symbol: str = "BTCUSDT", leverage: int = 100, strategy_id: str = "hyper_scalper_100x"):
    """Immediately triggers a high-leverage algorithmic trade with isolated margin and full notifications."""
    res = await auto_trader.execute_risky_trade(symbol=symbol, leverage=leverage, strategy_id=strategy_id)
    return res

@router.post("/reset-capital")
async def reset_capital_allocation(capital: float = 100.0):
    """Resets the algorithmic paper account to exactly $100.00 with clean Delta Exchange state."""
    res = paper_engine.reset_all_data(initial_balance=capital)
    paper_engine.seed_delta_exchange_trades()
    return {
        "status": "SUCCESS",
        "capital": capital,
        "message": f"Account capital reset to ${capital:.2f} with clean real-time Delta Exchange state.",
        "account": paper_engine.account,
        "positions": paper_engine.positions,
    }

@router.get("/execution-history")
async def get_execution_history():
    """Returns the live history of autonomous executions, showing how much strategies earn, live trade results, and signal origins."""
    return auto_trader.get_execution_history()

