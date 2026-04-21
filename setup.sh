#!/bin/bash

echo "🚀 Starting InternMatch AI Setup..."

# Ensure we are in the right directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# 1. Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# 2. Activate virtual environment
echo "🔌 Activating environment..."
source venv/bin/activate

# 3. Upgrade Pip and Build tools (Fixes 'blis' build error)
echo "🛠 Upgrading build tools..."
pip install --upgrade pip setuptools wheel

# 4. Install requirements
echo "📥 Installing dependencies (this may take a minute)..."
pip install -r requirements.txt

# 5. Download Spacy model
echo "🧠 Downloading AI NLP model..."
python3 -m spacy download en_core_web_sm

echo "✅ Setup Complete!"
echo "----------------------------------------"
echo "To start the app, run:"
echo "source venv/bin/activate"
echo "python3 -m app.main"
echo "----------------------------------------"
