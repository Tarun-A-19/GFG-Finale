import json
import logging
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
from contextlib import asynccontextmanager
from typing import Any, Dict, Generator, List

import uvicorn
from dotenv import load_dotenv
from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse

from pipeline.extractor import extract_claims
from pipeline.retriever import retrieve_evidence_for_claim, search_evidence
from pipeline.scraper import scrape_url
from pipeline.verifier import get_model, verify_claim
from utils.ai_detector import detect_ai_text
from utils.helpers import env_get, sse_data


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("factguard")


@asynccontextmanager
async def lifespan(app: FastAPI):
    load_dotenv()
    # Pre-load the NLI model at startup
    app.state.model = get_model()
    yield


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health() -> Dict[str, bool]:
    return {
        "groq": bool(env_get("GROQ_API_KEY")),
        "tavily": bool(env_get("TAVILY_API_KEY")),
        "sapling": bool(env_get("SAPLING_API_KEY")),
    }


@app.get("/api/factcheck")
def factcheck_stream(
    request: Request,
    input: str = Query(..., description="User-provided text or URL"),
    type: str = Query("text", description="text|url"),
):
    """SSE stream that emits verification progress and per-claim verdicts."""

    def event_generator() -> Generator[str, None, None]:
        try:
            groq_key = env_get("GROQ_API_KEY")
            tavily_key = env_get("TAVILY_API_KEY")
            sapling_key = env_get("SAPLING_API_KEY")

            input_type = (type or "text").lower().strip()
            article_text = ""

            # Stage: scraping
            yield sse_data({"stage": "scraping", "status": "loading", "message": "Fetching article content..."})
            try:
                if input_type == "url":
                    article_text = scrape_url(input)
                else:
                    article_text = (input or "").strip()
                yield sse_data({"stage": "scraping", "status": "done", "message": "Article extracted successfully"})
            except Exception as e:
                logger.exception("Scraping stage failed: %s", e)
                article_text = (input or "").strip()
                yield sse_data({"stage": "scraping", "status": "done", "message": "Using raw input text"})

            claims: List[Dict[str, Any]] = []

            # Stage: extracting
            yield sse_data({"stage": "extracting", "status": "loading", "message": "Identifying verifiable claims..."})
            try:
                if groq_key:
                    claims = extract_claims(article_text, groq_api_key=groq_key)
                else:
                    logger.warning("Missing GROQ_API_KEY; skipping extraction.")
                    claims = []
            except ValueError as e:
                logger.warning("Extractor issue: %s", e)
                claims = []
            except Exception as e:
                logger.exception("Extraction stage failed: %s", e)
                claims = []

            yield sse_data({"stage": "extracting", "status": "done", "message": f"Found {len(claims)} claims", "claims": claims})

            # Stage: searching + verifying per claim
            claim_results: List[Dict[str, Any]] = []

            if claims:
                max_workers = min(8, len(claims))
                with ThreadPoolExecutor(max_workers=max_workers) as executor:
                    futures = []
                    for c in claims:
                        futures.append(
                            executor.submit(retrieve_evidence_for_claim, c.get("claim", ""), tavily_key or "", 3)
                        )

                    for idx, c in enumerate(claims, start=1):
                        yield sse_data({"stage": "searching", "status": "loading", "message": f"Searching evidence for claim {idx}/{len(claims)}..."})
                        evidence: List[Dict[str, Any]] = []
                        try:
                            evidence = futures[idx - 1].result(timeout=120)
                        except Exception as e:
                            logger.exception("Evidence retrieval failed for claim %s: %s", idx, e)
                            yield sse_data({"stage": "searching", "status": "error", "message": f"Evidence error for claim {idx}"})
                            evidence = []

                        yield sse_data({"stage": "searching", "status": "done", "message": "Evidence retrieved", "count": len(evidence)})
                        yield sse_data({"stage": "verifying", "status": "loading", "message": f"Verifying claim {idx}/{len(claims)}..."})

                        try:
                            result = verify_claim(claim=c.get("claim", ""), evidence_list=evidence, model=app.state.model)
                        except Exception as e:
                            logger.exception("Verification failed for claim %s: %s", idx, e)
                            yield sse_data({"stage": "verifying", "status": "error", "message": f"Verification error for claim {idx}"})
                            result = {"verdict": "UNVERIFIABLE", "confidence": 0.0, "sources": []}

                        claim_result = {
                            "id": c.get("id", idx),
                            "claim": c.get("claim", ""),
                            "verdict": result.get("verdict", "UNVERIFIABLE"),
                            "confidence": result.get("confidence", 0.0),
                            "sources": result.get("sources", []),
                        }
                        claim_results.append(claim_result)
                        yield sse_data({"stage": "verifying", "status": "done", "claim_result": claim_result})

            # Stage: ai_detection
            ai_score = 0.0
            try:
                ai_score = detect_ai_text(article_text, sapling_api_key=sapling_key)
            except Exception as e:
                logger.exception("AI detection failed: %s", e)

            yield sse_data({"stage": "ai_detection", "status": "done", "ai_score": ai_score})

            # Stage: complete
            total = len(claim_results)
            true_count = sum(1 for r in claim_results if r.get("verdict") == "TRUE")
            false_count = sum(1 for r in claim_results if r.get("verdict") == "FALSE")
            partial_count = sum(1 for r in claim_results if r.get("verdict") == "PARTIALLY TRUE")
            unverifiable_count = sum(1 for r in claim_results if r.get("verdict") == "UNVERIFIABLE")

            if total > 0:
                accuracy_score = int(round(((true_count + 0.5 * partial_count) / float(total)) * 100))
            else:
                accuracy_score = 0

            if accuracy_score >= 75:
                credibility = "High Credibility"
            elif accuracy_score >= 50:
                credibility = "Medium Credibility"
            elif accuracy_score >= 25:
                credibility = "Low Credibility"
            else:
                credibility = "Unreliable"

            summary = {
                "total": total,
                "true": true_count,
                "false": false_count,
                "partial": partial_count,
                "unverifiable": unverifiable_count,
                "accuracy_score": accuracy_score,
                "credibility": credibility,
            }
            yield sse_data({"stage": "complete", "status": "done", "summary": summary})

        except Exception as e:
            logger.exception("Fatal SSE stream error: %s", e)
            yield sse_data({
                "stage": "complete", "status": "done",
                "summary": {"total": 0, "true": 0, "false": 0, "partial": 0, "unverifiable": 0, "accuracy_score": 0, "credibility": "Unreliable"}
            })

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "Connection": "keep-alive"},
    )


