//B"H
/**
 * Awtsmoos Quantum Mail Client
 * Edition: Infinite Scroll & Caching
 */

const API_BASE = "/api/social/mail";

// --- The Vessel (State) ---
const state = {
    alias: null,
    
    // Data Structures
    threads: {},        // Map<ThreadID, Array<Message>> (The Cache)
    snippets: [],       // Array<Message> (The Sidebar List)
    
    // View State
    activeThread: null,
    view: 'inbox',      // 'inbox' | 'requests'
    pagination: {},     // Map<ThreadID, PageNumber>
    
    // Config
    settings: { gatekeeperMode: false, approved: {}, rules: [] },
    settingsLoaded: false,
    
    // UI State
    replyingTo: null,
    isLoadingHistory: false
};

// --- Genesis ---

async function whenLoaded() {
    if (!window.curAlias) {
        document.getElementById('loginOverlay').classList.remove('hidden');
        return;
    }
    state.alias = window.curAlias;
    document.getElementById('displayAlias').textContent = state.alias;
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    connectSocket();
    setupUI();
    
    // Initial Fetch: Snippets Only
    await refreshSnippets();
    
    // Poll for new snippets
    setInterval(refreshSnippets, 30000);
}

// --- API: The Flow of Light ---

/**
 * Fetches the latest message for every thread (The Headers).
 */
async function refreshSnippets() {
    if (!state.alias) return;
    try {
        // Load settings if needed
        if (!state.settingsLoaded) await loadSettings();

        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=threads&_t=${Date.now()}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            state.snippets = data;
            renderSidebar();
        }
    } catch (e) { console.error("Snippet fetch failed", e); }
}

/**
 * Fetches specific pages of history for a thread.
 */
/**
 * Fetches specific pages of history for a thread.
 */
async function loadThreadHistory(threadId, page = 1) {
    if (!state.alias) return;
    
    state.isLoadingHistory = true;
    
    try {
        // B"H - Request 'messages' view from server
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=messages&threadId=${encodeURIComponent(threadId)}&page=${page}`;
        const res = await fetch(url);
        const newMsgs = await res.json();
        
        if (Array.isArray(newMsgs) && newMsgs.length > 0) {
            if (!state.threads[threadId]) state.threads[threadId] = [];
            
            // Deduplicate based on UID
            const currentIds = new Set(state.threads[threadId].map(m => m.uid));
            const uniqueNew = newMsgs.filter(m => !currentIds.has(m.uid));
            
            // Add new messages and re-sort chronological
            state.threads[threadId] = [...state.threads[threadId], ...uniqueNew].sort((a,b) => a.timeSent - b.timeSent);
            
            state.pagination[threadId] = page;
            return uniqueNew.length;
        }
        return 0;
    } finally {
        state.isLoadingHistory = false;
    }
}

async function loadSettings() {
    try {
        const sRes = await fetch(`${API_BASE}/settings/get?aliasId=${encodeURIComponent(state.alias)}`);
        const sData = await sRes.json();
        if(sData && !sData.error) {
            state.settings = sData;
            state.settingsLoaded = true;
            populateSettingsModal();
        }
    } catch (e) {}
}

async function sendEmail(recipient, subject, content) {
    if(!recipient || !content) return;

    // 1. Prepare Content (Handle Reply)
    let finalContent = content;
    if (state.replyingTo) {
        const r = state.replyingTo;
        const metaBlock = `<div class="reply-meta" data-uid="${r.uid}" data-name="${escapeHtml(r.name)}" style="display:none;">${r.snippet}</div>`;
        finalContent = metaBlock + content;
        cancelReply();
    }
    
    // 2. UI Clear & Reset
    const input = document.getElementById('messageInput');
    input.value = '';
    input.style.height = 'auto'; // Reset height
    updateSendButtonState();

    // 3. Optimistic Update
    const time = Date.now();
    const tempMsg = {
        id: "temp_" + time,
        uid: time + "",
        from: state.alias,
        to: recipient,
        subject: subject,
        content: finalContent,
        timeSent: time,
        direction: "outgoing",
        read: true,
        correspondent: recipient.includes('@') ? recipient.replace('@','_at_') : recipient 
    };

    // Inject into Cache
    injectMessageIntoCache(tempMsg);

    // 4. Network Request
    let url = recipient.includes("@") 
        ? `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(recipient.replace("_at_", "@"))}`
        : `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;

    const bodyData = new URLSearchParams();
    bodyData.append("subject", subject);
    bodyData.append("content", finalContent);

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
    });
    
    // Refresh snippets to update the sidebar order
    refreshSnippets();
}

