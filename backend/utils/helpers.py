import json
import logging
from typing import Any, Dict, Optional


logger = logging.getLogger(__name__)


def sse_data(payload: Dict[str, Any]) -> str:
    """
    Format a JSON payload as an SSE "data:" message.
    """
    return f"data: {json.dumps(payload, ensure_ascii=False)}\n\n"


def extract_json_array(text: str) -> list:
    """
    Best-effort parsing for models that may wrap JSON in extra text.
    """
    if not text:
        return []

    text = text.strip()
    # If the model returns exactly a JSON array, this is the fast path.
    if text.startswith("[") and text.endswith("]"):
        return json.loads(text)

    # Otherwise, try to find the first/last JSON array boundaries.
    start = text.find("[")
    end = text.rfind("]")
    if start != -1 and end != -1 and end > start:
        return json.loads(text[start : end + 1])

    raise ValueError("Could not locate JSON array boundaries in model output")


def env_get(name: str) -> Optional[str]:
    import os

    value = os.getenv(name)
    if value is None or not value.strip():
        return None
    return value.strip()


def safe_float(value: Any, default: float = 0.0) -> float:
    try:
        return float(value)
    except Exception:
        return default

