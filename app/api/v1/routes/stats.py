from fastapi import APIRouter, Depends, Query
from sqlmodel import Session
from app.db.session import get_session
from app.crud.stats import (
    get_summary_stats, 
    get_equity_curve,
    get_equity_curve_v2,
    get_pnl_by_pair,
    get_win_loss_distribution,
    get_daily_performance,
    get_stats_by_date_range,
    get_performance_calendar
)
from app.api.v1.routes.auth import get_current_user

router = APIRouter()

@router.get("/summary")
async def summary_stats(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get summary trading statistics for current user"""
    return get_summary_stats(session, current_user.id)


@router.get("/equity_curve")
async def equity_curve(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get cumulative equity curve from user's trades in the database"""
    return get_equity_curve(session, current_user.id)


@router.get("/pnl_by_pair")
async def pnl_by_pair(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get P&L breakdown by trading pair from user's trades"""
    return get_pnl_by_pair(session, current_user.id)


@router.get("/win_loss_distribution")
async def win_loss_distribution(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get win/loss distribution from user's trades in database"""
    return get_win_loss_distribution(session, current_user.id)


@router.get("/daily_performance")
async def daily_performance(
    days: int = Query(30, ge=1, le=365),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get daily P&L for the last N days from user's trades"""
    return get_daily_performance(session, current_user.id, days)


@router.get("/by_date_range")
async def stats_by_date_range(
    start_date: str = Query(None), 
    end_date: str = Query(None),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get stats filtered by date range (ISO format: YYYY-MM-DD) from user's trades"""
    return get_stats_by_date_range(session, current_user.id, start_date, end_date)


@router.get("/performance_calendar")
async def performance_calendar(
    month: int = Query(..., ge=1, le=12),
    year: int = Query(..., ge=2000, le=2100),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """Get daily PnL data for a specific month from user's trades (calendar heatmap)
    
    Query params:
    - month: 1-12
    - year: 2000-2100
    
    Returns array of days with: date (YYYY-MM-DD), pnl (float), trades (int), winRate (percent)
    """
    return get_performance_calendar(session, current_user.id, month, year)


@router.get("/equity_curve/v2")
async def equity_curve_v2(
    starting_balance: float = Query(0.0, description="Initial account balance in USD"),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    """
    INSTITUTIONAL-GRADE equity curve endpoint (v2).
    
    Returns complete equity curve with:
    - Full accounting (realized P&L, unrealized P&L, total equity)
    - Microsecond timestamp precision
    - Sequence IDs for deterministic ordering
    - Data quality metadata
    - Event annotations for audit trail
    
    Query params:
    - starting_balance: Initial account balance (default 0.0)
    
    Returns: EquityCurveResponse with curve, summary, and data_quality
    """
    return get_equity_curve_v2(session, current_user.id, starting_balance=starting_balance)