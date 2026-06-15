import hashlib
import json
import logging

import redis.asyncio as aioredis

from app.config import settings

logger = logging.getLogger(__name__)

_redis_client: aioredis.Redis | None = None


async def get_redis() -> aioredis.Redis | None:
    global _redis_client
    if not settings.redis_url:
        return None
    if _redis_client is None:
        _redis_client = aioredis.from_url(
            settings.redis_url,
            decode_responses=True,
        )
    return _redis_client


def make_cache_key(concept: str, agent: str, context_hash: str) -> str:
    raw = f"{concept}|{agent}|{context_hash}"
    return f"synthfocus:llm:{hashlib.sha256(raw.encode()).hexdigest()[:32]}"


async def get_cached_response(key: str) -> str | None:
    r = await get_redis()
    if r is None:
        return None
    try:
        return await r.get(key)
    except Exception as e:
        logger.warning(f"Redis get error: {e}")
        return None


async def set_cached_response(key: str, response: str, ttl: int = 3600) -> None:
    r = await get_redis()
    if r is None:
        return
    try:
        await r.set(key, response, ex=ttl)
    except Exception as e:
        logger.warning(f"Redis set error: {e}")
