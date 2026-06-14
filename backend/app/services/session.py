import uuid
from dataclasses import dataclass, field


@dataclass
class Session:
    session_id: str
    concept: str
    status: str = "pending"
    personas: list[dict] = field(default_factory=list)
    include_moderator: bool = True
    include_devil_advocate: bool = True
    include_analyst: bool = True
    max_rounds: int = 5
    final_report: str | None = None


class SessionStore:
    def __init__(self):
        self._sessions: dict[str, Session] = {}

    def create(
        self,
        concept: str,
        personas: list[dict],
        max_rounds: int,
        include_moderator: bool = True,
        include_devil_advocate: bool = True,
        include_analyst: bool = True,
    ) -> Session:
        session_id = str(uuid.uuid4())
        session = Session(
            session_id=session_id,
            concept=concept,
            personas=personas,
            include_moderator=include_moderator,
            include_devil_advocate=include_devil_advocate,
            include_analyst=include_analyst,
            max_rounds=max_rounds,
        )
        self._sessions[session_id] = session
        return session

    def get(self, session_id: str) -> Session | None:
        return self._sessions.get(session_id)

    def list_all(self) -> list[Session]:
        return list(self._sessions.values())

    def update_status(self, session_id: str, status: str) -> None:
        session = self._sessions.get(session_id)
        if session:
            session.status = status

    def set_report(self, session_id: str, report: str) -> None:
        session = self._sessions.get(session_id)
        if session:
            session.final_report = report
            session.status = "complete"


session_store = SessionStore()
