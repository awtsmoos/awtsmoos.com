// B"H
/**
 * @module AwtsmoosMailNetwork
 * @description
 * Chapter 463: Mail now listens to the unified social socket. Messages are
 * still mail, but the chamber also hears social events, presence, and live hub
 * sparks from the same WebSocket vessel.
 */

import { state, notify } from './store.js';
import { FX } from './ui/fx.js';

const API_BASE = "/api/social/mail";
let socket;

export async function refreshSnippets() {
    if (!state.alias) return;
    try {
        const res = await fetch(`${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=threads&_t=${Date.now()}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            data.sort((a,b) => b.timeSent - a.timeSent);
            state.snippets = data;
            notify('snippets', data);
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
            const map = new Map();
            [...state.threads[threadId], ...msgs].forEach(m => map.set(m.id || m.uid, m));
            state.threads[threadId] = Array.from(map.values()).sort((a,b) => a.timeSent - b.timeSent);
            return msgs.length;
        }
    } catch(e) {}
    return 0;
}

export async function sendMessageApi(recipient, subject, content) {
    if(!state.alias) return;
    const url = recipient.includes("@") ? `${API_BASE}/sendTo/external/from/${state.alias}?toEmail=${encodeURIComponent(recipient.replace("_at_", "@"))}` : `${API_BASE}/sendTo/${recipient}/from/${state.alias}`;
    const body = new URLSearchParams();
    body.append("subject", subject);
    body.append("content", content);
    try {
        await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        publishSocialMailEvent('mail.sent', { to: recipient, subject });
        refreshSnippets();
    } catch(e) { alert("Transmission Failed"); }
}

export async function deleteThread(threadId) {
    if (!state.alias) return false;
    try {
        const body = new URLSearchParams();
        body.append("aliasId", state.alias);
        body.append("threadId", threadId);
        await fetch(`${API_BASE}/deleteThread`, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        publishSocialMailEvent('mail.deleted', { threadId });
        return true;
    } catch (e) {
        console.error("Deletion Anomaly:", e);
        return false;
    }
}

export function connectSocket(alias) {
    if(socket && socket.readyState <= 1) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${proto}://${location.host}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'LOGIN', aliasId: alias }));
        socket.send(JSON.stringify({ type: 'SOCIAL_SUBSCRIBE', aliasId: alias, channel: `alias:${alias}` }));
        socket.send(JSON.stringify({ type: 'SOCIAL_PRESENCE', aliasId: alias, channel: `alias:${alias}`, status: 'mail-online' }));
        notify('socket', { status: 'connected', alias });
    };
    socket.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            if (data.type === 'NEW_MAIL' && data.message) return handleNewMail(data.message);
            if (data.type === 'LIVE_PREVIEW') return notify('ghost', data);
            if (data.type === 'SOCIAL_EVENT' || data.type === 'SOCIAL_PRESENCE' || data.type === 'SOCIAL_SUBSCRIBED' || data.type === 'SOCIAL_PONG') {
                notify('socialSocket', data);
                return;
            }
            notify('socketMessage', data);
        } catch(e){}
    };
    socket.onclose = () => notify('socket', { status: 'closed', alias });
    socket.onerror = () => notify('socket', { status: 'error', alias });
}

function handleNewMail(m) {
    if(FX.playSound) FX.playSound('sent');
    if(FX.triggerSonar) FX.triggerSonar(window.innerWidth/2, 50);
    const tid = m.correspondent || m.from;
    if(!state.threads[tid]) state.threads[tid] = [];
    state.threads[tid].push(m);
    notify('threads', state.threads);
    notify('socialSocket', { type: 'MAIL_BRIDGED_TO_SOCIAL', threadId: tid, at: Date.now() });
    refreshSnippets();
}

export function broadcastTyping(content) {
    if (state.activeThread && socket && socket.readyState === 1) {
        socket.send(JSON.stringify({ type: 'LIVE_PREVIEW', to: state.activeThread, content }));
    }
}

export function publishSocialMailEvent(kind, payload = {}) {
    if (!socket || socket.readyState !== 1 || !state.alias) return false;
    socket.send(JSON.stringify({ type: 'SOCIAL_PUBLISH', aliasId: state.alias, actor: state.alias, channel: `alias:${state.alias}`, kind, payload }));
    return true;
}
