# SynthFocus

**AI-powered synthetic focus groups.** Get instant market research feedback from diverse AI personas that debate, challenge, and react to your product concepts in real-time.

Instead of spending thousands of dollars and weeks recruiting human focus groups, SynthFocus deploys a swarm of 8 AI agents that simulate realistic group dynamics — complete with disagreements, opinion shifts, and emergent insights.

## Features

- **Multi-agent debate**: 8 specialized agents interact with each other, not just the product
- **Real-time streaming**: Watch the discussion unfold live via WebSocket
- **Cyclic discussion**: Analyst agent ensures all key topics are covered before generating a report
- **Structured output**: Executive summary, sentiment analysis, friction points, and actionable recommendations
- **Customizable personas**: Swap in your own target demographic profiles
- **Model-agnostic**: Works with GPT-4o, Claude, or any OpenAI-compatible API

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- An OpenAI API key (or compatible gateway)

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .

cp .env.example .env
# Edit .env — set OPENAI_API_KEY and LLM_MODEL at minimum

uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

### 3. Open the App

Navigate to http://localhost:5173. The frontend proxies `/api` and `/ws` requests to the backend automatically.

## Docker Deployment

### Production / Staging

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

docker-compose up --build
```

Access at http://localhost (port 80). The nginx container handles routing, proxying API/WebSocket traffic to the backend.

### Development (hot-reload)

```bash
docker-compose -f docker-compose.dev.yml up --build
# Backend reloads on file changes

# In a separate terminal:
cd frontend && npm run dev
```

## Architecture

```
                          +------------------+
                          |   React Frontend |
                          |  (Vite + Tailwind)|
                          +--------+---------+
                                   |
                            WebSocket / REST
                                   |
                          +--------+---------+
                          |   FastAPI Backend |
                          +--------+---------+
                                   |
                          +--------+---------+
                          |  LangGraph Engine |
                          +--------+---------+
                                   |
              +--------------------+--------------------+
              |         |          |          |         |
         Moderator  Personas  Devil's    Analyst    Analyst
                    (5 agents) Advocate   (check)   (report)
