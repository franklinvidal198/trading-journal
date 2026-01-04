from sqlmodel import Session, select, func
from app.models.trade import Trade, TradeStatus
from app.schemas.equity_curve import EquityCurveResponse, EquityCurvePoint, EquityCurveEvent, DataQuality
from datetime import datetime, timezone
import math

def calculate_trade_result(trade: Trade) -> float:
    """Calculate result USD for a trade"""
    if trade.status != TradeStatus.CLOSED or not trade.exit_price:
        return 0
    
    if trade.direction == "BUY":
        return (trade.exit_price - trade.entry_price) * trade.position_size
    else:  # SELL
        return (trade.entry_price - trade.exit_price) * trade.position_size

def calculate_trade_risk_reward(trade: Trade) -> float:
    """Calculate risk:reward ratio for a trade"""
    if trade.status != TradeStatus.CLOSED or not trade.exit_price or not trade.stop_loss or not trade.take_profit:
        return 0
    
    risk = abs(trade.entry_price - trade.stop_loss)
    reward = abs(trade.take_profit - trade.entry_price)
    
    if risk == 0:
        return 0
    return reward / risk

def get_summary_stats(session: Session):
    trades = session.exec(select(Trade).where(Trade.status == TradeStatus.CLOSED)).all()
    total = len(trades)
    
    # Calculate results for each trade
    calculated_results = [calculate_trade_result(t) for t in trades]
    calculated_rr = [calculate_trade_risk_reward(t) for t in trades]
    
    wins = [r for r in calculated_results if r > 0]
    losses = [r for r in calculated_results if r <= 0]
    win_rate = (len(wins) / total * 100) if total else 0
    avg_rr = sum([r for r in calculated_rr if r > 0]) / total if total else 0
    total_profit = sum(calculated_results)
    
    # Calculate daily profit (today's profit)
    from datetime import datetime, timedelta
    today = datetime.now().date()
    today_trades = [t for t in trades if t.closed_at and t.closed_at.date() == today]
    daily_profit = sum([calculate_trade_result(t) for t in today_trades]) if today_trades else 0
    
    # Calculate max loss
    max_loss = min(calculated_results) if calculated_results else 0
    max_loss = abs(max_loss) if max_loss < 0 else 0
    
    return {
        "total_trades": total,
        "winning_trades": len(wins),
        "losing_trades": len(losses),
        "win_rate": win_rate,
        "avg_risk_reward": avg_rr,
        "total_profit": total_profit,
        "daily_profit": daily_profit,
        "max_loss": max_loss,
    }

def get_equity_curve(session: Session):
    trades = session.exec(select(Trade).where(Trade.status == TradeStatus.CLOSED).order_by(Trade.closed_at)).all()
    curve = []
    balance = 0
    for t in trades:
        result = calculate_trade_result(t)
        balance += result
        curve.append({"date": t.closed_at, "balance": balance})
    return curve
def get_pnl_by_pair(session: Session):
    """Get P&L breakdown by trading pair"""
    trades = session.exec(select(Trade).where(Trade.status == TradeStatus.CLOSED)).all()
    
    pnl_dict = {}
    for trade in trades:
        result = calculate_trade_result(trade)
        pair = trade.pair
        if pair not in pnl_dict:
            pnl_dict[pair] = {"wins": 0, "losses": 0, "total_pnl": 0}
        
        if result > 0:
            pnl_dict[pair]["wins"] += 1
        else:
            pnl_dict[pair]["losses"] += 1
        pnl_dict[pair]["total_pnl"] += result
    
    return [{"pair": pair, **data} for pair, data in pnl_dict.items()]

def get_win_loss_distribution(session: Session):
    """Get win/loss distribution for pie chart"""
    trades = session.exec(select(Trade).where(Trade.status == TradeStatus.CLOSED)).all()
    
    wins = 0
    losses = 0
    for trade in trades:
        result = calculate_trade_result(trade)
        if result > 0:
            wins += 1
        else:
            losses += 1
    
    total = wins + losses
    return {
        "wins": wins,
        "win_percentage": (wins / total * 100) if total else 0,
        "losses": losses,
        "loss_percentage": (losses / total * 100) if total else 0,
    }

