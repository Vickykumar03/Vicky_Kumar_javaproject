import os
from pathlib import Path
from typing import List

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings:
    PROJECT_NAME: str = "GramSaksham"
    PROJECT_TAGLINE: str = "Your Voice. Your Rights. Accountable Governance."
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api/v1"
    
    # Pilot region
    PILOT_STATE: str = "Jharkhand"
    PILOT_DISTRICT: str = "Seraikela-Kharsawan"
    PILOT_BLOCK: str = "Chandil"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "gramsaksham-super-secret-production-key-jharkhand-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"sqlite:///{BASE_DIR / 'gramsaksham.db'}"
    )
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Uploads
    UPLOAD_DIR: Path = BASE_DIR / "uploads"

settings = Settings()
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
