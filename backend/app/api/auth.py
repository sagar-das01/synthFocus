import logging

from fastapi import Depends, HTTPException, Request, WebSocket
from jose import jwt, JWTError

from app.config import settings
from app.services.database import get_supabase

logger = logging.getLogger(__name__)


async def get_current_user(request: Request) -> dict:
    auth_header = request.headers.get("Authorization", "")
    if not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = auth_header[7:]
    return _decode_token(token)


async def get_current_user_ws(websocket: WebSocket) -> dict | None:
    token = websocket.query_params.get("token")
    if not token:
        return None
    try:
        return _decode_token(token)
    except HTTPException:
        return None


def _decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.supabase_jwt_secret,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return {"user_id": payload["sub"], "email": payload.get("email", "")}
    except JWTError as e:
        logger.warning(f"JWT decode error: {e}")
        raise HTTPException(status_code=401, detail="Invalid token")


async def require_admin(user: dict = Depends(get_current_user)) -> dict:
    supabase = get_supabase()
    result = supabase.table("profiles").select("role").eq("id", user["user_id"]).single().execute()
    if not result.data or result.data.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user
