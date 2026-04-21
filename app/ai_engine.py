import json
import re
from typing import List, Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Optional Spacy Import
try:
    import spacy
    nlp = spacy.load("en_core_web_sm")
except ImportError:
    nlp = None
except Exception:
    nlp = None

# Common skills for extraction
COMMON_SKILLS = [
    "Python", "Java", "C++", "JavaScript", "React", "Node.js", "SQL", "NoSQL",
    "Machine Learning", "Deep Learning", "NLP", "Computer Vision", "Data Analysis",
    "Excel", "Financial Modeling", "Accounting", "Marketing", "SEO", "Google Ads",
    "Figma", "UI/UX", "Project Management", "Agile", "FastAPI", "Flask", "Docker",
    "AWS", "Cloud Computing", "TensorFlow", "PyTorch", "Tableau", "PowerBI"
]

class AIEngine:
    def __init__(self, internships_path: str):
        with open(internships_path, "r") as f:
            self.internships = json.load(f)
        
    def extract_skills(self, text: str) -> List[str]:
        """Extract skills from text using keyword matching."""
        found_skills = []
        # Case-insensitive search for common skills
        for skill in COMMON_SKILLS:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                found_skills.append(skill)
        
        # Spacy fallback if available
        if nlp:
            try:
                doc = nlp(text)
                for ent in doc.ents:
                    if ent.label_ in ["ORG", "PRODUCT"] and ent.text not in found_skills:
                        if len(ent.text) < 20 and any(char.isupper() for char in ent.text):
                            found_skills.append(ent.text)
            except:
                pass
        
        return list(set(found_skills))

    def calculate_match(self, user_skills: List[str], internship: Dict) -> Dict:
        """Calculate match score and provide suggestions."""
        internship_skills = [s.lower() for s in internship.get("skills", [])]
        user_skills_lower = [s.lower() for s in user_skills]
        
        matches = [s for s in internship_skills if s in user_skills_lower]
        missing = [s for s in internship_skills if s not in user_skills_lower]
        
        if not internship_skills:
            score = 0.0
        else:
            score = (len(matches) / len(internship_skills)) * 100
        
        suggestions = []
        if missing:
            suggestions.append(f"To improve your match, consider learning: {', '.join(missing[:3])}")
        
        if score < 50:
            suggestions.append("Update your resume with relevant projects in this field.")
        
        return {
            "score": round(score, 1),
            "suggestions": suggestions
        }

    def get_recommendations(self, user_skills: List[str], query: str = "") -> List[Dict]:
        """Rank internships based on user skills and optional query."""
        results = []
        for item in self.internships:
            # Create a copy to avoid mutating the original data
            new_item = item.copy()
            match_data = self.calculate_match(user_skills, new_item)
            
            relevance_boost = 0
            if query:
                query_lower = query.lower()
                if query_lower in new_item["title"].lower() or query_lower in new_item["description"].lower():
                    relevance_boost = 20
            
            new_item["match_score"] = min(match_data["score"] + relevance_boost, 100.0)
            new_item["suggestions"] = match_data["suggestions"]
            results.append(new_item)
            
        return sorted(results, key=lambda x: x["match_score"], reverse=True)
