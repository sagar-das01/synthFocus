from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

from app.agents.prompts import MODERATOR_SYSTEM, MODERATOR_INTRO
from app.agents.llm import get_llm
from app.models.state import FocusGroupState


async def moderator_node(state: FocusGroupState) -> dict:
    llm = get_llm()

    if state["round_number"] == 0:
        system_prompt = MODERATOR_INTRO.format(concept=state["concept"])
    else:
        system_prompt = MODERATOR_SYSTEM.format(
            topics_covered=", ".join(state["topics_covered"]) or "none yet",
            current_topic=state["current_topic"],
            round_number=state["round_number"],
            max_rounds=state["max_rounds"],
        )

    messages = [SystemMessage(content=system_prompt)]
    if state["round_number"] > 0:
        messages.append(
            HumanMessage(
                content=f"The group has discussed: {', '.join(state['topics_covered'])}. "
                f"Now guide the discussion toward: {state['current_topic']}"
            )
        )

    response = await llm.ainvoke(messages)

    return {
        "messages": [AIMessage(content=response.content, name="Moderator")],
        "round_number": state["round_number"] + 1,
    }