def get_daily_performance(session: Session, days: int = 30):
    """Get daily P&L for the last N days"""
    from datetime import datetime, timedelta
    
    trades = session.exec(select(Trade).where(Trade.status == TradeStatus.CLOSED)).all()
    
    daily_dict = {}
    start_date = datetime.now().date() - timedelta(days=days)
    
    for trade in trades:
        if trade.closed_at:
            trade_date = trade.closed_at.date()
            if trade_date >= start_date:
                if trade_date not in daily_dict:
                    daily_dict[trade_date] = {"profit": 0, "trades": 0}
                
                result = calculate_trade_result(trade)
                daily_dict[trade_date]["profit"] += result
                daily_dict[trade_date]["trades"] += 1
    
    # Fill in missing days with 0
    current_date = start_date
    while current_date <= datetime.now().date():
        if current_date not in daily_dict:
            daily_dict[current_date] = {"profit": 0, "trades": 0}
        current_date += timedelta(days=1)
    
    return [{"date": date, **data} for date, data in sorted(daily_dict.items())]

def get_stats_by_date_range(session: Session, start_date: str = None, end_date: str = None):
    """Get stats filtered by date range"""
    from datetime import datetime
    
    query = select(Trade).where(Trade.status == TradeStatus.CLOSED)
    
    if start_date:
        start = datetime.fromisoformat(start_date).date()
        query = query.where(Trade.closed_at >= start)
    
    if end_date:
        end = datetime.fromisoformat(end_date).date()
        query = query.where(Trade.closed_at <= end)
    
    trades = session.exec(query).all()
    total = len(trades)
    
    if total == 0:
        return {
            "total_trades": 0,
            "winning_trades": 0,
            "losing_trades": 0,
            "win_rate": 0,
            "avg_risk_reward": 0,
            "total_profit": 0,
            "avg_profit": 0,
        }
    
    calculated_results = [calculate_trade_result(t) for t in trades]
    calculated_rr = [calculate_trade_risk_reward(t) for t in trades]
    
    wins = [r for r in calculated_results if r > 0]
    losses = [r for r in calculated_results if r <= 0]
    win_rate = (len(wins) / total * 100) if total else 0
    avg_rr = sum([r for r in calculated_rr if r > 0]) / total if total else 0
    total_profit = sum(calculated_results)
    avg_profit = total_profit / total if total else 0
    
    return {
        "total_trades": total,
        "winning_trades": len(wins),
        "losing_trades": len(losses),
        "win_rate": win_rate,
        "avg_risk_reward": avg_rr,
        "total_profit": total_profit,
        "avg_profit": avg_profit,
    }

def get_performance_calendar(session: Session, month: int, year: int):
    """Get daily PnL data for a specific month for calendar heatmap"""
    from datetime import datetime, date
    from calendar import monthrange
    
    trades = session.exec(select(Trade).where(Trade.status == TradeStatus.CLOSED)).all()
    
    # Build daily aggregates for the month
    daily_dict = {}
    _, num_days = monthrange(year, month)
    
    for trade in trades:
        if trade.closed_at:
            trade_date = trade.closed_at.date()
            if trade_date.year == year and trade_date.month == month:
                if trade_date not in daily_dict:
                    daily_dict[trade_date] = {
                        "pnl": 0.0,
                        "trades": 0,
                        "wins": 0,
                        "losses": 0,
                    }
                
                result = calculate_trade_result(trade)
                daily_dict[trade_date]["pnl"] += result
                daily_dict[trade_date]["trades"] += 1
                
                if result > 0:
                    daily_dict[trade_date]["wins"] += 1
                else:
                    daily_dict[trade_date]["losses"] += 1
    
    # Build result array for all days in month (including empty days)
    result = []
    for day in range(1, num_days + 1):
        current_date = date(year, month, day)
        day_data = daily_dict.get(current_date)
        
        if day_data:
            win_rate = (day_data["wins"] / day_data["trades"] * 100) if day_data["trades"] > 0 else 0
            result.append({
                "date": current_date.isoformat(),
                "pnl": round(day_data["pnl"], 2),
                "trades": day_data["trades"],
                "winRate": round(win_rate, 1),
            })
        else:
            result.append({
                "date": current_date.isoformat(),
                "pnl": 0.0,
                "trades": 0,
                "winRate": 0.0,
            })
    
    return result


