from sqlmodel import SQLModel, Field, Enum
from datetime import datetime
from typing import Optional
import enum

class TradeDirection(str, enum.Enum):
    BUY = "BUY"
    SELL = "SELL"

class TradeStatus(str, enum.Enum):
    OPEN = "OPEN"
    CLOSED = "CLOSED"

class Trade(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    pair: str
    direction: TradeDirection
    entry_price: float
    exit_price: Optional[float] = None
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None
    position_size: float
    risk_reward: Optional[float] = None
    result_pips: Optional[float] = None
    result_usd: Optional[float] = None
    notes: Optional[str] = None
    screenshot_url: Optional[str] = None
    status: TradeStatus = Field(default=TradeStatus.OPEN)
    opened_at: datetime = Field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
