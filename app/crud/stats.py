from sqlmodel import Session, select, func
from app.models.trade import Trade, TradeStatus

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