from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/performance")
async def get_analytics_performance():
    return {
        "overview": {
            "win_rate": 68.4,
            "loss_rate": 31.6,
            "profit_factor": 1.92,
            "expectancy": 184.20,
            "average_rr": 2.3,
            "average_win": 320.50,
            "average_loss": 145.20,
            "largest_win": 1420.00,
            "largest_loss": -280.00,
            "max_drawdown": 7.2,
            "recovery_factor": 3.42,
            "sharpe_ratio": 2.14,
            "sortino_ratio": 2.89,
            "total_trades": 248,
            "winning_trades": 170,
            "losing_trades": 78,
            "breakeven_trades": 12,
        },
        "best_attributes": {
            "best_strategy": "EMA Crossover + RSI",
            "best_instrument": "BTCUSDT",
            "best_timeframe": "1H",
            "best_session": "London / NY Overlap",
            "best_direction": "LONG (72.4% win rate)",
        },
        "by_strategy": [
            {"strategy": "EMA Crossover + RSI", "trades": 114, "win_rate": 71.1, "pnl": 5840.0, "profit_factor": 2.15},
            {"strategy": "Supertrend Volatility", "trades": 76, "win_rate": 65.8, "pnl": 3420.0, "profit_factor": 1.82},
            {"strategy": "Commodities Breakout", "trades": 42, "win_rate": 69.0, "pnl": 2180.0, "profit_factor": 1.95},
            {"strategy": "Mean Reversion", "trades": 16, "win_rate": 56.2, "pnl": 680.0, "profit_factor": 1.42},
        ],
        "by_symbol": [
            {"symbol": "BTCUSDT", "market": "CRYPTO", "trades": 84, "win_rate": 72.6, "pnl": 6480.0},
            {"symbol": "XAUUSD", "market": "COMMODITIES", "trades": 62, "win_rate": 67.7, "pnl": 2840.0},
            {"symbol": "SOLUSDT", "market": "CRYPTO", "trades": 54, "win_rate": 64.8, "pnl": 1960.0},
            {"symbol": "USOIL", "market": "COMMODITIES", "trades": 48, "win_rate": 66.7, "pnl": 1420.0},
        ],
        "by_timeframe": [
            {"timeframe": "15m", "win_rate": 61.5, "trades": 65, "pnl": 2140.0},
            {"timeframe": "1H", "win_rate": 74.2, "trades": 128, "pnl": 7620.0},
            {"timeframe": "4H", "win_rate": 68.0, "trades": 40, "pnl": 2100.0},
            {"timeframe": "1D", "win_rate": 66.7, "trades": 15, "pnl": 840.0},
        ],
        "long_vs_short": {
            "long": {"trades": 158, "win_rate": 70.9, "pnl": 8120.0, "avg_rr": 2.4},
            "short": {"trades": 90, "win_rate": 64.4, "pnl": 4000.0, "avg_rr": 2.1},
        },
        "by_day": [
            {"day": "Mon", "win_rate": 64.0, "trades": 42, "pnl": 1420.0},
            {"day": "Tue", "win_rate": 72.5, "trades": 55, "pnl": 3150.0},
            {"day": "Wed", "win_rate": 74.0, "trades": 58, "pnl": 3680.0},
            {"day": "Thu", "win_rate": 68.2, "trades": 52, "pnl": 2420.0},
            {"day": "Fri", "win_rate": 61.0, "trades": 41, "pnl": 1450.0},
        ],
        "by_hour": [
            {"hour": "00:00", "pnl": 210.0, "trades": 12},
            {"hour": "04:00", "pnl": 340.0, "trades": 16},
            {"hour": "08:00 (London Open)", "pnl": 2680.0, "trades": 54},
            {"hour": "12:00", "pnl": 1450.0, "trades": 38},
            {"hour": "14:00 (NY Open)", "pnl": 3840.0, "trades": 68},
            {"hour": "18:00", "pnl": 820.0, "trades": 32},
            {"hour": "21:00", "pnl": 410.0, "trades": 18},
        ]
    }
