import logging
import traceback

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.auth import get_current_user_ws
from app.services.streaming import stream_focus_group

logger = logging.getLogger(__name__)

ws_router = APIRouter()


@ws_router.websocket("/ws/sessions/{session_id}")
async def websocket_session(websocket: WebSocket, session_id: str):
    user = await get_current_user_ws(websocket)
    if not user:
        await websocket.close(code=4001, reason="Unauthorized")
        return

    await websocket.accept()
    try:
        await stream_focus_group(websocket, session_id)
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}\n{traceback.format_exc()}")
        try:
            await websocket.send_json({"type": "error", "content": str(e)})
        except Exception:
            pass
