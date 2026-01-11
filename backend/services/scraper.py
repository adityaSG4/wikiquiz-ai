import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse, urlunparse
import re

def normalize_url(url):
    """
    Normalizes a Wikipedia URL by removing query parameters and fragments.
    Ensures it maps to the same resource.
    """
    parsed = urlparse(url)
    # Reconstruct without query or fragment
    normalized = urlunparse((parsed.scheme, parsed.netloc, parsed.path, '', '', ''))
    return normalized

def fetch_article(url):
    """
    Fetches and cleans a Wikipedia article.
    Returns: (title, raw_html, cleaned_text)
    """
    try:
        # Wikipedia requires a User-Agent header
        headers = {
            'User-Agent': 'WikiQuizAI/1.0 (mailto:your-email@example.com)'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
    except requests.RequestException as e:
        raise Exception(f"Failed to fetch URL: {str(e)}")

    raw_html = response.text
    soup = BeautifulSoup(raw_html, 'html.parser')

    # Extract Title
    title = soup.find('h1', {'id': 'firstHeading'})
    title_text = title.get_text() if title else "Unknown Title"

    # Main Content Extraction
    content_div = soup.find('div', {'id': 'mw-content-text'})
    if not content_div:
        raise Exception("Could not find article content")

    # We typically want the div inside mw-content-text called 'mw-parser-output'
    parser_output = content_div.find('div', {'class': 'mw-parser-output'})
    target_div = parser_output if parser_output else content_div

    # Extraction Logic:
    # 1. Start with p tags.
    # 2. Iterate and filter out empty or non-meaningful ones.
    
    cleaned_paragraphs = []
    
    for p in target_div.find_all('p'):
        # Remove references like [1], [2]
        for sup in p.find_all('sup'):
            sup.decompose()
        
        text = p.get_text().strip()
        if text:
            cleaned_paragraphs.append(text)

    if not cleaned_paragraphs:
        raise Exception("No readable text found in article")

    cleaned_text = "\n\n".join(cleaned_paragraphs)
    
    return title_text, raw_html, cleaned_text
