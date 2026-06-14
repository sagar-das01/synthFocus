from typing import Annotated, TypedDict
from langgraph.graph import add_messages
from langchain_core.messages import BaseMessage


class FocusGroupState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]
    concept: str
    current_topic: str
    round_number: int
    max_rounds: int
    topics_covered: list[str]
    analysis_data: dict
    final_report: str | None
    discussion_complete: bool
    next_speakers: list[str]
    personas: list[dict]
    include_devil_advocate: bool
    include_analyst: bool
