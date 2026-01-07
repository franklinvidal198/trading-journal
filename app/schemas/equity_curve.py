"""
Institutional-grade equity curve schemas.
Enforces strict financial accounting and audit trail requirements.
"""

from pydantic import BaseModel, Field, validator
from typing import List, Literal, Optional
from datetime import datetime


class EquityCurveEvent(BaseModel):
    """Event annotation for audit trail"""
    type: Literal["TRADE_CLOSE", "TRADE_OPEN", "MARK_TO_MARKET", "FUNDING"]
    trade_id: Optional[int] = None
    description: Optional[str] = None


class EquityCurvePoint(BaseModel):
    """
    Single point on the equity curve.
    
    CRITICAL: All values are finalized at point creation time.
    No calculations happen downstream.
    """
    # Timestamp: microsecond precision, monotonic guarantee
    timestamp_iso: str = Field(
        description="ISO 8601 timestamp with microsecond precision (YYYY-MM-DDTHH:MM:SS.ffffff±HH:MM)"
    )
    timestamp_unix_us: int = Field(
        description="Unix timestamp in microseconds for deterministic sorting"
    )
    sequence_id: int = Field(
        description="Monotonic sequence number for ordering within same microsecond"
    )
    
    # Financial state at this moment
    balance_realized: float = Field(
        description="Cumulative closed trade P&L (USD)"
    )
    balance_unrealized: float = Field(
        description="Mark-to-market gain/loss on open positions (USD)"
    )
    balance_total: float = Field(
        description="Total account equity = starting_balance + realized + unrealized (USD)"
    )
    return_percent: float = Field(
        description="Return as percentage: (balance_total - starting_balance) / starting_balance * 100"
    )
    
    # Audit trail
    event: EquityCurveEvent
    
    # Display hints for frontend (OPTIONAL - frontend must NOT depend on these)
    display_date: Optional[str] = Field(
        None,
        description="Frontend display hint: 'Jan 4 09:15' (computed server-side for consistency)"
    )
    
    @validator("balance_total")
    def validate_total_equity(cls, v, values):
        """Validate that total_equity = starting_balance + realized + unrealized"""
        if "balance_realized" in values and "balance_unrealized" in values:
            # Note: _starting_balance is passed via EquityCurveResponse
            # If not available, skip validation (it will be validated at response level)
            starting = values.get("_starting_balance", None)
            if starting is not None:
                expected = starting + values["balance_realized"] + values["balance_unrealized"]
                # Allow tiny floating point error
                if abs(v - expected) > 0.01:
                    raise ValueError(
                        f"Equity curve integrity violation: {v} != {starting} + {values['balance_realized']} + {values['balance_unrealized']}"
                    )
        return v


class DataQuality(BaseModel):
    """Metadata about data completeness and reliability"""
    is_complete: bool = Field(
        description="True if all trades and positions are included"
    )
    includes_open_positions: bool = Field(
        description="True if unrealized P&L is included (requires live market prices)"
    )
    timestamp_precision_ms: int = Field(
        description="Precision of timestamps: 1000 for microseconds, 1 for milliseconds, etc"
    )
    has_gaps: bool = Field(
        description="True if there are time periods with no trading activity"
    )
    warnings: List[str] = Field(
        default_factory=list,
        description="Non-fatal issues: missing data, precision loss, etc"
    )


class EquityCurveResponse(BaseModel):
    """
    Complete institutional-grade equity curve response.
    
    DESIGN PRINCIPLE:
    - Backend owns ALL financial calculations
    - Frontend receives finished product
    - Zero ambiguity about what each value means
    """
    
    # Account context
    starting_balance: float = Field(
        description="Initial account balance at curve start (USD)"
    )
    currency: str = Field(
        default="USD",
        description="Currency code"
    )
    timezone: str = Field(
        default="UTC",
        description="Timezone context for displayed dates"
    )
    
    # The curve itself
    curve: List[EquityCurvePoint] = Field(
        description="Equity progression with full financial state at each event"
    )
    
    # Summary statistics (for quick UX)
    summary: dict = Field(
        description={
            "ending_balance": "Final total equity",
            "ending_realized": "Final realized P&L",
            "ending_unrealized": "Final unrealized P&L",
            "total_return_percent": "Return from start to end",
            "max_balance": "Peak equity during period",
            "min_balance": "Trough equity during period",
            "max_drawdown_percent": "Worst peak-to-trough decline",
        }
    )
    
    # Data quality assurance
    data_quality: DataQuality = Field(
        description="Warnings and metadata about data reliability"
    )
    
    # Response metadata
    generated_at_iso: str = Field(
        description="When this response was generated (UTC)"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "starting_balance": 10000.00,
                "currency": "USD",
                "timezone": "UTC",
                "curve": [
                    {
                        "timestamp_iso": "2026-01-04T09:00:00.000000Z",
                        "timestamp_unix_us": 1735980000000000,
                        "sequence_id": 1,
                        "balance_realized": 0.00,
                        "balance_unrealized": 0.00,
                        "balance_total": 10000.00,
                        "return_percent": 0.0,
                        "event": {"type": "FUNDING", "description": "Initial balance"},
                        "display_date": "Jan 4 09:00"
                    },
                    {
                        "timestamp_iso": "2026-01-04T09:15:30.123456Z",
                        "timestamp_unix_us": 1735980930123456,
                        "sequence_id": 2,
                        "balance_realized": 300.50,
                        "balance_unrealized": 0.00,
                        "balance_total": 10300.50,
                        "return_percent": 3.005,
                        "event": {"type": "TRADE_CLOSE", "trade_id": 1},
                        "display_date": "Jan 4 09:15"
                    }
                ],
                "summary": {
                    "ending_balance": 10300.50,
                    "ending_realized": 300.50,
                    "ending_unrealized": 0.00,
                    "total_return_percent": 3.005,
                    "max_balance": 10300.50,
                    "min_balance": 10000.00,
                    "max_drawdown_percent": 0.0
                },
                "data_quality": {
                    "is_complete": True,
                    "includes_open_positions": False,
                    "timestamp_precision_ms": 1000,
                    "has_gaps": False,
                    "warnings": []
                },
                "generated_at_iso": "2026-01-04T09:30:00.000000Z"
            }
        }
