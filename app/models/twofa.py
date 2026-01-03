from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class TwoFactorAuth(SQLModel, table=True):
    """Two-factor authentication model"""
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id")
    secret: str  # Base32 encoded secret
    is_enabled: bool = False
    backup_codes: Optional[str] = None  # JSON list of backup codes
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class TwoFactorSetup(SQLModel):
    """2FA setup request"""
    enable: bool

class TwoFactorVerify(SQLModel):
    """2FA verification"""
    otp_code: str
    backup_code: Optional[str] = None

class TwoFactorResponse(SQLModel):
    """2FA setup response"""
    secret: str
    qr_code: str  # Base64 encoded QR code
    backup_codes: list[str]
