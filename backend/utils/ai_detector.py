import logging
from typing import Optional

import requests

logger = logging.getLogger(__name__)


def detect_ai_text(text: str, sapling_api_key: Optional[str]) -> float:
    """
    Uses Sapling AI detector.
    Returns 0.0 on failure.
    """
    if not text or not sapling_api_key:
        return 0.0

    try:
        resp = requests.post(
            "https://api.sapling.ai/api/v1/aidetect",
            json={"key": sapling_api_key, "text": text},
            timeout=30,
        )
        if resp.status_code != 200:
            return 0.0

        data = resp.json() if resp.content else {}
        # Different plans/APIs sometimes return different keys; best-effort extraction.
        for key in ("score", "ai_score", "probability", "prob", "result"):
            if key in data:
                return max(0.0, min(1.0, float(data[key])))

        # Sometimes nested structure may exist.
        if isinstance(data.get("data"), dict):
            for key in ("score", "ai_score", "probability", "prob"):
                if key in data["data"]:
                    return max(0.0, min(1.0, float(data["data"][key])))

        return 0.0
    except Exception:
        # Per requirement: fail silently.
        return 0.0

