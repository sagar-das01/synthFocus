import uuid
import logging
from dataclasses import dataclass, field

from app.services.database import get_supabase

logger = logging.getLogger(__name__)


@dataclass
class Session:
    session_id: str
    user_id: str
    concept: str
    status: str = "pending"
    personas: list[dict] = field(default_factory=list)
    include_moderator: bool = True
    include_devil_advocate: bool = True
    include_analyst: bool = True
    max_rounds: int = 5
    final_report: str | None = None


class SessionStore:
    def create(
        self,
        user_id: str,
        concept: str,
        personas: list[dict],
        max_rounds: int,
        include_moderator: bool = True,
        include_devil_advocate: bool = True,
        include_analyst: bool = True,
    ) -> Session:
        session_id = str(uuid.uuid4())
        supabase = get_supabase()
        supabase.table("sessions").insert({
            "id": session_id,
            "user_id": user_id,
            "concept": concept,
            "status": "pending",
            "personas": personas,
            "include_moderator": include_moderator,
            "include_devil_advocate": include_devil_advocate,
            "include_analyst": include_analyst,
            "max_rounds": max_rounds,
        }).execute()
        return Session(
            session_id=session_id,
            user_id=user_id,
            concept=concept,
            personas=personas,
            include_moderator=include_moderator,
            include_devil_advocate=include_devil_advocate,
            include_analyst=include_analyst,
            max_rounds=max_rounds,
        )

    def get(self, session_id: str) -> Session | None:
        supabase = get_supabase()
        result = supabase.table("sessions").select("*").eq("id", session_id).single().execute()
        if not result.data:
            return None
        return self._row_to_session(result.data)

    def list_for_user(self, user_id: str) -> list[Session]:
        supabase = get_supabase()
        result = supabase.table("sessions").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).execute()
        return [self._row_to_session(row) for row in (result.data or [])]

    def update_status(self, session_id: str, status: str) -> None:
        try:
            supabase = get_supabase()
            supabase.table("sessions").update({"status": status}).eq("id", session_id).execute()
        except Exception as e:
            logger.warning(f"Failed to update session status: {e}")

    def set_report(self, session_id: str, report: str) -> None:
        try:
            supabase = get_supabase()
            supabase.table("sessions").update({
                "final_report": report,
                "status": "complete",
            }).eq("id", session_id).execute()
        except Exception as e:
            logger.warning(f"Failed to save report: {e}")

    def _row_to_session(self, row: dict) -> Session:
        return Session(
            session_id=row["id"],
            user_id=row["user_id"],
            concept=row["concept"],
            status=row["status"],
            personas=row.get("personas", []),
            include_moderator=row.get("include_moderator", True),
            include_devil_advocate=row.get("include_devil_advocate", True),
            include_analyst=row.get("include_analyst", True),
            max_rounds=row.get("max_rounds", 5),
            final_report=row.get("final_report"),
        )


session_store = SessionStore()
