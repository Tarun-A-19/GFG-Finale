# FactGuard

AI-powered fact & claim verification with:
- FastAPI backend (SSE streaming)
- React + Vite frontend (Tailwind + Axios)
- Groq (claim extraction), Tavily (evidence retrieval), Trafilatura (scraping),
  HuggingFace cross-encoder (verification), Sapling (AI detection).

## Setup

1. Backend env:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in `GROQ_API_KEY`, `TAVILY_API_KEY`, `SAPLING_API_KEY`

## Run locally

Backend (SSE API):
```bash
cd backend && pip install -r requirements.txt && python -m uvicorn main:app --reload
```

Frontend (Vite dev server):
```bash
cd frontend && npm install && npm run dev
```

Then open the frontend at `http://localhost:5173`.

