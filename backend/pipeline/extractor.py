import json
import logging
import re
from typing import Any, Dict, List

from groq import Groq


logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are a forensic claim extraction engine.
Extract EVERY distinct, atomic, verifiable factual claim from the input text.

MANDATORY RULES:
1. Extract ALL claims — especially suspicious or false-sounding ones
2. Split every compound sentence into individual atomic claims
3. One claim = one subject + one fact only. Never combine two facts.
4. Types to extract: who built/created/founded what, dates, locations, 
   measurements, numbers, named attributions, scientific facts
5. DO NOT skip anything. False claims are the most important to catch.
6. DO NOT include opinions, feelings, predictions, or recommendations

OUTPUT: Return ONLY a raw JSON array. Zero other text. No markdown fences.

EXAMPLE INPUT:
"The Eiffel Tower was built by Thomas Edison in Paris in 1889. 
Apple was co-founded by Bill Gates and Steve Jobs in 1976."

EXAMPLE OUTPUT:
[
  {"id":1,"claim":"The Eiffel Tower was built by Thomas Edison","type":"attribution"},
  {"id":2,"claim":"The Eiffel Tower is located in Paris","type":"location"},
  {"id":3,"claim":"The Eiffel Tower was completed in 1889","type":"temporal"},
  {"id":4,"claim":"Apple was co-founded by Bill Gates","type":"attribution"},
  {"id":5,"claim":"Apple was co-founded by Steve Jobs","type":"attribution"},
  {"id":6,"claim":"Apple was founded in 1976","type":"temporal"}
]"""


def parse_json_safely(text: str) -> list:
    text = text.strip()
    # Strip markdown fences
    text = re.sub(r'^```(?:json)?\s*', '', text)
    text = re.sub(r'\s*```\s*$', '', text)
    # Try direct parse
    try:
        result = json.loads(text)
        if isinstance(result, list):
            return result
    except json.JSONDecodeError:
        pass
    # Extract array from anywhere in response
    match = re.search(r'\[[\s\S]*\]', text)
    if match:
        try:
            result = json.loads(match.group())
            if isinstance(result, list):
                return result
        except Exception:
            pass
    return []


def extract_claims(
    text: str,
    groq_api_key: str,
    model: str = "llama-3.3-70b-versatile",
) -> List[Dict[str, Any]]:
    """
    Extract atomic verifiable claims from text via Groq.
    Returns a list of dicts: {id, claim, type}.
    """
    if not text or not groq_api_key:
        raise ValueError("Missing input text or GROQ_API_KEY")

    client = Groq(api_key=groq_api_key)

    try:
        completion = client.chat.completions.create(
            model=model,
            temperature=0.1,
            max_tokens=2048,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": text},
            ],
        )
    except Exception as e:
        logger.exception("Groq claim extraction call failed: %s", e)
        return []

    try:
        content = completion.choices[0].message.content or ""
        parsed = parse_json_safely(content)

        if not isinstance(parsed, list):
            raise ValueError("Model did not return a JSON array")

        claims: List[Dict[str, Any]] = []
        for i, item in enumerate(parsed, start=1):
            if not isinstance(item, dict):
                continue
            claim_text = item.get("claim")
            claim_type = item.get("type", "factual")
            if not claim_text:
                continue
            claims.append(
                {
                    "id": int(item.get("id", i)),
                    "claim": str(claim_text),
                    "type": str(claim_type),
                }
            )

        if len(claims) < 1:
            raise ValueError("No valid claims were extracted")

        # Ensure sequential ids
        for idx, c in enumerate(claims, start=1):
            c["id"] = idx
        return group_claims_by_entity(claims)
    except ValueError:
        raise
    except Exception as e:
        logger.exception("Claim extraction parsing/validation failed: %s", e)
        return []

def find_claim_offsets(original_text: str, claims: list) -> list:
    import re
    for claim in claims:
        claim_text = claim["claim"]
        sentences = re.split(r'(?<=[.!?])\s+', original_text)
        best_match = None
        best_score = 0
        offset = 0
        for sentence in sentences:
            claim_words = set(claim_text.lower().split())
            sent_words = set(sentence.lower().split())
            overlap = len(claim_words & sent_words) / max(len(claim_words), 1)
            if overlap > best_score:
                best_score = overlap
                best_match = sentence
                claim["start_offset"] = offset
                claim["end_offset"] = offset + len(sentence)
                claim["source_sentence"] = sentence
            offset += len(sentence) + 1
    return claims

def group_claims_by_entity(claims: list) -> list:
    import re
    
    def extract_entity(claim_text: str) -> str:
        match = re.match(r'^((?:[A-Z][a-z]+\s?)+)', claim_text)
        if match:
            return match.group(1).strip()
        return "General"
    
    for claim in claims:
        claim["entity_group"] = extract_entity(claim["claim"])
    
    return claims
