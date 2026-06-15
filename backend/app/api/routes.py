from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from app.api.auth import get_current_user, require_admin
from app.models.schemas import (
    SessionCreate,
    SessionResponse,
    SessionListResponse,
    ReportResponse,
)
from app.services.session import session_store
from app.services.message_store import message_store
from app.services.pdf_generator import generate_report_pdf
from app.utils.personas import DEFAULT_PERSONAS, persona_config_to_dict

router = APIRouter(prefix="/api")


@router.post("/sessions", response_model=SessionResponse)
async def create_session(request: SessionCreate, user: dict = Depends(get_current_user)):
    if request.personas:
        personas = [persona_config_to_dict(p) for p in request.personas]
    else:
        personas = DEFAULT_PERSONAS

    session = session_store.create(
        user_id=user["user_id"],
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
async def list_sessions(user: dict = Depends(get_current_user)):
    sessions = session_store.list_for_user(user["user_id"])
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
async def get_session(session_id: str, user: dict = Depends(get_current_user)):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return SessionResponse(
        session_id=session.session_id,
        status=session.status,
        concept=session.concept,
        persona_count=len(session.personas),
    )


@router.get("/sessions/{session_id}/messages")
async def get_session_messages(session_id: str, user: dict = Depends(get_current_user)):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    messages = message_store.get_messages(session_id)
    return {"session_id": session_id, "messages": messages}


@router.get("/sessions/{session_id}/report", response_model=ReportResponse)
async def get_report(session_id: str, user: dict = Depends(get_current_user)):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return ReportResponse(
        session_id=session.session_id,
        report=session.final_report,
        status=session.status,
    )


@router.get("/sessions/{session_id}/report/pdf")
async def export_report_pdf(session_id: str, user: dict = Depends(get_current_user)):
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.user_id != user["user_id"]:
        raise HTTPException(status_code=403, detail="Access denied")
    if not session.final_report:
        raise HTTPException(status_code=404, detail="Report not yet available")

    pdf_buffer = generate_report_pdf(session.concept, session.final_report)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=synthfocus-report-{session_id[:8]}.pdf"
        },
    )


@router.get("/admin/sessions", response_model=SessionListResponse)
async def admin_list_sessions(user: dict = Depends(require_admin)):
    from app.services.database import get_supabase
    supabase = get_supabase()
    result = supabase.table("sessions").select("*").order("created_at", desc=True).limit(100).execute()
    sessions = []
    for row in (result.data or []):
        sessions.append(SessionResponse(
            session_id=row["id"],
            status=row["status"],
            concept=row["concept"],
            persona_count=len(row.get("personas", [])),
        ))
    return SessionListResponse(sessions=sessions)
