from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_session
import os
from app.schemas.trade import TradeRead
from app.schemas.trade import TradeCreate, TradeRead, TradeUpdate
from app.crud.trade import (
    create_trade, get_trade, get_trades, update_trade, delete_trade, close_trade
)
from app.models.trade import TradeStatus
from app.api.v1.routes.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=TradeRead)
async def create_trade_endpoint(
    trade_in: TradeCreate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    trade = create_trade(session, trade_in, current_user.id)
    return trade

@router.get("/", response_model=List[TradeRead])
async def list_trades(
    pair: Optional[str] = Query(None),
    status: Optional[TradeStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    limit: Optional[int] = Query(None),
    offset: Optional[int] = Query(None),
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    trades = get_trades(
        session, current_user.id, pair, status, start_date, end_date, limit, offset
    )
    return trades

@router.get("/{trade_id}", response_model=TradeRead)
async def get_trade_endpoint(
    trade_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    trade = get_trade(session, trade_id, current_user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.put("/{trade_id}", response_model=TradeRead)
async def update_trade_endpoint(
    trade_id: int,
    trade_in: TradeUpdate,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    trade = update_trade(session, trade_id, current_user.id, trade_in)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.delete("/{trade_id}", response_model=TradeRead)
async def delete_trade_endpoint(
    trade_id: int,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    trade = delete_trade(session, trade_id, current_user.id)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found")
    return trade

@router.patch("/{trade_id}/close", response_model=TradeRead)
async def close_trade_endpoint(
    trade_id: int,
    exit_price: float,
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user)
):
    trade = close_trade(session, trade_id, current_user.id, exit_price)
    if not trade:
        raise HTTPException(status_code=404, detail="Trade not found or already closed")
    return trade
