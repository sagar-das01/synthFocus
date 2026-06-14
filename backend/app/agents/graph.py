from langgraph.graph import StateGraph, END

from app.models.state import FocusGroupState
from app.agents.moderator import moderator_node
from app.agents.persona import persona_round_node
from app.agents.devil_advocate import devil_advocate_node
from app.agents.analyst import analyst_check_node, analyst_report_node


def should_continue_or_report(state: FocusGroupState) -> str:
    if state.get("discussion_complete", False):
        return "analyst_report"
    return "moderator"


def after_personas(state: FocusGroupState) -> str:
    if state.get("include_devil_advocate", True):
        return "devil_advocate"
    if state.get("include_analyst", True):
        return "analyst_check"
    return "check_rounds"


def after_devil_advocate(state: FocusGroupState) -> str:
    if state.get("include_analyst", True):
        return "analyst_check"
    return "check_rounds"


def check_rounds_decision(state: FocusGroupState) -> str:
    if state["round_number"] >= state["max_rounds"]:
        return "end"
    return "moderator"


async def check_rounds_node(state: FocusGroupState) -> dict:
    """Simple round counter when analyst is disabled."""
    if state["round_number"] >= state["max_rounds"]:
        return {"discussion_complete": True}
    return {}


def create_focus_group_graph(
    include_devil_advocate: bool = True,
    include_analyst: bool = True,
) -> StateGraph:
    graph = StateGraph(FocusGroupState)

    graph.add_node("moderator", moderator_node)
    graph.add_node("persona_round", persona_round_node)

    if include_devil_advocate:
        graph.add_node("devil_advocate", devil_advocate_node)

    if include_analyst:
        graph.add_node("analyst_check", analyst_check_node)
        graph.add_node("analyst_report", analyst_report_node)
    else:
        graph.add_node("check_rounds", check_rounds_node)

    graph.set_entry_point("moderator")
    graph.add_edge("moderator", "persona_round")

    if include_devil_advocate and include_analyst:
        graph.add_edge("persona_round", "devil_advocate")
        graph.add_edge("devil_advocate", "analyst_check")
        graph.add_conditional_edges(
            "analyst_check",
            should_continue_or_report,
            {"moderator": "moderator", "analyst_report": "analyst_report"},
        )
        graph.add_edge("analyst_report", END)

    elif include_devil_advocate and not include_analyst:
        graph.add_edge("persona_round", "devil_advocate")
        graph.add_edge("devil_advocate", "check_rounds")
        graph.add_conditional_edges(
            "check_rounds",
            check_rounds_decision,
            {"moderator": "moderator", "end": END},
        )

    elif not include_devil_advocate and include_analyst:
        graph.add_edge("persona_round", "analyst_check")
        graph.add_conditional_edges(
            "analyst_check",
            should_continue_or_report,
            {"moderator": "moderator", "analyst_report": "analyst_report"},
        )
        graph.add_edge("analyst_report", END)

    else:
        graph.add_edge("persona_round", "check_rounds")
        graph.add_conditional_edges(
            "check_rounds",
            check_rounds_decision,
            {"moderator": "moderator", "end": END},
        )

    return graph.compile()
