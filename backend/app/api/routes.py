from fastapi import APIRouter, HTTPException

from app.models.schemas import (
    SessionCreate,
    SessionResponse,
    SessionListResponse,
    ReportResponse,
)
from app.services.session import session_store
from app.utils.personas import DEFAULT_PERSONAS, persona_config_to_dict

router = APIRouter(prefix="/api")


@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: SessionCreate):
    if request.personas:
        personas = [persona_config_to_dict(p) for p in request.personas]
    else:
        personas = DEFAULT_PERSONAS

    session = session_store.create(
        concept=request.concept,
        personas=personas,
        max_rounds=request.max_rounds,
        include_moderator=request.include_moderator,
        include_devil_advocate=request.include_devil_advocate,
        include_analyst=request.include_analyst,
    )
    return SessionResponse(
        session_id=session.session_id,
        status=session.status,
        concept=session.concept,
        persona_count=len(personas),
    )


@router.get("/sessions", response_model=SessionListResponse)
async def list_sessions():
    sessions = session_store.list_all()
    return SessionListResponse(
        sessions=[
            SessionResponse(
                session_id=s.session_id,
                status=s.status,
                concept=s.concept,
                persona_count=len(s.personas),
            )
            for s in sessions
        ]
    )


@router.get("/sessions/{session_id}", response_model=SessionResponse)
async def get_session(session_id: str):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return SessionResponse(
        session_id=session.session_id,
        status=session.status,
        concept=session.concept,
        persona_count=len(session.personas),
    )


@router.get("/sessions/{session_id}/report", response_model=ReportResponse)
async def get_report(session_id: str):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return ReportResponse(
        session_id=session.session_id,
        report=session.final_report,
        status=session.status,
    )
