// B"H
import { aliasDisplay, cleanAlias, isValidAlias, readRememberedAlias, rememberAlias } from './localAliasState.js';

export { aliasDisplay, cleanAlias, isValidAlias };

export async function ensureDefaultAlias() {
  const session = await getSession();
  const username = session?.info?.userId || session?.userId || '';
  const serverAlias = cleanAlias(session?.info?.hosuhfuh?.alias);
  const remembered = cleanAlias(serverAlias || readRememberedAlias());
  if (serverAlias) rememberAlias(serverAlias);
  if (username && remembered) return { alias:rememberAlias(remembered), username, session, mode:'synced' };
  if (!username && remembered) return { alias:remembered, username:'Local IndexedDB', session, mode:'local' };
  if (!username) return { alias:'', username:'', session, mode:'logged-out' };
  const aliases = await getAliases();
  const first = aliases.map(item => cleanAlias(item?.id || item?.aliasId || item)).find(Boolean);
  if (first) { await setDefaultAlias(first); return { alias:first, username, session, mode:'synced' }; }
  const created = await createDefaultAlias(username);
  if (created) await setDefaultAlias(created);
  return { alias:created, username, session, mode:created ? 'synced' : 'logged-out' };
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
  rememberAlias(clean);
  try {
    const data = await jsonFetch('/api/social/alias/default', { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body:new URLSearchParams({ alias:clean, aliasId:clean }), credentials:'include' });
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
    const data = await jsonFetch('/api/social/aliases', { method:'POST', headers:{ 'Content-Type':'application/x-www-form-urlencoded' }, body:new URLSearchParams({ aliasName, inputId, aliasId:inputId, description:'Default alias created automatically.' }), credentials:'include' });
    return cleanAlias(data?.aliasId || data?.success?.aliasId || inputId);
  } catch { return ''; }
}

function idBase(value) {
  const clean = String(value || 'awtsmoos').toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 20);
  return clean || `awts${Date.now().toString(36).slice(-6)}`;
}

async function jsonFetch(url, options = {}) {
  const res = await fetch(url, { credentials:'include', ...options });
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok || data?.error) throw new Error(data?.error?.message || data?.message || `HTTP ${res.status}`);
  return data;
}

/** B"H: login is a bridge, but local alias memory keeps the OS from calling its own user absent. */
