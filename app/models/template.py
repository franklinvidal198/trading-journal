from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class TradeTemplate(SQLModel, table=True):
    """Saved trading templates for quick trade setup"""
    __tablename__ = "trade_templates"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    
    # Template metadata
    name: str = Field(index=True)
    pair: str = Field(index=True)
    trade_type: str  # BUY, SELL
    
    # Strategy details
    entry_strategy: str  # Detailed entry criteria
    exit_strategy: str   # Detailed exit criteria
    risk_reward: str  # e.g., "1:1.5"
    
    # Optional fields
    description: Optional[str] = None
    tags: Optional[str] = None  # Comma-separated tags
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    usage_count: int = Field(default=0)  # Track how many trades used this template

class TradeTemplateCreate(SQLModel):
    """Schema for creating templates"""
    name: str
    pair: str
    trade_type: str
    entry_strategy: str
    exit_strategy: str
    risk_reward: str
    description: Optional[str] = None
    tags: Optional[str] = None

class TradeTemplateUpdate(SQLModel):
    """Schema for updating templates"""
    name: Optional[str] = None
    entry_strategy: Optional[str] = None
    exit_strategy: Optional[str] = None
    risk_reward: Optional[str] = None
    description: Optional[str] = None
    tags: Optional[str] = None

class TradeFromTemplate(SQLModel):
    """Schema for creating trade from template"""
    template_id: int
    # Optional overrides
    pair: Optional[str] = None
    entry_price: Optional[float] = None
    position_size: Optional[float] = None
