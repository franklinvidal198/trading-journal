from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
from app.db.session import get_session
from app.models.trade import Trade
from app.api.v1.routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/reports", tags=["reports"])

def calculate_win_rate(trades: list):
    if not trades:
        return 0.0
    winning = len([t for t in trades if t.result_usd and t.result_usd > 0])
    return round((winning / len(trades)) * 100, 2)

def calculate_total_profit(trades: list):
    return round(sum([t.result_usd or 0 for t in trades]), 2)

@router.get("/summary")
def get_summary(session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    trades = session.exec(select(Trade).where(Trade.user_id == current_user.id)).all()
    closed_trades = [t for t in trades if t.status == "CLOSED"]
    return {
        "total_trades": len(trades),
        "closed_trades": len(closed_trades),
        "open_trades": len([t for t in trades if t.status == "OPEN"]),
        "win_rate": calculate_win_rate(closed_trades),
        "total_profit": calculate_total_profit(closed_trades),
    }

@router.get("/by-pair")
def get_pair_statistics(session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    trades = session.exec(select(Trade).where(Trade.user_id == current_user.id)).all()
    pair_data = {}
    for trade in trades:
        pair = trade.pair or "UNKNOWN"
        if pair not in pair_data:
            pair_data[pair] = []
        pair_data[pair].append(trade)
    
    pair_stats = {}
    for pair, pair_trades in pair_data.items():
        closed = [t for t in pair_trades if t.status == "CLOSED"]
        pair_stats[pair] = {
            "total_trades": len(pair_trades),
            "closed_trades": len(closed),
            "win_rate": calculate_win_rate(closed),
            "total_profit": calculate_total_profit(closed),
        }
    return pair_stats
