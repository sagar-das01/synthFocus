# Deployment Guide

## Local Development

### Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
cp .env.example .env
# Configure .env

uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` and `/ws` to `localhost:8000` automatically.

## Docker (Staging / Production)

### Build and Run

```bash
# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with production credentials

# Build and start
docker-compose up --build -d

# View logs
docker-compose logs -f
```

The stack exposes:
- Port 80: nginx (serves frontend + proxies API/WebSocket)
- Port 8000: backend (direct access, optional)

### Architecture

```
Client --> nginx:80 --> /api/* --> backend:8000 (FastAPI)
                    --> /ws/*  --> backend:8000 (WebSocket)
                    --> /*     --> static files (React build)
```

### Health Check

```bash
curl http://localhost/api/health
# {"status": "healthy", "service": "synthfocus"}
```

## Environment Variables

Create `backend/.env` with:

```env
OPENAI_API_KEY=your-key
OPENAI_BASE_URL=https://api.openai.com/v1
LLM_PROVIDER=openai
LLM_MODEL=gpt-4o
MAX_ROUNDS=5
CORS_ORIGINS=http://localhost,http://your-domain.com
```

For Anthropic:
```env
ANTHROPIC_BEARER_TOKEN=your-key
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514
```

## Production Checklist

- [ ] Set strong, unique API keys
- [ ] Configure `CORS_ORIGINS` to only allow your domain
- [ ] Add rate limiting middleware to FastAPI
- [ ] Move session storage to Redis/PostgreSQL
- [ ] Add authentication (API keys or OAuth)
- [ ] Set up log aggregation (stdout → CloudWatch/Datadog)
- [ ] Configure SSL termination (nginx or load balancer)
- [ ] Set resource limits in docker-compose (memory, CPU)
- [ ] Add monitoring/alerting on `/health` endpoint

## CI/CD

Suggested pipeline (GitHub Actions):

```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: cd backend && pip install -e ".[dev]" && pytest
      - run: cd frontend && npm ci && npx tsc --noEmit

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker-compose build
      - run: docker-compose push  # to your registry
      # Deploy to your hosting (ECS, GKE, Railway, Fly.io, etc.)
```
