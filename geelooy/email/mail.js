//B"H
/**
 * Awtsmoos Quantum Mail Client
 * Full Edition: Gatekeeper, Rules Engine, and Real-time Sockets
 */

const API_BASE = "/api/social/mail";

// State Management
const state = {
    alias: null,
    messages: [],
    threads: {}, // The currently active dictionary of threads
    threadsInbox: {},
    threadsRequests: {},
    activeThread: null,
    view: 'inbox', // 'inbox' or 'requests'
    settings: {
        gatekeeperMode: false,
        approved: {},
        rules: [],
        customScript: ""
    },
    settingsLoaded: false,
    
    replyingTo: null 
};

// --- Initialization ---

async function whenLoaded() {
    // 1. Auth Check
    if (!window.curAlias) {
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
        return;
    }

    state.alias = window.curAlias;
    document.getElementById('displayAlias').textContent = state.alias;
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    // 2. Connect Real-time
    connectSocket();

    // 3. Setup Listeners
    setupUI();

    // 4. Initial Load
    await refreshMail();
    
    // Fallback Polling (30s)
    setInterval(refreshMail, 30000);
}

// --- API Interactions ---

async function refreshMail() {
    if (!state.alias) return;
    
    try {
        // 1. Load Settings (Lazy Load)
        // We need settings to know how to filter "Requests" vs "Inbox"
        if (!state.settingsLoaded) {
            try {
                const sRes = await fetch(`${API_BASE}/settings/get?aliasId=${encodeURIComponent(state.alias)}`);
                const sData = await sRes.json();
                if(sData && !sData.error) {
                    state.settings = sData;
                    state.settingsLoaded = true;
                    populateSettingsModal(); // Pre-fill UI
                }
            } catch (e) { console.warn("Failed to load settings", e); }
        }

        // 2. Load Mail
        // _t=Date.now() prevents caching
        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&_t=${Date.now()}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            state.messages = data;
            processThreads(data);
            renderSidebar();
            
            // If active thread is visible in current view, refresh it
            if (state.activeThread && state.threads[state.activeThread]) {
                renderMessages(state.activeThread);
            } else if (state.activeThread) {
                // Thread exists but not in current view (e.g. moved to inbox)
                // Optional: Force switch view or deselect
            }
        }
    } catch (e) {
        console.error("Connection interrupted:", e);
    }
}

