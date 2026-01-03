from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from datetime import datetime
from app.db.session import get_session
from app.models.goal import TradingGoal, TradingGoalCreate, TradingGoalUpdate, TradeStreak
from app.api.v1.routes.auth import get_current_user

router = APIRouter(prefix="/api/v1/goals", tags=["goals"])

@router.get("")
def get_goals(session: Session = Depends(get_session), current_user = Depends(get_current_user), skip: int = Query(0), limit: int = Query(20)):
    query = select(TradingGoal).where(TradingGoal.user_id == current_user["id"]).order_by(TradingGoal.created_at.desc())
    total = len(session.exec(select(TradingGoal).where(TradingGoal.user_id == current_user["id"])).all())
    goals = session.exec(query.offset(skip).limit(limit)).all()
    return {"data": goals, "total": total, "skip": skip, "limit": limit}

@router.post("")
def create_goal(goal: TradingGoalCreate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    db_goal = TradingGoal(**goal.dict(), user_id=current_user["id"], status="ACTIVE", created_at=datetime.utcnow())
    session.add(db_goal)
    session.commit()
    session.refresh(db_goal)
    return db_goal

@router.get("/{goal_id}")
def get_goal(goal_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    goal = session.get(TradingGoal, goal_id)
    if not goal or goal.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal

@router.put("/{goal_id}")
def update_goal(goal_id: int, goal_update: TradingGoalUpdate, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    goal = session.get(TradingGoal, goal_id)
    if not goal or goal.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Goal not found")
    update_data = goal_update.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    for field, value in update_data.items():
        setattr(goal, field, value)
    session.add(goal)
    session.commit()
    session.refresh(goal)
    return goal

@router.delete("/{goal_id}")
def delete_goal(goal_id: int, session: Session = Depends(get_session), current_user = Depends(get_current_user)):
    goal = session.get(TradingGoal, goal_id)
    if not goal or goal.user_id != current_user["id"]:
        raise HTTPException(status_code=404, detail="Goal not found")
    session.delete(goal)
    session.commit()
    return {"status": "deleted"}

@router.get("/streaks/list")
def get_streaks(session: Session = Depends(get_session), current_user = Depends(get_current_user), skip: int = Query(0), limit: int = Query(20)):
    query = select(TradeStreak).where(TradeStreak.user_id == current_user["id"]).order_by(TradeStreak.current_count.desc())
    total = len(session.exec(select(TradeStreak).where(TradeStreak.user_id == current_user["id"])).all())
    streaks = session.exec(query.offset(skip).limit(limit)).all()
    return {"data": streaks, "total": total, "skip": skip, "limit": limit}
