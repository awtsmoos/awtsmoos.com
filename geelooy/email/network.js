// B"H
/**
 * @module AwtsmoosMailNetwork
 * @description The mail river now uses the actual API gates, unwraps responses
 * gently, and keeps sockets alive without letting one broken fetch crack the UI.
 */
import { state, notify } from './store.js';
import { FX } from './ui/fx.js';

const API_BASE = '/api/social/mail';
let socket;

async function jsonFetch(url, options) {
    const res = await fetch(url, options);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }
    if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
    return data;
}
function threadKey(id) { return String(id || '').replace(/@/g, '_at_'); }

export async function refreshSnippets() {
    if (!state.alias) return;
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=threads&_t=${Date.now()}`;
        const data = await jsonFetch(url);
        const list = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
        state.snippets = list.sort((a, b) => (b.timeSent || 0) - (a.timeSent || 0));
        notify('snippets', state.snippets);
    } catch (e) { console.error('Mail thread fetch failed:', e); notify('mailError', e); }
}

export async function loadThreadHistory(threadId, page = 1) {
    if (!state.alias || !threadId) return 0;
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=messages&threadId=${encodeURIComponent(threadKey(threadId))}&page=${page}`;
        const data = await jsonFetch(url);
        const msgs = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
        if (!state.threads[threadId]) state.threads[threadId] = [];
        const map = new Map();
        [...state.threads[threadId], ...msgs].forEach(m => map.set(m.id || m.uid || `${m.timeSent}-${m.content}`, m));
        state.threads[threadId] = Array.from(map.values()).sort((a, b) => (a.timeSent || 0) - (b.timeSent || 0));
        return msgs.length;
    } catch (e) { console.error('Mail history failed:', e); return 0; }
}

export async function sendMessageApi(recipient, subject, content) {
    if (!state.alias || !recipient) return false;
    const target = recipient.includes('@') ? `external?toEmail=${encodeURIComponent(recipient.replace('_at_', '@'))}` : encodeURIComponent(recipient);
    const url = `${API_BASE}/sendTo/${target}/from/${encodeURIComponent(state.alias)}`;
    const body = new URLSearchParams({ subject: subject || '', content: content || '' });
    try {
        await jsonFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        publishSocialMailEvent('mail.sent', { to: recipient, subject });
        await refreshSnippets();
        return true;
    } catch (e) { alert('Transmission Failed'); console.error(e); return false; }
}

export async function deleteThread(threadId) {
    if (!state.alias || !threadId) return false;
    try {
        const url = `${API_BASE}/thread/delete/${encodeURIComponent(threadKey(threadId))}?aliasId=${encodeURIComponent(state.alias)}`;
        await jsonFetch(url, { method: 'POST' });
        publishSocialMailEvent('mail.deleted', { threadId });
        return true;
    } catch (e) { console.error('Deletion Anomaly:', e); return false; }
}

export function connectSocket(alias) {
    if (socket && socket.readyState <= 1) return;
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    socket = new WebSocket(`${proto}://${location.host}`);
    socket.onopen = () => {
        socket.send(JSON.stringify({ type: 'LOGIN', aliasId: alias }));
        socket.send(JSON.stringify({ type: 'SOCIAL_SUBSCRIBE', aliasId: alias, channel: `alias:${alias}` }));
        socket.send(JSON.stringify({ type: 'SOCIAL_PRESENCE', aliasId: alias, channel: `alias:${alias}`, status: 'mail-online' }));
        notify('socket', { status: 'connected', alias });
    };
    socket.onmessage = event => handleSocketMessage(event.data);
    socket.onclose = () => notify('socket', { status: 'closed', alias });
    socket.onerror = () => notify('socket', { status: 'error', alias });
}

function handleSocketMessage(raw) {
    try {
        const data = JSON.parse(raw);
        if (data.type === 'NEW_MAIL' && data.message) return handleNewMail(data.message);
        if (data.type === 'LIVE_PREVIEW') return notify('ghost', data);
        if (/^SOCIAL_/.test(data.type || '')) return notify('socialSocket', data);
        notify('socketMessage', data);
    } catch {}
}
function handleNewMail(message) {
    if (FX.playSound) FX.playSound('sent');
    if (FX.triggerSonar) FX.triggerSonar(window.innerWidth / 2, 50);
    const tid = message.correspondent || message.from;
    if (!state.threads[tid]) state.threads[tid] = [];
    state.threads[tid].push(message);
    notify('threads', state.threads);
    notify('socialSocket', { type: 'MAIL_BRIDGED_TO_SOCIAL', threadId: tid, at: Date.now() });
    refreshSnippets();
}
export function broadcastTyping(content) {
    if (state.activeThread && socket?.readyState === 1) socket.send(JSON.stringify({ type: 'LIVE_PREVIEW', to: state.activeThread, content }));
}
export function publishSocialMailEvent(kind, payload = {}) {
    if (!socket || socket.readyState !== 1 || !state.alias) return false;
    socket.send(JSON.stringify({ type: 'SOCIAL_PUBLISH', aliasId: state.alias, actor: state.alias, channel: `alias:${state.alias}`, kind, payload }));
    return true;
}
