import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.config import settings
from server.routers import (
    auth_router,
    resume_router,
    career_router,
    learning_router,
    assessment_router,
    posts_router,
    tutor_router,
    skills_router
)

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("careerbot_server")

app = FastAPI(
    title="CareerBot AI Backend",
    description="Multi-Agent Personalized Career Development & Adaptive Learning Platform",
    version="1.0.0"
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(auth_router.router)
app.include_router(resume_router.router)
app.include_router(career_router.router)
app.include_router(learning_router.router)
app.include_router(assessment_router.router)
app.include_router(posts_router.router)
app.include_router(tutor_router.router)
app.include_router(skills_router.router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "CareerBot AI Backend",
        "nvidia_model": settings.nvidia_model,
        "gemini_model": settings.gemini_model,
        "supabase_connected": bool(settings.supabase_url)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server.main:app", host=settings.host, port=settings.port, reload=True)
