from sqlmodel import SQLModel, create_engine, Session
from app.core.config import settings

engine = create_engine(settings.SQLITE_DB, echo=False, connect_args={"check_same_thread": False})

# Import all models to register them with SQLModel
from app.models.user import User
from app.models.trade import Trade
from app.models.template import TradeTemplate
from app.models.journal import JournalEntry

# Create all tables on startup
SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
