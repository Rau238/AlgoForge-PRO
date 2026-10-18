from fastapi import APIRouter
from app.execution.paper_engine import paper_engine

router = APIRouter(prefix="/trade-history", tags=["Trade History"])

@router.get("")
async def get_trade_history():
    return paper_engine.trade_history

@router.delete("")
async def clear_all_trade_history():
    count = len(paper_engine.trade_history)
    paper_engine.trade_history = []
    # Reset realized settlement metrics to 0
    paper_engine.account["realized_pnl"] = 0.0
    return {
        "status": "SUCCESS",
        "message": f"Successfully deleted {count} trade records from history.",
        "deleted_count": count
    }

@router.delete("/{trade_id}")
async def delete_single_trade(trade_id: int):
    paper_engine.trade_history = [
        t for t in paper_engine.trade_history if t.get("id") != trade_id and str(t.get("id")) != str(trade_id)
    ]
    return {
        "status": "SUCCESS",
        "message": f"Trade #{trade_id} deleted."
    }

