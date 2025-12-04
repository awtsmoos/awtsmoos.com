//B"H
/**
 * Awtsmoos Quantum Mail Client
 * Edition: Infinite Scroll & Caching & Visual Alchemy
 */
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
createProfileDropdown(document.getElementById('displayAlias'))
const API_BASE = "/api/social/mail";

// --- The Vessel (State) ---
const state = {
    alias: null,
    threads: {},        // Map<ThreadID, Array<Message>>
    snippets: [],       // Sidebar List
    activeThread: null,
    view: 'inbox',      // 'inbox' | 'requests'
    pagination: {},     // Map<ThreadID, PageNumber>
    settings: { gatekeeperMode: false, approved: {}, rules: [] },
    settingsLoaded: false,
    replyingTo: null,
    isLoadingHistory: false,
    historyLoaded: new Set()
};

// --- Genesis ---
async function whenLoaded(e) {
    let id = window.curAlias;
    if (e && e.detail && typeof e.detail.id !== 'undefined') {
        id = e.detail.id;
    }

    if (!id) {
        state.alias = null;
        window.curAlias = null;
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
        return;
    }

    state.alias = id;
    window.curAlias = id;
    
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    connectSocket();
    setupUI();
    
    await refreshSnippets();
    
    if(!window._mailPoll) {
        window._mailPoll = setInterval(refreshSnippets, 30000);
    }
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// --- API: The Flow of Light ---

async function refreshSnippets() {
    if (!state.alias) return;
    try {
        if (!state.settingsLoaded) await loadSettings();

        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=threads&_t=${Date.now()}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            state.snippets = data;
            renderSidebar();
        }
    } catch (e) { console.error("Snippet fetch failed", e); }
}

async function loadThreadHistory(threadId, page = 1) {
    if (!state.alias) return;
    state.isLoadingHistory = true;
    
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=messages&threadId=${encodeURIComponent(threadId)}&page=${page}`;
        const res = await fetch(url);
        const newMsgs = await res.json();
        
        if (Array.isArray(newMsgs)) {
            if (!state.threads[threadId]) state.threads[threadId] = [];
            
            const combined = [...state.threads[threadId], ...newMsgs];
            const seen = new Set();
            const unique = [];
            
            for (const m of combined) {
                if (!seen.has(m.uid)) {
                    seen.add(m.uid);
                    unique.push(m);
                }
            }
            
            unique.sort((a,b) => a.timeSent - b.timeSent);
            state.threads[threadId] = unique;
            state.pagination[threadId] = page;
            state.historyLoaded.add(threadId);
            return unique.length;
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

    let finalContent = content;
    if (state.replyingTo) {
        const r = state.replyingTo;
        const metaBlock = `<div class="reply-meta" data-uid="${r.uid}" data-name="${escapeHtml(r.name)}" style="display:none;">${r.snippet}</div>`;
        finalContent = metaBlock + content;
        cancelReply();
    }
    
    // UI Reset
    const input = document.getElementById('messageInput');
    const visual = document.getElementById('visualInput');
    input.value = '';
    visual.innerHTML = ''; // Clear visual too
    updateSendButtonState();

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

    injectMessageIntoCache(tempMsg);

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
    
    refreshSnippets();
}

// --- UI Rendering ---

function renderSidebar() {
    const list = document.getElementById('threadsList');
    list.innerHTML = '';

    const filtered = state.snippets.filter(msg => {
        const partner = msg.correspondent;
        const isApproved = state.settings.approved?.[partner] || state.settings.approved?.[partner.split('_at_')[0]];
        const hasOutgoing = msg.direction === 'outgoing'; 
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
        
        const unread = msg.unreadCount || 0;
        const badgeHtml = unread > 0 ? `<div class="unread-badge">${unread}</div>` : '';

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
            ${badgeHtml}
        `;
        list.appendChild(item);
    });
}

