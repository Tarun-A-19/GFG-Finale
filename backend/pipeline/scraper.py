import logging

import trafilatura


logger = logging.getLogger(__name__)


def scrape_url(url: str) -> str:
    """
    Fetch and extract clean article text from a URL.
    """
    if not url:
        raise ValueError("URL is required")

    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            raise ValueError("Failed to fetch URL content")

        extracted = trafilatura.extract(downloaded)
        if not extracted or not extracted.strip():
            raise ValueError("Failed to extract article text")

        return extracted.strip()
    except Exception as e:
        logger.exception("Scraping failed for URL=%s: %s", url, e)
        raise

