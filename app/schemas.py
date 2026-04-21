from pydantic import BaseModel, EmailStr
from typing import List, Optional

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserProfile(UserBase):
    id: int
    skills: List[str]
    experience: Optional[str] = None
    education: Optional[str] = None

    class Config:
        from_attributes = True

class Internship(BaseModel):
    id: int
    title: str
    company: str
    location: str
    category: str
    description: str
    skills: List[str]
    eligibility: str
    benefits: str
    match_score: Optional[float] = 0.0
    suggestions: Optional[List[str]] = []

class ChatMessage(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str
    matches: Optional[List[Internship]] = []
    suggestions: Optional[List[str]] = []
