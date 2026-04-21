import os
import uvicorn
from fastapi import FastAPI, Request, Form, File, UploadFile
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from .ai_engine import AIEngine
from .schemas import UserProfile, ChatRequest

app = FastAPI()

# Absolute path setup
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
static_path = os.path.join(BASE_DIR, "static")
templates_path = os.path.join(BASE_DIR, "templates")
db_path = os.path.join(BASE_DIR, "data", "internships.json")

app.mount("/static", StaticFiles(directory=static_path), name="static")
templates = Jinja2Templates(directory=templates_path)

ai_engine = AIEngine(db_path)
current_user = {"username": "Guest", "skills": []}

@app.get("/")
async def read_index(request: Request):
    try:
        # The modern FastAPI way: request is a keyword argument
        return templates.TemplateResponse(request=request, name="index.html")
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.post("/auth/login")
async def login(username: str = Form(...)):
    global current_user
    current_user["username"] = username
    return {"status": "success", "username": username}

@app.get("/recommendations")
async def get_recommendations():
    try:
        recs = ai_engine.get_recommendations(current_user["skills"])
        return recs
    except:
        return []

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        query = request.message
        recs = ai_engine.get_recommendations(current_user["skills"], query=query)
        best = recs[0]["company"] if recs else "Global Markets"
        return {
            "response": f"I've found {len(recs)} opportunities! {best} looks like a match.",
            "matches": recs[:5]
        }
    except:
        return {"response": "Searching...", "matches": []}

@app.post("/resume/upload")
async def upload_resume(file: UploadFile = File(...)):
    try:
        content = await file.read()
        text = content.decode('utf-8', errors='ignore')
        skills = ai_engine.extract_skills(text)
        current_user["skills"] = skills
        return {"status": "success", "skills_found": skills}
    except:
        return {"status": "error", "skills_found": []}

@app.post("/bookmarks/{job_id}")
async def add_bookmark(job_id: int):
    return {"status": "bookmarked"}

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
