import hashlib
import json

from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

from app.agents.prompts import PERSONA_SYSTEM
from app.agents.llm import get_llm
from app.models.state import FocusGroupState
from app.services.cache import make_cache_key, get_cached_response, set_cached_response


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

        # Check cache for round 1 responses
        cached_content = None
        cache_key = None
        if state["round_number"] == 1:
            context_hash = hashlib.sha256(
                json.dumps([m.content for m in recent_messages[-3:]], default=str).encode()
            ).hexdigest()[:16]
            cache_key = make_cache_key(state["concept"], persona["name"], context_hash)
            cached_content = await get_cached_response(cache_key)

        if cached_content:
            new_messages.append(AIMessage(content=cached_content, name=persona["name"]))
        else:
            response = await llm.ainvoke(conversation)
            new_messages.append(
                AIMessage(content=response.content, name=persona["name"])
            )
            if cache_key:
                await set_cached_response(cache_key, response.content, ttl=7200)

    return {"messages": new_messages}
