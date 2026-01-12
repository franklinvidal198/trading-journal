from sqlmodel import Session, select
from app.models.trade import Trade, TradeStatus
from app.schemas.trade import TradeCreate, TradeUpdate
from app.utils.trading import compute_risk_reward, compute_result_pips, compute_result_usd
from datetime import datetime

def create_trade(session: Session, trade_in: TradeCreate, user_id: int):
    trade = Trade(**trade_in.dict(), user_id=user_id)
    trade.risk_reward = compute_risk_reward(trade)
    session.add(trade)
    session.commit()
    session.refresh(trade)
    return trade

def get_trade(session: Session, trade_id: int, user_id: int):
    trade = session.get(Trade, trade_id)
    if trade and trade.user_id == user_id:
        return trade
    return None

def get_trades(session: Session, user_id: int, pair: str = None, status: TradeStatus = None, start_date: datetime = None, end_date: datetime = None, limit: int = None, offset: int = None):
    query = select(Trade).where(Trade.user_id == user_id)
    if pair:
        query = query.where(Trade.pair == pair)
    if status:
        query = query.where(Trade.status == status)
    if start_date:
        query = query.where(Trade.opened_at >= start_date)
    if end_date:
        query = query.where(Trade.opened_at <= end_date)
    if limit:
        query = query.limit(limit)
    if offset:
        query = query.offset(offset)
    return session.exec(query).all()

def update_trade(session: Session, trade_id: int, user_id: int, trade_in: TradeUpdate):
    trade = get_trade(session, trade_id, user_id)
    if not trade:
        return None
    for key, value in trade_in.dict(exclude_unset=True).items():
        setattr(trade, key, value)
    trade.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(trade)
    return trade

def delete_trade(session: Session, trade_id: int, user_id: int):
    trade = get_trade(session, trade_id, user_id)
    if not trade:
        return None
    session.delete(trade)
    session.commit()
    return trade

def close_trade(session: Session, trade_id: int, user_id: int, exit_price: float):
    trade = get_trade(session, trade_id, user_id)
    if not trade or trade.status == TradeStatus.CLOSED:
        return None
    trade.exit_price = exit_price
    trade.closed_at = datetime.utcnow()
    trade.status = TradeStatus.CLOSED
    trade.result_pips = compute_result_pips(trade)
    trade.result_usd = compute_result_usd(trade)
    trade.risk_reward = compute_risk_reward(trade)
    trade.updated_at = datetime.utcnow()
    session.commit()
    session.refresh(trade)
    return trade