async function sendEmail(recipient, subject, content) {
    if(!recipient || !content) return;

    // Detect format
    const isEmail = recipient.includes("@") || recipient.includes("_at_");
    
    // Check for active reply
    let finalContent = content;
    if (state.replyingTo) {
        // Create a hidden meta block. 
        // We use data attributes so we can parse it cleanly later.
        const r = state.replyingTo;
        const metaBlock = `<div class="reply-meta" data-id="${r.id}" data-name="${r.name}" style="display:none;">${r.snippet}</div>`;
        finalContent = metaBlock + content;
        
        // Reset Reply UI
        cancelReply();
    }
    
    // UI: Clear input
    document.getElementById('messageInput').value = ''; 
    
    let url = "";
    let cleanRecipient = recipient;

    if (isEmail) {
        cleanRecipient = recipient.replace("@", "_at_");
        let cleanEmailParam = recipient.replace("_at_", "@");
        url = `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(cleanEmailParam)}`;
    } else {
        url = `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;
    }
    
    // Optimistic Update
    const time = Date.now();
    const tempMsg = {
        id: "temp_" + time,
        from: state.alias,
        to: recipient,
        subject: subject,
        content: finalContent, // Store with the meta block
        timeSent: time,
        direction: "outgoing",
        read: true,
        correspondent: cleanRecipient 
    };

    injectMessageIntoState(tempMsg);

    const bodyData = new URLSearchParams();
    bodyData.append("subject", subject);
    bodyData.append("content", finalContent); // Send modified content

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
    });
    
    const j = await res.json();
    if(!j.success) {
        alert("Transmission failed: " + (j.error ? j.error.message : "Unknown error"));
    }
}

async function deleteMessage(messageId) {
    if(!confirm("Dissolve this message?")) return;
    await fetch(`${API_BASE}/delete/${messageId}?aliasId=${state.alias}`, { method: 'DELETE' });
    await refreshMail();
}

async function deleteCurrentThread() {
    if(!state.activeThread) return;
    if(!confirm("Permanently delete this entire thread?")) return;
    
    const tid = state.activeThread;
    await fetch(`${API_BASE}/thread/delete/${tid}?aliasId=${state.alias}`);
    
    // Cleanup Local State immediately
    state.messages = state.messages.filter(m => m.correspondent !== tid);
    state.activeThread = null;
    processThreads(state.messages);
    renderSidebar();
    
    document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Thread Deleted</div>';
    document.getElementById('activeChatInfo').classList.add('hidden');
}

async function approveThread() {
    if (!state.activeThread) return;
    const tid = state.activeThread;

    await fetch(`${API_BASE}/approve/${encodeURIComponent(tid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `aliasId=${encodeURIComponent(state.alias)}`
    });

    // Update Local Settings
    if (!state.settings.approved) state.settings.approved = {};
    state.settings.approved[tid] = true;

    // Move logic
    toggleView('inbox'); 
    selectThread(tid, tid.replace(/_at_/g, '@'));
}

// B"H - DYNAMIC RULE UI GENERATOR
function addRuleUI(data = null) {
    const container = document.getElementById('rulesContainer');
    
    const div = document.createElement('div');
    div.className = "rule-card glass-card";
    
    // Defaults
    const d = data || { 
        condition: 'contains_any', 
        keywords: '', 
        actionType: 'text', 
        replyText: '',
        enabled: true 
    };

    div.innerHTML = `
        <div class="rule-header">
            <select class="rule-cond input-sm">
                <option value="contains_any" ${d.condition=='contains_any'?'selected':''}>If msg contains ANY:</option>
                <option value="contains_only" ${d.condition=='contains_only'?'selected':''}>If msg contains ONLY:</option>
                <option value="javascript" ${d.condition=='javascript'?'selected':''}>Custom JS Condition</option>
            </select>
            <button class="btn-icon danger" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
        
        <input type="text" class="rule-keys input-block" placeholder="Keywords (comma sep) e.g. Hi, Hello" value="${escapeHtml(d.keywords || d.customCondition || '')}">
        
        <div class="rule-action-row">
            <span>Then:</span>
            <select class="rule-action input-sm" onchange="toggleRuleAction(this)">
                <option value="text" ${d.actionType=='text'?'selected':''}>Reply Text</option>
                <option value="javascript" ${d.actionType=='javascript'?'selected':''}>Run JS</option>
            </select>
        </div>

        <div class="rule-content-box">
            <!-- Text Area for Reply or Code -->
            <textarea class="rule-reply input-block" rows="2" placeholder="Response... Use $keyword+1 to grab words">${d.replyText || d.replyScript || ''}</textarea>
        </div>
    `;
    
    container.appendChild(div);
}

function toggleRuleAction(select) {
    const textarea = select.parentElement.nextElementSibling.querySelector('textarea');
    if (select.value === 'javascript') {
        textarea.placeholder = "reply('Hello ' + msg.from);";
        textarea.classList.add('code-font');
    } else {
        textarea.placeholder = "Response... Use $keyword+1 to grab words";
        textarea.classList.remove('code-font');
    }
}

// Override/Update the Save function to scrape the DOM
async function saveSettingsUI() {
    const gate = document.getElementById('gatekeeperToggle').checked;
    const customJs = document.getElementById('customScriptInput').value;

    // Scrape Rules from DOM
    const rules = [];
    document.querySelectorAll('#rulesContainer .rule-card').forEach(card => {
        const cond = card.querySelector('.rule-cond').value;
        const keyInput = card.querySelector('.rule-keys').value;
        const act = card.querySelector('.rule-action').value;
        const content = card.querySelector('.rule-reply').value;
        
        const rule = {
            enabled: true,
            condition: cond,
            actionType: act
        };

        if (cond === 'javascript') rule.customCondition = keyInput;
        else rule.keywords = keyInput;

        if (act === 'javascript') rule.replyScript = content;
        else rule.replyText = content;

        rules.push(rule);
    });

    const newSettings = {
        gatekeeperMode: gate,
        approved: state.settings.approved || {},
        rules: rules,
        customScript: customJs
    };

    await fetch(`${API_BASE}/settings/save`, {
        method: 'POST',
        headers: {'Content-Type':'application/x-www-form-urlencoded'},
        body: `aliasId=${encodeURIComponent(state.alias)}&settings=${encodeURIComponent(JSON.stringify(newSettings))}`
    });

    state.settings = newSettings;
    alert("Settings Saved");
    document.getElementById('settingsModal').classList.add('hidden');
    refreshMail(); 
}

async function markAsRead(msgId) {
    // Fire and forget
    fetch(`${API_BASE}/get/${msgId}/read?aliasId=${state.alias}`).catch(()=>{});
}


// --- Message Actions ---

let selectedMsgId = null;
let selectedMsgContent = "";

function openMsgMenu(msgId, content, isMe) {
    selectedMsgId = msgId;
    selectedMsgContent = unescapeHtml(content); // Helpers to decode if needed
    
    const modal = document.getElementById('msgContextModal');
    modal.classList.remove('hidden');
    
    // Vibrate on mobile for tactile feel
    if(navigator.vibrate) navigator.vibrate(50);
}

function closeMsgMenu() {
    document.getElementById('msgContextModal').classList.add('hidden');
    selectedMsgId = null;
}

// --- Message Actions & Swipe Logic ---

// Swipe Logic Variables
let touchStartX = 0;
let touchCurrentX = 0;
const SWIPE_THRESHOLD = 80;

function attachSwipeLogic(element, msg, senderName) {
    // Only enable on Touch Devices to prevent mouse interference
    // or check media query. For now, we bind touch events.
    
    element.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, {passive: true});

    element.addEventListener('touchmove', e => {
        touchCurrentX = e.touches[0].clientX;
        const diff = touchCurrentX - touchStartX;
        
        // Limit swipe logic to Right Swipe (pulling from left -> right) to reply
        // WhatsApp actually does Right-to-Left for reply usually? 
        // User asked "drag from side". We'll do Pull Right -> Reply.
        
        if (diff > 0 && diff < 150) {
            // Visual feedback
            element.style.transform = `translateX(${diff}px)`;
            if(diff > SWIPE_THRESHOLD) {
                element.querySelector('.swipe-indicator').style.opacity = '1';
                element.querySelector('.swipe-indicator').style.right = 'auto';
                element.querySelector('.swipe-indicator').style.left = '-30px'; 
            }
        }
    }, {passive: true});

    element.addEventListener('touchend', e => {
        const diff = touchCurrentX - touchStartX;
        element.style.transform = ''; // Reset position
        element.querySelector('.swipe-indicator').style.opacity = '0';
        touchStartX = 0;
        touchCurrentX = 0;

        if (diff > SWIPE_THRESHOLD) {
            // Trigger Reply
            triggerReplyMode(msg.id, msg.textContent || msg.content, senderName);
        }
    });
}