async function selectThread(threadId, displayName) {
    const coreId = getCoreThreadId(threadId);
    state.activeThread = coreId;
    
    document.getElementById('appContainer').classList.add('chat-open');
    document.getElementById('activeChatInfo').classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = displayName || coreId;

    const isRequest = (state.view === 'requests');
    if (isRequest) {
        document.getElementById('approveBtn').classList.remove('hidden');
        document.getElementById('composeForm').classList.add('hidden');
    } else {
        document.getElementById('approveBtn').classList.add('hidden');
        document.getElementById('composeForm').classList.remove('hidden');
    }

    const hasHistory = state.historyLoaded.has(coreId);

    if (!state.threads[coreId] || !hasHistory) {
        if (!state.threads[coreId]) {
            document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Loading light...</div>';
        }
        await loadThreadHistory(coreId, 1);
    }

    const snip = state.snippets.find(s => getCoreThreadId(s.correspondent) === coreId);
    if(snip) snip.unreadCount = 0;

    renderMessages(coreId, true); 
    renderSidebar();
    attachScrollListener();
}

function renderMessages(threadId, forceScrollBottom = false) {
    const container = document.getElementById('messagesContainer');
    const msgs = state.threads[threadId] || [];
    
    // Preserve Ghost
    const existingGhost = document.getElementById('ghostBubble');
    let savedGhostText = null;
    if (existingGhost) {
        const textEl = document.getElementById('ghostText');
        if (textEl) savedGhostText = textEl.innerHTML;
    }

    const oldScrollHeight = container.scrollHeight;
    const oldScrollTop = container.scrollTop;

    container.innerHTML = '';
    if (msgs.length === 0 && !state.isLoadingHistory) {
        container.innerHTML = '<div class="empty-state">No messages here.</div>';
    }

    let lastDate = null;
    msgs.forEach(msg => {
        const ts = msg.time || msg.timeSent;
        if (!ts) return; 
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

    if (savedGhostText !== null) {
        renderGhostBubble(savedGhostText, true); // Pass raw HTML
    }

    if (forceScrollBottom) {
        setTimeout(() => { container.scrollTop = container.scrollHeight; }, 0);
        isUserAtBottom = true;
    } else {
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
    
    let contentHtml = String(msg.content || ""); 
    let quoteHtml = "";
    
    // Reply Meta Extraction
    const metaRegex = /(?:<|&lt;)div class=(?:"|&quot;)reply-meta(?:"|&quot;)[\s\S]*?data-uid=(?:"|&quot;)([^"&]*)(?:"|&quot;)[\s\S]*?data-name=(?:"|&quot;)([^"&]*)(?:"|&quot;)[\s\S]*?(?:>|&gt;)([\s\S]*?)(?:<|&lt;)\/div(?:>|&gt;)/i;
    const match = contentHtml.match(metaRegex);
    if (match) {
        const qUid = match[1];
        const qName = match[2];
        const qText = match[3]; 
        contentHtml = contentHtml.replace(match[0], "");
        quoteHtml = `<div class="embedded-quote" onclick="scrollToMsg('${qUid}')">
                        <span class="quote-name">${escapeHtml(qName)}</span>${escapeHtml(qText)}
                     </div>`;
    }
    
    contentHtml = contentHtml.trim();
    const senderName = isMe ? "Me" : (msg.fromName || "Them");

    let subjectHtml = "";
    if(msg.subject && msg.subject !== "(No Subject)") {
        subjectHtml = `<div class="msg-subject">${escapeHtml(msg.subject)}</div>`;
    }

    row.innerHTML = `
        <div class="swipe-indicator">↩️</div>
        <div class="message-bubble">
            <span class="msg-sender-name">${escapeHtml(senderName)}</span>
            ${subjectHtml}
            <button class="msg-menu-btn" onclick="event.stopPropagation(); findAndOpenMenu('${msg.id}')">•••</button>
            ${quoteHtml}
            <div class="msg-content email-body">${formatContent(contentHtml)}</div>
            <div class="msg-meta"><span class="msg-time">${formatTime(msg.timeSent)}</span></div>
        </div>
    `;

    const bub = row.querySelector('.message-bubble');
    bub.oncontextmenu = (e) => { e.preventDefault(); openMsgMenu(msg, isMe); };
    attachSwipeLogic(row, msg, senderName);

    return row;
}

// --- Scroll Logic ---
let isUserAtBottom = true;

function attachScrollListener() {
    const container = document.getElementById('messagesContainer');
    container.onscroll = async () => {
        const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
        isUserAtBottom = distanceToBottom < 100;

        if (container.scrollTop < 50 && !state.isLoadingHistory) {
            const tid = state.activeThread;
            const nextPage = (state.pagination[tid] || 1) + 1;
            const added = await loadThreadHistory(tid, nextPage);
            if (added > 0) renderMessages(tid, false); 
        }
    };
}

// --- Utilities ---
function getCoreThreadId(rawId) {
    if (!rawId) return "unknown";
    if (rawId.endsWith("_at_awtsmoos.com")) return rawId.replace("_at_awtsmoos.com", "");
    if (rawId.endsWith("@awtsmoos.com")) return rawId.split("@")[0];
    if (!rawId.includes("_at_") && !rawId.includes("@")) return rawId;
    return rawId;
}

function injectMessageIntoCache(msg) {
    let rawTid = msg.correspondent || msg.from;
    if (msg.direction === 'outgoing' && msg.to) {
        rawTid = Array.isArray(msg.to) ? msg.to[0] : msg.to;
        if (rawTid.includes("@") && !rawTid.includes("_at_")) rawTid = rawTid.replace("@", "_at_");
    }
    
    let tid = getCoreThreadId(rawTid);
    msg.correspondent = tid; 

    if (!state.threads[tid]) state.threads[tid] = [];
    const thread = state.threads[tid];

    const existingIdx = thread.findIndex(m => m.id === msg.id || (m.uid && m.uid === msg.uid));
    
    if (existingIdx > -1) {
        if (String(thread[existingIdx].id).startsWith('temp_') && !String(msg.id).startsWith('temp_')) {
             thread[existingIdx] = msg; 
             if (state.activeThread === tid) renderMessages(tid); 
        }
        return; 
    }

    // Optimistic dedupe
    let replaced = false;
    if (msg.direction === 'outgoing' && !String(msg.id).startsWith('temp_')) {
        const tempIdx = thread.findIndex(m => 
            String(m.id).startsWith('temp_') && 
            m.content === msg.content &&
            Math.abs((m.timeSent || 0) - msg.timeSent) < 300000 
        );
        if (tempIdx > -1) {
            thread[tempIdx] = msg; 
            replaced = true;
        }
    }

    if (!replaced) {
        const exactDup = thread.some(m => m.timeSent === msg.timeSent && m.content === msg.content);
        if (!exactDup) {
            if(typeof msg.content !== 'string') msg.content = String(msg.content || "");
            thread.push(msg);
        } else { return; }
    }

    thread.sort((a,b) => a.timeSent - b.timeSent);
        
    const snipIdx = state.snippets.findIndex(s => getCoreThreadId(s.correspondent) === tid);
    const isOpen = state.activeThread && getCoreThreadId(state.activeThread) === tid;
    
    if (snipIdx > -1) {
        let oldUnread = state.snippets[snipIdx].unreadCount || 0;
        state.snippets[snipIdx] = msg; 
        if (!isOpen && msg.direction === 'incoming') {
            state.snippets[snipIdx].unreadCount = oldUnread + 1;
        } else {
            state.snippets[snipIdx].unreadCount = isOpen ? 0 : oldUnread;
        }
    } else {
        if (!isOpen && msg.direction === 'incoming') msg.unreadCount = 1;
        state.snippets.unshift(msg);
    }
    
    if (isOpen) {
        const shouldScroll = (msg.direction === 'outgoing' && !replaced); 
        renderMessages(tid, shouldScroll);
        if(snipIdx > -1) state.snippets[snipIdx].unreadCount = 0;
    }
    renderSidebar();
}

function updateSendButtonState() {
    const el = document.getElementById('messageInput');
    const visual = document.getElementById('visualInput');
    // Check both inputs
    const hasContent = (el && el.value.trim().length > 0) || (visual && visual.textContent.trim().length > 0);
    const btn = document.querySelector('.btn-send');
    if(btn) {
        if(hasContent) btn.classList.add('ready');
        else btn.classList.remove('ready');
    }
}

function findAndOpenMenu(id) { const m = state.threads[state.activeThread]?.find(x=>x.id==id); if(m) openMsgMenu(m); }
function openMsgMenu(m) { selectedMsgObj = m; document.getElementById('msgContextModal').classList.remove('hidden'); }
function closeMsgMenu() { document.getElementById('msgContextModal').classList.add('hidden'); }

function escapeHtml(text) {
    if (text === null || text === undefined) return "";
    return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\\/g, "");
}

function formatTime(ts) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function setupUI() {
    // Sync editor before send
    document.getElementById('composeForm').onsubmit = (e) => {
        e.preventDefault();
        prepareSend(); 
        
        const sub = document.getElementById('subjectInput').value;
        const msg = document.getElementById('messageInput').value;
        
        if(state.activeThread) {
            sendEmail(state.activeThread, sub, msg).then(() => {
                document.getElementById('visualInput').innerHTML = '';
                document.querySelector('.btn-send').classList.remove('sending');
            });
        }
    };

    const modal = document.getElementById('newMsgModal');
    document.getElementById('composeBtn').onclick = () => modal.classList.remove('hidden');
    document.querySelector('.close-modal').onclick = () => modal.classList.add('hidden');
    
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
    
    // Live Typing Broadcast
    const broadcaster = throttle((content) => {
        if (state.settings.broadcastTyping && state.activeThread && socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                type: 'LIVE_PREVIEW',
                to: state.activeThread, 
                content: content
            }));
        }
    }, 150);

    // Listen to both inputs
    document.getElementById('messageInput').addEventListener('input', (e) => broadcaster(e.target.value));
    document.getElementById('visualInput').addEventListener('input', (e) => {
        broadcaster(htmlToMarkdown(e.target.innerHTML));
        updateSendButtonState();
    });
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
                const ghost = document.getElementById('ghostBubble');
                if(ghost) ghost.remove();
                injectMessageIntoCache(data.message);
            }
            else if (data.type === 'LIVE_PREVIEW') {
                const fromId = getCoreThreadId(data.from);
                const activeId = getCoreThreadId(state.activeThread);
                if (fromId === activeId) renderGhostBubble(data.content);
            }
        } catch(e){}
    };
    socket.onclose = () => setTimeout(connectSocket, 5000);
}

