from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

from app.agents.prompts import DEVIL_ADVOCATE_SYSTEM
from app.agents.llm import get_llm
from app.models.state import FocusGroupState


async def devil_advocate_node(state: FocusGroupState) -> dict:
    llm = get_llm()

    recent_messages = state["messages"][-10:]

    conversation = [SystemMessage(content=DEVIL_ADVOCATE_SYSTEM)]
    for msg in recent_messages:
        conversation.append(
            HumanMessage(content=f"[{msg.name or 'Unknown'}]: {msg.content}")
        )
    conversation.append(
        HumanMessage(
            content="Challenge the group's responses. Find weaknesses in their reasoning or the product concept."
        )
    )

    response = await llm.ainvoke(conversation)

    return {
        "messages": [AIMessage(content=response.content, name="Devil's Advocate")]
    }
