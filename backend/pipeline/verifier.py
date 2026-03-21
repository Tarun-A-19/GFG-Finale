from sentence_transformers import CrossEncoder
import numpy as np
import os

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


def verify_claim(claim: str, evidence_list: list, model=None) -> dict:
    if model is None:
        model = get_model()

    sources = [
        {"title": e.get("title", ""), "url": e.get("url", "")}
        for e in evidence_list if e.get("url", "").strip()
    ]

    # Build premise from evidence
    parts = []
    for e in evidence_list:
        content = (e.get("content") or e.get("raw_content") or "").strip()
        if content and len(content) > 30:
            parts.append(content[:500])

    if not parts:
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "sources": sources,
            "reasoning": "No evidence retrieved"
        }

    premise = " ".join(parts)[:1500]

    if len(premise.split()) < 15:
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "sources": sources,
            "reasoning": "Insufficient evidence content"
        }

    try:
        max_entailment = 0.0
        max_contradiction = 0.0
        min_neutral = 1.0

        for content in parts:
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
            print(f"[Verifier] Snippet -> E:{e:.2f} C:{c:.2f} N:{n:.2f}")
            
            if e > max_entailment: max_entailment = e
            if c > max_contradiction: max_contradiction = c
            if n < min_neutral: min_neutral = n

        entailment = max_entailment
        contradiction = max_contradiction
        neutral = min_neutral
        print(f"[Verifier] Max probs for '{claim[:50]}' -> E:{entailment:.2f} C:{contradiction:.2f}")

        # Decision logic with calibrated thresholds
        if entailment > 0.50 and entailment > contradiction:
            verdict = "TRUE"
            confidence = round(entailment, 2)
        elif contradiction > 0.50 and contradiction > entailment:
            verdict = "FALSE"
            confidence = round(contradiction, 2)
        elif entailment > 0.30 and entailment > contradiction:
            verdict = "PARTIALLY TRUE"
            confidence = round(entailment, 2)
        elif contradiction > 0.30:
            verdict = "FALSE"
            confidence = round(contradiction, 2)
        else:
            verdict = "UNVERIFIABLE"
            confidence = round(neutral, 2)

        return {
            "verdict": verdict,
            "confidence": confidence,
            "sources": sources,
            "reasoning": f"E:{entailment:.2f} C:{contradiction:.2f} N:{neutral:.2f}"
        }

    except Exception as e:
        print(f"[Verifier ERROR] {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        return {
            "verdict": "UNVERIFIABLE",
            "confidence": 0.0,
            "sources": sources,
            "reasoning": f"Error: {str(e)}"
        }
