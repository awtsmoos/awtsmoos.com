// B"H
import { connectSocket } from './network.js';
import { refreshSnippets } from './network.js';

export const state = {
    alias: null,
    threads: {},        // Cache: { threadId: [msgs] }
    snippets: [],       // Sidebar list
    activeThread: null,
    view: 'inbox',      // 'inbox' | 'requests'
    pagination: {},
    settings: { gatekeeperMode: false, approved: {}, rules: [] },
    replyingTo: null,
    
    // Reactive Listeners
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
    // 1. Listen for the signal from profileDropdown
    // This event fires when session is checked or alias is switched
    window.addEventListener("awtsmoosAliasChange", async (e) => {
        const id = e.detail ? e.detail.id : null;
        if(id) {
            await login(id, ui);
        } else {
            // Null ID means not logged in or no alias selected
            showLoginOverlay(ui, true);
        }
    });

    // We do not manually check window.curAlias here because 
    // profileDropdown will automatically fetch session on mount 
    // and fire the event above.
}

async function login(alias, ui) {
    if(state.alias === alias) return; // Debounce
    
    state.alias = alias;
    window.curAlias = alias;
    showLoginOverlay(ui, false); // Hide overlay
    
    // Update Sidebar User Badge
    const statusText = ui.getHtml('userStatusText');
    if(statusText) {
        statusText.textContent = `@${alias}`;
        statusText.style.color = 'var(--neon-emerald)';
    }

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