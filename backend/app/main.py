import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.routes import router
from app.api.websocket import ws_router
from app.services.cache import get_redis

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="SynthFocus",
    description="AI-powered synthetic focus group platform",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(ws_router)


@app.get("/health")
async def health_check():
    redis_status = "not_configured"
    if settings.redis_url:
        try:
            r = await get_redis()
            if r:
                await r.ping()
                redis_status = "connected"
        except Exception:
            redis_status = "error"

    db_status = "not_configured"
    if settings.supabase_url:
        try:
            from app.services.database import get_supabase
            get_supabase()
            db_status = "connected"
        except Exception:
            db_status = "error"

    return {
        "status": "healthy",
        "service": "synthfocus",
        "redis": redis_status,
        "database": db_status,
    }
