from pydantic_settings import BaseSettings
from functools import lru_cache
import os

class Settings(BaseSettings):
    SECRET_KEY: str = "devsecretkey2090"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    DATABASE_URL: str = "sqlite:///./trading_journal.db"
    DATA_MODE: str = os.getenv('DATA_MODE', 'real')
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings()
