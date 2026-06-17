# OSS Copilot — Open Source Contribution Recommender

> Enter a GitHub username → get AI-ranked, beginner-friendly issues matched to their exact skill stack.

---

## Architecture

```
oss-recommender/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── github.py          # GET /api/github/profile/:username
│   │   │   ├── issues.py          # POST /api/issues/search
│   │   │   └── recommendations.py # POST /api/recommendations/
│   │   ├── services/
│   │   │   ├── github_service.py       # GitHub REST API wrapper
│   │   │   └── recommendation_service.py # LLM ranking pipeline
│   │   ├── models/schemas.py
│   │   └── core/config.py
│   └── requirements.txt
└── frontend/
    └── src/
        ├── components/
        │   ├── SearchBar.jsx       # Username input
        │   ├── ProfileCard.jsx     # GitHub profile + language bar
        │   ├── IssueCard.jsx       # Issue with match score ring
        │   ├── FilterBar.jsx       # Difficulty/language/sort filters
        │   ├── LoadingTerminal.jsx # Animated terminal during fetch
        │   └── StatsSummary.jsx    # Summary stats + AI blurb
        └── App.jsx
```

---

## Pipeline

```
GitHub Username
      ↓
GitHub REST API → user profile + repos + language bytes
      ↓
Skill Level Inference (beginner / intermediate / advanced)
      ↓
GitHub Search API → "good first issue" + language filter
      ↓
Heuristic pre-scoring (language match, stars, labels)
      ↓
GPT-4o-mini → rank top 20, annotate each with:
  · match score (0–100)
  · difficulty estimate
  · time estimate
  · skills used / learned
  · contribution tips
      ↓
Sorted recommendations returned to frontend
```

---

## Quick Start

### Backend

```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Set OPENAI_API_KEY and optionally GITHUB_TOKEN
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# http://localhost:3000
```

---

## Key Config

| Variable | Notes |
|----------|-------|
| `GITHUB_TOKEN` | Optional but strongly recommended. Raises rate limit to 5,000 req/hr |
| `LLM_PROVIDER` | `openai` (default) or `gemini` |
| `OPENAI_API_KEY` | For GPT-4o-mini ranking |
| `GOOGLE_API_KEY` | For Gemini 1.5 Flash ranking |

---

## Features

- **Profile Analysis** — Languages, stars, repos, account age → inferred skill level
- **Smart Issue Search** — Searches `good first issue`, `help wanted`, `beginner friendly` across user's top languages
- **LLM Ranking** — GPT/Gemini matches issues to the specific developer, not just the language
- **Per-Issue Annotations** — Match score ring, difficulty badge, time estimate, skills used/learned, contribution tips
- **Filter & Sort** — By difficulty, language, match score, or recency
- **Animated Terminal UI** — Developer-aesthetic loading animation

---

## GitHub Rate Limits

Without a token: 60 requests/hour  
With a personal access token: 5,000 requests/hour

Generate one at: https://github.com/settings/tokens (no scopes needed for public data)
