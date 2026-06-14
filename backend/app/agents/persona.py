from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

from app.agents.prompts import PERSONA_SYSTEM
from app.agents.llm import get_llm
from app.models.state import FocusGroupState


def build_persona_prompt(persona: dict) -> str:
    return PERSONA_SYSTEM.format(
        name=persona["name"],
        age=persona.get("age", 30),
        role=persona.get("role", persona.get("archetype", "participant")),
        background=persona.get("background", ""),
        values=", ".join(persona.get("values", [])),
        pain_points=", ".join(persona.get("pain_points", [])),
        communication_style=persona.get("communication_style", "Direct and clear"),
    )


async def persona_round_node(state: FocusGroupState) -> dict:
    llm = get_llm()
    new_messages = []

    recent_messages = state["messages"][-15:]

    for persona in state["personas"]:
        system_prompt = build_persona_prompt(persona)

        conversation = [SystemMessage(content=system_prompt)]
        for msg in recent_messages:
            conversation.append(
                HumanMessage(content=f"[{msg.name or 'Unknown'}]: {msg.content}")
            )
        for msg in new_messages:
            conversation.append(
                HumanMessage(content=f"[{msg.name}]: {msg.content}")
            )
        conversation.append(
            HumanMessage(
                content="It's your turn to respond to the discussion. Stay in character."
            )
        )

        response = await llm.ainvoke(conversation)
        new_messages.append(
            AIMessage(content=response.content, name=persona["name"])
        )

    return {"messages": new_messages}
