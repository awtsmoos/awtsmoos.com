
// B"H
import { state, notify, subscribe } from '../store.js';
import { loadThreadHistory } from '../network.js';
import { FX } from './fx.js';

// Import Sub-Modules
import { initChatLayout } from './chat/layout.js';
import { renderMessages, renderGhostBubble, updateRelativeTimes } from './chat/messages.js';
import { toggleSpotlight } from './chat/physics.js';
import { chatState } from './chat/state.js';

let isSubscribed = false;

export function renderChat(ui, parent) {
    // 1. Initialize Layout
    initChatLayout(ui, parent);
    
    // 2. Listen for internal exit event to trigger cleanup
    document.addEventListener('chat:exit', cleanupChat);

    // 3. Subscribe to Store Updates (Data Reactivity)
    if(!isSubscribed) {
        subscribe((key, val) => {
            // Typing Indicator
            if(key === 'ghost') {
                const fromId = val.from; 
                if(state.activeThread && fromId && fromId.includes(state.activeThread.split('@')[0])) {
                    renderGhostBubble(val.content);
                }
            }
            // Real-time Message Arrival
            if(key === 'threads') {
                if(chatState.activeThreadId && val[chatState.activeThreadId]) {
                    // Pass true to indicate this is an update, not a full load
                    renderMessages(chatState.activeThreadId, val[chatState.activeThreadId]);
                }
            }
        });
        isSubscribed = true;
    }

    // 4. Global Keys
    document.removeEventListener('keydown', handleGlobalKey);
    document.addEventListener('keydown', handleGlobalKey);

    // 5. Time Interval
    if(chatState.timeInterval) clearInterval(chatState.timeInterval);
    chatState.timeInterval = setInterval(updateRelativeTimes, 1000);
}

function handleGlobalKey(e) {
    // Ctrl+K for Command Palette
    if(e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const ui = chatState.ui;
        if(ui) {
            const m = ui.getHtml('cmdModal');
            if(m) {
                m.classList.toggle('hidden');
                if(!m.classList.contains('hidden')) m.querySelector('input').focus();
            }
        }
    }
}

function cleanupChat() {
    if(chatState.timeInterval) {
        clearInterval(chatState.timeInterval);
        chatState.timeInterval = null;
    }
    
    document.removeEventListener('keydown', handleGlobalKey);
    document.removeEventListener('chat:exit', cleanupChat);
    
    // Stop WebGL loop to save battery
    if(FX && FX.stop) FX.stop();

    if(chatState.isSpotlightActive) {
        toggleSpotlight(); // Reset cursor mode
    }
}

export async function switchChat(ui, threadId, displayName) {
    const container = ui.getHtml('msgContainer');
    
    // 1. Update URL without reloading
    const url = new URL(window.location);
    url.searchParams.set('thread', threadId);
    window.history.pushState({}, '', url);

    // 2. Singularity Transition Effect
    if(container) {
        container.style.transition = 'transform 0.5s cubic-bezier(0.55, 0.055, 0.675, 0.19)';
        container.style.transform = 'scale(0) rotate(720deg)';
        container.style.opacity = '0.6';
    }

    if(FX.dissolveScreen) FX.dissolveScreen(container);
    await new Promise(r => setTimeout(r, 500)); 

    // 3. Reset styles & Set State
    if(container) {
        container.style.transition = 'none';
        container.style.transform = 'scale(1) rotate(0deg)';
        container.style.opacity = '';
    }

    state.activeThread = threadId;
    chatState.activeThreadId = threadId;

    const titleEl = ui.getHtml('chatTitle');
    if(titleEl) titleEl.textContent = displayName;
    
    ui.getHtml('appContainer').classList.add('view-chat'); 
    
    // 4. Load Data
    container.innerHTML = `<div class="singularity-loader"></div>`;
    
    await loadThreadHistory(threadId);
    
    // 5. Initial Render
    const msgs = state.threads[threadId] || [];
    renderMessages(threadId, msgs);

    // 6. Smart Suggestions
    const lastMsg = msgs[msgs.length-1];
    if (lastMsg && lastMsg.direction !== 'outgoing') {
        const text = (lastMsg.content || "").toLowerCase();
        let suggests = ['Received', 'Reviewing'];
        if(text.includes('?')) suggests = ['Yes', 'No', 'Not sure'];
        if(text.includes('time') || text.includes('when')) suggests = ['Soon', 'Later', 'Tomorrow'];
        notify('smartSuggestions', suggests);
    }
}

// Export internal render function for network usage
export { renderMessages };
