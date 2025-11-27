//B"H
/**
 * Awtsmoos Quantum Mail Client
 * ----------------------------
 * A vessel for the light of communication to travel through the void.
 * Features: Gatekeeper (Gevurah), Rules Engine (Chochmah), and Real-time Sockets (Ohr).
 * 
 * "And the letters flew upon the air, connecting soul to soul."
 */

const API_BASE = "/api/social/mail";

// --- The Vessel (State) ---
// Holds the contracted light of the application instance.
const state = {
    alias: null,
    messages: [],           // The raw gathering of sparks
    threads: {},            // Organized constellations of conversation
    threadsInbox: {},       // The open gates
    threadsRequests: {},    // The guarded gates
    activeThread: null,     // The current focus of intent (Kavanah)
    view: 'inbox',          // Perspective: 'inbox' or 'requests'
    
    // The Rules of Engagement
    settings: {
        gatekeeperMode: false,
        approved: {},
        rules: [],
        customScript: ""
    },
    settingsLoaded: false,
    
    // The Reflection (Reply State)
    replyingTo: null 
};

// --- Genesis (Initialization) ---

/**
 * When the page breathes life (Load).
 * Establishes identity and connection to the Infinite (Server).
 */
async function whenLoaded() {
    // 1. Identify the Soul (Auth Check)
    if (!window.curAlias) {
        document.getElementById('loginOverlay').classList.remove('hidden');
        document.getElementById('appContainer').classList.add('hidden');
        return;
    }

    state.alias = window.curAlias;
    document.getElementById('displayAlias').textContent = state.alias;
    document.getElementById('loginOverlay').classList.add('hidden');
    document.getElementById('appContainer').classList.remove('hidden');

    // 2. Open the Channel (WebSockets)
    connectSocket();

    // 3. Prepare the Vessels (UI Listeners)
    setupUI();

    // 4. Gather the Sparks (Initial Load)
    await refreshMail();
    
    // 5. Eternal Cycle (Polling Fallback)
    setInterval(refreshMail, 30000);
}

// --- The Flow (API Interactions) ---

/**
 * Draws down the Light from the Server.
 * Filters the chaos into ordered threads.
 */
async function refreshMail() {
    if (!state.alias) return;
    
    try {
        // A. Load Wisdom (Settings) - Lazy Loaded
        if (!state.settingsLoaded) {
            try {
                const sRes = await fetch(`${API_BASE}/settings/get?aliasId=${encodeURIComponent(state.alias)}`);
                const sData = await sRes.json();
                if(sData && !sData.error) {
                    state.settings = sData;
                    state.settingsLoaded = true;
                    populateSettingsModal();
                }
            } catch (e) { console.warn("Failed to load ancient wisdom (settings)", e); }
        }

        // B. Load Emanations (Messages)
        // _t=Date.now() ensures we see the present moment, not a cached memory
        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&_t=${Date.now()}`);
        const data = await res.json();
        
        if (Array.isArray(data)) {
            state.messages = data;
            processThreads(data);
            renderSidebar();
            
            // If the eye is focused on a thread, refresh its vision
            if (state.activeThread && state.threads[state.activeThread]) {
                renderMessages(state.activeThread);
            }
        }
    } catch (e) {
        console.error("The connection severed:", e);
    }
}

/**
 * Projects a new spark into the void.
 * Handles the mystery of the "Reply Quote" by hiding it within the HTML.
 */
async function sendEmail(recipient, subject, content) {
    if(!recipient || !content) return;

    // 1. Detect Destination Type
    const isEmail = recipient.includes("@") || recipient.includes("_at_");
    
    // 2. Embed the Reply (if exists) as a Hidden Spark
    let finalContent = content;
    if (state.replyingTo) {
        const r = state.replyingTo;
        // B"H - We embed the UID so the receiver can link it back 100% reliably
        const metaBlock = `<div class="reply-meta" data-uid="${r.uid}" data-name="${escapeHtml(r.name)}" style="display:none;">${r.snippet}</div>`;
        finalContent = metaBlock + content;
        
        cancelReply(); // The reflection is cast; clear the mirror.
    }
    
    // 3. Clear the Vessel (Input)
    document.getElementById('messageInput').value = ''; 
    
    let url = "";
    let cleanRecipient = recipient;

    if (isEmail) {
        cleanRecipient = recipient.replace("@", "_at_");
        const cleanEmailParam = recipient.replace("_at_", "@");
        url = `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(cleanEmailParam)}`;
    } else {
        url = `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;
    }
    
    // 4. Optimistic Projection (Show it before it's confirmed)
    const time = Date.now();
    const tempMsg = {
        id: "temp_" + time,
        uid: time + "", // Temporary UID
        from: state.alias,
        to: recipient,
        subject: subject,
        content: finalContent, 
        timeSent: time,
        direction: "outgoing",
        read: true,
        correspondent: cleanRecipient 
    };

    injectMessageIntoState(tempMsg);

    // 5. The Transmission
    const bodyData = new URLSearchParams();
    bodyData.append("subject", subject);
    bodyData.append("content", finalContent);

    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: bodyData
    });
    
    const j = await res.json();
    if(!j.success) {
        alert("Transmission blocked by the firmament: " + (j.error ? j.error.message : "Unknown error"));
    }
}

