import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    CORS_ORIGINS: list = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")


settings = Settings()

if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
    print("⚠️  WARNING: SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set. Check your .env file.")

if not settings.GEMINI_API_KEY:
    print("⚠️  WARNING: GEMINI_API_KEY not set. AI recipe generation will fail until it is.")
