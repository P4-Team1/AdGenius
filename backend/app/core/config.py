from pydantic_settings import BaseSettings
import secrets
import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()


class Settings(BaseSettings):
    # Database - SQLite
    DATABASE_URL: str = "sqlite:///./app.db"
    
    # Security
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Application
    APP_NAME: str = "FastAPI ADS Project"
    DEBUG: bool = True
    
    # OpenAI
    OPENAI_API_KEY: str
    
    # HuggingFace
    HUGGINGFACE_TOKEN: Optional[str] = None
    
    # Base Directory
    BASE_DIR: Path = Path(__file__).parent.parent.parent  # backend/
    
    # Model Configuration
    FLUX_MODEL_PATH: str = "black-forest-labs/FLUX.1-schnell"
    FLUX_QUANTIZED_TRANSFORMER: str = "Keffisor21/flux1-schnell-bnb-nf4"
    
    class Config:
        env_file = ".env"
        extra = "ignore"  # 정의되지 않은 환경변수는 무시
        # Pydantic V2에서 protected_namespaces 설정
        protected_namespaces = ()


settings = Settings()
