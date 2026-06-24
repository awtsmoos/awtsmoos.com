// B"H
/**
 * @file socialInboxBridge.js
 * @description
 * Chapter 540: The desktop hears the civilization inbox without demanding a
 * throne. A small read-only bridge exposes the same communications river to
 * windows, start-menu actions, and future OS programs.
 */

const KEY = 'awtsmoos_social_inbox_alias';

function cleanAlias(aliasId) {
  return String(aliasId || '').trim().replace(/[^a-zA-Z0-9_:@.-]/g, '_').slice(0, 180);
}

function guessAlias() {
  const stored = localStorage.getItem(KEY) || localStorage.getItem('awtsmoosAlias') || '';
  return cleanAlias(stored || window?.awtsmoosAlias || window?.currentAlias || '');
}

async function json(url, options = {}) {
  const res = await fetch(url, options);
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { error: { code: 'BAD_JSON', text } }; }
}

function endpoint(aliasId, path = '') {
  return `/api/social/communications/${encodeURIComponent(cleanAlias(aliasId))}${path}`;
}

async function overview(aliasId = guessAlias()) {
  return json(endpoint(aliasId, '/overview'));
}

async function list(aliasId = guessAlias(), limit = 25) {
  return json(`${endpoint(aliasId, '/inbox')}?limit=${encodeURIComponent(limit)}`);
}

async function unread(aliasId = guessAlias()) {
  return json(endpoint(aliasId, '/inbox/unread'));
}

async function openThread(aliasId, threadId, limit = 50) {
  const thread = encodeURIComponent(String(threadId || ''));
  return json(`${endpoint(aliasId, `/threads/${thread}`)}?limit=${encodeURIComponent(limit)}`);
}

async function markRead(aliasId, itemId) {
  const item = encodeURIComponent(String(itemId || ''));
  return json(endpoint(aliasId, `/inbox/${item}/read`), { method: 'POST' });
}

function badgeText(count) {
  return count ? `Inbox ${count}` : 'Inbox';
}

async function renderBadge(container, aliasId = guessAlias()) {
  if (!container) return null;
  let node = container.querySelector?.('[data-awtsmoos-social-inbox-badge]');
  if (!node) {
    node = document.createElement('button');
    node.dataset.awtsmoosSocialInboxBadge = 'yes';
    node.style.marginLeft = '6px';
    node.onclick = () => window.AwtsmoosSocialInbox.openWindow?.(aliasId);
    container.appendChild(node);
  }
  if (!aliasId) { node.textContent = 'Inbox: set alias'; return node; }
  const data = await unread(aliasId).catch(error => ({ error }));
  node.textContent = badgeText(Number(data?.success?.count || 0));
  return node;
}

async function openWindow(aliasId = guessAlias()) {
  const os = window.os;
  if (!os?.addWindow) return null;
  const box = document.createElement('div');
  box.style.padding = '12px';
  box.textContent = 'Loading Awtsmoos inbox...';
  os.addWindow({ title: 'Social Inbox', content: box, os });
  const data = await list(aliasId).catch(error => ({ error }));
  const items = data?.success || [];
  box.innerHTML = `<h3>B"H Social Inbox</h3><p>Alias: ${aliasId || '(none)'}</p>`;
  for (const item of items.slice(0, 20)) {
    const row = document.createElement('div');
    row.textContent = `${item.readAt ? '✓' : '•'} ${item.title || item.kind || item.id}`;
    box.appendChild(row);
  }
  if (!items.length) box.appendChild(document.createTextNode('No inbox items found.'));
  return box;
}

export function initSocialInboxBridge({ os } = {}) {
  const api = { overview, list, unread, openThread, markRead, renderBadge, openWindow, guessAlias };
  window.AwtsmoosSocialInbox = api;
  const taskArea = document.getElementById('task-area');
  setTimeout(() => renderBadge(taskArea, guessAlias()).catch(() => {}), 100);
  window.addEventListener('awtsmoosAliasChange', () => renderBadge(taskArea, guessAlias()).catch(() => {}));
  return api;
}
