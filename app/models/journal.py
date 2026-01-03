from datetime import datetime
from sqlmodel import SQLModel, Field
from typing import Optional

class JournalEntry(SQLModel, table=True):
    """Trade journal entry for analysis and learning"""
    __tablename__ = "journal_entries"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    trade_id: Optional[int] = Field(default=None, foreign_key="trade.id")
    
    # Entry metadata
    entry_type: str = Field(index=True)  # ANALYSIS, MISTAKE, SUCCESS, STRATEGY
    pair: str = Field(index=True)
    title: str
    content: str
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Tags for easy filtering
    tags: Optional[str] = None  # Comma-separated tags

class JournalEntryCreate(SQLModel):
    """Schema for creating journal entries"""
    entry_type: str
    pair: str
    title: str
    content: str
    trade_id: Optional[int] = None
    tags: Optional[str] = None

class JournalEntryUpdate(SQLModel):
    """Schema for updating journal entries"""
    title: Optional[str] = None
    content: Optional[str] = None
    entry_type: Optional[str] = None
    tags: Optional[str] = None
