// InternMatch AI - Global Edition (Final Polish)

let currentUser = "User";
let currentSkills = [];
let bookmarks = 0;
let applied = 0;

// 1. Navigation
function switchScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.remove('active'));
    
    const target = document.getElementById(screenId);
    if (target) target.classList.add('active');
    
    const tabBar = document.getElementById('bottom-tabs');
    if (tabBar) {
        tabBar.style.display = (screenId === 'login-screen') ? 'none' : 'flex';
    }
    
    const tabs = document.querySelectorAll('.tab-item');
    const screenIndexMap = {
        'home-screen': 0,
        'results-screen': 1,
        'chat-screen': 2,
        'resume-screen': 3
    };
    
    tabs.forEach(t => t.classList.remove('active'));
    const idx = screenIndexMap[screenId];
    if (idx !== undefined && tabs[idx]) {
        tabs[idx].classList.add('active');
    }

    loadRecommendations();
}

// 2. Authentication
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Enter a username');
    currentUser = username;
    document.getElementById('display-name').innerText = currentUser;
    switchScreen('home-screen');
}

// 3. Data Rendering
async function loadRecommendations() {
    try {
        const response = await fetch('/recommendations');
        const data = await response.json();
        
        const matchCounter = document.getElementById('match-count');
        if (matchCounter) matchCounter.innerText = data.length;
        
        renderInternships(data.slice(0, 4), 'top-matches');
        renderInternships(data, 'results-list');
    } catch (err) {}
}

function renderInternships(data, containerId, append = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!append) container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card internship-card';
        card.style.cssText = "position: relative; margin-top: 15px; width: 100%; border: 1px solid rgba(0,0,0,0.08); display: block;";
        card.innerHTML = `
            <span class="match-badge">${item.match_score}% Match</span>
            <h3 style="margin-bottom: 5px; font-size: 16px;">${item.title}</h3>
            <p style="color: #007AFF; font-weight: 600; font-size: 13px;">${item.company}</p>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button onclick="handleApply(this)" class="btn-primary" style="flex: 1; padding: 8px; font-size: 12px; background: #5856D6;">Apply</button>
                <button onclick="addBookmark(this)" class="btn-primary" style="flex: 1; padding: 8px; font-size: 12px; background: #34C759;">Bookmark</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    if (append) container.scrollTop = container.scrollHeight;
}

function addBookmark(btn) {
    bookmarks++;
    const counter = document.getElementById('bookmark-count');
    if (counter) counter.innerText = bookmarks;
    btn.innerText = 'Saved! ✅';
    btn.disabled = true;
}

function handleApply(btn) {
    applied++;
    const counter = document.getElementById('applied-count');
    if (counter) counter.innerText = applied;
    btn.innerText = 'Applied! 🚀';
    btn.style.background = '#8E8E93';
    btn.disabled = true;
}

// 4. AI Chat
async function handleChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg) return;

    displayMessage('user', msg);
    input.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await response.json();
        displayMessage('ai', data.response);
        
        if (data.matches && data.matches.length > 0) {
            // FIX: data.matches.slice instead of data.slice
            renderInternships(data.matches.slice(0, 3), 'chat-messages', true);
        }
    } catch (err) {
        console.error(err);
    }
}

function displayMessage(sender, text) {
    const container = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.style.cssText = sender === 'user' 
        ? "background: #007AFF; color: white; align-self: flex-end; padding: 10px 15px; border-radius: 18px; margin: 8px; max-width: 80%; font-size: 15px; display: inline-block;"
        : "background: rgba(0,0,0,0.05); color: black; align-self: flex-start; padding: 10px 15px; border-radius: 18px; margin: 8px; max-width: 80%; font-size: 15px; display: inline-block;";
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}

// 5. Resume Upload
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const btn = event.target.nextElementSibling;
    btn.innerText = 'AI Scanning...';
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/resume/upload', { method: 'POST', body: formData });
        const data = await response.json();
        btn.innerText = 'Scan Complete!';
        setTimeout(() => switchScreen('results-screen'), 1000);
    } catch (err) {}
}

function toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

document.addEventListener('DOMContentLoaded', () => {
    switchScreen('login-screen');
    const chatInp = document.getElementById('chat-input');
    if (chatInp) chatInp.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });
});
