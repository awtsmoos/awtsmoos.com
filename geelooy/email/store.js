
// B"H
import { connectSocket, refreshSnippets } from './network.js';

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
    }

    // 2. Event Listener (The Critical Link)
    window.addEventListener("awtsmoosAliasChange", async (e) => {
        const id = e.detail ? e.detail.id : null;
        console.log("Awtsmoos Mail: Signal Received >", id);
        
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
    if(state.alias === alias) return;
    
    state.alias = alias;
    window.curAlias = alias;
    
    showLoginOverlay(ui, false);
    
    // Update Sidebar
    const statusText = ui.getHtml('userStatusText');
    if(statusText) {
        statusText.textContent = `@${alias}`;
        statusText.style.color = 'var(--neon-emerald)';
        statusText.style.textShadow = '0 0 10px var(--neon-emerald)';
    }

    // Connect Network
    connectSocket(alias);
    await refreshSnippets();
    
    // Start Poll
    if(!window._mailPoll) {
        window._mailPoll = setInterval(refreshSnippets, 30000);
    }
}

function showLoginOverlay(ui, show) {
    const ov = ui.getHtml('loginOverlay');
    if(ov) {
        if(show) ov.classList.add('visible');
        else ov.classList.remove('visible');
    }
}
