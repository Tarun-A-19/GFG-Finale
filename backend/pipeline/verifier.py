import os
import random
import numpy as np
from sentence_transformers import CrossEncoder

try:
    from groq import Groq
except ImportError:
    Groq = None

_model = None

def get_model():
    global _model
    if _model is None:
        print("[Verifier] Loading DeBERTa NLI model...")
        _model = CrossEncoder(
            'cross-encoder/nli-MiniLM2-L6-H768',
            max_length=512
        )
        print("[Verifier] Model loaded successfully")
    return _model

# =========================================================
# MISSION 3: ANTI-HALLUCINATION SHIELD 
# =========================================================

def check_evidence_sufficiency(claim: str, premise_text: str) -> bool:
    """Layer 1: Hard block if evidence depth is too low or off-topic."""
    if len(premise_text.split()) < 20:
        return False
    # Basic keyword overlap check
    claim_words = set(w.lower() for w in claim.replace('.','').split() if len(w) > 4)
    prem_words = set(w.lower() for w in premise_text.replace('.','').split() if len(w) > 4)
    if not claim_words:
        return True
    overlap = len(claim_words.intersection(prem_words))
    return overlap >= max(1, len(claim_words) // 3)

def self_consistency_check(claim: str, premise_parts: list, model) -> dict:
    """Layer 2: Ensure the model draws the same conclusion regardless of sentence order."""
    if len(premise_parts) < 2:
        return {"consistent": True, "agreement": "Consistent (1 slice)"}
    
    verdicts = []
    # Test 3 different shuffled arrangements of the evidence
    for _ in range(3):
        shuffled = list(premise_parts)
        random.shuffle(shuffled)
        test_premise = " ".join(shuffled)[:1500]
        try:
            raw = model.predict([(test_premise, claim)], apply_softmax=False, show_progress_bar=False)
            scores = np.array(raw[0])
            exp = np.exp(scores - np.max(scores))
            probs = exp / exp.sum()
            e, c, n = float(probs[1]), float(probs[0]), float(probs[2])
            if e > c and e > n: verdicts.append("TRUE")
            elif c > e and c > n: verdicts.append("FALSE")
            else: verdicts.append("NEUTRAL")
        except:
            verdicts.append("ERROR")
    
    unique_verdicts = set([v for v in verdicts if v != "ERROR"])
    if len(unique_verdicts) > 1:
        return {"consistent": False, "agreement": f"Mixed ({', '.join(unique_verdicts)})"}
    return {"consistent": True, "agreement": f"Unanimous ({list(unique_verdicts)[0] if unique_verdicts else 'None'})"}

def llm_sanity_check(claim: str, premise: str, tentative_verdict: str) -> dict:
    """Layer 3: Use LLM as an adjudicator for borderline cases to prevent hallucination."""
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or not Groq:
         return {"llm_checked": False}
    
    try:
        client = Groq(api_key=groq_key)
        prompt = f"""
Given this claim: "{claim}"
And this evidence: "{premise[:1000]}"
The NLI model thinks it is {tentative_verdict}. 
Is there ACTUAL explicit evidence supporting this verdict? Answer YES or NO, followed by a 1 sentence explanation.
"""
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.0,
            max_tokens=60
        )
        ans = response.choices[0].message.content.strip()
        is_yes = ans.upper().startswith("YES")
        return {
            "llm_checked": True,
            "llm_agrees": is_yes,
            "llm_reason": ans
        }
    except Exception as e:
        print(f"[SanityCheck] Error: {e}")
        return {"llm_checked": False}


# =========================================================
# MISSION 2: DEEP DIVE (Used by main.py)
# =========================================================

def rephrase_claim_for_search(claim: str) -> str:
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key or not Groq:
         return claim
    try:
        client = Groq(api_key=groq_key)
        prompt = f"Convert this claim into a Google search query to find evidence. Reply WITH ONLY the query, no quotes: {claim}"
        res = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3, max_tokens=20
        )
        return res.choices[0].message.content.strip().replace('"', '')
    except:
        return claim


# =========================================================
# MISSION 4: CONFIDENCE BOOST & SMART PREMISE CACHE
# =========================================================

def build_smart_premise(claim: str, evidence_list: list) -> list:
    """Favor sentences containing keywords from the claim."""
    claim_keywords = [w.lower() for w in claim.replace('.','').split() if len(w) > 4]
    
    all_sentences = []
    for e in evidence_list:
        content = (e.get("content") or e.get("raw_content") or "").strip()
        if content:
            # Simple sentence split
            for phrase in content.split(". "):
                if len(phrase) > 20:
                    all_sentences.append(phrase + ".")

    # Deduplicate and score sentences
    unique_sentences = list(set(all_sentences))
    scored = []
    for s in unique_sentences:
        s_lower = s.lower()
        score = sum(1 for kw in claim_keywords if kw in s_lower)
        scored.append((score, s))
    
    scored.sort(key=lambda x: x[0], reverse=True)
    return [tup[1] for tup in scored[:15]]


