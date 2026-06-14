import json

from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

from app.agents.prompts import ANALYST_CHECK_SYSTEM, ANALYST_REPORT_SYSTEM
from app.agents.llm import get_llm
from app.models.state import FocusGroupState


async def analyst_check_node(state: FocusGroupState) -> dict:
    llm = get_llm()

    all_messages_text = "\n".join(
        f"[{msg.name or 'Unknown'}]: {msg.content}" for msg in state["messages"]
    )

    conversation = [
        SystemMessage(content=ANALYST_CHECK_SYSTEM),
        HumanMessage(
            content=f"Here is the discussion so far:\n\n{all_messages_text}\n\n"
            f"Round {state['round_number']} of {state['max_rounds']}. "
            f"Topics already covered: {', '.join(state['topics_covered']) or 'none'}. "
            f"Analyze and respond with the JSON assessment."
        ),
    ]

    response = await llm.ainvoke(conversation)

    try:
        content = response.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1].rsplit("```", 1)[0]
        analysis = json.loads(content)
    except (json.JSONDecodeError, IndexError):
        analysis = {
            "topics_covered": state["topics_covered"],
            "topics_remaining": [],
            "next_topic": None,
            "should_continue": False,
            "sentiment_summary": {"positive": 0.5, "negative": 0.3, "neutral": 0.2},
        }

    topics_covered = list(
        set(state["topics_covered"] + analysis.get("topics_covered", []))
    )

    should_continue = (
        analysis.get("should_continue", False)
        and state["round_number"] < state["max_rounds"]
    )

    next_topic = analysis.get("next_topic", "general feedback")

    analysis_data = state.get("analysis_data", {})
    analysis_data[f"round_{state['round_number']}"] = analysis.get(
        "sentiment_summary", {}
    )

    return {
        "topics_covered": topics_covered,
        "current_topic": next_topic or "general feedback",
        "discussion_complete": not should_continue,
        "analysis_data": analysis_data,
    }


async def analyst_report_node(state: FocusGroupState) -> dict:
    llm = get_llm()

    all_messages_text = "\n".join(
        f"[{msg.name or 'Unknown'}]: {msg.content}" for msg in state["messages"]
    )

    conversation = [
        SystemMessage(content=ANALYST_REPORT_SYSTEM),
        HumanMessage(
            content=f"Product concept: {state['concept']}\n\n"
            f"Full discussion transcript:\n\n{all_messages_text}\n\n"
            f"Generate the final market research report."
        ),
    ]

    response = await llm.ainvoke(conversation)

    return {
        "final_report": response.content,
        "messages": [AIMessage(content=response.content, name="Analyst")],
    }
