// B"H
/**
 * @module AwtsmoosMailNetwork
 * @description
 * The Awtsmoos breathes through the mail river: every HTTP response is read
 * truthfully, every error gets a human name, and failed transmissions now throw
 * so the composer can preserve the draft instead of pretending the spark flew.
 */
import { state, notify } from './store.js';
import { FX } from './ui/fx.js';

const API_BASE = '/api/social/mail';
let socket;

function threadKey(id) { return String(id || '').replace(/@/g, '_at_'); }

function firstText(...values) {
    for (const value of values) {
        if (typeof value === 'string' && value.trim()) return value.trim();
    }
    return '';
}

function errorMessage(payload, status) {
    const error = payload?.error || payload?.success?.error || payload;
    if (typeof error === 'string') return error;
    return firstText(
        error?.message, error?.details, error?.code,
        payload?.message, payload?.details,
        status ? `Request failed with status ${status}.` : 'Request failed.'
    );
}

function isErrorPayload(payload) {
    return Boolean(payload?.error || payload?.success?.error || payload?.ok === false);
}

async function parseResponse(res) {
    const text = await res.text();
    if (!text) return null;
    try { return JSON.parse(text); }
    catch { return { raw: text }; }
}

async function jsonFetch(url, options = {}) {
    const res = await fetch(url, options);
    const data = await parseResponse(res);
    if (!res.ok || isErrorPayload(data)) {
        const err = new Error(errorMessage(data, res.status));
        err.status = res.status;
        err.payload = data;
        err.url = url;
        throw err;
    }
    return data;
}

function listFrom(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.success)) return data.success;
    if (Array.isArray(data?.messages)) return data.messages;
    if (Array.isArray(data?.threads)) return data.threads;
    return [];
}

function mailRoute(recipient) {
    const clean = String(recipient || '').trim();
    if (!clean) throw new Error('Recipient is required.');
    if (clean.includes('@')) {
        return { to: 'external', query: `?toEmail=${encodeURIComponent(clean.replace('_at_', '@'))}` };
    }
    return { to: encodeURIComponent(clean.replace(/^@/, '')), query: '' };
}

export async function refreshSnippets() {
    if (!state.alias) return [];
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=threads&_t=${Date.now()}`;
        const list = listFrom(await jsonFetch(url));
        state.snippets = list.sort((a, b) => (b.timeSent || 0) - (a.timeSent || 0));
        notify('snippets', state.snippets);
        return state.snippets;
    } catch (error) {
        console.error('Mail thread fetch failed:', error);
        notify('mailError', error);
        return [];
    }
}

export async function loadThreadHistory(threadId, page = 1) {
    if (!state.alias || !threadId) return 0;
    try {
        const url = `${API_BASE}/get?aliasId=${encodeURIComponent(state.alias)}&view=messages&threadId=${encodeURIComponent(threadKey(threadId))}&page=${page}`;
        const msgs = listFrom(await jsonFetch(url));
        if (!state.threads[threadId]) state.threads[threadId] = [];
        const map = new Map();
        [...state.threads[threadId], ...msgs].forEach(m => map.set(m.id || m.uid || `${m.timeSent}-${m.content}`, m));
        state.threads[threadId] = Array.from(map.values()).sort((a, b) => (a.timeSent || 0) - (b.timeSent || 0));
        return msgs.length;
    } catch (error) {
        console.error('Mail history failed:', error);
        notify('mailError', error);
        return 0;
    }
}

export async function sendMessageApi(recipient, subject, content) {
    if (!state.alias) throw new Error('Choose an alias before sending.');
    if (!String(content || '').trim()) throw new Error('Message body is empty.');
    const route = mailRoute(recipient);
    const url = `${API_BASE}/sendTo/${route.to}/from/${encodeURIComponent(state.alias)}${route.query}`;
    const body = new URLSearchParams({ subject: subject || '', content: content || '' });
    try {
        const data = await jsonFetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body });
        publishSocialMailEvent('mail.sent', { to: recipient, subject });
        await refreshSnippets();
        return data || { success: true };
    } catch (error) {
        console.error('Transmission failed:', error);
        notify('mailError', error);
        throw error;
    }
}

export async function deleteThread(threadId) {
    if (!state.alias || !threadId) return false;
    const url = `${API_BASE}/thread/delete/${encodeURIComponent(threadKey(threadId))}?aliasId=${encodeURIComponent(state.alias)}`;
    await jsonFetch(url, { method: 'POST' });
    publishSocialMailEvent('mail.deleted', { threadId });
    return true;
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
