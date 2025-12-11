
// B"H
import { sendMessageApi } from '../../network.js';
import { FX } from '../fx.js';
import { chatState } from '../chat/state.js';
import { notify } from '../../store.js';
import { composerState } from './state.js';
import { htmlToMarkdown, markdownToHtml } from '../../helpers.js';
import { renderMessages } from '../chat/messages.js';
import { state as globalState } from '../../store.js';

let currentMode = 'visual'; // visual, markdown, html

export function toggleSubject(ui) {
    const wrap = ui.getHtml('subjectWrapper');
    if(wrap) wrap.classList.toggle('hidden');
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
        // if newMode is html, content is already html
    } 
    else if (currentMode === 'markdown') {
        content = code.value;
        if (newMode === 'visual') content = markdownToHtml(content);
        else if (newMode === 'html') content = markdownToHtml(content); // simplistic
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

    // Convert MD to HTML if needed before sending, or send as is? 
    // The backend handles capsules, but usually we send HTML or Plain.
    // If in Markdown mode, let's convert to HTML for better display on other end
    if (currentMode === 'markdown') txt = markdownToHtml(txt);

    if (!txt.trim() || !chatState.activeThreadId) return;

    if (FX.playSound) FX.playSound('sent');
    
    // 1. Clear Input
    visual.innerHTML = '';
    code.value = '';
    if(subjectInput) subjectInput.value = '';
    
    // 2. Clear Ghost
    notify('broadcast', { type: 'LIVE_PREVIEW', to: chatState.activeThreadId, content: '' });

    // 3. OPTIMISTIC UPDATE (Immediate UI Feedback)
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
    
    // Render immediately
    renderMessages(chatState.activeThreadId, globalState.threads[chatState.activeThreadId]);

    try {
        await sendMessageApi(chatState.activeThreadId, (subjectInput ? subjectInput.value : null), txt);
        if (FX.explode) FX.explode(window.innerWidth / 2, window.innerHeight - 50);
        
        // Remove temp message handled by network refresh or keep it?
        // Usually refreshSnippets/loadHistory will sync the real ID.
        
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

// --- MAGNETIC PHYSICS ---
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
