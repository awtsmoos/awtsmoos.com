// B"H
import { state, notify } from './store.js';
import { renderThreadList } from './ui/sidebar.js';
import { renderMessages } from './ui/chat.js';

const API_BASE = "/api/social/mail";
let socket;

export async function refreshSnippets() {
    if (!state.alias) return;
    try {
        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=threads&_t=${Date.now()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            state.snippets = data;
            renderThreadList(); // Trigger UI update
        }
    } catch (e) { console.error("Fetch Error", e); }
}

export async function loadThreadHistory(threadId, page=1) {
    if (!state.alias) return 0;
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=messages&threadId=${encodeURIComponent(threadId)}&page=${page}`;
        const res = await fetch(url);
        const msgs = await res.json();
        if (Array.isArray(msgs)) {
            if(!state.threads[threadId]) state.threads[threadId] = [];
            // Merge logic (simplified)
            const map = new Map();
            [...state.threads[threadId], ...msgs].forEach(m => map.set(m.uid || m.id, m));
            const unique = Array.from(map.values()).sort((a,b) => a.timeSent - b.timeSent);
            state.threads[threadId] = unique;
            return msgs.length;
        }
    } catch(e) {}
    return 0;
}

export async function sendMessageApi(recipient, subject, content) {
    const url = recipient.includes("@") 
        ? `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(recipient.replace("_at_", "@"))}`
        : `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;

    const body = new URLSearchParams();
    body.append("subject", subject);
    body.append("content", content);

    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body
    });
    refreshSnippets();
}

export function connectSocket(alias) {
    if(socket) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${proto}://${location.host}`);
    
    socket.onopen = () => socket.send(JSON.stringify({ type: 'LOGIN', aliasId: alias }));
    
    socket.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'NEW_MAIL' && data.message) {
                // Handle new mail (inject into cache, update UI)
                const m = data.message;
                const tid = m.correspondent || m.from; // Simplified
                if(!state.threads[tid]) state.threads[tid] = [];
                state.threads[tid].push(m);
                renderMessages(tid); // Refresh chat if open
                refreshSnippets();
            }
            if (data.type === 'LIVE_PREVIEW') {
                notify('ghost', data);
            }
        } catch(e){}
    };
}

export function broadcastTyping(content) {
    if (state.activeThread && socket && socket.readyState === 1) {
         socket.send(JSON.stringify({
            type: 'LIVE_PREVIEW',
            to: state.activeThread, 
            content: content
        }));
    }
}