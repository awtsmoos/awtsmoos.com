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
    isLoadingHistory: false,
    historyLoaded: new Set() 
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
async function loadThreadHistory(threadId, page = 1) {
    if (!state.alias) return;
    state.isLoadingHistory = true;
    
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=messages&threadId=${encodeURIComponent(threadId)}&page=${page}`;
        const res = await fetch(url);
        const newMsgs = await res.json();
        
        if (Array.isArray(newMsgs)) {
            if (!state.threads[threadId]) state.threads[threadId] = [];
            
            // B"H - MERGE LOGIC: Combine API (History) + Cache (Socket)
            const combined = [...state.threads[threadId], ...newMsgs];
            
            // Deduplicate by UID
            const seen = new Set();
            const unique = [];
            
            // Process combined array to remove duplicates
            for (const m of combined) {
                if (!seen.has(m.uid)) {
                    seen.add(m.uid);
                    unique.push(m);
                }
            }
            
            // Sort Chronological
            unique.sort((a,b) => a.timeSent - b.timeSent);
            
            state.threads[threadId] = unique;
            state.pagination[threadId] = page;
            
            // Mark history as loaded so we don't refetch unnecessarily
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
    // Normalize
    const coreId = getCoreThreadId(threadId);
    state.activeThread = coreId;
    
    document.getElementById('appContainer').classList.add('chat-open');
    document.getElementById('activeChatInfo').classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = displayName || coreId;

    // View Logic (Inbox vs Requests)
    const isRequest = (state.view === 'requests');
    if (isRequest) {
        document.getElementById('approveBtn').classList.remove('hidden');
        document.getElementById('composeForm').classList.add('hidden');
    } else {
        document.getElementById('approveBtn').classList.add('hidden');
        document.getElementById('composeForm').classList.remove('hidden');
    }

    // B"H - CRITICAL FIX: Check if we have FULL history, not just partial socket data
    const hasHistory = state.historyLoaded.has(coreId);

    // If we have messages (socket) but no history, or no messages at all...
    if (!state.threads[coreId] || !hasHistory) {
        
        // Show loading ONLY if we have absolutely nothing
        if (!state.threads[coreId]) {
            document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Loading light...</div>';
        }
        
        // Fetch history and merge it with any existing socket messages
        await loadThreadHistory(coreId, 1);
    }

    // Clear Unread Count for this thread
    const snip = state.snippets.find(s => getCoreThreadId(s.correspondent) === coreId);
    if(snip) {
        snip.unreadCount = 0;
        // Optionally notify server that we read them (fire and forget)
        // state.threads[coreId].forEach(m => markAsRead(m.id));
    }

    renderMessages(coreId, true); 
    renderSidebar(); // Update to remove badge
    
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



// Find "createMessageRow" and replace it with this version:
function createMessageRow(msg) {
    const isMe = msg.direction === 'outgoing';
    const row = document.createElement('div');
    row.className = `message-row ${isMe ? 'row-me' : 'row-them'}`;
    row.id = `msg_row_${msg.id}`;
    row.dataset.uid = msg.uid || msg.timeSent;
    
    // B"H - 1. Handle Content
    let contentHtml = String(msg.content || ""); 
    let quoteHtml = "";
    
    // B"H - 2. Universal Regex (Matches raw <div or escaped &lt;div)
    // Captures: 1=UID, 2=Name, 3=Snippet Content
    const metaRegex = /(?:<|&lt;)div class=(?:"|&quot;)reply-meta(?:"|&quot;)[\s\S]*?data-uid=(?:"|&quot;)([^"&]*)(?:"|&quot;)[\s\S]*?data-name=(?:"|&quot;)([^"&]*)(?:"|&quot;)[\s\S]*?(?:>|&gt;)([\s\S]*?)(?:<|&lt;)\/div(?:>|&gt;)/i;
    
    const match = contentHtml.match(metaRegex);
    
    if (match) {
        const qUid = match[1];
        const qName = match[2];
        const qText = match[3]; 
        
        // Remove the meta block (entire match) from the message
        contentHtml = contentHtml.replace(match[0], "");
        
        // Create the quote UI
        quoteHtml = `<div class="embedded-quote" onclick="scrollToMsg('${qUid}')">
                        <span class="quote-name">${escapeHtml(qName)}</span>${escapeHtml(qText)}
                     </div>`;
    }
    
    contentHtml = contentHtml.trim();

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
/**
 * B"H
 * Unifies Identity: "coby_at_awtsmoos.com" becomes "coby".
 * External emails like "friend_at_gmail.com" remain as they are.
 */
function getCoreThreadId(rawId) {
    if (!rawId) return "unknown";
    
    // 1. If it has the Awtsmoos suffix, strip it.
    if (rawId.endsWith("_at_awtsmoos.com")) {
        return rawId.replace("_at_awtsmoos.com", "");
    }
    // 2. If it's an email format ending in @awtsmoos.com, strip it.
    if (rawId.endsWith("@awtsmoos.com")) {
        return rawId.split("@")[0];
    }
    // 3. If it is already short (no _at_ and no @), keep it.
    if (!rawId.includes("_at_") && !rawId.includes("@")) {
        return rawId;
    }
    
    // Otherwise, it is an external user (e.g. friend_at_gmail.com), keep as is.
    return rawId;
}
// B"H - Find injectMessageIntoCache and replace it with this:
function injectMessageIntoCache(msg) {
    // B"H - Unification: Determine the canonical thread ID
    let rawTid = msg.correspondent || msg.from;
    
    // If I sent it, the correspondent is the recipient
    if (msg.direction === 'outgoing' && msg.to) {
        rawTid = Array.isArray(msg.to) ? msg.to[0] : msg.to;
    }
    
    // Normalize!
    let tid = getCoreThreadId(rawTid);
    msg.correspondent = tid; 

    // Initialize thread array if it doesn't exist
    if (!state.threads[tid]) state.threads[tid] = [];
    
    const thread = state.threads[tid];

    // B"H - 1. Strict Deduplication (ID or UID)
    // Check if we already have this EXACT message instance
    const existingIdx = thread.findIndex(m => m.id === msg.id || (m.uid && m.uid === msg.uid));
    
    if (existingIdx > -1) {
        // If it exists, update it (e.g. status change), but don't duplicate
        // Only update if the new one is "more real" (not temp) or newer info
        if (String(thread[existingIdx].id).startsWith('temp_') && !String(msg.id).startsWith('temp_')) {
             thread[existingIdx] = msg; // Upgrade to real
             if (state.activeThread === tid) renderMessages(tid); // Refresh UI to show real state
        }
        return; 
    }

    // B"H - 2. Optimistic Cleanup ("The Cash Check")
    // If incoming is a REAL outgoing message, look for a matching TEMP message to replace.
    // This solves the "Duplicate before/after auto-response" issue.
    let replaced = false;
    if (msg.direction === 'outgoing' && !String(msg.id).startsWith('temp_')) {
        const tempIdx = thread.findIndex(m => 
            String(m.id).startsWith('temp_') && 
            m.content === msg.content &&
            // Safety: Only replace if created recently (within 5 mins)
            Math.abs((m.timeSent || 0) - msg.timeSent) < 300000 
        );

        if (tempIdx > -1) {
            thread[tempIdx] = msg; // Replace the ghost with the body
            replaced = true;
        }
    }

    // B"H - 3. Insert if not replaced
    if (!replaced) {
        // Double check content/time uniqueness just to be safe (Classic Dedupe)
        const exactDup = thread.some(m => m.timeSent === msg.timeSent && m.content === msg.content);
        
        if (!exactDup) {
            if(typeof msg.content !== 'string') msg.content = String(msg.content || "");
            thread.push(msg);
        } else {
            return; // It's a duplicate, exit.
        }
    }

    // Sort Chronologically
    thread.sort((a,b) => a.timeSent - b.timeSent);
        
    // B"H - 4. Update Snippets & Unread Count
    const snipIdx = state.snippets.findIndex(s => getCoreThreadId(s.correspondent) === tid);
    const isOpen = state.activeThread && getCoreThreadId(state.activeThread) === tid;
    
    if (snipIdx > -1) {
        // Update existing snippet
        let oldUnread = state.snippets[snipIdx].unreadCount || 0;
        state.snippets[snipIdx] = msg; // Replace snippet
        
        // Unread Logic
        if (!isOpen && msg.direction === 'incoming') {
            state.snippets[snipIdx].unreadCount = oldUnread + 1;
        } else {
            state.snippets[snipIdx].unreadCount = isOpen ? 0 : oldUnread;
        }
    } else {
        // New Snippet
        if (!isOpen && msg.direction === 'incoming') {
            msg.unreadCount = 1;
        }
        state.snippets.unshift(msg);
    }
    
    // 5. Render if open
    if (isOpen) {
        // If we replaced, we already rendered above? 
        // Better to re-render to ensure order and snippet updates are reflected or if it was a new push.
        // We pass 'false' to forceScrollBottom only if it's a brand new message, 
        // but for simplicity, we let the user scroll unless it's strictly new outgoing.
        
        // Actually, just calling renderMessages is safe, it preserves scroll unless told otherwise.
        // But if I just sent a message (replaced or new), I want to see it.
        const shouldScroll = (msg.direction === 'outgoing' && !replaced); 
        renderMessages(tid, shouldScroll);
        
        if(snipIdx > -1) state.snippets[snipIdx].unreadCount = 0;
    }
    
    renderSidebar();
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




function escapeHtml(text) {
    // B"H - The Shield of String
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\\/g, ""); // Remove backslashes used for escaping in the original raw text
}

function escapeHtml(text) {
    // B"H - The Shield of String
    if (text === null || text === undefined) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
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

// B"H - Find attachSwipeLogic and replace with this "Deadzone Buffer" version:
function attachSwipeLogic(element, msg, senderName) {
    let startX = 0;
    let startY = 0;
    let isTouch = false;
    let isScrolling = null; // null = waiting, true = scrolling, false = swiping
    
    const SWIPE_THRESHOLD = 60; 
    const isMe = msg.direction === 'outgoing'; 

    // Setup Indicator
    if (!element.querySelector('.swipe-indicator')) {
        const ind = document.createElement('div');
        ind.className = 'swipe-indicator';
        ind.innerHTML = '↩️'; 
        element.prepend(ind); 
    }
    const indicator = element.querySelector('.swipe-indicator');

    // --- Events ---

    const start = (x, y) => { 
        startX = x; 
        startY = y;
        isScrolling = null; // Reset: We don't know yet!
        
        element.classList.add('swiping');
        // B"H - Don't remove transition yet. Wait until we confirm it's a swipe.
    };
    
    const move = (x, y) => {
        // 1. If we already decided it's a scroll, goodbye.
        if (isScrolling === true) return;

        const diffX = x - startX;
        const diffY = y - startY;

        // 2. DECISION PHASE (The Deadzone)
        if (isScrolling === null) {
            // Calculate total distance moved
            const dist = Math.sqrt(diffX*diffX + diffY*diffY);
            
            // B"H - Buffer: Ignore movement until it exceeds 10px
            if (dist < 10) return; 

            // Now look at the angle
            if (Math.abs(diffY) > Math.abs(diffX)) {
                isScrolling = true; // It's a vertical scroll
                return; // Let the browser handle it
            } else {
                isScrolling = false; // It's a horizontal swipe
                
                // NOW we engage the swipe physics
                element.style.transition = 'none'; 
                element.style.userSelect = 'none'; // Stop text highlighting
            }
        }

        // 3. ACTION PHASE (Only runs if isScrolling === false)
        let resistance = 0;
        let validSwipe = false;

        // Them -> Pull Right, Me -> Pull Left
        if (!isMe && diffX > 0) {
            validSwipe = true;
            resistance = Math.pow(diffX, 0.85); 
        } 
        else if (isMe && diffX < 0) {
            validSwipe = true;
            resistance = -Math.pow(Math.abs(diffX), 0.85);
        }

        if (Math.abs(resistance) > 150) resistance = resistance > 0 ? 150 : -150;

        if (validSwipe) {
            element.style.transform = `translateX(${resistance}px)`;
            
            const absRes = Math.abs(resistance);
            const baseRotate = isMe ? 0 : -180; 
            
            if (absRes > SWIPE_THRESHOLD) {
                indicator.style.transform = `translateY(-50%) scale(1.2) rotate(${baseRotate}deg)`;
                indicator.style.opacity = '1';
                indicator.style.color = '#fff';
            } else {
                const scale = 0.5 + (absRes/SWIPE_THRESHOLD)*0.5;
                indicator.style.transform = `translateY(-50%) scale(${scale}) rotate(${baseRotate}deg)`;
                indicator.style.opacity = (absRes / 50).toString();
                indicator.style.color = 'var(--neon-gold)';
            }
        }
    };

    const end = (x) => {
        // Only trigger action if we were definitively swiping
        if (isScrolling === false) {
            const diff = x - startX;
            const triggered = (!isMe && diff > SWIPE_THRESHOLD) || (isMe && diff < -SWIPE_THRESHOLD);

            if (triggered) {
                if (navigator.vibrate) navigator.vibrate(40);
                triggerReplyMode(msg, senderName);
            }
        }

        // Cleanup
        element.style.transition = 'transform 0.2s cubic-bezier(0.2, 0.9, 0.2, 1)';
        element.style.transform = ''; 
        element.style.userSelect = '';
        element.classList.remove('swiping');
        indicator.style.opacity = '0';
        
        isScrolling = null;
    };

    // Attach Listeners
    element.addEventListener('touchstart', e => { 
        isTouch=true; 
        start(e.touches[0].clientX, e.touches[0].clientY); 
    }, {passive: true});
    
    element.addEventListener('touchmove', e => { 
        if(isTouch) move(e.touches[0].clientX, e.touches[0].clientY); 
    }, {passive: true});
    
    element.addEventListener('touchend', e => { 
        if(isTouch) { 
            end(e.changedTouches[0].clientX); 
            isTouch=false; 
        } 
    });

    // Mouse Listeners
    let isDragging = false;
    element.addEventListener('mousedown', e => {
        if (e.button !== 0 || e.target.closest('button, a, input, textarea, .msg-menu-btn')) return;
        isDragging = true;
        element.style.cursor = 'grabbing';
        start(e.clientX, e.clientY);
    });
    window.addEventListener('mousemove', e => { if (isDragging) move(e.clientX, e.clientY); });
    window.addEventListener('mouseup', e => { if (isDragging) { isDragging = false; element.style.cursor = ''; end(e.clientX); } });
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
    // Ensure we get the raw content for the snippet, not the potentially formatted HTML
    let content = msg.content || msg.textContent || "";
    
    // Use the new formatter on the raw content to get a clean snippet, or just use raw text
    let snippetContent = formatContent(content); 
    
    // Clean up HTML tags for the short preview snippet
    let snippet = snippetContent.replace(/<[^>]*>?/gm, '').substring(0, 50);
    if(snippetContent.length > 50) snippet += "...";
    
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
        // Gatekeeper
        document.getElementById('gatekeeperToggle').checked = !!s.gatekeeperMode;
        
        // AI Global
        const ai = s.aiGlobal || {};
        document.getElementById('aiToggle').checked = !!ai.enabled;
        document.getElementById('aiKey').value = ai.apiKey || "";
        document.getElementById('aiPrompt').value = ai.systemPrompt || "";
        
        // Toggle visibility
        document.getElementById('aiConfigBox').classList.toggle('hidden', !ai.enabled);

        // Custom Script
        document.getElementById('customScriptInput').value = s.customScript || "";
        
        // Rules
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
    // 1. Capture Gatekeeper
    const gate = document.getElementById('gatekeeperToggle').checked;
    const customJs = document.getElementById('customScriptInput').value;
    
    // 2. Capture AI Global
    const aiConfig = {
        enabled: document.getElementById('aiToggle').checked,
        apiKey: document.getElementById('aiKey').value,
        systemPrompt: document.getElementById('aiPrompt').value
    };

    // 3. Capture Rules
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
        
        // Handle per-rule AI key if strictly set? 
        // For now, simpler rules use the global AI setting logic in server.
        rules.push(rule);
    });

    // 4. Construct Payload
    const newSettings = {
        gatekeeperMode: gate,
        approved: state.settings.approved || {},
        rules: rules,
        customScript: customJs,
        aiGlobal: aiConfig // <--- B"H: The New Field
    };

    // 5. Send
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



/**
 * B"H - The Alchemist's Crucible: Simple Markdown to HTML Transmutation.
 * Transmutes essential markdown (*, _, `) into HTML tags.
 * Fixes: correctly handles raw asterisks for bold and underscores for italics.
 */
