import logging

from app.services.database import get_supabase

logger = logging.getLogger(__name__)


class MessageStore:
    def save_message(self, session_id: str, msg_type: str, agent: str,
                     content: str, node: str | None = None) -> None:
        try:
            supabase = get_supabase()
            supabase.table("messages").insert({
                "session_id": session_id,
                "type": msg_type,
                "agent": agent,
                "content": content,
                "node": node or "",
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to save message: {e}")

    def get_messages(self, session_id: str) -> list[dict]:
        try:
            supabase = get_supabase()
            result = supabase.table("messages").select("*").eq(
                "session_id", session_id
            ).order("created_at").execute()
            return result.data or []
        except Exception as e:
            logger.warning(f"Failed to get messages: {e}")
            return []


message_store = MessageStore()