async function deleteMessage(messageId) {
    if(!confirm("Return this spark to the void?")) return;
    await fetch(`${API_BASE}/delete/${messageId}?aliasId=${state.alias}`, { method: 'DELETE' });
    // We wait for the echo...
    await refreshMail();
}

async function deleteCurrentThread() {
    if(!state.activeThread) return;
    if(!confirm("Unravel this entire tapestry of conversation?")) return;
    
    const tid = state.activeThread;
    await fetch(`${API_BASE}/thread/delete/${tid}?aliasId=${state.alias}`);
    
    // Cleansing the local state immediately
    state.messages = state.messages.filter(m => m.correspondent !== tid);
    state.activeThread = null;
    processThreads(state.messages);
    renderSidebar();
    
    document.getElementById('messagesContainer').innerHTML = '<div class="empty-state">Thread Dissolved</div>';
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

    // Update local wisdom
    if (!state.settings.approved) state.settings.approved = {};
    state.settings.approved[tid] = true;

    // Shift perspective
    toggleView('inbox'); 
    selectThread(tid, tid.replace(/_at_/g, '@'));
}

async function markAsRead(msgId) {
    // A silent prayer, fire and forget
    fetch(`${API_BASE}/get/${msgId}/read?aliasId=${state.alias}`).catch(()=>{});
}

// --- The Weaver (Data Processing) ---

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
        
        // The Three Pillars of Acceptance:
        // 1. Explicit Approval (Chesed)
        const isApproved = state.settings.approved && (
            state.settings.approved[partner] || 
            state.settings.approved[partner.split('_at_')[0]]
        );
        // 2. Outgoing Connection (Action)
        const hasOutgoing = msgs.some(m => m.direction === 'outgoing');
        // 3. Divine Decree (Server Status)
        const serverFlag = msgs.some(m => m.status === 'inbox');

        if (!state.settings.gatekeeperMode || isApproved || hasOutgoing || serverFlag) {
            state.threadsInbox[partner] = msgs;
        } else {
            state.threadsRequests[partner] = msgs;
        }
    });
    
    // Set the current reality based on view
    state.threads = (state.view === 'requests') ? state.threadsRequests : state.threadsInbox;
}

// --- The Vision (Rendering) ---

