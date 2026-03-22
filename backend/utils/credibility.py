DOMAIN_SCORES = {
    # Tier 1 — Gold standard (90-100)
    "en.wikipedia.org": 88,
    "britannica.com": 92,
    "reuters.com": 95,
    "apnews.com": 95,
    "bbc.com": 91,
    "bbc.co.uk": 91,
    "nasa.gov": 98,
    "who.int": 97,
    "un.org": 94,
    "nature.com": 96,
    "science.org": 96,
    "pubmed.ncbi.nlm.nih.gov": 97,
    "nytimes.com": 88,
    "theguardian.com": 87,
    "washingtonpost.com": 87,
    "economist.com": 90,
    "nationalgeographic.com": 89,
    "smithsonianmag.com": 88,
    "history.com": 82,
    "snopes.com": 85,
    "factcheck.org": 90,
    "politifact.com": 88,
    # Tier 2 — Reliable (70-89)
    "cnn.com": 75,
    "foxnews.com": 68,
    "nbcnews.com": 78,
    "cbsnews.com": 79,
    "abcnews.go.com": 79,
    "time.com": 82,
    "forbes.com": 78,
    "wired.com": 80,
    "techcrunch.com": 76,
    "theatlantic.com": 83,
    # Tier 3 — Low quality (0-50)
    "reddit.com": 30,
    "quora.com": 25,
    "brainly.com": 15,
    "instagram.com": 10,
    "facebook.com": 10,
    "twitter.com": 20,
    "tiktok.com": 5,
}

def score_source(url: str) -> dict:
    from urllib.parse import urlparse
    try:
        domain = urlparse(url).netloc.replace("www.", "")
    except Exception:
        domain = url
    
    score = DOMAIN_SCORES.get(domain)
    
    if score is None:
        # Score unknown domains based on TLD
        if domain.endswith(".gov"):
            score = 92
        elif domain.endswith(".edu"):
            score = 85
        elif domain.endswith(".org"):
            score = 70
        else:
            score = 55  # Unknown domains get neutral score
    
    if score >= 85:
        tier = "gold"
        tier_label = "Highly Reliable"
        color = "#10b981"
    elif score >= 70:
        tier = "silver"
        tier_label = "Reliable"
        color = "#6366f1"
    elif score >= 50:
        tier = "bronze"
        tier_label = "Use with Caution"
        color = "#f59e0b"
    else:
        tier = "poor"
        tier_label = "Low Credibility"
        color = "#ef4444"
    
    return {
        "domain": domain,
        "score": score,
        "tier": tier,
        "tier_label": tier_label,
        "color": color
    }

def score_evidence_set(evidence_list: list) -> dict:
    if not evidence_list:
        return {"average_score": 0, "sources": [], "overall_tier": "poor"}
    
    scored = []
    for e in evidence_list:
        credibility = score_source(e.get("url", ""))
        scored.append({**e, "credibility": credibility})
    
    avg = sum(s["credibility"]["score"] for s in scored) / len(scored)
    
    return {
        "average_score": round(avg),
        "sources": scored,
        "overall_tier": "gold" if avg >= 85 else "silver" if avg >= 70 else "bronze" if avg >= 50 else "poor"
    }
