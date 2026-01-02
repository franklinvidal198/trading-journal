from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
import os
from app.db.session import get_session
from app.crud.stats import (
    get_summary_stats, 
    get_equity_curve,
    get_pnl_by_pair,
    get_win_loss_distribution,
    get_daily_performance,
    get_stats_by_date_range
)

router = APIRouter()

@router.get("/summary")
async def summary_stats(session: Session = Depends(get_session)):
    mode = os.environ.get("DATA_MODE", "real")
    if mode == "test":
        return {
            "total_profit": 9999.99,
            "win_rate": 100.0,
            "avg_risk_reward": 5.0,
            "total_trades": 1,
            "winning_trades": 1,
            "losing_trades": 0,
            "daily_profit": 500.00,
            "max_loss": 0.0
        }
    elif mode == "seed":
        return {
            "total_profit": 5000.00,
            "win_rate": 80.0,
            "avg_risk_reward": 3.0,
            "total_trades": 10,
            "winning_trades": 8,
            "losing_trades": 2,
            "daily_profit": 250.00,
            "max_loss": 100.0
        }
    return get_summary_stats(session)

@router.get("/equity_curve")
async def equity_curve(session: Session = Depends(get_session)):
    mode = os.environ.get("DATA_MODE", "real")
    if mode == "test":
        return [
            {"date": "2025-01-01", "balance": 10000},
            {"date": "2025-01-02", "balance": 11000},
        ]
    elif mode == "seed":
        return [
            {"date": "2025-01-01", "balance": 5000},
            {"date": "2025-01-02", "balance": 6000},
        ]
    return get_equity_curve(session)

@router.get("/pnl_by_pair")
async def pnl_by_pair(session: Session = Depends(get_session)):
    """Get P&L breakdown by trading pair"""
    mode = os.environ.get("DATA_MODE", "real")
    if mode == "test":
        return [
            {"pair": "EUR/USD", "wins": 5, "losses": 1, "total_pnl": 1500.00},
            {"pair": "BTC/USD", "wins": 3, "losses": 0, "total_pnl": 2000.00},
        ]
    elif mode == "seed":
        return [
            {"pair": "EUR/USD", "wins": 3, "losses": 1, "total_pnl": 800.00},
            {"pair": "BTC/USD", "wins": 2, "losses": 1, "total_pnl": 1200.00},
        ]
    return get_pnl_by_pair(session)

@router.get("/win_loss_distribution")
async def win_loss_distribution(session: Session = Depends(get_session)):
    """Get win/loss distribution for charts"""
    mode = os.environ.get("DATA_MODE", "real")
    if mode == "test":
        return {"wins": 8, "win_percentage": 80.0, "losses": 2, "loss_percentage": 20.0}
    elif mode == "seed":
        return {"wins": 6, "win_percentage": 75.0, "losses": 2, "loss_percentage": 25.0}
    return get_win_loss_distribution(session)

@router.get("/daily_performance")
async def daily_performance(days: int = Query(30, ge=1, le=365), session: Session = Depends(get_session)):
    """Get daily P&L for the last N days"""
    mode = os.environ.get("DATA_MODE", "real")
    if mode == "test":
        return [
            {"date": "2025-01-01", "profit": 500.00, "trades": 2},
            {"date": "2025-01-02", "profit": 1000.00, "trades": 3},
        ]
    elif mode == "seed":
        return [
            {"date": "2025-01-01", "profit": 200.00, "trades": 2},
            {"date": "2025-01-02", "profit": 300.00, "trades": 3},
        ]
    return get_daily_performance(session, days)

@router.get("/by_date_range")
async def stats_by_date_range(
    start_date: str = Query(None), 
    end_date: str = Query(None),
    session: Session = Depends(get_session)
):
    """Get stats filtered by date range (ISO format: YYYY-MM-DD)"""
    return get_stats_by_date_range(session, start_date, end_date)