// --- UI Rendering ---

function renderSidebar() {
    const list = document.getElementById('threadsList');
    list.innerHTML = '';

    // Filter based on View (Inbox vs Requests)
    const filtered = state.snippets.filter(msg => {
        const partner = msg.correspondent;
        const isApproved = state.settings.approved?.[partner] || state.settings.approved?.[partner.split('_at_')[0]];
        const hasOutgoing = msg.direction === 'outgoing'; 
        // Note: Ideally we check the whole thread for outgoing, 
        // but for snippets, we assume if we are talking, it's inbox.
        
        const isInbox = !state.settings.gatekeeperMode || isApproved || hasOutgoing || msg.status === 'inbox';
        return state.view === 'requests' ? !isInbox : isInbox;
    });

    if(filtered.length === 0) {
        list.innerHTML = `<div class="empty-list-msg">No ${state.view}</div>`;
        return;
    }

    filtered.forEach(msg => {
        const name = msg.correspondent;
        const displayName = msg.fromName || name.replace(/_at_/g, "@");
        
        const item = document.createElement('div');
        item.className = `thread-item ${state.activeThread === name ? 'active' : ''}`;
        item.onclick = () => selectThread(name, displayName);
        
        item.innerHTML = `
            <div class="avatar">${displayName.charAt(0).toUpperCase()}</div>
            <div class="thread-info">
                <div class="thread-top">
                    <span class="thread-name">${escapeHtml(displayName)}</span>
                    <span class="thread-time">${formatTime(msg.timeSent)}</span>
                </div>
                <div class="thread-preview">
                    ${msg.direction === 'outgoing' ? '<span class="you-prefix">You:</span> ' : ''}
                    ${escapeHtml(msg.subject || msg.snippet || msg.content).substring(0, 30)}...
                </div>
            </div>
        `;
        list.appendChild(item);
    });
}

async function selectThread(threadId, displayName) {
    state.activeThread = threadId;
    document.getElementById('appContainer').classList.add('chat-open');
    document.getElementById('activeChatInfo').classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = displayName || threadId;

    // --- CRITICAL FIX: Manage Compose vs Approve Visibility ---
    const isRequest = (state.view === 'requests');
    if (isRequest) {
        document.getElementById('approveBtn').classList.remove('hidden');
        document.getElementById('composeForm').classList.add('hidden');
    } else {
        document.getElementById('approveBtn').classList.add('hidden');
        document.getElementById('composeForm').classList.remove('hidden');
    }

    // Load History if not in cache
    if (!state.threads[threadId]) {
        document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Loading light...</div>';
        await loadThreadHistory(threadId, 1);
    }

    renderMessages(threadId, true); // True = Scroll to bottom
    renderSidebar(); // Update active class
    
    // Attach Scroll Listener for Pagination
    attachScrollListener();
}

function renderMessages(threadId, forceScrollBottom = false) {
    const container = document.getElementById('messagesContainer');
    const msgs = state.threads[threadId] || [];
    
    // Preserve scroll position if prepending
    const oldScrollHeight = container.scrollHeight;
    const oldScrollTop = container.scrollTop;

    container.innerHTML = '';

    if (msgs.length === 0 && !state.isLoadingHistory) {
        container.innerHTML = '<div class="empty-state">No messages here.</div>';
        return;
    }

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
        
        container.appendChild(createMessageRow(msg));
    });

    if (forceScrollBottom) {
        setTimeout(() => container.scrollTop = container.scrollHeight, 0);
    } else {
        // Restore position (for pagination)
        const newScrollHeight = container.scrollHeight;
        container.scrollTop = oldScrollTop + (newScrollHeight - oldScrollHeight);
    }
}

