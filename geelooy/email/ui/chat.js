
// B"H
import { state, notify, subscribe } from '../store.js';
import { loadThreadHistory } from '../network.js';
import { renderComposer } from './composer.js';
import { smartParse } from '../helpers.js';
import { FX } from './fx.js';

let _uiRef = null;
let liveTimeInterval = null;

export function renderChat(ui, parent) {
    _uiRef = ui;
    
    // Header
    ui.html({
        parent,
        tag: 'header',
        classList: ['chat-header'],
        children: [
            {
                tag: 'div', classList: ['flex', 'items-center'],
                children: [
                    { 
                        tag: 'button', classList: ['back-button'], textContent: '←',
                        events: { click: () => ui.getHtml('appContainer').classList.remove('view-chat') }
                    },
                    { tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Quantum Stream' }
                ]
            },
            { tag: 'button', classList: ['tool-btn'], textContent: '⋮', events: { click: () => toggleSpotlight() } }
        ]
    });

    // Time Scrubber
    ui.html({
        parent, tag: 'div', classList: ['time-scrubber'],
        events: {
            mousemove: (e) => {
                const perc = e.offsetY / e.target.offsetHeight;
                const con = ui.getHtml('msgContainer');
                if(con) con.scrollTop = perc * con.scrollHeight;
            }
        }
    });

    // Command Modal
    ui.html({
        parent, tag: 'div', shaym: 'cmdModal', classList: ['cmd-modal', 'hidden'],
        children: [{
            tag: 'input', classList: ['cmd-input'], placeholder: 'Run protocol...',
            events: { keydown: handleCmdKey }
        }]
    });

    // Message Container
    ui.html({
        parent,
        tag: 'div',
        shaym: 'msgContainer',
        classList: ['messages-scroll'],
        events: { 
            scroll: (e) => handleScroll(e),
            click: (e) => { if(FX.triggerSonar) FX.triggerSonar(e.clientX, e.clientY); },
            mousemove: (e) => handleMagneticField(e)
        }
    });

    // Wormhole
    const container = ui.getHtml('msgContainer');
    if(container) {
        ui.html({
            parent: container,
            tag: 'div', shaym: 'wormhole', classList: ['wormhole-loader', 'hidden'],
            textContent: 'WARPING SPACETIME...'
        });
    }

    // GL Canvas
    const cvs = document.createElement('canvas');
    cvs.id = 'particleCanvas';
    parent.appendChild(cvs);
    if(FX && FX.init) FX.init(cvs);

    renderComposer(ui, parent);
    setupDropZone(parent);

    // Ghost Listener for Broadcast Typing
    subscribe((key, val) => {
        if(key === 'ghost') {
            const fromId = val.from; // Assuming val is {from, content}
            // Simple check: is this ghost for the current thread?
            // (Simplified logic: check if activeThread contains part of fromId)
            if(state.activeThread && fromId && fromId.includes(state.activeThread.split('@')[0])) {
                renderGhostBubble(val.content);
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.ctrlKey && e.key === 'k') {
            e.preventDefault();
            const m = ui.getHtml('cmdModal');
            if(m) {
                m.classList.toggle('hidden');
                if(!m.classList.contains('hidden')) m.querySelector('input').focus();
            }
        }
    });

    // Start Live Time
    if(!liveTimeInterval) liveTimeInterval = setInterval(updateRelativeTimes, 1000);
}

function renderGhostBubble(content) {
    if(!_uiRef) return;
    const container = _uiRef.getHtml('msgContainer');
    if(!container) return;

    let ghost = document.getElementById('ghostBubble');
    if (!content) {
        if(ghost) ghost.remove();
        return;
    }

    if (!ghost) {
        // Create new ghost
        // We use direct DOM manipulation for performance on rapid updates
        ghost = document.createElement('div');
        ghost.id = 'ghostBubble';
        ghost.className = 'msg-row them ghost-row';
        ghost.innerHTML = `
            <div class="msg-bubble ghost-bubble">
                <div class="msg-content decrypting"></div>
            </div>
        `;
        container.appendChild(ghost);
        container.scrollTop = container.scrollHeight;
    }
    
    // Update content
    const contentEl = ghost.querySelector('.msg-content');
    if(contentEl) contentEl.innerText = content;
    container.scrollTop = container.scrollHeight;
}

function handleMagneticField(e) {
    const rows = document.querySelectorAll('.msg-bubble');
    const mx = e.clientX;
    const my = e.clientY;
    
    rows.forEach(row => {
        const rect = row.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        
        const dist = Math.hypot(mx - cx, my - cy);
        if (dist < 150) {
            const angle = Math.atan2(my - cy, mx - cx);
            const force = (150 - dist) / 10; 
            const tx = -Math.cos(angle) * force;
            const ty = -Math.sin(angle) * force;
            row.style.transform = `translate(${tx}px, ${ty}px)`;
        } else {
            row.style.transform = '';
        }
    });
}

function updateRelativeTimes() {
    document.querySelectorAll('.msg-time').forEach(el => {
        const ts = parseInt(el.dataset.ts);
        if(!ts) return;
        const diff = Math.floor((Date.now() - ts) / 1000);
        
        if (diff < 60) el.textContent = `${diff}s ago`;
        else if (diff < 3600) el.textContent = `${Math.floor(diff/60)}m ago`;
        else {
            const date = new Date(ts);
            el.textContent = date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    });
}

function handleCmdKey(e) {
    if(e.key === 'Enter') {
        const val = e.target.value.toLowerCase();
        if(val === 'theme zen' && FX.setTheme) FX.setTheme('zen');
        else if(val === 'theme mech' && FX.setTheme) FX.setTheme('mech');
        else if(val === 'home') document.querySelector('.back-button').click();
        e.target.value = '';
        e.target.parentElement.classList.add('hidden');
    }
    if(e.key === 'Escape') e.target.parentElement.classList.add('hidden');
}

function setupDropZone(root) {
    root.addEventListener('dragover', (e) => { e.preventDefault(); root.classList.add('dragging-over'); });
    root.addEventListener('dragleave', (e) => { root.classList.remove('dragging-over'); });
    root.addEventListener('drop', (e) => {
        e.preventDefault();
        root.classList.remove('dragging-over');
        if (e.dataTransfer.files.length > 0) notify('filesDropped', e.dataTransfer.files);
    });
    const overlay = document.createElement('div');
    overlay.className = 'drop-portal';
    overlay.innerHTML = '<div class="portal-text">INITIATE DATA TRANSFER</div>';
    root.appendChild(overlay);
}

let lastScrollTop = 0;
let lastScrollTime = 0;

function handleScroll(e) {
    const el = e.target;
    if(FX.setScroll) FX.setScroll(el.scrollTop);
    
    if (el.scrollTop < 50 && !state.isLoadingHistory) {
        const wh = _uiRef.getHtml('wormhole');
        if(wh) {
            wh.classList.remove('hidden');
            setTimeout(() => wh.classList.add('hidden'), 1000);
        }
    }
    
    const now = Date.now();
    const dt = now - lastScrollTime;
    if (dt > 16) {
        const speed = Math.abs(el.scrollTop - lastScrollTop) / dt;
        if (speed > 3) document.body.classList.add('sonic-boom');
        else document.body.classList.remove('sonic-boom');
        lastScrollTop = el.scrollTop;
        lastScrollTime = now;
    }
}

function toggleSpotlight() {
    document.body.classList.toggle('spotlight-mode');
    if(document.body.classList.contains('spotlight-mode')) {
        document.body.style.setProperty('--cursor-x', '50%');
        document.body.style.setProperty('--cursor-y', '50%');
        window.addEventListener('mousemove', spotlightMove);
    } else {
        window.removeEventListener('mousemove', spotlightMove);
    }
}

function spotlightMove(e) {
    document.body.style.setProperty('--cursor-x', e.clientX + 'px');
    document.body.style.setProperty('--cursor-y', e.clientY + 'px');
}

export async function switchChat(ui, threadId, displayName) {
    const container = ui.getHtml('msgContainer');
    if(FX.dissolveScreen) FX.dissolveScreen(container);
    await new Promise(r => setTimeout(r, 300));

    state.activeThread = threadId;
    ui.getHtml('chatTitle').textContent = displayName;
    ui.getHtml('appContainer').classList.add('view-chat'); 
    
    container.innerHTML = `<div class="singularity-loader"></div>`;
    
    await loadThreadHistory(threadId);
    renderMessages(threadId);

    const lastMsg = state.threads[threadId]?.[state.threads[threadId].length-1];
    if (lastMsg && lastMsg.direction !== 'outgoing') {
        const text = (lastMsg.content || "").toLowerCase();
        let suggests = ['Received', 'Reviewing'];
        if(text.includes('?')) suggests = ['Yes', 'No', 'Not sure'];
        if(text.includes('time') || text.includes('when')) suggests = ['Soon', 'Later', 'Tomorrow'];
        notify('smartSuggestions', suggests);
    }
}

export function renderMessages(threadId) {
    if (!_uiRef || state.activeThread !== threadId) return;
    const container = _uiRef.getHtml('msgContainer');
    const msgs = state.threads[threadId] || [];
    const wormhole = container.querySelector('.wormhole-loader');
    
    container.innerHTML = '';
    if(wormhole) container.appendChild(wormhole);
    
    msgs.forEach((m, index) => {
        const isMe = m.direction === 'outgoing';
        const isNew = index === msgs.length - 1; 

        // CRITICAL FIX: .filter(Boolean) prevents empty string tokens
        const rowClasses = ['msg-row', isMe ? 'me' : 'them'];
        if (isNew) rowClasses.push('glitch-entry');

        const row = _uiRef.html({
            parent: container,
            tag: 'div',
            classList: rowClasses,
            dataset: { id: m.id },
            ready: (el) => attachSwipePhysics(el, m),
            events: {
                contextmenu: (e) => handleRightClick(e, m, row),
                dblclick: (e) => { if(FX.explode) FX.explode(e.clientX, e.clientY, '#ef4444'); }
            },
            children: [
                {
                    tag: 'div', classList: ['swipe-wrapper'],
                    children: [
                        { tag: 'div', classList: ['swipe-icon'], textContent: '↩️' },
                        {
                            tag: 'div',
                            classList: ['msg-bubble', 'magnetic'], 
                            children: [
                                m.subject ? { tag: 'div', classList: ['msg-subject'], textContent: m.subject } : null,
                                { 
                                    tag: 'div', 
                                    // CRITICAL FIX: Filter Boolean
                                    classList: ['msg-content', isNew ? 'decrypting' : null].filter(Boolean), 
                                    innerHTML: smartParse(m.content) 
                                },
                                { 
                                    tag: 'div', classList: ['msg-footer'],
                                    children: [
                                        { tag: 'span', classList: ['msg-time'], dataset: { ts: m.timeSent }, textContent: 'Just now' },
                                        { tag: 'button', classList: ['tts-btn'], textContent: '🔊', events: { click: (e) => { e.stopPropagation(); if(FX.playTTS) FX.playTTS(m.content); }}}
                                    ] 
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        if (m.content && (m.content.includes('```javascript') || m.content.includes('```js'))) {
            const btn = document.createElement('button');
            btn.className = 'code-run-btn';
            btn.innerText = '▶ RUN PROTOCOL';
            btn.onclick = () => alert('Executing in Sandbox environment...\n(Visual Demo Only)');
            const bub = row.querySelector('.msg-bubble');
            if(bub) bub.appendChild(btn);
        }

        if (isNew && FX.decryptText) FX.decryptText(row.querySelector('.msg-content'), m.content);
    });
    
    setTimeout(() => container.scrollTop = container.scrollHeight, 0);
}

function attachSwipePhysics(row, msg) {
    const wrapper = row.querySelector('.swipe-wrapper');
    const bubble = row.querySelector('.msg-bubble');
    const icon = row.querySelector('.swipe-icon');
    
    if(!wrapper || !bubble) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let longPressTimer;

    wrapper.style.touchAction = "pan-y"; 

    const start = (x) => {
        startX = x;
        isDragging = true;
        wrapper.classList.add('swiping');
        bubble.style.transition = 'none';
        
        longPressTimer = setTimeout(() => {
            if (Math.abs(currentX - startX) < 5) {
                handleRightClick({ preventDefault:()=>{}, clientX: x, clientY: wrapper.getBoundingClientRect().top }, msg, row);
                isDragging = false; 
            }
        }, 600);
    };

    const move = (x) => {
        if (!isDragging) return;
        currentX = x;
        const diff = x - startX;
        
        if (Math.abs(diff) > 5) clearTimeout(longPressTimer); 
        const resist = Math.sign(diff) * Math.pow(Math.abs(diff), 0.7); 
        
        const isMe = row.classList.contains('me');
        if ((isMe && diff < 0) || (!isMe && diff > 0)) {
            bubble.style.transform = `translateX(${resist}px)`;
            const abs = Math.abs(resist);
            if (abs > 10) {
                icon.style.opacity = Math.min(1, abs/40);
                icon.style.transform = `scale(${Math.min(1.4, 0.5 + abs/40)}) translateY(-50%)`;
            }
        }
    };

    const end = (e) => {
        clearTimeout(longPressTimer);
        if (!isDragging) return;
        isDragging = false;
        wrapper.classList.remove('swiping');
        bubble.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        bubble.style.transform = '';
        icon.style.opacity = 0;
        
        const diff = currentX - startX;
        const isMe = row.classList.contains('me');
        const threshold = 80;

        if ((isMe && diff < -threshold) || (!isMe && diff > threshold)) {
            if(FX.playSound) FX.playSound('hover');
            if (navigator.vibrate) navigator.vibrate(50);
            notify('triggerReply', { msg, name: msg.fromName || (isMe ? "Yourself" : "Them") });
        }
    };

    wrapper.onpointerdown = (e) => { wrapper.setPointerCapture(e.pointerId); start(e.clientX); };
    wrapper.onpointermove = (e) => move(e.clientX);
    wrapper.onpointerup = (e) => end(e);
    wrapper.onpointercancel = (e) => end(e);
}

function handleRightClick(e, msg, row) {
    if(e.preventDefault) e.preventDefault();
    if(confirm("Implode into Singularity?")) {
        row.style.animation = "singularityImplode 0.5s forwards";
        if(FX.playSound) FX.playSound('sent');
        setTimeout(() => row.remove(), 500);
    }
}