def verify_claim(claim: str, evidence_list: list, model=None) -> dict:
    if model is None:
        model = get_model()

    sources = [
        {"title": e.get("title", ""), "url": e.get("url", "")}
        for e in evidence_list if e.get("url", "").strip()
    ]

    # Smart Premise
    smart_parts = build_smart_premise(claim, evidence_list)
    full_premise = " ".join(smart_parts)[:2000]

    if not full_premise:
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "sources": sources,
            "hallucination_blocked": False,
            "consistency": None,
            "llm_sanity": None
        }

    # Layer 1: Sufficiency Check
    if not check_evidence_sufficiency(claim, full_premise):
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "sources": sources,
            "hallucination_blocked": True, # Shield triggered
            "consistency": None,
            "llm_sanity": None
        }

    # Layer 2: Consistency Check
    consistency_data = self_consistency_check(claim, smart_parts, model)

    try:
        max_entailment = 0.0
        max_contradiction = 0.0
        min_neutral = 1.0

        for content in smart_parts:
            if not content.strip(): 
                continue
            raw_scores = model.predict(
                [(content, claim)],
                apply_softmax=False,
                show_progress_bar=False
            )
            scores = np.array(raw_scores[0])
            exp_scores = np.exp(scores - np.max(scores))
            probs = exp_scores / exp_scores.sum()
            
            c, e, n = float(probs[0]), float(probs[1]), float(probs[2])
            
            if e > max_entailment: max_entailment = e
            if c > max_contradiction: max_contradiction = c
            if n < min_neutral: min_neutral = n

        # Apply confidence calibration (power adjustment)
        entailment = max_entailment ** 0.7
        contradiction = max_contradiction ** 0.7
        neutral = min_neutral

        # Adjust thresholds for more polarized outcomes
        if entailment > 0.45 and entailment > contradiction:
            verdict = "TRUE"
            confidence = min(0.99, entailment * 1.1)
        elif contradiction > 0.45 and contradiction > entailment:
            verdict = "FALSE"
            confidence = min(0.99, contradiction * 1.1)
        elif entailment > 0.25 and entailment > contradiction:
            verdict = "PARTIALLY TRUE"
            confidence = min(0.99, entailment * 1.1)
        elif contradiction > 0.25:
            verdict = "FALSE"
            confidence = min(0.99, contradiction * 1.1)
        else:
            verdict = "UNVERIFIABLE"
            confidence = round(neutral, 2)

        # Layer 3: Sanity Check for borderline verdicts
        sanity_data = None
        if verdict != "UNVERIFIABLE" and confidence < 0.65:
             sanity_data = llm_sanity_check(claim, full_premise, verdict)
             if sanity_data.get("llm_checked") and not sanity_data.get("llm_agrees"):
                 # Force downgrade to prevent hallucination propagating
                 verdict = "UNVERIFIABLE"
                 confidence = 0.0

        if verdict == "UNVERIFIABLE":
             # Neutral wasn't augmented, so scale it smoothly
             confidence = round(neutral, 2)

        return {
            "verdict": verdict,
            "confidence": round(confidence, 2),
            "sources": sources,
            "reasoning": f"E:{entailment:.2f} C:{contradiction:.2f}",
            "hallucination_blocked": False,
            "consistency": consistency_data,
            "llm_sanity": sanity_data
        }

    except Exception as e:
        print(f"[Verifier ERROR] {e}")
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "sources": sources,
            "hallucination_blocked": False,
            "consistency": None,
            "llm_sanity": None
        }

def detect_contradictions(claim: str, evidence_list: list, model) -> dict:
    if len(evidence_list) < 2:
        return {"has_contradiction": False, "conflict_score": 0.0, "sources": []}
    
    verdicts_per_source = []
    for evidence in evidence_list[:4]:
        content = (evidence.get("content") or evidence.get("raw_content") or "").strip()
        if len(content) < 30:
            continue
        try:
            raw = model.predict([(content[:500], claim)], 
                               apply_softmax=False,
                               show_progress_bar=False)
            scores = np.array(raw[0])
            exp = np.exp(scores - np.max(scores))
            probs = exp / exp.sum()
            verdicts_per_source.append({
                "url": evidence.get("url", ""),
                "title": evidence.get("title", ""),
                "entailment": float(probs[1]),
                "contradiction": float(probs[0]),
                "dominant": "supports" if probs[1] > probs[0] else "contradicts"
            })
        except:
            continue
    
    if len(verdicts_per_source) < 2:
        return {"has_contradiction": False, "conflict_score": 0.0, "sources": []}
    
    supporting = [v for v in verdicts_per_source if v["dominant"] == "supports"]
    contradicting = [v for v in verdicts_per_source if v["dominant"] == "contradicts"]
    
    has_contradiction = len(supporting) > 0 and len(contradicting) > 0
    
    conflict_score = round(min(len(supporting), len(contradicting)) / len(verdicts_per_source), 2) if has_contradiction else 0.0
    
    return {
        "has_contradiction": has_contradiction,
        "conflict_score": conflict_score,
        "supporting_sources": supporting,
        "contradicting_sources": contradicting,
        "summary": f"{len(supporting)} source(s) support this, {len(contradicting)} contradict it"
    }
