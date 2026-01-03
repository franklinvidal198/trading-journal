from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime
from app.db.session import get_session
from app.models.template import TradeTemplate, TradeTemplateCreate, TradeTemplateUpdate
from app.models.trade import Trade
from app.api.v1.routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/templates", tags=["templates"])

@router.get("")
def get_templates(session: Session = Depends(get_session), current_user = Depends(get_current_user), skip: int = Query(0), limit: int = Query(20)):
    query = select(TradeTemplate).where(TradeTemplate.user_id == current_user["id"]).order_by(TradeTemplate.created_at.desc())
    total = len(session.exec(select(TradeTemplate).where(TradeTemplate.user_id == current_user["id"])).all())
    templates = session.exec(query.offset(skip).limit(limit)).all()
    return {"data": templates, "total": total, "skip": skip, "limit": limit}

@router.post("")
def create_template(template: TradeTemplateCreate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    db_template = TradeTemplate(**template.dict(), user_id=current_user["id"], created_at=datetime.utcnow())
    session.add(db_template)
    session.commit()
    session.refresh(db_template)
    return db_template

@router.get("/{template_id}")
def get_template(template_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    template = session.get(TradeTemplate, template_id)
    if not template or template.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Template not found")
    return template

@router.put("/{template_id}")
def update_template(template_id: int, template_update: TradeTemplateUpdate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    template = session.get(TradeTemplate, template_id)
    if not template or template.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Template not found")
    update_data = template_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    for field, value in update_data.items():
        setattr(template, field, value)
    session.add(template)
    session.commit()
    session.refresh(template)
    return template

@router.delete("/{template_id}")
def delete_template(template_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    template = session.get(TradeTemplate, template_id)
    if not template or template.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Template not found")
    session.delete(template)
    session.commit()
    return {"status": "deleted"}