function triggerReplyMode(id, content, senderName) {
    // Clean content for snippet
    let snippet = content.replace(/<[^>]*>?/gm, '').substring(0, 50);
    if(content.length > 50) snippet += "...";
    
    state.replyingTo = {
        id: id,
        name: senderName,
        snippet: snippet
    };

    // UI Updates
    document.getElementById('replyPreview').classList.remove('hidden');
    document.getElementById('replySnippet').textContent = snippet;
    document.getElementById('messageInput').focus();
    
    // Close context menu if open
    closeMsgMenu();
}

function cancelReply() {
    state.replyingTo = null;
    document.getElementById('replyPreview').classList.add('hidden');
}

function scrollToMsg(id) {
    // Look for row
    const el = document.getElementById(`msg_row_${id}`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-msg');
        setTimeout(() => el.classList.remove('highlight-msg'), 2000);
    } else {
        alert("Message is too old or not loaded.");
    }
}

// Updated Context Menu Action
function handleMsgAction(action) {
    if (!selectedMsgId) return;
    
    if (action === 'copy') {
        navigator.clipboard.writeText(selectedMsgContent).then(() => alert("Copied!"));
    } else if (action === 'reply') {
        // Calculate sender name logic (basic heuristic since we don't have full object here)
        // Ideally pass full object to openMsgMenu. 
        // For now, assume "Them" if not me.
        triggerReplyMode(selectedMsgId, selectedMsgContent, "Replying..."); 
    } else if (action === 'delete') {
        deleteMessage(selectedMsgId);
    }
    
    closeMsgMenu();
}

