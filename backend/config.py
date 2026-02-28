import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin_user:G7lSxPFYtQAcBoohFfwZGv48vopi2R9S@dpg-d6hc2qvgi27c73fnsuc0-a.oregon-postgres.render.com/risk_engine_db"
    APP_NAME: str = "Business Context Memory AI Engine"
    DEBUG: bool = True
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    FAISS_INDEX_PATH: str = os.path.join(os.getcwd(), "vector_storage", "business_context")

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
