import hashlib

from langchain_core.messages import AIMessage, SystemMessage, HumanMessage

from app.agents.prompts import MODERATOR_SYSTEM, MODERATOR_INTRO
from app.agents.llm import get_llm
from app.models.state import FocusGroupState
from app.services.cache import make_cache_key, get_cached_response, set_cached_response


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

    # Cache the intro (round 0) for the same concept
    cached_content = None
    cache_key = None
    if state["round_number"] == 0:
        concept_hash = hashlib.sha256(state["concept"].strip().lower().encode()).hexdigest()[:16]
        cache_key = make_cache_key(state["concept"], "Moderator", concept_hash)
        cached_content = await get_cached_response(cache_key)

    if cached_content:
        content = cached_content
    else:
        response = await llm.ainvoke(messages)
        content = response.content
        if cache_key:
            await set_cached_response(cache_key, content, ttl=14400)

    return {
        "messages": [AIMessage(content=content, name="Moderator")],
        "round_number": state["round_number"] + 1,
    }
