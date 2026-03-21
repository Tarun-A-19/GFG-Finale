from tavily import TavilyClient
from concurrent.futures import ThreadPoolExecutor, as_completed
import os

EXCLUDED_DOMAINS = [
    "quora.com", "brainly.com", "reddit.com", "instagram.com",
    "facebook.com", "twitter.com", "tiktok.com", "pinterest.com",
    "maps.apple.com", "homework.study.com", "answers.yahoo.com",
    "chegg.com", "coursehero.com", "snapchat.com"
]

PREFERRED_DOMAINS = [
    "en.wikipedia.org", "britannica.com", "bbc.com", "reuters.com",
    "apnews.com", "nationalgeographic.com", "nasa.gov",
    "history.com", "smithsonianmag.com", "scientificamerican.com",
    "nature.com", "newscientist.com", "theguardian.com", "nytimes.com"
]


def search_evidence(claim: str) -> list:
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        return []

    client = TavilyClient(api_key=api_key)
    results = []

    try:
        # Primary search
        response = client.search(
            query=claim,
            max_results=5,
            search_depth="advanced",
            include_raw_content=False,
            exclude_domains=EXCLUDED_DOMAINS
        )
        for r in response.get("results", []):
            content = r.get("content", "").strip()
            if content and len(content) > 50:
                results.append({
                    "title": r.get("title", ""),
                    "url": r.get("url", ""),
                    "content": content
                })
    except Exception as e:
        print(f"[Retriever] Primary search error: {e}")

    # If insufficient results, try a rephrased query
    if len(results) < 2:
        try:
            rephrased = f"fact check: {claim}"
            response2 = client.search(
                query=rephrased,
                max_results=3,
                search_depth="basic",
                include_raw_content=False
            )
            for r in response2.get("results", []):
                content = r.get("content", "").strip()
                url = r.get("url", "")
                if content and len(content) > 50:
                    if not any(ex in url for ex in EXCLUDED_DOMAINS):
                        if not any(existing["url"] == url for existing in results):
                            results.append({
                                "title": r.get("title", ""),
                                "url": url,
                                "content": content
                            })
        except Exception as e:
            print(f"[Retriever] Fallback search error: {e}")

    print(f"[Retriever] Found {len(results)} results for: {claim[:60]}")
    return results[:5]


# Legacy compatibility wrapper for main.py
def retrieve_evidence_for_claim(claim: str, tavily_api_key: str = "", max_results: int = 5) -> list:
    """Backward-compatible wrapper used by main.py SSE pipeline."""
    if tavily_api_key:
        os.environ.setdefault("TAVILY_API_KEY", tavily_api_key)
    return search_evidence(claim)


def search_all_claims(claims: list) -> dict:
    evidence_map = {}
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {
            executor.submit(search_evidence, c["claim"]): c["id"]
            for c in claims
        }
        for future in as_completed(futures):
            claim_id = futures[future]
            try:
                evidence_map[claim_id] = future.result()
            except Exception as e:
                print(f"[Retriever] Thread error for claim {claim_id}: {e}")
                evidence_map[claim_id] = []
    return evidence_map
