
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
    const params = new URLSearchParams(window.location.search);
    const requestedAlias = params.get('alias');

    if (window.curAlias || requestedAlias) {
        await login(window.curAlias || requestedAlias, ui);
    } else {
        showLoginOverlay(ui, true);
    }

    window.addEventListener("awtsmoosAliasChange", async (e) => {
        const id = e.detail ? e.detail.id : null;
        if(id) {
            await login(id, ui);
        } else {
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
    
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get('thread');
    const toAlias = params.get('to');
    if (threadId) {
        const clean = normalizeThreadId(threadId);
        const found = state.snippets.find(s => s.correspondent === clean);
        const name = found ? found.correspondent.replace(/_at_/g, '@') : clean.replace(/_at_/g, '@');
        switchChat(ui, clean, name);
    } else if (toAlias) {
        openComposeTo(ui, toAlias);
    }

    if(!window._mailPoll) {
        window._mailPoll = setInterval(refreshSnippets, 30000);
    }
}

function normalizeThreadId(threadId) {
    return String(threadId || '').replace(/@/g, '_at_');
}

function openComposeTo(ui, toAlias) {
    const modal = ui.getHtml('composeModal');
    const to = ui.getHtml('newTo');
    const subject = ui.getHtml('newSub');
    if (!modal || !to) return;

    to.value = toAlias;
    if (subject && !subject.value) subject.value = `Message for @${toAlias}`;
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.add('visible'), 10);
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
