import json
import re
from typing import List, Dict

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
        found_skills = []
        for skill in COMMON_SKILLS:
            if re.search(r'\b' + re.escape(skill) + r'\b', text, re.IGNORECASE):
                found_skills.append(skill)
        return list(set(found_skills))

    def calculate_match(self, user_skills: List[str], internship: Dict) -> Dict:
        internship_skills = [s.lower() for s in internship.get("skills", [])]
        user_skills_lower = [s.lower() for s in user_skills]
        
        matches = [s for s in internship_skills if s in user_skills_lower]
        missing = [s for s in internship_skills if s not in user_skills_lower]
        
        score = (len(matches) / len(internship_skills)) * 100 if internship_skills else 0
        
        return {
            "score": round(score, 1),
            "suggestions": [f"Learn {s}" for s in missing[:2]] if missing else ["Profile looks great!"]
        }

    def get_recommendations(self, user_skills: List[str], query: str = "") -> List[Dict]:
        results = []
        
        # Keywords for filtering
        stop_words = {'find', 'me', 'a', 'an', 'the', 'at', 'for', 'in', 'of', 'and', 'or', 'internship', 'internships'}
        keywords = []
        if query:
            keywords = [kw for kw in query.lower().split() if kw not in stop_words and len(kw) > 1]

        for item in self.internships:
            new_item = item.copy()
            match_data = self.calculate_match(user_skills, new_item)
            
            relevance_boost = 0
            is_relevant = False
            
            if keywords:
                for kw in keywords:
                    if kw in new_item["company"].lower() or kw in new_item["title"].lower():
                        relevance_boost += 50
                        is_relevant = True
                    elif kw in new_item["description"].lower():
                        relevance_boost += 20
                        is_relevant = True
            
            new_item["match_score"] = min(match_data["score"] + relevance_boost, 100.0)
            new_item["suggestions"] = match_data["suggestions"]
            
            # If searching, ONLY show relevant ones
            if query:
                if is_relevant:
                    results.append(new_item)
            else:
                results.append(new_item)
            
        return sorted(results, key=lambda x: x["match_score"], reverse=True)
