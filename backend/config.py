from pydantic_settings import BaseSettings


import os

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/business_memory_db"
    APP_NAME: str = "Business Context Memory AI Engine"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = os.path.join(os.path.dirname(__file__), ".env")



settings = Settings()