@app.get("/api/debug/verify")
async def debug_verify():
    test_claim = "The Eiffel Tower is located in Paris France"
    test_evidence = [{
        "title": "Eiffel Tower - Wikipedia",
        "url": "https://en.wikipedia.org/wiki/Eiffel_Tower",
        "content": "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower from 1887 to 1889."
    }]
    result = verify_claim(test_claim, test_evidence, app.state.model)
    return result


@app.get("/api/debug/accuracy")
async def debug_accuracy():
    """Test the full pipeline with known facts. Run this to verify >80% accuracy."""
    test_cases = [
        {"claim": "The Eiffel Tower is located in Paris France", "expected": "TRUE"},
        {"claim": "The Eiffel Tower was completed in 1889", "expected": "TRUE"},
        {"claim": "Water boils at 100 degrees Celsius at sea level", "expected": "TRUE"},
        {"claim": "Apple Inc was founded in 1976", "expected": "TRUE"},
        {"claim": "The Great Wall of China is clearly visible from space", "expected": "FALSE"},
        {"claim": "Thomas Edison built the Eiffel Tower", "expected": "FALSE"},
    ]

    results = []
    correct = 0

    for tc in test_cases:
        evidence = search_evidence(tc["claim"])
        result = verify_claim(tc["claim"], evidence, app.state.model)
        is_correct = result["verdict"] == tc["expected"]
        if is_correct:
            correct += 1
        results.append({
            "claim": tc["claim"],
            "expected": tc["expected"],
            "got": result["verdict"],
            "confidence": result["confidence"],
            "evidence_count": len(evidence),
            "correct": is_correct,
            "reasoning": result.get("reasoning", "")
        })

    accuracy = round((correct / len(test_cases)) * 100, 1)
    return {
        "accuracy": f"{accuracy}%",
        "passed": correct,
        "total": len(test_cases),
        "target": "80%+",
        "passed_target": accuracy >= 80,
        "results": results
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", "8000")), reload=True)
