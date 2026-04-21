# 🎓 InternMatch AI

InternMatch AI is an intelligent internship discovery application designed to help students find the most relevant opportunities using AI-powered matching. The app features a premium **iOS-inspired UI** with a seamless, modern experience.

## 🚀 Key Features

- **🧠 Smart Skill Extraction**: Automatically parses PDF resumes to identify core competencies.
- **📊 AI Matching Engine**: Ranks internships based on user profile similarity and provides "Match %" scores.
- **📱 iOS-Style UI/UX**: Premium Glassmorphism design with smooth transitions and Apple-style aesthetics.
- **💬 AI Chat Assistant**: A dedicated chat interface for natural language internship searches.
- **🌗 Dark Mode Support**: Sleek dark mode toggle for better accessibility.

## 🛠 Tech Stack

- **Backend**: Python 3 (FastAPI)
- **AI/NLP**: Regex-based Skill Extraction & Scikit-learn (TF-IDF Matching)
- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript (ES6+)
- **Database**: SQLite (SQLAlchemy ORM)

## 📦 Installation & Setup

### Prerequisites
- Python 3.x
- pip3

### Steps to Run
1. **Clone the repository**:
   ```bash
   git clone https://github.com/adithyask86-hub/InternMatch-AI.git
   cd InternMatch-AI
   ```

2. **Install dependencies**:
   ```bash
   pip3 install -r requirements.txt
   ```

3. **Start the server**:
   ```bash
   python3 -m app.main
   ```

4. **Access the App**:
   Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## 📁 Project Structure
- `app/`: Core backend logic (API, AI Engine, Models)
- `static/`: Frontend assets (CSS Design System, JS Logic)
- `templates/`: HTML SPA Shell
- `data/`: Mock internship database (JSON)

---
Developed with ❤️ by **Adithya S Kumar** using Antigravity AI.