function createMessageRow(msg) {
    const isMe = msg.direction === 'outgoing';
    const row = document.createElement('div');
    row.className = `message-row ${isMe ? 'row-me' : 'row-them'}`;
    row.id = `msg_row_${msg.id}`;
    row.dataset.uid = msg.uid || msg.timeSent;
    
    // Quote Logic
    let contentHtml = msg.content || "";
    let quoteHtml = "";
    if (contentHtml.includes('class="reply-meta"')) {
        const div = document.createElement('div');
        div.innerHTML = contentHtml;
        const meta = div.querySelector('.reply-meta');
        if (meta) {
            const qUid = meta.getAttribute('data-uid');
            const qName = meta.getAttribute('data-name');
            const qText = meta.textContent;
            quoteHtml = `<div class="embedded-quote" onclick="scrollToMsg('${qUid}')">
                            <span class="quote-name">${escapeHtml(qName)}</span>${escapeHtml(qText)}
                         </div>`;
            meta.remove();
            contentHtml = div.innerHTML;
        }
    }

    const senderName = isMe ? "Me" : (msg.fromName || "Them");

    row.innerHTML = `
        <div class="swipe-indicator">↩️</div>
        <div class="message-bubble">
            <span class="msg-sender-name">${escapeHtml(senderName)}</span>
            <button class="msg-menu-btn" onclick="event.stopPropagation(); findAndOpenMenu('${msg.id}')">•••</button>
            ${quoteHtml}
            <div class="msg-content email-body">${formatContent(contentHtml)}</div>
            <div class="msg-meta"><span class="msg-time">${formatTime(msg.timeSent)}</span></div>
        </div>
    `;

    // Bind Interaction
    const bub = row.querySelector('.message-bubble');
    bub.oncontextmenu = (e) => { e.preventDefault(); openMsgMenu(msg, isMe); };
    attachSwipeLogic(row, msg, senderName);

    return row;
}

// --- Infinite Scroll Logic ---

function attachScrollListener() {
    const container = document.getElementById('messagesContainer');
    container.onscroll = async () => {
        if (container.scrollTop < 50 && !state.isLoadingHistory) {
            // Reached top - load older messages
            const tid = state.activeThread;
            const nextPage = (state.pagination[tid] || 1) + 1;
            
            const added = await loadThreadHistory(tid, nextPage);
            if (added > 0) {
                renderMessages(tid, false); // Render without forcing bottom scroll
            }
        }
    };
}

// --- Utilities ---

function injectMessageIntoCache(msg) {
    let tid = msg.correspondent;
    
    // B"H - Normalization: Always try to match existing thread first
    // If we have a thread "coby", and msg is "coby_at_awtsmoos.com", merge them.
    const cleanTid = tid.split('_at_')[0];
    
    const existingKey = Object.keys(state.threads).find(k => {
        const kClean = k.split('_at_')[0];
        return k === tid || kClean === cleanTid;
    });

    if (existingKey) {
        tid = existingKey;
        msg.correspondent = tid; // Force message to adopt the active thread ID
    }

    if (!state.threads[tid]) state.threads[tid] = [];
    
    // Only push if not exists (Dedup by UID)
    if (!state.threads[tid].some(m => m.uid == msg.uid)) {
        state.threads[tid].push(msg);
        state.threads[tid].sort((a,b) => a.timeSent - b.timeSent);
        
        // Update Snippet
        const snipIdx = state.snippets.findIndex(s => s.correspondent === tid);
        if (snipIdx > -1) {
            state.snippets[snipIdx] = msg;
        } else {
            state.snippets.unshift(msg);
        }
        
        // If viewing this thread, render the new message
        if (state.activeThread === tid) renderMessages(tid, true);
        renderSidebar();
    }
}