function formatContent(text) {
    if (text === null || text === undefined) return "";
    
    let str = String(text);
    
    // 1. Check for existing HTML (The Gold Standard)
    if (/<[a-z][\s\S]*>/i.test(str) || str.includes('style=')) {
        return str; // Return raw HTML
    }
    
    // 2. Escape HTML entities to prevent XSS before we add our own tags
    let html = escapeHtml(str);
    
    // 3. Extract Code Blocks so we don't format inside them
    let codeBlocks = [];
    // Match ```code```
    html = html.replace(/```([\s\S]*?)```/g, (match, content) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<pre class="code-block"><code>${content}</code></pre>`); 
        return placeholder;
    });
    // Match `code` (inline)
    html = html.replace(/`([^`]+)`/g, (match, content) => {
        const placeholder = `__CODE_BLOCK_${codeBlocks.length}__`;
        codeBlocks.push(`<code class="inline-code">${content}</code>`); 
        return placeholder;
    });

    // 4. Simple Markdown Transmutation (Chat Style)
    // *bold* -> <strong>bold</strong>
    // Note: We use [^*] to match anything that isn't an asterisk inside
    html = html.replace(/\*([^*]+)\*/g, '<strong>$1</strong>');
    
    // _italics_ -> <em>italics</em>
    html = html.replace(/_([^_]+)_/g, '<em>$1</em>');
    
    // Links: [Text](URL) -> <a href="...">
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Auto-link loose URLs (Simple http/https detection)
    html = html.replace(/(^|\s)(https?:\/\/[^\s]+)/g, '$1<a href="$2" target="_blank" rel="noopener noreferrer">$2</a>');

    // 5. Restore Code Blocks
    codeBlocks.forEach((block, index) => {
        html = html.replace(`__CODE_BLOCK_${index}__`, block);
    });

    // 6. Line Breaks to <br>
    return html.replace(/\n/g, '<br>');
}