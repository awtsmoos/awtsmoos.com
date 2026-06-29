// B"H
/** @module AliasIdentity @description One small oracle: mail never accepts an empty alias. */
export function isValidAlias(value) {
    const alias = String(value || '').trim();
    return !!alias && !['null', 'undefined', 'false', '0'].includes(alias.toLowerCase());
}
export function cleanAlias(value) { return isValidAlias(value) ? String(value).trim().replace(/^@+/, '') : ''; }
export function aliasDisplay(value) { const alias = cleanAlias(value); return alias ? `@${alias}` : 'Choose alias'; }
export async function ensureDefaultAlias() {
    const session = await getSession();
    const username = session?.info?.userId || session?.userId || '';
    const current = cleanAlias(session?.info?.hosuhfuh?.alias || window.curAlias);
    if (current) return { alias: current, username, session };
    if (!username) return { alias: '', username: '', session };
    const aliases = await getAliases();
    const first = aliases.map(item => cleanAlias(item?.id || item?.aliasId || item)).find(Boolean);
    if (first) { await setDefaultAlias(first); return { alias: first, username, session }; }
    const created = await createDefaultAlias(username);
    if (created) await setDefaultAlias(created);
    return { alias: created, username, session };
}
export async function getSession() {
    try { const data = await jsonFetch('/api/social'); return data?.session || data?.user || null; }
    catch { return null; }
}
export async function getAliases() {
    try {
        const data = await jsonFetch('/api/social/aliases/details');
        const list = Array.isArray(data) ? data : Array.isArray(data?.success) ? data.success : [];
        return list.filter(item => cleanAlias(item?.id || item?.aliasId || item));
    } catch { return []; }
}
export async function setDefaultAlias(alias) {
    const clean = cleanAlias(alias);
    if (!clean) return false;
    try {
        const data = await jsonFetch('/api/social/alias/default', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ alias: clean, aliasId: clean }), credentials: 'include' });
        window.curAlias = clean;
        return !!(data?.success || data?.details);
    } catch { return false; }
}
async function createDefaultAlias(username) {
    const base = idBase(username);
    for (let i = 0; i < 8; i++) {
        const id = i ? `${base}${i + 1}` : base;
        const alias = await createAlias(username, id);
        if (alias) return alias;
    }
    return '';
}
export async function createAlias(name, requestedId) {
    const aliasName = String(name || 'Awtsmoos').trim().slice(0, 50);
    const inputId = idBase(requestedId || aliasName);
    try {
        const data = await jsonFetch('/api/social/aliases', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams({ aliasName, inputId, aliasId: inputId, description: 'Default alias created automatically.' }), credentials: 'include' });
        return cleanAlias(data?.aliasId || data?.success?.aliasId || inputId);
    } catch { return ''; }
}
function idBase(value) {
    const clean = String(value || 'awtsmoos').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
    return clean || `awts${Date.now().toString(36).slice(-6)}`;
}
async function jsonFetch(url, options = {}) {
    const res = await fetch(url, { credentials: 'include', ...options });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
    return data;
}
