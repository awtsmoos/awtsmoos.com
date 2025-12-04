
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

    // 1. Immediate Check: If window.curAlias exists, login immediately.
    // This prevents the overlay from getting stuck if the script loaded fast.
    if(window.curAlias) {
        console.log("Awtsmoos Mail: Identity found in memory:", window.curAlias);
        await login(window.curAlias, ui);
    } else {
        // Ensure overlay is visible if no alias
        showLoginOverlay(ui, true);
    }

    // 2. Event Listener: Listens for the profile dropdown changes
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
    state.alias = alias;
    window.curAlias = alias;
    
    // Force hide overlay
    showLoginOverlay(ui, false);
    
    // Update Sidebar Status
    try {
        const statusText = ui.getHtml('userStatusText');
        if(statusText) {
            statusText.textContent = `@${alias}`;
            statusText.style.color = 'var(--neon-emerald)';
            statusText.style.textShadow = '0 0 10px var(--neon-emerald)';
        }
    } catch(e) {}

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
        if(show) {
            ov.classList.remove('hidden');
            // Small delay to allow CSS transition if needed
            setTimeout(() => ov.classList.add('visible'), 10);
        }
        else {
            ov.classList.remove('visible');
            setTimeout(() => ov.classList.add('hidden'), 300);
        }
    }
}
