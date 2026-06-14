# Architecture

## Overview

SynthFocus uses a multi-agent orchestration pattern built on LangGraph to simulate focus group discussions. The system is split into three layers:

1. **Presentation layer** — React SPA that streams discussion in real-time
2. **API layer** — FastAPI with REST + WebSocket endpoints
3. **Agent layer** — LangGraph StateGraph managing 8 concurrent agent roles

## Agent Graph Design

### State Schema

All agents share a single `FocusGroupState` TypedDict that flows through the graph:

```python
class FocusGroupState(TypedDict):
    messages: Annotated[list[BaseMessage], add_messages]  # Shared chat history
    concept: str                    # User's product concept
    current_topic: str              # Topic being discussed this round
    round_number: int               # Current round (incremented by moderator)
    max_rounds: int                 # Termination threshold
    topics_covered: list[str]       # Prevents repetition
    analysis_data: dict             # Running sentiment/theme data
    final_report: str | None        # Populated at end
    discussion_complete: bool       # Analyst sets this to trigger report
    next_speakers: list[str]        # Routing hints (future use)
    personas: list[dict]            # Persona configs for this session
```

The `messages` field uses LangGraph's `add_messages` reducer, which automatically appends new messages returned by nodes.

### Graph Topology

```
Entry Point: moderator

Edges:
  moderator       --> persona_round
  persona_round   --> devil_advocate
  devil_advocate  --> analyst_check
  analyst_check   --> moderator       (conditional: discussion_complete == False)
  analyst_check   --> analyst_report  (conditional: discussion_complete == True)
  analyst_report  --> END
```

The conditional edge after `analyst_check` creates the cyclic behavior — the graph loops through discussion rounds until the analyst determines sufficient coverage or `max_rounds` is reached.

### Node Responsibilities

| Node | Input | Output | Side Effects |
|------|-------|--------|--------------|
| `moderator` | Full state | 1 AI message, incremented round_number | Sets discussion direction |
| `persona_round` | Recent messages + all persona configs | 5 AI messages (one per persona) | — |
| `devil_advocate` | Last 10 messages | 1 AI message challenging claims | — |
| `analyst_check` | Full message history + analysis_data | Updated topics_covered, current_topic, discussion_complete | Decides graph termination |
| `analyst_report` | Full message history + concept | final_report string + 1 AI message | Ends the session |

## Streaming Architecture

### Data Flow

```
LangGraph.astream_events() --> streaming.py --> WebSocket --> React Store --> UI
```

1. `astream_events(version="v2")` yields fine-grained events for every node and LLM call
2. `streaming.py` filters relevant events (`on_chain_start`, `on_chain_end`, `on_chat_model_stream`)
3. Events are serialized to JSON and pushed through the WebSocket
4. The React `useWebSocket` hook parses messages and dispatches to the Zustand store
5. Components re-render reactively as store state updates

### Event Types

| LangGraph Event | Maps To | Frontend Behavior |
|----------------|---------|-------------------|
| `on_chain_start` (node) | `node_start` | Update active speaker indicator |
| `on_chain_end` (node) | `agent_message` | Add complete message bubble |
| `on_chat_model_stream` | `stream_token` | Typewriter effect (optional) |

## Session Lifecycle

```
[idle] --> POST /api/sessions --> [pending]
       --> WS connect /ws/sessions/:id --> [running]
       --> graph completes --> [complete]
       --> graph error --> [error]
```

Sessions are stored in-memory (`SessionStore` dict). For production, this should be replaced with Redis or PostgreSQL for persistence across restarts.

## LLM Provider Abstraction

The `get_llm()` factory in `app/agents/llm.py` returns a LangChain `BaseChatModel` based on configuration:

- **OpenAI path**: Uses `ChatOpenAI` with optional custom `base_url` and `Referer` header (for gateway proxies that require it)
- **Anthropic path**: Uses `ChatAnthropic` with optional custom `base_url` for proxied endpoints

All agents call `get_llm()` at invocation time, so model changes take effect without restart when using `--reload`.

## Error Handling

- LLM failures are caught at the graph level in `streaming.py` and forwarded to the client as `error` WebSocket messages
- WebSocket disconnects are logged but don't crash the server
- The session status is set to `"error"` on failure, allowing the frontend to display appropriate UI

## Scaling Considerations

| Concern | Current (MVP) | Production Path |
|---------|---------------|-----------------|
| Session storage | In-memory dict | Redis / PostgreSQL |
| Concurrent sessions | Limited by single process | Celery workers or async task queue |
| Token budget | Full history passed each call | Summarization of prior rounds |
| WebSocket connections | Direct uvicorn | Redis pub/sub + connection pooling |
| Rate limiting | None | Per-user rate limits via middleware |