```

### Agent Flow

```
START --> [Moderator] --> [Persona Round (5)] --> [Devil's Advocate] --> [Analyst Check]
              ^                                                               |
              |__________________ loop if topics remain ______________________|
                                                                              |
                                                          [Analyst Report] --> END
```

Each round consists of:
1. **Moderator** poses a focused question
2. **5 Personas** respond in character, reacting to each other
3. **Devil's Advocate** challenges the weakest claims
4. **Analyst** evaluates topic coverage and decides: loop back or generate final report

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Zustand |
| Backend | Python 3.11+, FastAPI, Pydantic |
| Agent Orchestration | LangGraph (StateGraph with conditional edges) |
| LLM | OpenAI GPT-4o (configurable) |
| Streaming | WebSocket (bidirectional) |
| Deployment | Docker, nginx, docker-compose |

## Project Structure

```
synthFocus/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry point
│   │   ├── config.py            # Environment-based configuration
│   │   ├── agents/
│   │   │   ├── graph.py         # LangGraph StateGraph definition
│   │   │   ├── llm.py          # LLM provider factory
│   │   │   ├── moderator.py    # Moderator agent node
│   │   │   ├── persona.py      # Persona round node (all 5 personas)
│   │   │   ├── devil_advocate.py # Devil's Advocate node
│   │   │   ├── analyst.py      # Analyst check + report nodes
│   │   │   └── prompts.py      # All system prompts
│   │   ├── api/
│   │   │   ├── routes.py       # REST: POST /api/sessions, GET /api/sessions/:id
│   │   │   └── websocket.py    # WS: /ws/sessions/:id
│   │   ├── models/
│   │   │   ├── state.py        # FocusGroupState TypedDict
│   │   │   └── schemas.py      # Pydantic request/response models
│   │   ├── services/
│   │   │   ├── session.py      # In-memory session store
│   │   │   └── streaming.py    # Graph execution → WebSocket bridge
│   │   └── utils/
│   │       └── personas.py     # Default persona configurations
│   ├── pyproject.toml
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.tsx             # Root component (routing between views)
│   │   ├── components/
│   │   │   ├── ConceptUpload.tsx    # Product concept input form
│   │   │   ├── DiscussionPanel.tsx  # Live message feed
│   │   │   ├── MessageBubble.tsx    # Color-coded agent message
│   │   │   ├── ParticipantSidebar.tsx # Agent roster + active indicator
│   │   │   ├── ReportView.tsx       # Final report (markdown rendered)
│   │   │   └── SessionControls.tsx  # Status bar
│   │   ├── hooks/useWebSocket.ts    # WebSocket lifecycle management
│   │   ├── stores/sessionStore.ts   # Zustand state store
│   │   ├── types/index.ts          # TypeScript interfaces
│   │   └── utils/api.ts            # REST API client
│   ├── package.json
│   ├── Dockerfile
│   └── vite.config.ts
├── docs/
│   └── presentation.md        # 10-page Marp pitch deck
├── docker-compose.yml          # Production deployment
├── docker-compose.dev.yml      # Development with hot-reload
└── README.md
```

## API Reference

### REST Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/sessions` | Create a new focus group session |
| `GET` | `/api/sessions` | List all sessions |
| `GET` | `/api/sessions/:id` | Get session status |
| `GET` | `/api/sessions/:id/report` | Get the final report |
| `GET` | `/health` | Health check |

### Create Session

```bash
curl -X POST http://localhost:8000/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"concept": "A fitness app that uses AI to...", "max_rounds": 5}'
```

Response:
```json
{
  "session_id": "uuid-here",
  "status": "pending",
  "concept": "A fitness app that uses AI to..."
}
```

### WebSocket

Connect to `ws://localhost:8000/ws/sessions/{session_id}` after creating a session.

**Server messages:**

| Type | Description |
|------|-------------|
| `status` | Session lifecycle events |
| `node_start` | Agent node began execution |
| `agent_message` | Complete message from an agent |
| `stream_token` | Incremental token (for typewriter effect) |
| `report` | Final analyst report |
| `error` | Error message |

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENAI_API_KEY` | — | OpenAI API key or compatible gateway token |
| `OPENAI_BASE_URL` | — | Custom base URL for OpenAI-compatible APIs |
| `ANTHROPIC_BEARER_TOKEN` | — | Anthropic API key (if using `anthropic` provider) |
| `ANTHROPIC_ENDPOINT_URL_BEDROCK_RUNTIME` | — | Custom Anthropic endpoint URL |
| `LLM_PROVIDER` | `anthropic` | `anthropic` or `openai` |
| `LLM_MODEL` | `claude-sonnet-4-20250514` | Model identifier |
| `MAX_ROUNDS` | `5` | Default max discussion rounds |
| `CORS_ORIGINS` | `http://localhost:5173` | Comma-separated allowed origins |

## Default Personas

| Name | Archetype | Focus |
|------|-----------|-------|
| Jordan | Tech-savvy Gen-Z Student | Innovation, aesthetics, social features |
| Maria | Budget-conscious Working Parent | Value, simplicity, time-saving |
| Derek | Skeptical Industry Veteran | Execution, differentiation, business model |
| Priya | Accessibility-focused Designer | Inclusive design, edge cases, UX |
| Marcus | Early-adopter Entrepreneur | Market timing, growth potential, monetization |

Personas are fully customizable — pass a `personas` array in the session creation request to override defaults.

## Development

### Running Tests

```bash
cd backend
source .venv/bin/activate
pytest
```

### Type Checking (Frontend)

```bash
cd frontend
npx tsc --noEmit
```

### Building for Production

```bash
# Frontend
cd frontend && npm run build

# Backend (Docker)
cd backend && docker build -t synthfocus-backend .
```

## License

MIT
