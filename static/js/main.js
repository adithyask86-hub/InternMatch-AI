// InternMatch AI - Main Logic

let currentUser = "User";
let currentSkills = [];

// Navigation Controller
function switchScreen(screenId) {
    console.log('Switching to:', screenId);
    
    // Hide all screens first
    const allScreens = document.querySelectorAll('.screen');
    allScreens.forEach(s => {
        s.classList.remove('active');
    });
    
    // Show the target screen
    const target = document.getElementById(screenId);
    if (target) {
        target.classList.add('active');
    }
    
    // Control Tab Bar Visibility
    const tabBar = document.getElementById('bottom-tabs');
    if (tabBar) {
        if (screenId === 'login-screen') {
            tabBar.style.display = 'none';
        } else {
            tabBar.style.display = 'flex';
        }
    }
    
    // Update active state of tabs
    const tabs = document.querySelectorAll('.tab-item');
    const screenToTabIndex = {
        'home-screen': 0,
        'results-screen': 1,
        'chat-screen': 2,
        'resume-screen': 3
    };
    
    tabs.forEach(t => t.classList.remove('active'));
    const activeIdx = screenToTabIndex[screenId];
    if (activeIdx !== undefined && tabs[activeIdx]) {
        tabs[activeIdx].classList.add('active');
    }

    // Auto-load data
    if (screenId === 'home-screen' || screenId === 'results-screen') {
        loadRecommendations();
    }
}

// Auth Handler
async function handleLogin() {
    const usernameInput = document.getElementById('username');
    const username = usernameInput.value.trim();
    
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
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
        console.error('Login error:', err);
        // Fallback for prototype
        switchScreen('home-screen');
    }
}

// AI Chat Handler
async function handleChat() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;
    
    appendMessage('user', message);
    input.value = '';
    
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: message })
        });
        const data = await response.json();
        appendMessage('ai', data.response);
        
        if (data.matches && data.matches.length > 0) {
            renderList(data.matches, 'chat-messages', true);
        }
    } catch (err) {
        appendMessage('ai', 'I am having trouble connecting. Check your server.');
    }
}

function appendMessage(sender, text) {
    const chatContainer = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    msgDiv.style.cssText = sender === 'user' 
        ? "background: #007AFF; color: white; align-self: flex-end; padding: 10px; border-radius: 15px; margin: 5px; max-width: 80%;"
        : "background: rgba(0,0,0,0.05); color: black; align-self: flex-start; padding: 10px; border-radius: 15px; margin: 5px; max-width: 80%;";
    msgDiv.innerText = text;
    chatContainer.appendChild(msgDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Data Fetching
async function loadRecommendations() {
    try {
        const response = await fetch('/recommendations');
        const data = await response.json();
        
        renderList(data, 'results-list');
        renderList(data.slice(0, 2), 'top-matches');
    } catch (err) {
        console.error('Data error:', err);
    }
}

function renderList(items, containerId, append = false) {
    const container = document.getElementById(containerId);
    if (!container) return;
    if (!append) container.innerHTML = '';
    
    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card';
        card.style.position = 'relative';
        card.innerHTML = `
            <span class="match-badge">${item.match_score}% Match</span>
            <h3 style="margin-bottom: 5px;">${item.title}</h3>
            <p style="color: #007AFF; font-weight: 600; margin-bottom: 8px;">${item.company}</p>
            <p style="font-size: 14px; margin-bottom: 12px;">${item.description.substring(0, 80)}...</p>
            <button class="btn-primary" style="width: 100%; padding: 8px; font-size: 14px;" onclick="alert('Internship bookmarked!')">Bookmark</button>
        `;
        container.appendChild(card);
    });
}

// Profile / Resume Upload
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    const btn = event.target.nextElementSibling;
    btn.innerText = 'Analyzing...';
    
    try {
        const response = await fetch('/resume/upload', {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        
        const list = document.getElementById('skills-list');
        const cloud = document.getElementById('skills-cloud');
        list.innerHTML = '';
        data.skills_found.forEach(s => {
            const span = document.createElement('span');
            span.style.cssText = "background: #007AFF; color: white; padding: 5px 12px; border-radius: 20px; font-size: 12px;";
            span.innerText = s;
            list.appendChild(span);
        });
        cloud.style.display = 'block';
        btn.innerText = 'Analysis Complete!';
        
        setTimeout(() => switchScreen('results-screen'), 1500);
    } catch (err) {
        alert('Upload failed. Check your file format.');
        btn.innerText = 'Choose PDF File';
    }
}

function toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    // Start at login
    switchScreen('login-screen');
});