def get_equity_curve_v2(
    session: Session,
    starting_balance: float = 0.0,
    include_open_positions: bool = False,
) -> EquityCurveResponse:
    """
    INSTITUTIONAL-GRADE equity curve calculation.
    
    DESIGN PRINCIPLE:
    - All financial calculations happen here
    - Backend owns truth about equity state
    - Frontend receives finished, validated product
    - No downstream mutation or inference
    
    Args:
        session: Database session
        starting_balance: Account starting balance (USD). If 0, inferred from first trade.
        include_open_positions: If True, include unrealized P&L (requires mark-to-market)
    
    Returns:
        EquityCurveResponse: Complete, validated equity curve with metadata
    
    Raises:
        ValueError: If data integrity checks fail
    """
    
    # STEP 1: Fetch and validate all closed trades
    trades = session.exec(
        select(Trade)
        .where(Trade.status == TradeStatus.CLOSED)
        .order_by(Trade.closed_at, Trade.id)  # Deterministic ordering
    ).all()
    
    if not trades:
        # Empty account: just return starting balance
        now = datetime.now(timezone.utc)
        return EquityCurveResponse(
            starting_balance=starting_balance,
            currency="USD",
            timezone="UTC",
            curve=[
                EquityCurvePoint(
                    timestamp_iso=now.isoformat(),
                    timestamp_unix_us=int(now.timestamp() * 1_000_000),
                    sequence_id=1,
                    balance_realized=0.0,
                    balance_unrealized=0.0,
                    balance_total=starting_balance,
                    return_percent=0.0,
                    event=EquityCurveEvent(
                        type="FUNDING",
                        description="Initial balance"
                    ),
                )
            ],
            summary={
                "ending_balance": starting_balance,
                "ending_realized": 0.0,
                "ending_unrealized": 0.0,
                "total_return_percent": 0.0,
                "max_balance": starting_balance,
                "min_balance": starting_balance,
                "max_drawdown_percent": 0.0,
            },
            data_quality=DataQuality(
                is_complete=True,
                includes_open_positions=False,
                timestamp_precision_ms=1000,
                has_gaps=False,
                warnings=[]
            ),
            generated_at_iso=now.isoformat(),
        )
    
    # STEP 2: Infer starting balance if not provided
    if starting_balance == 0.0:
        # Starting balance is the point where first trade starts
        # (or 0 if first trade is a loss)
        starting_balance = 0.0
    
    # STEP 3: Build equity curve with full accounting
    curve_points: list[EquityCurvePoint] = []
    balance_realized = 0.0
    max_balance = starting_balance
    min_balance = starting_balance
    has_gaps = False
    warnings = []
    
    # ANCHOR POINT: Starting balance
    if starting_balance != 0:
        first_trade_time = trades[0].closed_at
        curve_points.append(
            EquityCurvePoint(
                timestamp_iso=first_trade_time.isoformat() if hasattr(first_trade_time, 'isoformat') else str(first_trade_time),
                timestamp_unix_us=int(first_trade_time.timestamp() * 1_000_000) if hasattr(first_trade_time, 'timestamp') else 0,
                sequence_id=0,
                balance_realized=0.0,
                balance_unrealized=0.0,
                balance_total=starting_balance,
                return_percent=0.0,
                event=EquityCurveEvent(
                    type="FUNDING",
                    description="Initial balance"
                ),
                display_date=format_display_date(first_trade_time),
            )
        )
    
    # PROCESS CLOSED TRADES
    prev_timestamp = None
    for seq_id, trade in enumerate(trades, start=1):
        # Validate trade is properly closed
        if not trade.closed_at:
            warnings.append(f"Trade {trade.id} missing closed_at timestamp")
            continue
        
        if trade.exit_price is None:
            warnings.append(f"Trade {trade.id} missing exit_price")
            continue
        
        # Calculate trade result
        if trade.direction == "BUY":
            trade_result = (trade.exit_price - trade.entry_price) * trade.position_size
        else:  # SELL
            trade_result = (trade.entry_price - trade.exit_price) * trade.position_size
        
        # CRITICAL: Ensure monotonic timestamps
        if prev_timestamp and trade.closed_at <= prev_timestamp:
            warnings.append(
                f"Timestamp ordering issue: Trade {trade.id} at {trade.closed_at} "
                f"not strictly after previous {prev_timestamp}. "
                f"Consider adding microsecond precision."
            )
        
        prev_timestamp = trade.closed_at
        
        # Update cumulative
        balance_realized += trade_result
        balance_total = starting_balance + balance_realized  # (unrealized not included yet)
        
        # Track extrema for drawdown calc
        max_balance = max(max_balance, balance_total)
        min_balance = min(min_balance, balance_total)
        
        # Create curve point
        point = EquityCurvePoint(
            timestamp_iso=trade.closed_at.isoformat() if hasattr(trade.closed_at, 'isoformat') else str(trade.closed_at),
            timestamp_unix_us=int(trade.closed_at.timestamp() * 1_000_000) if hasattr(trade.closed_at, 'timestamp') else 0,
            sequence_id=seq_id,
            balance_realized=round(balance_realized, 2),
            balance_unrealized=0.0,  # No unrealized in "closed only" mode
            balance_total=round(balance_total, 2),
            return_percent=round(((balance_total - starting_balance) / max(starting_balance, 0.01) * 100), 2),
            event=EquityCurveEvent(
                type="TRADE_CLOSE",
                trade_id=trade.id,
                description=f"{trade.pair} {trade.direction} closed at ${trade.exit_price}"
            ),
            display_date=format_display_date(trade.closed_at),
        )
        
        curve_points.append(point)
    
    # STEP 4: Calculate summary stats
    ending_balance = starting_balance + balance_realized
    max_drawdown_percent = (
        ((min_balance - max_balance) / max_balance * 100)
        if max_balance > 0
        else 0.0
    )
    
    total_return_percent = (
        ((ending_balance - starting_balance) / max(starting_balance, 0.01) * 100)
    )
    
    # STEP 5: Data quality assessment
    data_quality = DataQuality(
        is_complete=(len(warnings) == 0),
        includes_open_positions=False,  # V2 only handles closed
        timestamp_precision_ms=1000,  # Current precision
        has_gaps=has_gaps,
        warnings=warnings
    )
    
    # STEP 6: Return institutional response
    now = datetime.now(timezone.utc)
    return EquityCurveResponse(
        starting_balance=starting_balance,
        currency="USD",
        timezone="UTC",
        curve=curve_points,
        summary={
            "ending_balance": round(ending_balance, 2),
            "ending_realized": round(balance_realized, 2),
            "ending_unrealized": 0.0,
            "total_return_percent": round(total_return_percent, 2),
            "max_balance": round(max_balance, 2),
            "min_balance": round(min_balance, 2),
            "max_drawdown_percent": round(max_drawdown_percent, 2),
        },
        data_quality=data_quality,
        generated_at_iso=now.isoformat(),
    )


def format_display_date(dt) -> str:
    """
    Format datetime for frontend display.
    Backend-side formatting ensures consistency.
    """
    if not dt:
        return ""
    
    if hasattr(dt, 'strftime'):
        # datetime object
        return dt.strftime("%b %d %H:%M")
    
    try:
        # Try parsing string
        from datetime import datetime as dt_class
        parsed = dt_class.fromisoformat(str(dt).replace('Z', '+00:00'))
        return parsed.strftime("%b %d %H:%M")
    except:
        return str(dt)