function updateSendButtonState() {
    const el = document.getElementById('messageInput');
    const val = el ? el.value.trim() : "";
    const btn = document.querySelector('.btn-send');
    if(btn) {
        if(val.length > 0) btn.classList.add('ready');
        else btn.classList.remove('ready');
    }
}



function findAndOpenMenu(id) { const m = state.threads[state.activeThread]?.find(x=>x.id==id); if(m) openMsgMenu(m); }
function openMsgMenu(m) { selectedMsgObj = m; document.getElementById('msgContextModal').classList.remove('hidden'); }
function closeMsgMenu() { document.getElementById('msgContextModal').classList.add('hidden'); }


function formatContent(text) {
    if (!text) return "";
    
    // B"H - Heuristic: If it looks like HTML, assume it's trusted (sanitized by server)
    // Checking for common tags like <div, <span, <br, <p
    if (/<[a-z][\s\S]*>/i.test(text) || text.includes('style=')) {
        return text; // Return raw HTML
    }
    
    // Otherwise, it's plain text -> Escape it and add line breaks
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
    // Compose Form
    document.getElementById('composeForm').onsubmit = (e) => {
        e.preventDefault();
        const sub = document.getElementById('subjectInput').value;
        const msg = document.getElementById('messageInput').value;
        if(state.activeThread) sendEmail(state.activeThread, sub, msg);
    };

    // Modal Triggers
    const modal = document.getElementById('newMsgModal');
    document.getElementById('composeBtn').onclick = () => modal.classList.remove('hidden');
    document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
    
    // New Thread Logic
    document.getElementById('newThreadForm').onsubmit = (e) => {
        e.preventDefault();
        const to = document.getElementById('newRecipient').value;
        const sub = document.getElementById('newSubject').value;
        const msg = document.getElementById('newMessageBody').value;
        
        sendEmail(to, sub, msg).then(ok => {
            modal.classList.add('hidden');
            let tId = to.includes('@') ? to.replace('@','_at_') : to + "_at_awtsmoos.com";
            state.activeThread = tId; 
            toggleView('inbox');
        });
    };
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


// --- Interaction Logic ---
// --- Interaction Logic ---

let touchStartX = 0;
let touchCurrentX = 0;
let isDragging = false; // B"H - Added for mouse tracking
const SWIPE_THRESHOLD = 80;

function attachSwipeLogic(element, msg, senderName) {
    
    // --- TOUCH EVENTS (Mobile) ---
    element.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, {passive: true});

    element.addEventListener('touchmove', e => {
        touchCurrentX = e.touches[0].clientX;
        handleSwipeMove(element, touchCurrentX - touchStartX);
    }, {passive: true});

    element.addEventListener('touchend', e => {
        handleSwipeEnd(element, touchCurrentX - touchStartX, msg, senderName);
    });

    // --- MOUSE EVENTS (Desktop) ---
    element.addEventListener('mousedown', e => {
        // Only trigger if left click and not on a button/interactive element
        if (e.button !== 0 || e.target.closest('button, a')) return;
        isDragging = true;
        touchStartX = e.clientX;
        element.style.cursor = 'grabbing';
    });

    element.addEventListener('mousemove', e => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent text selection while dragging
        touchCurrentX = e.clientX;
        handleSwipeMove(element, touchCurrentX - touchStartX);
    });

    element.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        element.style.cursor = '';
        handleSwipeEnd(element, e.clientX - touchStartX, msg, senderName);
    });

    element.addEventListener('mouseleave', e => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = '';
            // Reset position without triggering action
            element.style.transform = ''; 
            const ind = element.querySelector('.swipe-indicator');
            if(ind) ind.style.opacity = '0';
        }
    });
}

