from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from app.db.session import get_session
from app.crud.stats import (
    get_summary_stats, 
    get_equity_curve,
    get_pnl_by_pair,
    get_win_loss_distribution,
    get_daily_performance,
    get_stats_by_date_range,
    get_performance_calendar
)

router = APIRouter()

@router.get("/summary")
async def summary_stats(session: Session = Depends(get_session)):
    """Get summary trading statistics from actual database"""
    return get_summary_stats(session)


@router.get("/equity_curve")
async def equity_curve(session: Session = Depends(get_session)):
    """Get cumulative equity curve from actual trades in the database"""
    return get_equity_curve(session)


@router.get("/pnl_by_pair")
async def pnl_by_pair(session: Session = Depends(get_session)):
    """Get P&L breakdown by trading pair from actual database"""
    return get_pnl_by_pair(session)


@router.get("/win_loss_distribution")
async def win_loss_distribution(session: Session = Depends(get_session)):
    """Get win/loss distribution from actual trades in database"""
    return get_win_loss_distribution(session)


@router.get("/daily_performance")
async def daily_performance(days: int = Query(30, ge=1, le=365), session: Session = Depends(get_session)):
    """Get daily P&L for the last N days from database"""
    return get_daily_performance(session, days)


@router.get("/by_date_range")
async def stats_by_date_range(
    start_date: str = Query(None), 
    end_date: str = Query(None),
    session: Session = Depends(get_session)
):
    """Get stats filtered by date range (ISO format: YYYY-MM-DD) from database"""
    return get_stats_by_date_range(session, start_date, end_date)


@router.get("/performance_calendar")
async def performance_calendar(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    session: Session = Depends(get_session)
):
    """Get daily PnL data for a specific month from database (calendar heatmap)
    
    Query params:
    - month: 1-12
    - year: 2000-2100
    
    Returns array of days with: date (YYYY-MM-DD), pnl (float), trades (int), winRate (percent)
    """
    return get_performance_calendar(session, month, year)