
// B"H
import { sendMessageApi } from '../../network.js';
import { FX } from '../fx.js';
import { chatState } from '../chat/state.js';
import { notify, subscribe } from '../../store.js';
import { composerState } from './state.js';
import { htmlToMarkdown, markdownToHtml } from '../../helpers.js';
import { renderMessages } from '../chat/messages.js';
import { state as globalState } from '../../store.js';

let currentMode = 'visual'; // visual, markdown, html
let listenersInitialized = false;

// Initialize Subscription for Reply Events lazily
export function initComposerListeners() {
    if (listenersInitialized) return;
    listenersInitialized = true;

    // Default Enter setting
    composerState.enterToSend = false; 

    subscribe((key, val) => {
        if (key === 'triggerReply') {
            const ui = chatState.ui;
            if(!ui) return;
            
            // 1. Fill Subject (prefixed with Re:)
            const subjectInput = ui.getHtml('chatSubject');
            const subjectWrapper = ui.getHtml('subjectWrapper');
            if(subjectInput && val.msg) {
                let sub = val.msg.subject || "";
                if(sub === "(No Subject)") sub = "";
                if(sub && !sub.startsWith("Re:")) sub = "Re: " + sub;
                subjectInput.value = sub;
                
                // Show subject if hidden
                if(subjectWrapper && subjectWrapper.classList.contains('hidden')) {
                    subjectWrapper.classList.remove('hidden');
                }
            }
            
            // 2. Quote Body with Holographic Shard Style
            const visual = ui.getHtml('visualEditor');
            const code = ui.getHtml('codeEditor');
            
            const quoteContent = val.quote || "...";
            const quoteHtml = `
                <div class="reply-shard" contenteditable="false">
                    <div class="shard-meta">Replying to ${val.name}</div>
                    <div class="shard-body">${quoteContent}</div>
                </div>
                <p><br></p>
            `;
            
            // Expand if minimized
            const area = ui.getHtml('composerArea');
            if(area && area.classList.contains('minimized')) toggleMinimize(ui);

            if(currentMode === 'visual') {
                visual.innerHTML = quoteHtml + visual.innerHTML;
                
                // Focus CURSOR at the <p> after the shard
                setTimeout(() => {
                    visual.focus();
                    const range = document.createRange();
                    const sel = window.getSelection();
                    // Find the p tag we just added (last child of the inserted block approx)
                    // Simplified: just select the last p or append one if missing
                    const ps = visual.querySelectorAll('p');
                    if(ps.length > 0) {
                        const lastP = ps[0]; // The one after shard
                        range.setStart(lastP, 0);
                        range.collapse(true);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }, 50);

            } else {
                code.value = `> ${quoteContent}\n\n` + code.value;
                code.focus();
            }
        }
    });
}

export function toggleSubject(ui) {
    const wrap = ui.getHtml('subjectWrapper');
    if(wrap) wrap.classList.toggle('hidden');
}

export function toggleFullscreen(ui) {
    const area = ui.getHtml('composerArea');
    if(area) {
        area.classList.remove('minimized');
        area.classList.toggle('fullscreen');
    }
}

export function toggleMinimize(ui) {
    const area = ui.getHtml('composerArea');
    if(area) {
        area.classList.remove('fullscreen');
        area.classList.toggle('minimized');
    }
}

export function toggleEnterSend(e) {
    composerState.enterToSend = !composerState.enterToSend;
    const btn = e.target;
    if(composerState.enterToSend) {
        btn.textContent = 'ENTER: ➤';
        btn.style.borderColor = 'var(--mail-accent)';
        btn.style.color = 'var(--mail-accent)';
    } else {
        btn.textContent = 'ENTER: ↵';
        btn.style.borderColor = '#333';
        btn.style.color = '#aaa';
    }
}

export function switchMode(e, ui) {
    const newMode = e.target.dataset.mode;
    if (newMode === currentMode) return;

    const visual = ui.getHtml('visualEditor');
    const code = ui.getHtml('codeEditor');
    const toolbar = ui.getHtml('visualToolbar');

    // Update Tabs
    document.querySelectorAll('.mode-tab').forEach(t => t.classList.remove('active'));
    e.target.classList.add('active');

    // SYNC CONTENT before switching
    let content = "";
    if (currentMode === 'visual') {
        content = visual.innerHTML;
        if (newMode === 'markdown') content = htmlToMarkdown(content);
    } 
    else if (currentMode === 'markdown') {
        content = code.value;
        if (newMode === 'visual') content = markdownToHtml(content);
        else if (newMode === 'html') content = markdownToHtml(content); 
    }
    else if (currentMode === 'html') {
        content = code.value;
        if (newMode === 'visual') { /* content is html, just set it */ }
        else if (newMode === 'markdown') content = htmlToMarkdown(content);
    }

    // TOGGLE VIEWS
    if (newMode === 'visual') {
        visual.innerHTML = content;
        visual.classList.remove('hidden');
        code.classList.add('hidden');
        toolbar.classList.remove('hidden');
    } else {
        code.value = content;
        code.classList.remove('hidden');
        visual.classList.add('hidden');
        toolbar.classList.add('hidden');
    }

    currentMode = newMode;
}

// --- BROADCASTING (GHOST TYPING) ---
export function handleInput(e) {
    const el = e.target;
    
    // Auto-Resize (for textarea)
    if(el.tagName === 'TEXTAREA') {
        el.style.height = 'auto';
        el.style.height = (el.scrollHeight) + 'px';
    }

    const content = (currentMode === 'visual') ? el.innerText : el.value;
    const now = Date.now();
    const STREAM_RATE = 150; 

    if (now - composerState.lastStreamTime > STREAM_RATE) {
        composerState.lastStreamTime = now;
        if (chatState.activeThreadId) {
            notify('broadcast', { 
                type: 'LIVE_PREVIEW', 
                to: chatState.activeThreadId, 
                content: content 
            });
        }
    }
}

// --- SENDING ---
export async function handleSend(ui) {
    const visual = ui.getHtml('visualEditor');
    const code = ui.getHtml('codeEditor');
    const subjectInput = ui.getHtml('chatSubject');

    let txt = "";
    if (currentMode === 'visual') txt = visual.innerHTML;
    else txt = code.value;

    if (currentMode === 'markdown') txt = markdownToHtml(txt);

    if (!txt.trim() || !chatState.activeThreadId) return;

    if (FX.playSound) FX.playSound('sent');
    
    // 1. Clear Input
    visual.innerHTML = '';
    code.value = '';
    if(subjectInput) subjectInput.value = '';
    
    // 2. Clear Ghost
    notify('broadcast', { type: 'LIVE_PREVIEW', to: chatState.activeThreadId, content: '' });

    // 3. OPTIMISTIC UPDATE
    const tempId = 'temp_' + Date.now();
    const tempMsg = {
        id: tempId,
        from: globalState.alias,
        content: txt,
        subject: subjectInput ? subjectInput.value : null,
        timeSent: Date.now(),
        direction: 'outgoing',
        read: true
    };

    if(!globalState.threads[chatState.activeThreadId]) globalState.threads[chatState.activeThreadId] = [];
    globalState.threads[chatState.activeThreadId].push(tempMsg);
    
    renderMessages(chatState.activeThreadId, globalState.threads[chatState.activeThreadId]);

    try {
        await sendMessageApi(chatState.activeThreadId, (subjectInput ? subjectInput.value : null), txt);
        if (FX.explode) FX.explode(window.innerWidth / 2, window.innerHeight - 50);
        
    } catch (err) {
        console.error("Transmission failed", err);
        // Restore draft
        if(currentMode === 'visual') visual.innerHTML = txt;
        else code.value = txt;
        notify('error', 'Transmission Failed');
        
        // Remove optimistic message
        const idx = globalState.threads[chatState.activeThreadId].findIndex(m => m.id === tempId);
        if(idx > -1) {
            globalState.threads[chatState.activeThreadId].splice(idx, 1);
            renderMessages(chatState.activeThreadId, globalState.threads[chatState.activeThreadId]);
        }
    }
}

export function handleMagneticMove(e) {
    const btn = e.target;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
}

export function handleMagneticLeave(e) {
    e.target.style.transform = 'translate(0,0)';
}
