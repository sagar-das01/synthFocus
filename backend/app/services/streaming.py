import json
import logging
import traceback
from datetime import datetime, timezone

from fastapi import WebSocket

from app.agents.graph import create_focus_group_graph
from app.models.state import FocusGroupState
from app.services.session import session_store

logger = logging.getLogger(__name__)


async def send_ws_message(websocket: WebSocket, data: dict) -> bool:
    try:
        await websocket.send_text(json.dumps(data))
        return True
    except Exception:
        return False


async def stream_focus_group(websocket: WebSocket, session_id: str) -> None:
    session = session_store.get(session_id)
    if not session:
        await send_ws_message(websocket, {"type": "error", "content": "Session not found"})
        return

    session_store.update_status(session_id, "running")

    graph = create_focus_group_graph(
        include_devil_advocate=session.include_devil_advocate,
        include_analyst=session.include_analyst,
    )

    initial_state: FocusGroupState = {
        "messages": [],
        "concept": session.concept,
        "current_topic": "initial reactions and first impressions",
        "round_number": 0,
        "max_rounds": session.max_rounds,
        "topics_covered": [],
        "analysis_data": {},
        "final_report": None,
        "discussion_complete": False,
        "next_speakers": [],
        "personas": session.personas,
        "include_devil_advocate": session.include_devil_advocate,
        "include_analyst": session.include_analyst,
    }

    await send_ws_message(websocket, {
        "type": "status",
        "content": "Focus group starting...",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    logger.info(f"Starting graph execution for session {session_id}")

    current_node = None

    try:
        async for event in graph.astream_events(initial_state, version="v2"):
            kind = event.get("event")

            if kind == "on_chain_start":
                node_name = event.get("name", "")
                if node_name in ("moderator", "persona_round", "devil_advocate", "analyst_check", "analyst_report", "check_rounds"):
                    current_node = node_name
                    await send_ws_message(websocket, {
                        "type": "node_start",
                        "node": current_node,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

            elif kind == "on_chain_end":
                node_name = event.get("name", "")
                if node_name in ("moderator", "persona_round", "devil_advocate", "analyst_check", "analyst_report", "check_rounds"):
                    output = event.get("data", {}).get("output", {})
                    messages = output.get("messages", [])

                    for msg in messages:
                        agent_name = getattr(msg, "name", None) or current_node or "Unknown"
                        await send_ws_message(websocket, {
                            "type": "agent_message",
                            "agent": agent_name,
                            "content": msg.content,
                            "node": node_name,
                            "timestamp": datetime.now(timezone.utc).isoformat(),
                        })

                    if node_name == "analyst_report":
                        report = output.get("final_report", "")
                        if report:
                            session_store.set_report(session_id, report)
                            await send_ws_message(websocket, {
                                "type": "report",
                                "content": report,
                                "timestamp": datetime.now(timezone.utc).isoformat(),
                            })

            elif kind == "on_chat_model_stream":
                chunk = event.get("data", {}).get("chunk")
                if chunk and hasattr(chunk, "content") and chunk.content:
                    await send_ws_message(websocket, {
                        "type": "stream_token",
                        "content": chunk.content,
                        "node": current_node,
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                    })

    except Exception as e:
        logger.error(f"Graph execution error for session {session_id}: {e}\n{traceback.format_exc()}")
        await send_ws_message(websocket, {
            "type": "error",
            "content": f"Agent error: {str(e)}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        session_store.update_status(session_id, "error")
        return

    session_store.update_status(session_id, "complete")
    await send_ws_message(websocket, {
        "type": "status",
        "content": "Focus group complete",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })
