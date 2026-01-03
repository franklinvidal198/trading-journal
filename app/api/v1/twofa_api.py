from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from datetime import datetime
import pyotp
import qrcode
import io
import base64
import json
import secrets

from app.db.session import get_session
from app.models.twofa import TwoFactorAuth, TwoFactorSetup, TwoFactorVerify
from app.api.v1.routes.auth import get_current_user

router = APIRouter()

def generate_backup_codes(count: int = 10):
    return [secrets.token_hex(4) for _ in range(count)]

def get_qr_code(secret: str, username: str):
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(name=username, issuer_name="Trading Journal")
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(uri)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode()

@router.post("/api/v1/auth/2fa/setup")
def setup_2fa(setup_request: TwoFactorSetup, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    existing_2fa = session.exec(select(TwoFactorAuth).where(TwoFactorAuth.user_id == current_user["id"])).first()
    if existing_2fa and existing_2fa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA already enabled")
    secret = pyotp.random_base32()
    backup_codes = generate_backup_codes()
    twofa = TwoFactorAuth(user_id=current_user["id"], secret=secret, is_enabled=False, backup_codes=json.dumps(backup_codes))
    session.add(twofa)
    session.commit()
    qr_code = get_qr_code(secret, current_user["email"])
    return {"secret": secret, "qr_code": qr_code, "backup_codes": backup_codes}

@router.post("/api/v1/auth/2fa/verify")
def verify_2fa_setup(verify_request: TwoFactorVerify, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    twofa = session.exec(select(TwoFactorAuth).where(TwoFactorAuth.user_id == current_user["id"])).first()
    if not twofa:
        raise HTTPException(status_code=404, detail="2FA not initialized")
    if twofa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA already enabled")
    totp = pyotp.TOTP(twofa.secret)
    if not totp.verify(verify_request.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    twofa.is_enabled = True
    twofa.updated_at = datetime.utcnow()
    session.add(twofa)
    session.commit()
    return {"status": "2FA enabled successfully"}

@router.get("/api/v1/auth/2fa/status")
def get_2fa_status(session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    twofa = session.exec(select(TwoFactorAuth).where(TwoFactorAuth.user_id == current_user["id"])).first()
    if not twofa:
        return {"is_enabled": False, "backup_codes_remaining": 0}
    backup_codes = json.loads(twofa.backup_codes or "[]")
    return {"is_enabled": twofa.is_enabled, "backup_codes_remaining": len(backup_codes)}

@router.post("/api/v1/auth/2fa/disable")
def disable_2fa(verify_request: TwoFactorVerify, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    twofa = session.exec(select(TwoFactorAuth).where(TwoFactorAuth.user_id == current_user["id"])).first()
    if not twofa or not twofa.is_enabled:
        raise HTTPException(status_code=400, detail="2FA not enabled")
    totp = pyotp.TOTP(twofa.secret)
    if not totp.verify(verify_request.otp_code):
        raise HTTPException(status_code=400, detail="Invalid OTP code")
    twofa.is_enabled = False
    twofa.updated_at = datetime.utcnow()
    session.add(twofa)
    session.commit()
    return {"status": "2FA disabled successfully"}
