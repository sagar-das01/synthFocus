---
marp: true
theme: default
paginate: true
backgroundColor: #ffffff
style: |
  section {
    font-family: 'Inter', 'Helvetica Neue', sans-serif;
  }
  h1 {
    color: #4338ca;
  }
  h2 {
    color: #1e1b4b;
  }
---

# SynthFocus

## AI-Powered Synthetic Focus Groups

**Instant market research at a fraction of the cost.**

Replace weeks of recruitment and thousands in budget with a customizable AI agent swarm that debates, challenges, and analyzes your product concept in real-time.


---

# The Problem

## Traditional Market Research is Broken

- **Expensive**: A single focus group session costs $5,000 - $15,000
- **Slow**: 4-8 weeks to recruit, schedule, and conduct sessions
- **Limited diversity**: Geographic and demographic constraints
- **One-shot**: No ability to iterate and retest quickly
- **Rigid**: Fixed participant profiles — no way to target your exact audience

> Companies spend **$80B+ annually** on market research globally, yet 85% of new products still fail within the first year.

---

# The Solution

## Configurable AI Focus Groups in Minutes

Users define their own focus group by assigning agent roles:

1. **Configure agents** — Choose how many personas, define their roles (e.g. "Healthcare CTO", "Budget-conscious student"), backgrounds, and communication styles
2. **Toggle system agents** — Enable/disable Moderator, Devil's Advocate, and Analyst as needed
3. **Submit concept** — Paste your product idea, pitch, or feature spec
4. **Watch the debate** — Agents interact in real-time, challenging and building on each other's points
5. **Get the report** — Structured insights with sentiment analysis and actionable recommendations

**Key differentiator:** Users control the panel composition. Any number of personas, any roles, any demographic — tailored exactly to your target market.

---

# Customizable Agent Architecture

## User-Defined Roles & Configurable Swarm

| Agent Type | User Controls | Purpose |
|-----------|--------------|---------|
| **Personas** (N agents) | Name, role, background, values, pain points, communication style | Simulate your exact target audience |
| **Moderator** (toggle) | On/Off | Guides discussion, probes deeper |
| **Devil's Advocate** (toggle) | On/Off | Stress-tests ideas, finds weaknesses |
| **Analyst** (toggle) | On/Off | Observes silently, generates final report |

**Examples of custom personas:**
- "Senior DevOps Engineer, 15 years experience, hates vendor lock-in"
- "First-time founder, bootstrapped, obsessed with unit economics"
- "Non-technical HR director, manages 200 people, values compliance"

The graph dynamically adapts — 4 different topologies based on which system agents are enabled.

---

# Technology Stack

## Built on LangGraph for Multi-Agent Orchestration

```
START --> [Moderator] --> [N Personas] --> [Devil's Advocate] --> [Analyst]
              ^                                                       |
              |________________ (loop if topics remain) _____________|
```

| Layer | Technology |
|-------|-----------|
| Frontend | React, TypeScript, Tailwind CSS, Zustand |
| Backend | Python, FastAPI, LangGraph, WebSocket |
| LLM | Model-agnostic (GPT-4o, Claude, any OpenAI-compatible) |
| Deployment | Vercel (frontend) + Cloud (backend), Docker |

**Key technical innovations:**
- Dynamic graph compilation based on user's agent configuration
- Cyclic execution with analyst-controlled termination
- Real-time WebSocket streaming to browser
- Emergent behavior from agent-to-agent interaction

---

# Product Demo Flow

## What the User Experiences

**Step 1 — Configure:** Define custom personas with specific roles, backgrounds, and values. Toggle system agents on/off. Set discussion depth (2-8 rounds).

**Step 2 — Live Discussion:** Watch agents debate in real-time with color-coded messages and active speaker indicators. Each persona responds in-character based on their configured profile.

**Step 3 — Report:** Receive structured market research report:
- Executive Summary
- Key Findings and Sentiment Analysis
- Top Friction Points and Opportunities
- Actionable Recommendations

**Total time:** 3-5 minutes for a complete focus group session with custom audience.

---

# Market Opportunity & Valuation

## TAM / SAM / SOM

| Metric | Value |
|--------|-------|
| **TAM** (Global Market Research) | $80B |
| **SAM** (Qualitative Research + Concept Testing) | $12B |
| **SOM** (AI-first teams, startups, product teams) | $500M |

**Revenue Model:**
- **Free:** 2 sessions/month, 3 personas max
- **Pro ($49/mo):** Unlimited sessions, unlimited personas, PDF export
- **Team ($199/mo):** Shared workspace, API access, session history
- **Enterprise:** Custom pricing, SSO, dedicated models

**Unit Economics:** Cost per session ~$0.30 (LLM tokens), revenue per session ~$2.50. **Gross margin: 88%.**

**Projected ARR at scale:** $5M - $20M within 3 years.

---

# Competitive Landscape

## Why SynthFocus Wins

| Competitor | Approach | Weakness |
|-----------|----------|----------|
| **UserTesting** | Real humans, async video | $49+/response, weeks to schedule |
| **Maze** | Quantitative usability testing | No qualitative insights |
| **ChatGPT/Claude** | Single AI conversation | No group dynamics or debate |
| **Synthetic Users** | AI survey responses | No real-time interaction, no customization |

**SynthFocus moat:**
- **User-defined personas** — not a fixed panel, YOUR audience
- Multi-agent debate produces emergent insights a single LLM cannot
- Configurable topology (toggle agents on/off per session)
- Real-time streaming creates an engaging, shareable experience

---

# Future Roadmap

## Phase 1 (Q3 2026) — Platform Expansion
- AI-generated personas from audience description ("generate 8 fintech users")
- Session history and cross-session comparison
- PDF/Notion export, shareable report links
- Persona memory (agents recall prior sessions for continuity)

## Phase 2 (Q4 2026) — Enterprise Features
- Multimodal input: upload wireframes/screenshots for visual evaluation
- A/B concept testing (compare two product variants side-by-side)
- Integrations: Figma, Notion, Linear, Jira
- Team workspaces with shared insight libraries

## Phase 3 (2027) — Intelligence Layer
- Trend detection across thousands of sessions
- Industry persona packs (healthcare, fintech, gaming, B2B SaaS)
- Competitive intelligence agents (auto-research market landscape)
- Voice/audio mode (listen to the focus group as a podcast)

---

# Investment Case

## Why This is a Venture-Scale Opportunity

**Growth levers:**
- Viral loop: shareable focus group reports
- PLG motion: free tier with natural upgrade triggers
- API access enables embedded use cases (product tools, accelerators)

**Key milestones:**
- MVP: Complete and ready for deployment
- Beta: 100 users, validate retention and expansion revenue
- Seed target: $1.5M at $10M pre-money
- Series A triggers: 1,000 paying customers, $500K ARR

**Estimated valuation (Seed):** $8M - $15M pre-money based on AI SaaS multiples (15-30x forward ARR)


> "The best product decisions come from hearing diverse perspectives. SynthFocus makes that instant — with exactly the audience you choose."
