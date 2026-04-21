// State management
let currentUser = null;
let currentSkills = [];

// Screen Navigation
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
    
    // Update tab bar active state
    const tabs = document.querySelectorAll('.tab-item');
    const screenIndexMap = {
        'home-screen': 0,
        'results-screen': 1,
        'chat-screen': 2,
        'resume-screen': 3
    };
    
    tabs.forEach(t => t.classList.remove('active'));
    if (screenIndexMap[screenId] !== undefined) {
        tabs[screenIndexMap[screenId]].classList.add('active');
    }

    if (screenId === 'results-screen') {
        loadRecommendations();
    }
}

// Authentication
async function handleLogin() {
    const username = document.getElementById('username').value;
    if (!username) return alert('Please enter a username');
    
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
        document.getElementById('bottom-tabs').style.display = 'flex';
        switchScreen('home-screen');
    } catch (err) {
        console.error('Login failed', err);
    }
}

// Resume Upload
async function handleResumeUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    // Show loading
    const uploadBtn = event.target.nextElementSibling;
    const originalText = uploadBtn.innerText;
    uploadBtn.innerText = 'Analyzing...';
    uploadBtn.disabled = true;

    try {
        const response = await fetch('/resume/upload', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Upload failed');
        
        const data = await response.json();
        currentSkills = data.skills_found;
        
        // Render skills
        const skillsCloud = document.getElementById('skills-cloud');
        const skillsList = document.getElementById('skills-list');
        skillsList.innerHTML = '';
        
        currentSkills.forEach(skill => {
            const span = document.createElement('span');
            span.className = 'match-badge';
            span.style.background = 'var(--ios-blue)';
            span.style.float = 'none';
            span.innerText = skill;
            skillsList.appendChild(span);
        });
        
        skillsCloud.style.display = 'block';
        uploadBtn.innerText = 'Analysis Complete!';
        
        setTimeout(() => {
            switchScreen('results-screen');
        }, 1500);

    } catch (err) {
        alert('Error: ' + err.message);
    } finally {
        uploadBtn.disabled = false;
        uploadBtn.innerText = originalText;
    }
}

// AI Chat
async function handleChat() {
    const input = document.getElementById('chat-input');
    const msg = input.value;
    if (!msg) return;

    appendMessage('user', msg);
    input.value = '';

    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: msg })
        });
        const data = await response.json();
        
        appendMessage('ai', data.response);
        
        if (data.matches && data.matches.length > 0) {
            renderInternships(data.matches, 'chat-messages', true);
        }
    } catch (err) {
        appendMessage('ai', 'Sorry, I encountered an error. Please try again.');
    }
}

function appendMessage(sender, text) {
    const chatBox = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.innerText = text;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Recommendations
async function loadRecommendations() {
    try {
        const response = await fetch('/recommendations');
        const data = await response.json();
        renderInternships(data, 'results-list');
    } catch (err) {
        console.error('Failed to load recommendations', err);
    }
}

function renderInternships(data, containerId, append = false) {
    const container = document.getElementById(containerId);
    if (!append) container.innerHTML = '';

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'glass-card internship-card';
        card.innerHTML = `
            <span class="match-badge">${item.match_score}% Match</span>
            <h2 style="margin-bottom: 5px;">${item.title}</h2>
            <p style="color: var(--ios-blue); font-weight: 600; margin-bottom: 10px;">${item.company}</p>
            <p style="font-size: 14px; margin-bottom: 15px;">${item.description.substring(0, 100)}...</p>
            <div style="display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px;">
                ${item.skills.map(s => `<span style="font-size: 11px; background: rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 4px;">${s}</span>`).join('')}
            </div>
            <button class="btn-primary" style="width: 100%; padding: 8px;" onclick="bookmark(${item.id})">Bookmark</button>
        `;
        container.appendChild(card);
    });
}

async function bookmark(id) {
    await fetch(`/bookmarks/${id}`, { method: 'POST' });
    alert('Internship bookmarked!');
}

// Dark Mode
function toggleDarkMode() {
    const body = document.body;
    const isDark = body.getAttribute('data-theme') === 'dark';
    body.setAttribute('data-theme', isDark ? 'light' : 'dark');
}

// Enter key for inputs
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        if (document.activeElement.id === 'username') handleLogin();
        if (document.activeElement.id === 'chat-input') handleChat();
    }
});