// B"H - Helper to unify movement logic
function handleSwipeMove(element, diff) {
    // Right Swipe (Pulling Eastward) triggers Reply
    if (diff > 0 && diff < 150) {
        element.style.transform = `translateX(${diff}px)`;
        if(diff > SWIPE_THRESHOLD) {
            const ind = element.querySelector('.swipe-indicator');
            if(ind) {
                ind.style.opacity = '1';
                ind.style.right = 'auto';
                ind.style.left = '-30px'; 
            }
        }
    }
}

// B"H - Helper to unify end logic
function handleSwipeEnd(element, diff, msg, senderName) {
    element.style.transform = ''; 
    const ind = element.querySelector('.swipe-indicator');
    if(ind) ind.style.opacity = '0';
    
    // Reset Globals
    touchStartX = 0;
    touchCurrentX = 0;

    if (diff > SWIPE_THRESHOLD) {
        triggerReplyMode(msg, senderName);
    }
}

function triggerReplyMode(msg, senderName) {
    let content = msg.textContent || msg.content || "";
    let snippet = content.replace(/<[^>]*>?/gm, '').substring(0, 50);
    if(content.length > 50) snippet += "...";
    
    state.replyingTo = {
        id: msg.id,
        uid: msg.uid || msg.timeSent, 
        name: senderName,
        snippet: snippet
    };

    document.getElementById('replyPreview').classList.remove('hidden');
    document.getElementById('replySnippet').textContent = snippet;
    document.getElementById('messageInput').focus();
    
    closeMsgMenu();
}

function cancelReply() {
    state.replyingTo = null;
    document.getElementById('replyPreview').classList.add('hidden');
}

function scrollToMsg(uid) {
    // 1. Try Finding by Universal ID
    let el = document.querySelector(`.message-row[data-uid="${uid}"]`);

    // 2. Fallback: If not found, it might be on a previous page
    if (!el) {
        alert("That message is not currently loaded in this view.");
        return;
    }

    // 3. Illuminate
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const bub = el.querySelector('.message-bubble');
    if(bub) {
        bub.classList.add('highlight-msg');
        setTimeout(() => bub.classList.remove('highlight-msg'), 1500);
    }
}


// --- Action Helpers ---

let selectedMsgObj = null;

function handleMsgAction(action) {
    if (!selectedMsgObj) return;
    
    if (action === 'copy') {
        let txt = selectedMsgObj.textContent || selectedMsgObj.content;
        txt = txt.replace(/<[^>]*>?/gm, ''); // Clean HTML
        navigator.clipboard.writeText(txt).then(() => alert("Copied!"));
    } else if (action === 'reply') {
        const sender = selectedMsgObj.direction === 'outgoing' ? "Me" : (selectedMsgObj.fromName || "Them");
        triggerReplyMode(selectedMsgObj, sender); 
    } else if (action === 'delete') {
        deleteMessage(selectedMsgObj.id);
    }
    
    closeMsgMenu();
}

async function deleteMessage(messageId) {
    if(!confirm("Return this spark to the void?")) return;
    await fetch(`${API_BASE}/delete/${messageId}?aliasId=${state.alias}`, { method: 'DELETE' });
    
    // Remove from local cache immediately
    const tid = state.activeThread;
    if(state.threads[tid]) {
        state.threads[tid] = state.threads[tid].filter(m => m.id !== messageId);
        renderMessages(tid);
    }
    refreshSnippets();
}

async function deleteCurrentThread() {
    if(!state.activeThread) return;
    if(!confirm("Unravel this entire tapestry of conversation?")) return;
    
    const tid = state.activeThread;
    await fetch(`${API_BASE}/thread/delete/${tid}?aliasId=${state.alias}`);
    
    delete state.threads[tid];
    state.activeThread = null;
    
    document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Thread Dissolved</div>';
    document.getElementById('activeChatInfo').classList.add('hidden');
    
    refreshSnippets();
}

