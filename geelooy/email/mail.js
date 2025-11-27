//B"H
/**
 * Awtsmoos Quantum Mail Client
 * Designed for the Unified Thread API
 */

const API_BASE = "/api/social/mail";

// State Management
const state = {
    alias: null,
    messages: [],
    threads: {}, // Map: correspondent -> [msgs]
    activeThread: null
};

// --- Initialization ---

async function whenLoaded() {
    // 1. Check for Alias
    if (!window.curAlias) {
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
        return;
    }

    state.alias = window.curAlias;
    document.getElementById('displayAlias').textContent = state.alias;
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    // 2. Setup Event Listeners
    setupUI();

    // 3. Load Data
    await refreshMail();
    
    // Auto-refresh every 30 seconds
    setInterval(refreshMail, 30000);
};

// --- API Interactions ---

async function refreshMail() {
    if (!state.alias) {
        console.log("B\"H\n - Waiting for alias identification...");
        return;
    }
    try {
        // Encode the alias to handle special chars or spaces safely
        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            state.messages = data;
            processThreads(data);
            renderSidebar();
            if (state.activeThread) {
                renderMessages(state.activeThread);
            }
        } else if (data.error) {
            console.error(data.error);
        }
    } catch (e) {
        console.error("Connection interrupted:", e);
    }
}

