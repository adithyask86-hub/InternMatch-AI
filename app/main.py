from fastapi import FastAPI, Depends, UploadFile, File, HTTPException, Form, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import os
import json

from . import models, schemas, database, utils, ai_engine

# Initialize database
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="InternMatch AI API")

# Setup static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Initialize AI Engine
INTERNSHIPS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "internships.json")
ai = ai_engine.AIEngine(INTERNSHIPS_PATH)

# In-memory user state for prototype (replaces session)
current_user = {
    "username": "Guest",
    "skills": [],
    "history": []
}

@app.get("/", response_class=HTMLResponse)
async def read_root(request: Request):
    return templates.TemplateResponse(request=request, name="index.html")

@app.post("/auth/login")
async def login(username: str = Form(...), password: str = Form(...)):
    # Simple prototype auth
    current_user["username"] = username
    return {"status": "success", "username": username}

@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    
    content = await file.read()
    text = utils.extract_text_from_pdf(content)
    
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from PDF")
    
    skills = ai.extract_skills(text)
    current_user["skills"] = skills
    
    return {
        "filename": file.filename,
        "skills_found": skills,
        "message": f"Successfully parsed {len(skills)} skills."
    }

@app.post("/chat", response_model=schemas.ChatResponse)
async def chat(message: schemas.ChatMessage):
    msg = message.message.lower()
    
    # Simple intent recognition
    matches = []
    response_text = ""
    
    if "intern" in msg or "find" in msg or "job" in msg:
        matches = ai.get_recommendations(current_user["skills"], query=msg)
        response_text = f"I've found {len(matches)} internships matching your profile and query!"
    elif "skills" in msg or "profile" in msg:
        skills_str = ", ".join(current_user["skills"]) if current_user["skills"] else "none yet"
        response_text = f"Your current profile includes these skills: {skills_str}. Would you like to upload a new resume to update them?"
    else:
        response_text = "I'm your InternMatch AI assistant. You can ask me to find internships, check your skills, or help you improve your profile!"

    return {
        "response": response_text,
        "matches": matches[:5],  # Top 5
        "suggestions": ["Try searching for 'AI' or 'Finance'", "Upload a resume for better matches"]
    }

@app.get("/recommendations", response_model=list[schemas.Internship])
async def get_recommendations():
    return ai.get_recommendations(current_user["skills"])

@app.post("/bookmarks/{internship_id}")
async def add_bookmark(internship_id: int):
    # Mock bookmarking
    return {"status": "success", "message": f"Internship {internship_id} bookmarked"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
