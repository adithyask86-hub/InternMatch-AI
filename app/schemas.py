from pydantic import BaseModel
from typing import List, Optional

class UserProfile(BaseModel):
    username: str
    skills: List[str] = []

class InternshipSchema(BaseModel):
    id: int
    title: str
    company: str
    location: str
    description: str
    skills: List[str]
    match_score: float
    suggestions: Optional[List[str]] = []

class ChatRequest(BaseModel):
    message: str
