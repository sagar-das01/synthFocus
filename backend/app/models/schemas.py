from pydantic import BaseModel, Field


class PersonaConfig(BaseModel):
    name: str = Field(..., description="Display name for this agent")
    role: str = Field(..., description="Role/archetype description")
    background: str = Field(default="", description="Background context for the persona")
    values: list[str] = Field(default_factory=list, description="What this persona values")
    pain_points: list[str] = Field(default_factory=list, description="What frustrates this persona")
    communication_style: str = Field(default="", description="How this persona communicates")


class SessionCreate(BaseModel):
    concept: str
    personas: list[PersonaConfig] | None = None
    include_moderator: bool = True
    include_devil_advocate: bool = True
    include_analyst: bool = True
    max_rounds: int = 5


class SessionResponse(BaseModel):
    session_id: str
    status: str
    concept: str
    persona_count: int


class SessionListResponse(BaseModel):
    sessions: list[SessionResponse]


class ReportResponse(BaseModel):
    session_id: str
    report: str | None
    status: str
