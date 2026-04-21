import json
import re
from typing import List, Dict, Any

import spacy
from PyPDF2 import PdfReader

# Load spaCy model (small English)
nlp = spacy.load("en_core_web_sm")

# ---------- Resume Text Extraction ----------
def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """Extract plain text from a PDF file.
    Args:
        pdf_bytes: Raw PDF file bytes.
    Returns:
        Extracted text as a string.
    """
    try:
        reader = PdfReader(pdf_bytes)
        text = []
        for page in reader.pages:
            text.append(page.extract_text() or "")
        return "\n".join(text)
    except Exception as e:
        return ""

# ---------- Skill Extraction ----------
# Simple heuristic: collect nouns and noun chunks that look like skills.
# In a production app you'd use a richer taxonomy or a model.
def extract_skills(resume_text: str) -> List[str]:
    doc = nlp(resume_text.lower())
    # Common skill patterns – words that are nouns and appear in a predefined set.
    # For demonstration we maintain a small set; real app would use larger list.
    common_skills = {
        "python", "java", "c++", "javascript", "react", "nodejs", "sql",
        "aws", "docker", "kubernetes", "git", "linux", "html", "css",
        "swift", "ios", "android", "tensorflow", "pytorch", "nlp",
        "machine learning", "deep learning", "excel", "tableau", "powerpoint",
        "figma", "ui/ux", "design", "communication", "teamwork",
    }
    found = set()
    for token in doc:
        if token.text in common_skills:
            found.add(token.text)
    # also capture multi‑word skills via noun chunks
    for chunk in doc.noun_chunks:
        txt = chunk.text.strip()
        if txt in common_skills:
            found.add(txt)
    return sorted(found)

# ---------- Education Extraction (simple) ----------
# Looks for lines containing "bachelor", "master", "phd" etc.
EDU_REGEX = re.compile(r"(bachelor|master|ph\.d|b\.tech|m\.tech|undergraduate|graduate)", re.I)

def extract_education(resume_text: str) -> List[str]:
    lines = resume_text.splitlines()
    edu = []
    for line in lines:
        if EDU_REGEX.search(line):
            edu.append(line.strip())
    return edu[:3]  # keep first few matches

# ---------- Experience Level ----------
def extract_experience_level(resume_text: str) -> str:
    txt = resume_text.lower()
    if "intern" in txt or "student" in txt:
        return "beginner"
    if "junior" in txt:
        return "beginner"
    if "senior" in txt or "lead" in txt:
        return "experienced"
    return "intermediate"

# ---------- Query Intent Parsing ----------
def parse_query_intent(query: str) -> Dict[str, Any]:
    """Very lightweight intent parser.
    Returns dict with possible keys: domains (list), company (str), experience_level (str).
    """
    lowered = query.lower()
    domains = []
    for d in ["software", "ai", "data", "finance", "cloud", "design", "marketing", "product"]:
        if d in lowered:
            domains.append(d)
    # Simple company capture: look for known companies in seed data.
    known_companies = [
        "google", "amazon", "flipkart", "apple", "openai", "microsoft",
        "zomato", "nvidia", "swiggy", "goldman sachs", "morgan stanley",
        "jpmorgan", "paytm", "infosys", "tcs", "meta", "razorpay", "ola",
    ]
    company = None
    for c in known_companies:
        if c in lowered:
            company = c.title()
            break
    # Experience level hint
    exp = None
    if "beginner" in lowered:
        exp = "beginner"
    elif "intermediate" in lowered:
        exp = "intermediate"
    elif "experienced" in lowered or "senior" in lowered:
        exp = "experienced"
    return {
        "domains": domains,
        "company": company,
        "experience_level": exp,
    }

# ---------- Matching Algorithm ----------
def match_internships(user_skills: List[str], user_exp: str, internships: List[Dict[str, Any]], intent: Dict[str, Any] = None) -> List[Dict[str, Any]]:
    """Return internships sorted by a simple match score.
    Score components:
      * skill overlap (0‑60)
      * experience level compatibility (0‑20)
      * intent domain/company match (0‑20)
    """
    results = []
    user_skills_set = set([s.lower() for s in user_skills])
    for intern in internships:
        # Skill overlap
        required = set([s.lower() for s in intern.get("required_skills", [])])
        overlap = len(user_skills_set & required)
        skill_score = (overlap / max(len(required), 1)) * 60
        # Experience compatibility
        exp_levels = [e.lower() for e in intern.get("experience_level", [])]
        exp_score = 20 if user_exp.lower() in exp_levels else 0
        # Intent boost
        intent_score = 0
        if intent:
            if intent.get("domains") and intern.get("domain") in intent["domains"]:
                intent_score += 10
            if intent.get("company") and intent["company"].lower() == intern.get("company", "").lower():
                intent_score += 10
        total = round(skill_score + exp_score + intent_score, 2)
        intern_copy = intern.copy()
        intern_copy["match_score"] = total
        results.append(intern_copy)
    # Sort descending by match_score
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results