async function approveThread() {
    if (!state.activeThread) return;
    const tid = state.activeThread;

    await fetch(`${API_BASE}/approve/${encodeURIComponent(tid)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `aliasId=${encodeURIComponent(state.alias)}`
    });

    if (!state.settings.approved) state.settings.approved = {};
    state.settings.approved[tid] = true;

    state.view = 'inbox';
    document.getElementById('btn-inbox').classList.add('active');
    document.getElementById('btn-requests').classList.remove('active');
    
    refreshSnippets();
    selectThread(tid, tid.replace(/_at_/g, '@'));
}

function markAsRead(msgId) {
    fetch(`${API_BASE}/get/${msgId}/read?aliasId=${state.alias}`).catch(()=>{});
}

// Wrapper to fix Socket call name mismatch
function injectMessageIntoState(msg) {
    injectMessageIntoCache(msg);
}

// --- Settings Logic ---

function populateSettingsModal() {
    const s = state.settings;
    if(document.getElementById('gatekeeperToggle')) {
        document.getElementById('gatekeeperToggle').checked = !!s.gatekeeperMode;
        document.getElementById('customScriptInput').value = s.customScript || "";
        
        const container = document.getElementById('rulesContainer');
        container.innerHTML = "";
        
        if (s.rules && Array.isArray(s.rules)) {
            s.rules.forEach(rule => addRuleUI(rule));
        }
    }
}

function addRuleUI(data = null) {
    const container = document.getElementById('rulesContainer');
    const div = document.createElement('div');
    div.className = "rule-card glass-card";
    
    const d = data || { 
        condition: 'contains_any', keywords: '', actionType: 'text', replyText: '', enabled: true 
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
        <input type="text" class="rule-keys input-block" placeholder="Keywords..." value="${escapeHtml(d.keywords || d.customCondition || '')}">
        <div class="rule-action-row">
            <span>Then:</span>
            <select class="rule-action input-sm" onchange="toggleRuleAction(this)">
                <option value="text" ${d.actionType=='text'?'selected':''}>Reply Text</option>
                <option value="javascript" ${d.actionType=='javascript'?'selected':''}>Run JS</option>
            </select>
        </div>
        <div class="rule-content-box">
            <textarea class="rule-reply input-block" rows="2">${d.replyText || d.replyScript || ''}</textarea>
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
        textarea.placeholder = "Response...";
        textarea.classList.remove('code-font');
    }
}

async function saveSettingsUI() {
    const gate = document.getElementById('gatekeeperToggle').checked;
    const customJs = document.getElementById('customScriptInput').value;
    const rules = [];

    document.querySelectorAll('#rulesContainer .rule-card').forEach(card => {
        const cond = card.querySelector('.rule-cond').value;
        const keyInput = card.querySelector('.rule-keys').value;
        const act = card.querySelector('.rule-action').value;
        const content = card.querySelector('.rule-reply').value;
        
        const rule = { enabled: true, condition: cond, actionType: act };
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
    alert("Wisdom Saved");
    document.getElementById('settingsModal').classList.add('hidden');
}

// --- Missing Navigation Helpers ---

function backToInbox() {
    document.getElementById('appContainer').classList.remove('chat-open');
    state.activeThread = null;
    
    // Reset specific UI elements if needed
    document.getElementById('activeChatInfo').classList.add('hidden');
    
    // Refresh the sidebar to ensure highlights are removed
    renderSidebar();
}

function toggleView(newView) {
    state.view = newView;
    
    // Toggle visual tabs
    document.getElementById('btn-inbox').classList.toggle('active', newView === 'inbox');
    document.getElementById('btn-requests').classList.toggle('active', newView === 'requests');
    
    // Re-render list based on new view filter
    renderSidebar();
    
  
    /*
    if(state.activeThread) {
        backToInbox();
    }
    */
}


// Bind to the infinite cycle
if (window.curAlias) whenLoaded();
else addEventListener("awtsmoosAliasChange", whenLoaded);