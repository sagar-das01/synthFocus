import logging
import traceback

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.services.streaming import stream_focus_group

logger = logging.getLogger(__name__)

ws_router = APIRouter()


@ws_router.websocket("/ws/sessions/{session_id}")
async def websocket_session(websocket: WebSocket, session_id: str):
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
