// B"H
import { state, notify } from '../store.js';
import { loadThreadHistory } from '../network.js';
import { renderComposer } from './composer.js';
import { smartParse, formatTime } from '../helpers.js';

let _uiRef = null;

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
                        events: { click: () => {
                            ui.getHtml('appContainer').classList.remove('view-chat');
                        }}
                    },
                    { tag: 'h2', classList: ['chat-title'], shaym: 'chatTitle', textContent: 'Select a Frequency' }
                ]
            },
            {
                tag: 'div', classList: ['header-actions'],
                children: [
                    { tag: 'button', classList: ['tool-btn'], textContent: '⋮' }
                ]
            }
        ]
    });

    // Messages
    ui.html({
        parent,
        tag: 'div',
        shaym: 'msgContainer',
        classList: ['messages-scroll']
    });

    // Composer (Bottom)
    renderComposer(ui, parent);

    // Ghost Listener
    notify('ghost', (data) => {
        // Implement Ghost Bubble Logic here
    });
}

export async function switchChat(ui, threadId, displayName) {
    state.activeThread = threadId;
    ui.getHtml('chatTitle').textContent = displayName;
    ui.getHtml('appContainer').classList.add('view-chat'); // Mobile slide
    
    // Load History
    const container = ui.getHtml('msgContainer');
    container.innerHTML = '<div style="text-align:center; padding:20px; color:#555;">Tuning...</div>';
    
    await loadThreadHistory(threadId);
    renderMessages(threadId);
}

export function renderMessages(threadId) {
    if (!_uiRef || state.activeThread !== threadId) return;
    const container = _uiRef.getHtml('msgContainer');
    const msgs = state.threads[threadId] || [];
    
    container.innerHTML = '';
    
    msgs.forEach(m => {
        const isMe = m.direction === 'outgoing';
        
        // Use UI class to build message
        _uiRef.html({
            parent: container,
            tag: 'div',
            classList: ['msg-row', isMe ? 'me' : 'them'],
            children: [{
                tag: 'div',
                classList: ['msg-bubble'],
                children: [
                    m.subject ? { tag: 'div', classList: ['msg-subject'], textContent: m.subject } : null,
                    { 
                        tag: 'div', 
                        classList: ['msg-content'], 
                        // DANGER: We trust smartParse. 
                        // In a real app, use a DOM Sanitizer before setting innerHTML.
                        outerHTML: `<div class="msg-content">${smartParse(m.content)}</div>`
                    },
                    { tag: 'div', classList: ['msg-time'], textContent: formatTime(m.timeSent) }
                ]
            }]
        });
    });

    // Scroll to bottom
    setTimeout(() => container.scrollTop = container.scrollHeight, 0);
}