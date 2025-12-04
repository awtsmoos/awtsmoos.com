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
    let id = window.curAlias;
    
    // Check if loaded via event
    if (!id) {
        // Wait for event or show login
        showLoginOverlay(ui, true);
    } else {
        await login(id, ui);
    }
    
    window.addEventListener("awtsmoosAliasChange", async (e) => {
        if(e.detail && e.detail.id) {
            await login(e.detail.id, ui);
        }
    });
}

async function login(alias, ui) {
    state.alias = alias;
    window.curAlias = alias;
    showLoginOverlay(ui, false);
    
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