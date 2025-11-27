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
    connectSocket()
    document.getElementById('displayAlias').textContent = state.alias;
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    // 2. Setup Event Listeners
    setupUI();

    // 3. Load Data
    await refreshMail();
    
   
};

// --- API Interactions ---

async function refreshMail() {
    if (!state.alias) {
        return;
    }
    try {
        // B"H - CACHE BUSTER ADDED (_t)
        // This forces the browser to actually ask the server for new data
        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&_t=${Date.now()}`);
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

    const isEmail = recipient.includes("@") || recipient.includes("_at_");
    
    let url = "";
    if (isEmail) {
        // Fix: Ensure we send clean email if user typed it
        let cleanEmail = recipient.replace("_at_", "@");
        url = `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(cleanEmail)}`;
    } else {
        url = `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;
    }
    
    const bodyData = new URLSearchParams();
    bodyData.append("subject", subject);
    bodyData.append("content", content);
    
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
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

async function markAsRead(msgId) {
    try {
        await fetch(`${API_BASE}/get/${msgId}/read?aliasId=${state.alias}`);
    } catch(e) { console.error("Failed to mark read", e); }
}

// --- Data Processing ---

function processThreads(messages) {
    const groups = {};
    
    messages.forEach(msg => {
        let partner = msg.correspondent;
        if (!partner) {
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
        const lastA = state.threads[a][0].timeSent; // Assumes API sends newest first or we sorted
        const lastB = state.threads[b][0].timeSent;
        return lastB - lastA;
    });

    threadNames.forEach(name => {
        const msgs = state.threads[name];
        
        // Find the newest message to get display info
        // (Our API sort in 'getMail' puts oldest first, so newest is at end)
        // Wait, 'getMail' returns oldest->newest. So newest is msgs[msgs.length-1]
        // BUT processThreads pushes them in order. Let's grab the LAST one in array as newest.
        const newestMsg = msgs[msgs.length - 1];
        
        const isActive = name === state.activeThread;
        const unreadCount = msgs.filter(m => !m.read && m.direction === 'incoming').length;
        
        // B"H - NAME FORMATTING LOGIC
        // 1. Try 'fromName' (e.g. "Awts Moos")
        // 2. Try 'fromEmail' (e.g. "awts@gmail.com")
        // 3. Fallback to thread name with @ replacement
        
        let displayName = name.replace(/_at_/g, "@"); // Default fallback
        
        // Loop backwards to find a valid 'fromName' from the correspondent
        for(let i = msgs.length -1; i >= 0; i--) {
            if(msgs[i].direction === 'incoming' && msgs[i].fromName) {
                displayName = msgs[i].fromName;
                break;
            }
        }

        // If still the raw ID, try cleaning it up
        if(displayName.includes("_at_")) displayName = displayName.replace(/_at_/g, "@");

        const el = document.createElement('div');
        el.className = `thread-item ${isActive ? 'active' : ''}`;
        el.onclick = () => selectThread(name, displayName);
        
        el.innerHTML = `
            <div class="avatar">${displayName.charAt(0).toUpperCase()}</div>
            <div class="thread-info">
                <div class="thread-top">
                    <span class="thread-name">${escapeHtml(displayName)}</span>
                    <span class="thread-time">${formatTime(newestMsg.timeSent)}</span>
                </div>
                <div class="thread-preview">
                    ${newestMsg.direction === 'outgoing' ? '<span class="you-prefix">You:</span> ' : ''}
                    ${escapeHtml(newestMsg.subject || newestMsg.content).substring(0, 30)}...
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

    // Only fully wipe and redraw if it's a different thread or empty
    // For simplicity in this demo, we redraw. In prod, use diffing.
    container.innerHTML = '';
    
    // API returns oldest first (a-b), which is what we want for chat
    const sorted = msgs; 
    
    let lastDate = null;

    sorted.forEach(msg => {
        const ts = msg.time || msg.timeSent || Date.now();
        const dateStr = new Date(ts).toLocaleDateString();
        
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
        
        let bodyHtml = "";
        // Use server provided HTML if available and looks safe-ish
        if (msg.content && (msg.content.includes('<div') || msg.content.includes('<br'))) {
            bodyHtml = msg.content;
        } else {
            bodyHtml = formatContent(msg.textContent || msg.content || "");
        }
        
        // Attachments
        let attachmentHtml = "";
        if (msg.attachments && Array.isArray(msg.attachments)) {
            msg.attachments.forEach(att => {
                // If it wasn't already embedded via CID
                if(!att.wasEmbedded && att.contentType.startsWith("image/")) {
                    attachmentHtml += `<br><img src="${att.data}" class="email-img" alt="${att.filename}">`;
                }
            });
        }

        bubble.innerHTML = `
            <div class="message-bubble">
                ${msg.subject && msg.subject !== '(No Subject)' ? `<div class="msg-subject">${escapeHtml(msg.subject)}</div>` : ''}
                
                <div class="msg-content email-body">
                    ${bodyHtml}
                    ${attachmentHtml}
                </div>
                
                <div class="msg-meta">
                    <span class="msg-time">${formatTime(ts)}</span>
                    <button class="msg-del" onclick="deleteMessage('${msg.id}')" title="Delete">&times;</button>
                </div>
            </div>
        `;
        container.appendChild(bubble);
    });

    scrollToBottom();
}

// --- Interaction Logic ---

async function selectThread(name, prettyName) {
    state.activeThread = name;
    
    // Update Header
    document.getElementById('activeChatInfo').classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = prettyName || name.replace(/_at_/g, "@");
    document.getElementById('composeForm').classList.remove('hidden');
    
    // B"H - MARK AS READ LOGIC
    // 1. Find unread incoming messages
    const msgs = state.threads[name] || [];
    const unreadMsgs = msgs.filter(m => !m.read && m.direction === 'incoming');
    
    if (unreadMsgs.length > 0) {
        // 2. Optimistic Update (Client side)
        unreadMsgs.forEach(m => m.read = true);
        
        // 3. Re-render Sidebar to remove badge immediately
        renderSidebar();
        
        // 4. Send API requests in background
        for (const msg of unreadMsgs) {
            await markAsRead(msg.id);
        }
    } else {
        renderSidebar(); // Update active class
    }

    renderMessages(name);
}

function setupUI() {
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
            state.activeThread = to.replace("@", "_at_"); 
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
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


function connectSocket() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${proto}://${location.host}`);

    socket.onopen = () => {
        console.log("B\"H - Socket Connected");
        // IDENTIFY
        // Ensure we send the ID formatted as the server expects (usually with _at_)
        // or let server handle matching. Sending raw alias is safest.
        socket.send(JSON.stringify({
            type: 'LOGIN',
            aliasId: state.alias
        }));
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'NEW_MAIL') {
                console.log("B\"H - New Mail Received!", data.message);
                
                // OPTIMISTIC UPDATE: Inject directly into state
                // This makes the UI update instantly without waiting for fetch
                if(data.message) {
                    // Avoid duplicates
                    const exists = state.messages.find(m => m.id === data.message.id);
                    if(!exists) {
                        state.messages.push(data.message);
                        processThreads(state.messages);
                        renderSidebar();
                        if(state.activeThread === data.message.correspondent) {
                            renderMessages(state.activeThread);
                        }
                    }
                }

                // Still fetch to be safe (syncs everything else)
                refreshMail(); 
            }
        } catch(e) {}
    };

    socket.onclose = () => {
        console.log("Socket disconnected, retrying in 5s...");
        setTimeout(connectSocket, 5000);
    };
}

if(window.curAlias) whenLoaded();
else addEventListener("awtsmoosAliasChange", async e => {
    await whenLoaded();
});