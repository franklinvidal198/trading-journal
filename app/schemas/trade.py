from pydantic import BaseModel, Field, validator, computed_field
from typing import Optional
from datetime import datetime
from app.models.trade import TradeDirection, TradeStatus

class TradeBase(BaseModel):
    pair: str
    direction: TradeDirection
    entry_price: float = Field(..., gt=0)
    stop_loss: Optional[float] = Field(None, gt=0)
    take_profit: Optional[float] = Field(None, gt=0)
    position_size: float = Field(..., gt=0)
    notes: Optional[str] = None
    screenshot: Optional[str] = None

class TradeCreate(TradeBase):
    exit_price: Optional[float] = Field(None, gt=0)
    status: Optional[TradeStatus] = None
    closed_at: Optional[datetime] = None

class TradeUpdate(BaseModel):
    entry_price: Optional[float] = Field(None, gt=0)
    exit_price: Optional[float] = Field(None, gt=0)
    stop_loss: Optional[float] = Field(None, gt=0)
    take_profit: Optional[float] = Field(None, gt=0)
    position_size: Optional[float] = Field(None, gt=0)
    notes: Optional[str] = None
    screenshot: Optional[str] = None
    status: Optional[TradeStatus] = None

class TradeRead(TradeBase):
    id: int
    user_id: int
    exit_price: Optional[float]
    status: TradeStatus
    opened_at: datetime
    closed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def risk_reward(self) -> Optional[float]:
        """Calculate risk:reward ratio if trade is closed"""
        if self.status != TradeStatus.CLOSED or not self.exit_price or not self.stop_loss or not self.take_profit:
            return None
        
        risk = abs(self.entry_price - self.stop_loss)
        reward = abs(self.take_profit - self.entry_price)
        
        if risk == 0:
            return None
        return reward / risk

    @computed_field
    @property
    def result_usd(self) -> Optional[float]:
        """Calculate profit/loss in USD if trade is closed"""
        if self.status != TradeStatus.CLOSED or not self.exit_price:
            return None
        
        if self.direction == TradeDirection.BUY:
            return (self.exit_price - self.entry_price) * self.position_size
        else:  # SELL
            return (self.entry_price - self.exit_price) * self.position_size

    @computed_field
    @property
    def result_pips(self) -> Optional[float]:
        """Calculate profit/loss in pips if trade is closed"""
        if self.status != TradeStatus.CLOSED or not self.exit_price:
            return None
        
        if self.direction == TradeDirection.BUY:
            return (self.exit_price - self.entry_price) * 10000
        else:  # SELL
            return (self.entry_price - self.exit_price) * 10000

    class Config:
        from_attributes = True
