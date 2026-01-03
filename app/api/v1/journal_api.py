from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime
from app.db.session import get_session
from app.models.journal import JournalEntry, JournalEntryCreate, JournalEntryUpdate
from app.api.v1.routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/journal", tags=["journal"])

@router.get("")
def get_entries(
    session: Session = Depends(get_session),
    current_user = Depends(get_current_user),
    skip: int = Query(0),
    limit: int = Query(20),
):
    """Get user's journal entries"""
    query = select(JournalEntry).where(JournalEntry.user_id == current_user["id"]).order_by(JournalEntry.created_at.desc())
    total = len(session.exec(select(JournalEntry).where(JournalEntry.user_id == current_user["id"])).all())
    entries = session.exec(query.offset(skip).limit(limit)).all()
    return {"data": entries, "total": total, "skip": skip, "limit": limit}

@router.post("")
def create_entry(entry: JournalEntryCreate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    db_entry = JournalEntry(**entry.dict(), user_id=current_user["id"], created_at=datetime.utcnow())
    session.add(db_entry)
    session.commit()
    session.refresh(db_entry)
    return db_entry

@router.get("/{entry_id}")
def get_entry(entry_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    entry = session.get(JournalEntry, entry_id)
    if not entry or entry.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.put("/{entry_id}")
def update_entry(entry_id: int, entry_update: JournalEntryUpdate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    entry = session.get(JournalEntry, entry_id)
    if not entry or entry.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Entry not found")
    update_data = entry_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    for field, value in update_data.items():
        setattr(entry, field, value)
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return entry

@router.delete("/{entry_id}")
def delete_entry(entry_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    entry = session.get(JournalEntry, entry_id)
    if not entry or entry.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Entry not found")
    session.delete(entry)
    session.commit()
    return {"status": "deleted"}