// B"H - Render Ghost with visual formatting
function renderGhostBubble(content, isRawHtml = false) {
    if (!content) {
        const el = document.getElementById('ghostBubble');
        if(el) el.remove();
        return;
    }

    let container = document.getElementById('messagesContainer');
    let ghost = document.getElementById('ghostBubble');
    
    if (!ghost) {
        ghost = document.createElement('div');
        ghost.id = 'ghostBubble';
        ghost.className = 'message-row row-them ghost-row';
        ghost.innerHTML = `
            <div class="message-bubble ghost-bubble">
                <span class="msg-sender-name">Typing...</span>
                <div class="msg-content email-body" id="ghostText"></div>
            </div>`;
        container.appendChild(ghost);
        container.scrollTop = container.scrollHeight;
    }
    
    const textEl = document.getElementById('ghostText');
    if (textEl) {
        // If content is already HTML (from saved state), use it. 
        // If it's markdown (from socket), format it.
        textEl.innerHTML = isRawHtml ? content : formatContent(content);
    }
    if (isUserAtBottom) container.scrollTop = container.scrollHeight;
}

// --- Interaction (Swipe / Drag) ---
function attachSwipeLogic(element, msg, senderName) {
    let startX = 0;
    let startY = 0;
    let isTouch = false;
    let isScrolling = null; 
    
    const SWIPE_THRESHOLD = 60; 
    const isMe = msg.direction === 'outgoing'; 

    if (!element.querySelector('.swipe-indicator')) {
        const ind = document.createElement('div');
        ind.className = 'swipe-indicator';
        ind.innerHTML = '↩️'; 
        element.prepend(ind); 
    }
    const indicator = element.querySelector('.swipe-indicator');

    const start = (x, y) => { 
        startX = x; startY = y; isScrolling = null; 
        element.classList.add('swiping');
    };
    
    const move = (x, y) => {
        if (isScrolling === true) return;
        const diffX = x - startX;
        const diffY = y - startY;

        if (isScrolling === null) {
            if (Math.sqrt(diffX*diffX + diffY*diffY) < 10) return; 
            if (Math.abs(diffY) > Math.abs(diffX)) { isScrolling = true; return; }
            else { isScrolling = false; element.style.transition = 'none'; }
        }

        let resistance = 0;
        let validSwipe = false;
        if (!isMe && diffX > 0) { validSwipe = true; resistance = Math.pow(diffX, 0.85); } 
        else if (isMe && diffX < 0) { validSwipe = true; resistance = -Math.pow(Math.abs(diffX), 0.85); }

        if (Math.abs(resistance) > 150) resistance = resistance > 0 ? 150 : -150;

        if (validSwipe) {
            element.style.transform = `translateX(${resistance}px)`;
            const absRes = Math.abs(resistance);
            const baseRotate = isMe ? 0 : -180; 
            
            if (absRes > SWIPE_THRESHOLD) {
                indicator.style.transform = `translateY(-50%) scale(1.2) rotate(${baseRotate}deg)`;
                indicator.style.opacity = '1'; indicator.style.color = '#fff';
            } else {
                const scale = 0.5 + (absRes/SWIPE_THRESHOLD)*0.5;
                indicator.style.transform = `translateY(-50%) scale(${scale}) rotate(${baseRotate}deg)`;
                indicator.style.opacity = (absRes / 50).toString(); indicator.style.color = 'var(--neon-gold)';
            }
        }
    };

    const end = (x) => {
        if (isScrolling === false) {
            const diff = x - startX;
            const triggered = (!isMe && diff > SWIPE_THRESHOLD) || (isMe && diff < -SWIPE_THRESHOLD);
            if (triggered) {
                if (navigator.vibrate) navigator.vibrate(40);
                triggerReplyMode(msg, senderName);
            }
        }
        element.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.9, 0.2, 1)';
        element.style.transform = ''; 
        element.classList.remove('swiping');
        indicator.style.opacity = '0';
        isScrolling = null;
    };

    element.addEventListener('touchstart', e => { isTouch=true; start(e.touches[0].clientX, e.touches[0].clientY); }, {passive: true});
    element.addEventListener('touchmove', e => { if(isTouch) move(e.touches[0].clientX, e.touches[0].clientY); }, {passive: true});
    element.addEventListener('touchend', e => { if(isTouch) { end(e.changedTouches[0].clientX); isTouch=false; } });

    let isDragging = false;
    element.addEventListener('mousedown', e => {
        if (e.button !== 0 || e.target.closest('button, a, input, textarea, .msg-menu-btn')) return;
        isDragging = true; element.style.cursor = 'grabbing'; start(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => { if (isDragging) move(e.clientX, e.clientY); });
    window.addEventListener('mouseup', e => { if (isDragging) { isDragging = false; element.style.cursor = ''; end(e.clientX); } });
}

function triggerReplyMode(msg, senderName) {
    let content = msg.content || msg.textContent || "";
    let snippetContent = formatContent(content); 
    let snippet = snippetContent.replace(/<[^>]*>?/gm, '').substring(0, 50);
    if(snippetContent.length > 50) snippet += "...";
    
    state.replyingTo = { id: msg.id, uid: msg.uid || msg.timeSent, name: senderName, snippet: snippet };

    document.getElementById('replyPreview').classList.remove('hidden');
    document.getElementById('replySnippet').textContent = snippet;
    
    const subInput = document.getElementById('subjectInput');
    if (subInput && msg.subject && msg.subject !== "(No Subject)") {
        subInput.value = msg.subject.startsWith("Re:") ? msg.subject : "Re: " + msg.subject;
    }

    if (!document.getElementById('visualInput').classList.contains('hidden')) {
        document.getElementById('visualInput').focus();
    } else {
        document.getElementById('messageInput').focus();
    }
    
    closeMsgMenu();
}

function cancelReply() {
    state.replyingTo = null;
    document.getElementById('replyPreview').classList.add('hidden');
}

function scrollToMsg(uid) {
    let el = document.querySelector(`.message-row[data-uid="${uid}"]`);
    if (!el) { alert("Message not in view."); return; }
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
        txt = txt.replace(/<[^>]*>?/gm, '');
        navigator.clipboard.writeText(txt).then(() => alert("Copied!"));
    } else if(action == "copy-subject") {
        navigator.clipboard.writeText(selectedMsgObj.subject || "").then(() => alert("Copied!"));
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
    
    const tid = state.activeThread;
    if(state.threads[tid]) {
        state.threads[tid] = state.threads[tid].filter(m => m.id !== messageId);
        renderMessages(tid);
    }
    refreshSnippets();
}

async function deleteCurrentThread() {
    if(!state.activeThread) return;
    if(!confirm("Unravel this entire tapestry?")) return;
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

function populateSettingsModal() {
    const s = state.settings;
    if(document.getElementById('gatekeeperToggle')) {
        document.getElementById('gatekeeperToggle').checked = !!s.gatekeeperMode;
        const ai = s.aiGlobal || {};
        document.getElementById('aiToggle').checked = !!ai.enabled;
        document.getElementById('aiKey').value = ai.apiKey || "";
        document.getElementById('aiPrompt').value = ai.systemPrompt || "";
        document.getElementById('aiConfigBox').classList.toggle('hidden', !ai.enabled);
        document.getElementById('customScriptInput').value = s.customScript || "";
        
        const container = document.getElementById('rulesContainer');
        container.innerHTML = "";
        if (s.rules && Array.isArray(s.rules)) {
            s.rules.forEach(rule => addRuleUI(rule));
        }
    }
    if(s.broadcastTyping !== undefined) document.getElementById('broadcastToggle').checked = s.broadcastTyping;
    if(s.viewTyping !== undefined) document.getElementById('viewTypingToggle').checked = s.viewTyping;
}

function addRuleUI(data = null) {
    const container = document.getElementById('rulesContainer');
    const div = document.createElement('div');
    div.className = "rule-card glass-card";
    const d = data || { condition: 'contains_any', keywords: '', actionType: 'text', replyText: '', enabled: true };
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
    const aiConfig = {
        enabled: document.getElementById('aiToggle').checked,
        apiKey: document.getElementById('aiKey').value,
        systemPrompt: document.getElementById('aiPrompt').value
    };
    const rules = [];
    document.querySelectorAll('#rulesContainer .rule-card').forEach(card => {
        const cond = card.querySelector('.rule-cond').value;
        const keyInput = card.querySelector('.rule-keys').value;
        const act = card.querySelector('.rule-action').value;
        const content = card.querySelector('.rule-reply').value;
        const rule = { enabled: true, condition: cond, actionType: act };
        if (cond === 'javascript') rule.customCondition = keyInput; else rule.keywords = keyInput;
        if (act === 'javascript') rule.replyScript = content; else rule.replyText = content;
        rules.push(rule);
    });

    const newSettings = {
        gatekeeperMode: gate, approved: state.settings.approved || {}, rules: rules, customScript: customJs, aiGlobal: aiConfig,
        broadcastTyping: document.getElementById('broadcastToggle').checked,
        viewTyping: document.getElementById('viewTypingToggle').checked,
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

function backToInbox() {
    document.getElementById('appContainer').classList.remove('chat-open');
    state.activeThread = null;
    document.getElementById('activeChatInfo').classList.add('hidden');
    renderSidebar();
}

function toggleView(newView) {
    state.view = newView;
    document.getElementById('btn-inbox').classList.toggle('active', newView === 'inbox');
    document.getElementById('btn-requests').classList.toggle('active', newView === 'requests');
    renderSidebar();
}

// B"H - VISUAL ALCHEMY (Markdown <-> HTML)

/**
 * Parses Markdown-like text into HTML safe for display.
 * Now includes support for Bold, Italic, Strikethrough, Headers, and Lists.
 */
function formatContent(text) {
    if (text === null || text === undefined) return "";
    let str = String(text);
    const blocks = [];

    // 1. Extract Code/HTML Capsules
    str = str.replace(/```(\w*)\s*([\s\S]*?)```/g, (match, lang, content) => {
        const placeholder = `__BLOCK_${blocks.length}__`;
        const isHtmlArtifact = (lang.toLowerCase() === 'html') || /<!DOCTYPE/i.test(content) || /<html/i.test(content);
        blocks.push({ type: isHtmlArtifact ? 'capsule' : 'code', content: content, lang: lang });
        return placeholder;
    });

    // 2. Escape HTML entities in the remaining text
    let safeHTML = str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

    // 3. Rich Text Parsing (The missing piece!)
    safeHTML = safeHTML
        // Headers (### Header)
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Bold (**text**)
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        // Italic (*text*)
        .replace(/\*(?![ ])(.*?)\*/g, '<i>$1</i>')
        // Strike (~~text~~)
        .replace(/~~(.*?)~~/g, '<s>$1</s>')
        // Underline (__text__)
        .replace(/__(.*?)__/g, '<u>$1</u>')
        // Lists (- item) - Simple implementation
        .replace(/^\s*-\s+(.*)/gim, '<li>$1</li>');

    // Wrap adjacent LI's in UL (Simple regex pass)
    safeHTML = safeHTML.replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>').replace(/<\/ul>\s*<ul>/gim, '');

    // Links
    safeHTML = safeHTML.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    safeHTML = safeHTML.replace(/(^|[\s>])(https?:\/\/[^\s<"]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');

    // Newlines to BR (if not already handled by headers/lists)
    safeHTML = safeHTML.replace(/\n/g, '<br>');

    // 4. Restore Blocks
    blocks.forEach((block, index) => {
        let replacement = "";
        if (block.type === 'capsule') replacement = createHTMLCapsule(block.content, index);
        else replacement = `<pre class="code-block"><code>${escapeHtml(block.content)}</code></pre>`;
        safeHTML = safeHTML.replace(`__BLOCK_${index}__`, replacement);
    });

    return safeHTML;
}

function createHTMLCapsule(htmlContent, idSuffix) {
    const encoded = encodeURIComponent(htmlContent);
    const safeSrc = htmlContent.replace(/"/g, '&quot;');
    const uniqueId = `capsule_${Date.now()}_${idSuffix}`;
    return `
    <div class="html-capsule" id="${uniqueId}" data-code="${encoded}">
        <div class="capsule-header" onclick="toggleCapsule('${uniqueId}', event)">
            <div class="capsule-left">
                <span class="capsule-arrow">▼</span>
                <span class="capsule-label">HTML Artifact</span>
            </div>
            <div class="capsule-actions">
                <button class="capsule-btn" onclick="event.stopPropagation(); copyCapsule('${uniqueId}')">Copy</button>
                <button class="capsule-btn" onclick="event.stopPropagation(); downloadCapsule('${uniqueId}')">Download</button>
            </div>
        </div>
        <iframe class="capsule-frame" sandbox="allow-scripts allow-forms allow-popups allow-modals" srcdoc="${safeSrc}"></iframe>
    </div>`;
}

// B"H - Editor Toggle Logic
function setComposeMode(mode) {
    const visual = document.getElementById('visualInput');
    const source = document.getElementById('messageInput');
    const btnVisual = document.getElementById('modeVisual');
    const btnSource = document.getElementById('modeSource');

    if (mode === 'visual') {
        // Source -> Visual
        if (!source.classList.contains('hidden')) {
            // Apply formatting (markdown -> html)
            visual.innerHTML = formatContent(source.value);
        }
        source.classList.add('hidden');
        visual.classList.remove('hidden');
        btnSource.classList.remove('tab-active');
        btnVisual.classList.add('tab-active');
        visual.focus();
    } else {
        // Visual -> Source
        if (!visual.classList.contains('hidden')) {
            // Flatten HTML -> Markdown
            source.value = htmlToMarkdown(visual.innerHTML);
        }
        visual.classList.add('hidden');
        source.classList.remove('hidden');
        btnVisual.classList.remove('tab-active');
        btnSource.classList.add('tab-active');
        source.focus();
    }
}

// Ensure Source is up to date before sending
window.prepareSend = function() {
    const visual = document.getElementById('visualInput');
    const source = document.getElementById('messageInput');
    if (!visual.classList.contains('hidden')) {
        source.value = htmlToMarkdown(visual.innerHTML);
    }
    const btn = document.querySelector('.btn-send');
    if(btn) btn.classList.add('sending');
}

/**
 * Robust HTML to Markdown converter
 * Handles DIVs, BRs, and formatting tags better than regex.
 */
function htmlToMarkdown(html) {
    let temp = document.createElement('div');
    temp.innerHTML = html;

    // Replace block elements with newlines
    temp.querySelectorAll('div, p, h1, h2, h3, li').forEach(el => {
        el.after(document.createTextNode('\n'));
    });
    temp.querySelectorAll('br').forEach(el => {
        el.replaceWith(document.createTextNode('\n'));
    });

    let text = temp.innerHTML;
    
    // Convert tags to markdown symbols
    text = text
        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
        .replace(/<i>(.*?)<\/i>/gi, '*$1*')
        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
        .replace(/<s>(.*?)<\/s>/gi, '~~$1~~')
        .replace(/<u>(.*?)<\/u>/gi, '__$1__')
        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n')
        .replace(/<ul>/gi, '').replace(/<\/ul>/gi, '')
        .replace(/<li>(.*?)<\/li>/gi, '- $1')
        .replace(/<a href="(.*?)".*?>(.*?)<\/a>/gi, '[$2]($1)');

    // Clean entities
    text = text.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    // Clean capsule placeholders
    text = text.replace(/<div class="html-capsule"[\s\S]*?<\/div>/g, '[HTML Artifact]');

    // Strip remaining tags but keep text
    const cleanText = text.replace(/<[^>]+>/g, '');
    
    // Normalize newlines (max 2)
    return cleanText.replace(/\n\s*\n/g, '\n\n').trim();
}

function insertFormat(startTag, endTag, command, value = null) {
    const isVisual = !document.getElementById('visualInput').classList.contains('hidden');
    if (isVisual) {
        document.getElementById('visualInput').focus();
        if (command === 'createLink') {
            const url = prompt("Enter URL:", "https://");
            if (url) document.execCommand(command, false, url);
        } else {
            document.execCommand(command, false, value);
        }
    } else {
        const textarea = document.getElementById('messageInput');
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const before = text.substring(0, start);
        const selected = text.substring(start, end);
        const after = text.substring(end);
        textarea.value = before + startTag + selected + endTag + after;
        const newCursorPos = start + startTag.length + selected.length + endTag.length;
        textarea.selectionStart = newCursorPos;
        textarea.selectionEnd = newCursorPos;
        textarea.focus();
        textarea.dispatchEvent(new Event('input'));
    }
}

// --- Globals ---
window.toggleCapsule = function(id, e) {
    if (e && e.target.closest('button')) return;
    const container = document.getElementById(id);
    if (!container) return;
    const iframe = container.querySelector('iframe');
    const isCollapsed = container.classList.contains('collapsed');
    if (isCollapsed) {
        container.classList.remove('collapsed');
        iframe.srcdoc = decodeURIComponent(container.dataset.code);
    } else {
        container.classList.add('collapsed');
        iframe.removeAttribute('srcdoc');
    }
};

window.copyCapsule = function(id) {
    const container = document.getElementById(id);
    navigator.clipboard.writeText(decodeURIComponent(container.dataset.code))
        .then(() => alert("Code Copied"));
};

window.downloadCapsule = function(id) {
    const container = document.getElementById(id);
    const blob = new Blob([decodeURIComponent(container.dataset.code)], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `artifact_${Date.now()}.html`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
};

window.toggleNotifications = async function(checkbox) {
    if (!checkbox.checked) return;
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { alert("Permission denied."); checkbox.checked = false; return; }
    const reg = await navigator.serviceWorker.ready;
    const vapidKey = "BDAf39EwkWkpJFykJOGxnhzgaMI9XQF6qHGKH6CHaIGT9xxP5N-a85iTjpXD_33RPXU5r0t5ES5njXzzFGBnpF4"; 
    const convertedKey = urlBase64ToUint8Array(vapidKey);
    try {
        const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: convertedKey });
        await fetch(`${API_BASE}/notify/subscribe`, {
            method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ aliasId: state.alias, subscription: sub })
        });
        alert("Signal Established.");
    } catch(e) { console.error(e); alert("Failed to subscribe."); checkbox.checked = false; }
};

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

// Exports
window.setComposeMode = setComposeMode;
window.prepareSend = prepareSend;
window.insertFormat = insertFormat;
window.toggleView = toggleView;
window.backToInbox = backToInbox;
window.approveThread = approveThread;
window.deleteCurrentThread = deleteCurrentThread;
window.cancelReply = cancelReply;
window.closeMsgMenu = closeMsgMenu;
window.handleMsgAction = handleMsgAction;
window.addRuleUI = addRuleUI;
window.saveSettingsUI = saveSettingsUI;
window.toggleRuleAction = toggleRuleAction;
window.scrollToMsg = scrollToMsg;
window.findAndOpenMenu = findAndOpenMenu;

if (window.curAlias) whenLoaded();
window.addEventListener("awtsmoosAliasChange", whenLoaded);