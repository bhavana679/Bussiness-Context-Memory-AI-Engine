import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/business_memory_db"
    APP_NAME: str = "Business Context Memory AI Engine"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FAISS_INDEX_PATH: str = os.path.join(os.getcwd(), "vector_storage", "business_context")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