async function sendEmail(recipient, subject, content) {
    if(!recipient || !content) return;

    // Detect if Recipient is Email or Alias
    const isEmail = recipient.includes("@");
    
    let url = "";
    if (isEmail) {
        // Use generic "external" placeholder for the route param, pass actual email in query
        url = `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(recipient)}`;
    } else {
        // Local Alias
        url = `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;
    }
    
    // Add content to query (or body if you updated fetch to use body, but sticking to query based on previous context)
    // Ideally this should be a POST body.
    const bodyData = new URLSearchParams();
    bodyData.append("subject", subject);
    bodyData.append("content", content);
    
    // If the server expects POST body for content:
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyData
    });
    
    const j = await res.json();
    if(j.success) {
        await refreshMail();
        return true;
    } else {
        alert("Transmission failed: " + (j.error ? j.error.message : "Unknown error"));
        return false;
    }
}

async function deleteMessage(messageId) {
    if(!confirm("Dissolve this message into the void?")) return;
    
    await fetch(`${API_BASE}/delete/${messageId}?aliasId=${state.alias}`, {
        method: 'DELETE'
    });
    await refreshMail();
}

// --- Data Processing ---

function processThreads(messages) {
    const groups = {};
    
    messages.forEach(msg => {
        // The API returns 'correspondent' which is the Friend's Name/Email
        // Fallback to 'from' or 'to' logic if correspondent is missing
        let partner = msg.correspondent;
        if (!partner) {
             // Heuristic fallback
             partner = (msg.direction === 'incoming') ? msg.from : "Unknown";
        }
        
        if (!groups[partner]) groups[partner] = [];
        groups[partner].push(msg);
    });
    
    state.threads = groups;
}

// --- UI Rendering ---

function renderSidebar() {
    const list = document.getElementById('threadsList');
    list.innerHTML = '';
    
    // Sort threads by most recent message
    const threadNames = Object.keys(state.threads).sort((a, b) => {
        const lastA = state.threads[a][0].timeSent; // Assumes API sends newest first
        const lastB = state.threads[b][0].timeSent;
        return lastB - lastA;
    });

    threadNames.forEach(name => {
        const msgs = state.threads[name];
        const lastMsg = msgs[0];
        const isActive = name === state.activeThread;
        const unreadCount = msgs.filter(m => !m.read && m.direction === 'incoming').length;
        
        const el = document.createElement('div');
        el.className = `thread-item ${isActive ? 'active' : ''}`;
        el.onclick = () => selectThread(name);
        
        el.innerHTML = `
            <div class="avatar">${name.charAt(0).toUpperCase()}</div>
            <div class="thread-info">
                <div class="thread-top">
                    <span class="thread-name">${name}</span>
                    <span class="thread-time">${formatTime(lastMsg.timeSent)}</span>
                </div>
                <div class="thread-preview">
                    ${lastMsg.direction === 'outgoing' ? '<span class="you-prefix">You:</span> ' : ''}
                    ${escapeHtml(lastMsg.subject || lastMsg.content).substring(0, 30)}...
                </div>
            </div>
            ${unreadCount > 0 ? `<div class="unread-badge">${unreadCount}</div>` : ''}
        `;
        list.appendChild(el);
    });
}

function renderMessages(threadName) {
    const container = document.getElementById('messagesContainer');
    const msgs = state.threads[threadName];
    
    if (!msgs) return;

    // Determine render strategy: Replace innerHTML but try to keep scroll position if possible
    // For simplicity: Full re-render + scroll to bottom on first load
    
    container.innerHTML = '';
    
    // Sort oldest first for chat view
    const sorted = [...msgs].sort((a, b) => a.timeSent - b.timeSent);
    
    let lastDate = null;

    sorted.forEach(msg => {
        // Date Separator
        const dateStr = new Date(msg.timeSent).toLocaleDateString();
        if (dateStr !== lastDate) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateStr;
            container.appendChild(sep);
            lastDate = dateStr;
        }

        const isMe = msg.direction === 'outgoing';
        const bubble = document.createElement('div');
        bubble.className = `message-row ${isMe ? 'row-me' : 'row-them'}`;
        
        bubble.innerHTML = `
            <div class="message-bubble">
                ${msg.subject && msg.subject !== '(No Subject)' ? `<div class="msg-subject">${escapeHtml(msg.subject)}</div>` : ''}
                <div class="msg-content">${formatContent(msg.content)}</div>
                <div class="msg-meta">
                    <span class="msg-time">${formatTime(msg.timeSent)}</span>
                    <button class="msg-del" onclick="deleteMessage('${msg.id}')" title="Delete">&times;</button>
                </div>
            </div>
        `;
        container.appendChild(bubble);
    });

    // Mark as read (locally for now, API call could go here)
    // API call: /mail/get/:msgId/read
    
    scrollToBottom();
}

// --- Interaction Logic ---

function selectThread(name) {
    state.activeThread = name;
    
    // Update Header
    document.getElementById('activeChatInfo').classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = name;
    document.getElementById('composeForm').classList.remove('hidden');
    
    renderSidebar(); // Update active class
    renderMessages(name);
    
    // Set compose form subject to Re: Last Subject
    const msgs = state.threads[name];
    if(msgs && msgs.length > 0) {
        const last = msgs[0];
        const sub = last.subject || "";
        if(!sub.startsWith("Re:")) {
           // document.getElementById('subjectInput').value = "Re: " + sub;
        } else {
           // document.getElementById('subjectInput').value = sub;
        }
    }
}

function setupUI() {
    // Compose Form (Bottom of Chat)
    document.getElementById('composeForm').onsubmit = async (e) => {
        e.preventDefault();
        const sub = document.getElementById('subjectInput').value;
        const body = document.getElementById('messageInput').value;
        
        if (!body) return;
        
        const success = await sendEmail(state.activeThread, sub, body);
        if (success) {
            document.getElementById('messageInput').value = '';
            scrollToBottom();
        }
    };

    // Modal Handling
    const modal = document.getElementById('newMsgModal');
    const btn = document.getElementById('composeBtn');
    const close = document.querySelector('.close-modal');

    btn.onclick = () => modal.classList.remove('hidden');
    close.onclick = () => modal.classList.add('hidden');
    
    window.onclick = (e) => {
        if (e.target == modal) modal.classList.add('hidden');
    };

    document.getElementById('newThreadForm').onsubmit = async (e) => {
        e.preventDefault();
        const to = document.getElementById('newRecipient').value;
        const sub = document.getElementById('newSubject').value;
        const body = document.getElementById('newMessageBody').value;
        
        const success = await sendEmail(to, sub, body);
        if (success) {
            modal.classList.add('hidden');
            document.getElementById('newRecipient').value = '';
            document.getElementById('newMessageBody').value = '';
            state.activeThread = to; // Switch to new thread
        }
    };
}

// --- Helpers ---

function scrollToBottom() {
    const container = document.getElementById('messagesContainer');
    container.scrollTop = container.scrollHeight;
}

function escapeHtml(text) {
    if(!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatContent(text) {
    // Convert newlines to <br>, maybe linkify
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
if(window.curAlias) whenLoaded();
else addEventListener("awtsmoosAliasChange", async e => {
	await whenLoaded();
})
