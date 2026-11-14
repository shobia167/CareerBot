import os
from pathlib import Path
from pydantic import BaseModel

# Base directory
BASE_DIR = Path(__file__).resolve().parent

# Load local .env if present
env_path = BASE_DIR / ".env"
if env_path.exists():
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ.setdefault(key.strip(), val.strip().strip('"').strip("'"))

class Settings(BaseModel):
    # Supabase Configuration
    supabase_url: str = os.getenv("SUPABASE_URL", "https://bpnmitbdymvpdaztbhnc.supabase.co")
    supabase_anon_key: str = os.getenv(
        "SUPABASE_ANON_KEY",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwbm1pdGJkeW12cGRhenRiaG5jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NzMyMjIsImV4cCI6MjA3ODM0OTIyMn0.FvgQaLrp9thXLDIAojcUg-wU1sL3PicDp8KfoF9RReY"
    )
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    # NVIDIA Nemotron AI API Configuration
    nvidia_api_key: str = os.getenv("NVIDIA_API_KEY", "")
    nvidia_base_url: str = "https://integrate.api.nvidia.com/v1"
    nvidia_model: str = "nvidia/nemotron-3.5-lightning-30b-a3b"

    # Google Gemini AI API Configuration
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    gemini_model: str = "gemini-2.5-flash"

    # Server settings
    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
