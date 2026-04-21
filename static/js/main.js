// InternMatch AI - Perfect Master Logic
let currentUser = "User";
let currentSkills = [];
let bookmarks = 0;

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

    if (screenId === 'home-screen' || screenId === 'results-screen') {
        loadRecommendations();
    }
}

// 2. Authentication
async function handleLogin() {
    const username = document.getElementById('username').value.trim();
    if (!username) return alert('Enter a username');
    
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', 'demo');

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        currentUser = data.username;
        document.getElementById('display-name').innerText = currentUser;
        switchScreen('home-screen');
    } catch (err) {
        switchScreen('home-screen');
    }
}

// 3. AI Recommendations & Bookmarking
async function loadRecommendations() {
    try {
        const response = await fetch('/recommendations');
        const data = await response.json();
        
        const matchCounter = document.getElementById('match-count');
        if (matchCounter) matchCounter.innerText = data.length;
        
        renderInternships(data, 'results-list');
        renderInternships(data.slice(0, 3), 'top-matches');
    } catch (err) {
        console.error(err);
    }
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
            <p style="font-size: 12px; margin: 8px 0; color: #444;">${item.description.substring(0, 70)}...</p>
            <button onclick="addBookmark(this, ${item.id})" class="btn-primary" style="width: 100%; padding: 10px; font-size: 12px; margin-top: 5px;">Bookmark</button>
        `;
        container.appendChild(card);
    });
    
    if (append) {
        container.scrollTop = container.scrollHeight;
    }
}

function addBookmark(btn, id) {
    bookmarks++;
    const counter = document.getElementById('bookmark-count');
    if (counter) counter.innerText = bookmarks;
    btn.innerText = 'Saved! ✅';
    btn.style.background = '#34C759';
    btn.disabled = true;
    fetch(`/bookmarks/${id}`, { method: 'POST' }).catch(e => {});
}

// 4. Resume Upload
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const btn = event.target.nextElementSibling;
    btn.innerText = 'AI is Analyzing...';
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/resume/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        const list = document.getElementById('skills-list');
        document.getElementById('skills-cloud').style.display = 'block';
        list.innerHTML = '';
        
        data.skills_found.forEach(s => {
            const span = document.createElement('span');
            span.style.cssText = "background: #007AFF; color: white; padding: 4px 10px; border-radius: 15px; font-size: 11px; margin: 2px;";
            span.innerText = s;
            list.appendChild(span);
        });
        
        btn.innerText = 'Analysis Complete!';
        setTimeout(() => switchScreen('results-screen'), 1200);
    } catch (err) {
        alert('Upload Error');
        btn.innerText = 'Choose PDF File';
    }
}

// 5. AI Chat
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
        
        // Show AI's text response
        displayMessage('ai', data.response);
        
        // SHOW THE JOBS - THIS IS THE CRITICAL PART
        if (data.matches && data.matches.length > 0) {
            console.log('Rendering chat matches:', data.matches);
            renderInternships(data.matches.slice(0, 5), 'chat-messages', true);
        }
    } catch (err) {
        console.error('Chat error:', err);
        displayMessage('ai', 'Something went wrong with the AI server.');
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

function toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    switchScreen('login-screen');
    
    // Allow enter key for chat
    const chatInp = document.getElementById('chat-input');
    if (chatInp) {
        chatInp.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }
});