function renderSidebar() {
    const list = document.getElementById('threadsList');
    list.innerHTML = '';
    
    // Sort by the newest spark in the chain
    const names = Object.keys(state.threads).sort((a, b) => {
        const msgsA = state.threads[a];
        const msgsB = state.threads[b];
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
        
        // Determine the Name
        let displayName = name.replace(/_at_/g, "@");
        for(let i=msgs.length-1; i>=0; i--) {
            if(msgs[i].direction === 'incoming' && msgs[i].fromName) {
                displayName = msgs[i].fromName;
                break;
            }
        }
        
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
        container.innerHTML = '<div class="empty-state">Thread not found in this realm</div>';
        return;
    }

    container.innerHTML = '';
    let lastDate = null;

    msgs.forEach(msg => {
        // B"H - Universal ID: The timestamp that binds us
        const universalId = msg.uid || msg.timeSent || msg.time;

        const ts = msg.time || msg.timeSent;
        const dateStr = new Date(ts).toLocaleDateString();
        
        // Time Separator (Havdalah)
        if (dateStr !== lastDate) {
            const sep = document.createElement('div');
            sep.className = 'date-separator';
            sep.textContent = dateStr;
            container.appendChild(sep);
            lastDate = dateStr;
        }

        const isMe = msg.direction === 'outgoing';
        
        // --- CONTENT PROCESSING ---
        let contentHtml = msg.content || "";
        let quoteHtml = "";
        
        // 1. Quote Extraction
        // We look for the hidden divine sparks (meta tags)
        if (contentHtml.includes('class="reply-meta"')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = contentHtml;
            const quoteEl = tempDiv.querySelector('.reply-meta');
            if(quoteEl) {
                const qUid = quoteEl.getAttribute('data-uid');
                const qName = quoteEl.getAttribute('data-name');
                const qText = quoteEl.textContent;
                
                // Escape text for the JS function call
                const safeText = qText.replace(/'/g, "\\'").replace(/"/g, '&quot;');
                
                quoteHtml = `
                    <div class="embedded-quote" onclick="scrollToMsg('${qUid}', '${safeText}')">
                        <span class="quote-name">${escapeHtml(qName)}</span>
                        ${escapeHtml(qText)}
                    </div>
                `;
                
                quoteEl.remove(); // Hide the raw meta from view
                contentHtml = tempDiv.innerHTML;
            }
        }
        
        contentHtml = formatContent(contentHtml);

        // 2. Attachments (Physical Manifestations)
        let attHtml = "";
        if(msg.attachments) {
            msg.attachments.forEach(a => {
                if(!a.wasEmbedded && a.contentType && a.contentType.startsWith('image/')) {
                    attHtml += `<div class="att-img-wrap"><img src="${a.data}" title="${a.filename}"></div>`;
                }
            });
        }

        const senderName = isMe ? "Me" : (msg.fromName || msg.from || "Unknown");

        // 3. Construct the Message Row
        const row = document.createElement('div');
        row.className = `message-row ${isMe ? 'row-me' : 'row-them'}`;
        row.id = `msg_row_${msg.id}`; 
        
        // B"H - Bind the Universal ID to the DOM
        row.dataset.uid = universalId;

        // Swipe Indicator (The Arrow of Return)
        const swipeIcon = document.createElement('div');
        swipeIcon.className = 'swipe-indicator';
        swipeIcon.innerHTML = '↩️';
        row.appendChild(swipeIcon);

        const bubble = document.createElement('div');
        bubble.className = "message-bubble";
        
        // Long Press Handler
        bubble.oncontextmenu = (e) => {
            e.preventDefault(); 
            openMsgMenu(msg, isMe);
        };
        
        bubble.innerHTML = `
            <span class="msg-sender-name">${escapeHtml(senderName)}</span>
            <button class="msg-menu-btn" onclick="event.stopPropagation(); findAndOpenMenu('${msg.id}', ${isMe})">•••</button>
            
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
        
        // 4. Bind Swipe Logic
        attachSwipeLogic(row, msg, senderName);
    });

    // Auto Scroll to the most recent moment
    setTimeout(() => { container.scrollTop = container.scrollHeight; }, 50);
}

// --- Interaction & Motion (Kinesis) ---

function selectThread(name, displayName) {
    state.activeThread = name;
    document.getElementById('appContainer').classList.add('chat-open');
    
    // Update Header
    const chatInfo = document.getElementById('activeChatInfo');
    chatInfo.classList.remove('hidden');
    document.getElementById('chatPartnerName').textContent = displayName || name;
    
    // View Logic
    const isRequest = (state.view === 'requests');
    if (isRequest) {
        document.getElementById('approveBtn').classList.remove('hidden');
        document.getElementById('composeForm').classList.add('hidden');
    } else {
        document.getElementById('approveBtn').classList.add('hidden');
        document.getElementById('composeForm').classList.remove('hidden');
    }

    renderMessages(name);
    renderSidebar(); 

    // Mark as Read
    const msgs = state.threads[name];
    if (msgs) {
        const unread = msgs.filter(m => !m.read && m.direction === 'incoming');
        if (unread.length > 0) {
            unread.forEach(m => m.read = true);
            renderSidebar();
            unread.forEach(m => markAsRead(m.id));
        }
    }
}

/**
 * The great scroll.
 * Seeks the message by its Universal ID (UID).
 * Falls back to fuzzy text matching if the ID is lost in translation.
 */
function scrollToMsg(uid, fallbackText) {
    // 1. Try Finding by Universal ID (The True Name)
    let el = document.querySelector(`.message-row[data-uid="${uid}"]`);

    // 2. Fallback: Fuzzy Search (The Resemblance)
    if (!el && fallbackText) {
        console.log("UID obscured. Attempting content match...");
        const thread = state.threads[state.activeThread] || [];
        const match = thread.find(m => {
            const rawContent = (m.textContent || m.content || "").replace(/<[^>]*>?/gm, '');
            return rawContent.includes(fallbackText) || fallbackText.includes(rawContent);
        });
        if (match) {
            el = document.getElementById(`msg_row_${match.id}`);
        }
    }

    // 3. Illuminate
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        const bub = el.querySelector('.message-bubble');
        if(bub) {
            bub.classList.add('highlight-msg');
            setTimeout(() => bub.classList.remove('highlight-msg'), 1500);
        }
    } else {
        alert("The spark you seek is not in the current view.");
    }
}

function toggleView(newView) {
    state.view = newView;
    document.getElementById('btn-inbox').classList.toggle('active', newView === 'inbox');
    document.getElementById('btn-requests').classList.toggle('active', newView === 'requests');
    
    processThreads(state.messages);
    renderSidebar();
    
    if (state.activeThread && !state.threads[state.activeThread]) {
        document.getElementById('messagesContainer').innerHTML = '';
        document.getElementById('activeChatInfo').classList.add('hidden');
        state.activeThread = null;
    } else if (state.activeThread) {
        selectThread(state.activeThread);
    }
}

// --- The Swipe & Context (Mystical Manipulations) ---

let touchStartX = 0;
let touchCurrentX = 0;
const SWIPE_THRESHOLD = 80;

function attachSwipeLogic(element, msg, senderName) {
    element.addEventListener('touchstart', e => {
        touchStartX = e.touches[0].clientX;
    }, {passive: true});

    element.addEventListener('touchmove', e => {
        touchCurrentX = e.touches[0].clientX;
        const diff = touchCurrentX - touchStartX;
        
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
    }, {passive: true});

    element.addEventListener('touchend', e => {
        const diff = touchCurrentX - touchStartX;
        element.style.transform = ''; 
        const ind = element.querySelector('.swipe-indicator');
        if(ind) ind.style.opacity = '0';
        
        touchStartX = 0;
        touchCurrentX = 0;

        if (diff > SWIPE_THRESHOLD) {
            triggerReplyMode(msg, senderName);
        }
    });
}

function triggerReplyMode(msg, senderName) {
    let content = msg.textContent || msg.content || "";
    // Cleanse html for the snippet
    let snippet = content.replace(/<[^>]*>?/gm, '').substring(0, 50);
    if(content.length > 50) snippet += "...";
    
    // We bind the UID here
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

// --- Context Menu Logic ---

let selectedMsgObj = null;

function findAndOpenMenu(id, isMe) {
    const msg = state.messages.find(m => m.id === id);
    if(msg) openMsgMenu(msg, isMe);
}

function openMsgMenu(msgObj, isMe) {
    selectedMsgObj = msgObj;
    const modal = document.getElementById('msgContextModal');
    modal.classList.remove('hidden');
    if(navigator.vibrate) navigator.vibrate(50);
}

function closeMsgMenu() {
    document.getElementById('msgContextModal').classList.add('hidden');
    selectedMsgObj = null;
}

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

// --- Settings & Rules (The Wisdom) ---

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
    refreshMail(); 
}

// --- Utilities (The Tools) ---

function injectMessageIntoState(msg) {
    // Prevent double existence
    if (state.messages.some(m => m.id === msg.id)) return;

    // Normalization: Ensure thread ID continuity
    let targetThread = msg.correspondent;
    const existingKey = Object.keys(state.threads).find(key => {
        const cleanKey = key.split('_at_')[0];
        const cleanMsg = targetThread.split('_at_')[0];
        return cleanKey === cleanMsg;
    });

    if(existingKey) {
        msg.correspondent = existingKey; 
    }

    state.messages.push(msg);
    processThreads(state.messages);
    renderSidebar();
    
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

function backToInbox() {
    document.getElementById('appContainer').classList.remove('chat-open');
    state.activeThread = null;
    renderSidebar();
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

// Bind to the infinite cycle
if (window.curAlias) whenLoaded();
else addEventListener("awtsmoosAliasChange", whenLoaded);