function unescapeHtml(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

// --- Data Logic (The Brain) ---

function processThreads(messages) {
    const groups = {};
    messages.forEach(msg => {
        let partner = msg.correspondent;
        if (!groups[partner]) groups[partner] = [];
        groups[partner].push(msg);
    });
    
    state.threadsInbox = {};
    state.threadsRequests = {};

    Object.keys(groups).forEach(partner => {
        const msgs = groups[partner];
        
        // Sorting Logic:
        // 1. Is it approved?
        const isApproved = state.settings.approved && state.settings.approved[partner];
        // 2. Did I send a message? (Implicit approval)
        const hasOutgoing = msgs.some(m => m.direction === 'outgoing');
        // 3. Did server flag it?
        const serverFlag = msgs.some(m => m.status === 'inbox'); // If server marked inbox

        if (!state.settings.gatekeeperMode || isApproved || hasOutgoing || serverFlag) {
            state.threadsInbox[partner] = msgs;
        } else {
            state.threadsRequests[partner] = msgs;
        }
    });
    
    // Switch active view dict
    state.threads = (state.view === 'requests') ? state.threadsRequests : state.threadsInbox;
}

// --- UI Logic ---

function renderSidebar() {
    const list = document.getElementById('threadsList');
    list.innerHTML = '';
    
    // Sort by time of NEWEST message in thread
    const names = Object.keys(state.threads).sort((a, b) => {
        const msgsA = state.threads[a];
        const msgsB = state.threads[b];
        // Assuming array sorted oldest->newest, grab last
        const lastA = msgsA[msgsA.length - 1].timeSent;
        const lastB = msgsB[msgsB.length - 1].timeSent;
        return lastB - lastA;
    });

    if(names.length === 0) {
        list.innerHTML = `<div class="empty-list-msg">No ${state.view}</div>`;
        return;
    }

    names.forEach(name => {
        const msgs = state.threads[name];
        const lastMsg = msgs[msgs.length - 1];
        const unread = msgs.filter(m => !m.read && m.direction === 'incoming').length;
        
        // Display Name Logic
        let displayName = name.replace(/_at_/g, "@");
        for(let i=msgs.length-1; i>=0; i--) {
            if(msgs[i].direction === 'incoming' && msgs[i].fromName) {
                displayName = msgs[i].fromName;
                break;
            }
        }
        
        // Create Element
        const item = document.createElement('div');
        item.className = `thread-item ${state.activeThread === name ? 'active' : ''}`;
        item.onclick = () => selectThread(name, displayName);
        
        item.innerHTML = `
            <div class="avatar">${displayName.charAt(0).toUpperCase()}</div>
            <div class="thread-info">
                <div class="thread-top">
                    <span class="thread-name">${escapeHtml(displayName)}</span>
                    <span class="thread-time">${formatTime(lastMsg.timeSent)}</span>
                </div>
                <div class="thread-preview">
                    ${lastMsg.direction === 'outgoing' ? '<span class="you-prefix">You:</span> ' : ''}
                    ${escapeHtml(lastMsg.subject || lastMsg.snippet || lastMsg.content).substring(0, 30)}...
                </div>
            </div>
            ${unread > 0 ? `<div class="unread-badge">${unread}</div>` : ''}
        `;
        list.appendChild(item);
    });
}

function renderMessages(threadName) {
    const container = document.getElementById('messagesContainer');
    const msgs = state.threads[threadName];
    
    if (!msgs) {
        container.innerHTML = '<div class="empty-state">Thread not found in this view</div>';
        return;
    }

    container.innerHTML = '';
    let lastDate = null;

    msgs.forEach(msg => {
        const ts = msg.time || msg.timeSent;
        const dateStr = new Date(ts).toLocaleDateString();
        
        if (dateStr !== lastDate) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateStr;
            container.appendChild(sep);
            lastDate = dateStr;
        }

        const isMe = msg.direction === 'outgoing';
        
        // 1. Process Content & Extract Quote
        let contentHtml = msg.content || "";
        let quoteHtml = "";
        
        // Detect our custom quote format: <div class="reply-meta"...>
        if (contentHtml.includes('class="reply-meta"')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHtml;
            const quoteEl = tempDiv.querySelector('.reply-meta');
            if(quoteEl) {
                // Extract data
                const qId = quoteEl.getAttribute('data-id');
                const qName = quoteEl.getAttribute('data-name');
                const qText = quoteEl.textContent;
                
                quoteHtml = `
                    <div class="embedded-quote" onclick="scrollToMsg('${qId}')">
                        <span class="quote-name">${escapeHtml(qName)}</span>
                        ${escapeHtml(qText)}
                    </div>
                `;
                
                // Remove the meta block from the main body
                quoteEl.remove();
                contentHtml = tempDiv.innerHTML;
            }
        }
        
        // Clean remaining content
        contentHtml = formatContent(contentHtml);

        // 2. Attachments
        let attHtml = "";
        if(msg.attachments) {
            msg.attachments.forEach(a => {
                if(!a.wasEmbedded && a.contentType && a.contentType.startsWith('image/')) {
                    attHtml += `<div class="att-img-wrap"><img src="${a.data}" title="${a.filename}"></div>`;
                }
            });
        }

        const senderName = isMe ? "Me" : (msg.fromName || msg.from || "Unknown");

        // 3. Construct Elements
        const row = document.createElement('div');
        row.className = `message-row ${isMe ? 'row-me' : 'row-them'}`;
        row.id = `msg_row_${msg.id}`; // For scrolling
        
        // Swipe Indicator Icon
        const swipeIcon = document.createElement('div');
        swipeIcon.className = 'swipe-indicator';
        swipeIcon.innerHTML = '↩️';
        row.appendChild(swipeIcon);

        const bubble = document.createElement('div');
        bubble.className = "message-bubble";
        
        // Long Press Handler
        bubble.oncontextmenu = (e) => {
            e.preventDefault(); 
            openMsgMenu(msg.id, msg.textContent || msg.content, isMe);
        };
        
        bubble.innerHTML = `
            <span class="msg-sender-name">${escapeHtml(senderName)}</span>
            <button class="msg-menu-btn" onclick="event.stopPropagation(); openMsgMenu('${msg.id}', '${escapeHtml(msg.textContent || msg.content)}', ${isMe})">•••</button>
            
            ${quoteHtml}
            ${msg.subject && msg.subject !== '(No Subject)' ? `<div class="msg-subject">${escapeHtml(msg.subject)}</div>` : ''}
            <div class="msg-content email-body">${contentHtml}</div>
            ${attHtml}
            <div class="msg-meta">
                <span class="msg-time">${formatTime(ts)}</span>
            </div>
        `;
        
        row.appendChild(bubble);
        container.appendChild(row);
        
        // 4. Attach Swipe Listeners
        attachSwipeLogic(row, msg, senderName);
    });

    // Auto Scroll
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

function selectThread(name, displayName) {
    state.activeThread = name;
    
    document.getElementById('appContainer').classList.add('chat-open');
    
    
    
    // Header
    const chatInfo = document.getElementById('activeChatInfo');
    chatInfo.classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = displayName || name;
    
    // Controls Visibility
    const isRequest = (state.view === 'requests');
    if (isRequest) {
        document.getElementById('approveBtn').classList.remove('hidden');
        document.getElementById('composeForm').classList.add('hidden');
    } else {
        document.getElementById('approveBtn').classList.add('hidden');
        document.getElementById('composeForm').classList.remove('hidden');
    }

    renderMessages(name);
    renderSidebar(); // Update active highlight

    // Mark Read
    const msgs = state.threads[name];
    if (msgs) {
        const unread = msgs.filter(m => !m.read && m.direction === 'incoming');
        if (unread.length > 0) {
            unread.forEach(m => m.read = true);
            renderSidebar(); // Update badge
            unread.forEach(m => markAsRead(m.id));
        }
    }
}

function toggleView(newView) {
    state.view = newView;
    
    // CSS Tabs
    document.getElementById('btn-inbox').classList.toggle('active', newView === 'inbox');
    document.getElementById('btn-requests').classList.toggle('active', newView === 'requests');
    
    processThreads(state.messages);
    renderSidebar();
    
    // Reset Chat if it's not in the new view
    if (state.activeThread && !state.threads[state.activeThread]) {
        document.getElementById('messagesContainer').innerHTML = '';
        document.getElementById('activeChatInfo').classList.add('hidden');
        state.activeThread = null;
    } else if (state.activeThread) {
        selectThread(state.activeThread); // re-verify buttons
    }
}

// --- Helpers & Setup ---

function populateSettingsModal() {
    const s = state.settings;
    if(document.getElementById('gatekeeperToggle')) {
        document.getElementById('gatekeeperToggle').checked = !!s.gatekeeperMode;
        document.getElementById('customScriptInput').value = s.customScript || "";
        
        // B"H - Render Rules UI
        const container = document.getElementById('rulesContainer');
        container.innerHTML = ""; // Clear existing
        
        if (s.rules && Array.isArray(s.rules)) {
            s.rules.forEach(rule => addRuleUI(rule));
        }
    }
}

// B"H - Normalized State Injection
function injectMessageIntoState(msg) {
    if (state.messages.some(m => m.id === msg.id)) return;

    // NORMALIZATION FIX: Ensure thread IDs match existing ones
    // If msg.correspondent is short ("bob"), and we have ("bob_at_..."), remap it.
    let targetThread = msg.correspondent;
    const existingKey = Object.keys(state.threads).find(key => {
        // Match "bob" to "bob_at_..." or vice versa
        const cleanKey = key.split('_at_')[0];
        const cleanMsg = targetThread.split('_at_')[0];
        return cleanKey === cleanMsg;
    });

    if(existingKey) {
        msg.correspondent = existingKey; // Force new message into old thread container
    }

    state.messages.push(msg);
    processThreads(state.messages);
    renderSidebar();
    
    // Refresh if viewing this thread
    if (state.activeThread === msg.correspondent) {
        renderMessages(state.activeThread);
    }
}

function formatContent(text) {
    return escapeHtml(text).replace(/\n/g, '<br>');
}

function escapeHtml(text) {
    if (!text) return "";
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function setupUI() {
    // Send Form
    document.getElementById('composeForm').onsubmit = (e) => {
        e.preventDefault();
        const sub = document.getElementById('subjectInput').value;
        const msg = document.getElementById('messageInput').value;
        if(state.activeThread) sendEmail(state.activeThread, sub, msg);
    };

    // New Message Modal
    const modal = document.getElementById('newMsgModal');
    document.getElementById('composeBtn').onclick = () => modal.classList.remove('hidden');
    document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
    document.getElementById('newThreadForm').onsubmit = (e) => {
        e.preventDefault();
        const to = document.getElementById('newRecipient').value;
        const sub = document.getElementById('newSubject').value;
        const msg = document.getElementById('newMessageBody').value;
        
        sendEmail(to, sub, msg).then(ok => {
            if(ok) {
                modal.classList.add('hidden');
                // Format ID for selection (simple heuristic)
                let tId = to.includes('@') ? to.replace('@','_at_') : to + "_at_awtsmoos.com";
                state.activeThread = tId; 
                toggleView('inbox');
            }
        });
    };
}

// Add this to global scope
function backToInbox() {
    document.getElementById('appContainer').classList.remove('chat-open');
    state.activeThread = null;
    renderSidebar(); // Refresh to remove active highlight
}

let socket;
function connectSocket() {
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${proto}://${location.host}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'LOGIN', aliasId: state.alias }));
    };
    socket.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'NEW_MAIL' && data.message) {
                injectMessageIntoState(data.message);
            }
        } catch(e){}
    };
    socket.onclose = () => setTimeout(connectSocket, 5000);
}

if (window.curAlias) whenLoaded();
else addEventListener("awtsmoosAliasChange", whenLoaded);