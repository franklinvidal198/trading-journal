from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class TradingGoal(SQLModel, table=True):
    """User trading goals for motivation and tracking"""
    __tablename__ = "trading_goals"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Goal definition
    goal_type: str = Field(index=True)  # WIN_RATE, PNL, TRADES
    period: str  # MONTHLY, QUARTERLY, YEARLY
    target_value: float
    
    # Current progress
    current_value: float = Field(default=0.0)
    
    # Metadata
    description: Optional[str] = None
    status: str = Field(default="ACTIVE")  # ACTIVE, COMPLETED, FAILED
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    started_at: datetime = Field(default_factory=datetime.utcnow)
    target_date: datetime  # When goal should be completed
    completed_at: Optional[datetime] = None
    
    # Statistics
    progress_percentage: float = Field(default=0.0)
    is_on_track: bool = Field(default=True)

class TradingGoalCreate(SQLModel):
    """Schema for creating goals"""
    goal_type: str
    period: str
    target_value: float
    description: Optional[str] = None

class TradingGoalUpdate(SQLModel):
    """Schema for updating goals"""
    target_value: Optional[float] = None
    current_value: Optional[float] = None
    status: Optional[str] = None
    description: Optional[str] = None

class TradeStreak(SQLModel, table=True):
    """Track trading streaks (consecutive wins, no-loss days, etc.)"""
    __tablename__ = "trade_streaks"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Streak definition
    streak_type: str  # CONSECUTIVE_WINS, NO_LOSS_DAYS, PROFITABLE_WEEKS
    current_count: int = Field(default=0)
    best_count: int = Field(default=0)
    
    # Tracking
    started_at: datetime = Field(default_factory=datetime.utcnow)
    broken_at: Optional[datetime] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class StreakResponse(SQLModel):
    """Response schema for streak data"""
    type: str
    count: int
    percentage: float
