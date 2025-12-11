
// B"H
import { connectSocket, refreshSnippets } from './network.js';
import { switchChat } from './ui/chat.js';

export const state = {
    alias: null,
    threads: {},        
    snippets: [],       
    activeThread: null,
    view: 'inbox',      
    pagination: {},
    settings: { gatekeeperMode: false, approved: {}, rules: [] },
    replyingTo: null,
    isLoadingHistory: false,
    listeners: new Set()
};

export function subscribe(fn) {
    state.listeners.add(fn);
}

export function notify(key, value) {
    state.listeners.forEach(fn => fn(key, value));
}

// Global Auth logic
export async function initAuth(ui) {
    console.log("Awtsmoos Mail: Initializing Identity Protocols...");

    // 1. Immediate Check
    if(window.curAlias) {
        console.log("Awtsmoos Mail: Identity found in memory:", window.curAlias);
        await login(window.curAlias, ui);
    } else {
        showLoginOverlay(ui, true);
    }

    // 2. Event Listener
    window.addEventListener("awtsmoosAliasChange", async (e) => {
        const id = e.detail ? e.detail.id : null;
        if(id) {
            await login(id, ui);
        } else {
            console.log("Awtsmoos Mail: Identity Dissolved.");
            state.alias = null;
            showLoginOverlay(ui, true);
        }
    });
}

async function login(alias, ui) {
    state.alias = alias;
    window.curAlias = alias;
    
    showLoginOverlay(ui, false);
    
    try {
        const statusText = ui.getHtml('userStatusText');
        if(statusText) {
            statusText.textContent = `@${alias}`;
            statusText.style.color = 'var(--neon-emerald)';
            statusText.style.textShadow = '0 0 10px var(--neon-emerald)';
        }
    } catch(e) {}

    connectSocket(alias);
    await refreshSnippets();
    
    // ROUTING CHECK: Load thread from URL if present
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('thread');
    if(threadId) {
        // ID Cleaning: IDs in network often use _at_ instead of @
        let clean = threadId.replace(/@/g, '_at_');
        // If it's a domain-less alias (like 'awtsmoos'), don't append suffix unless necessary logic exists
        
        // Try to find display name from snippets
        const found = state.snippets.find(s => s.correspondent === clean);
        
        // Formatting for title: restore @ for visual
        const name = found 
            ? found.correspondent.replace(/_at_/g, '@') 
            : clean.replace(/_at_/g, '@');
        
        switchChat(ui, clean, name);
    }

    if(!window._mailPoll) {
        window._mailPoll = setInterval(refreshSnippets, 30000);
    }
}

function showLoginOverlay(ui, show) {
    const ov = ui.getHtml('loginOverlay');
    if(ov) {
        if(show) {
            ov.classList.remove('hidden');
            setTimeout(() => ov.classList.add('visible'), 10);
        }
        else {
            ov.classList.remove('visible');
            setTimeout(() => ov.classList.add('hidden'), 300);
        }
    }
}
