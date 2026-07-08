// B"H
/**
 * @module MailSidebarThreads
 * @description Threads become sender groups: one sender chamber, many messages, fast filters.
 */
import { state } from '../store.js';
import { formatTime } from '../helpers.js';
import { filterThreads, folderEmpty, groupThreadsBySender } from './mailFolders.js';
export function formatHandle(value) {
  if (!value) return 'Unknown';
  let handle = String(value).replace(/_at_/g, '@');
  const suffix = '@awtsmoos.com';
  if (handle.endsWith(suffix)) { const shorter = handle.slice(0, -suffix.length); if (shorter.includes('@')) handle = shorter; }
  return handle;
}
export function avatarTone(name = '?') { let hash = 0; for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash); return `#${(`00000${(hash & 0x00ffffff).toString(16).toUpperCase()}`).slice(-6)}22`; }
export function filteredThreads(view = state.view) { return filterThreads(Array.isArray(state.snippets) ? state.snippets : [], view, state.searchQuery, state.senderCategory); }
function emptyState(ui, list) { ui.html({ parent: list, tag: 'div', classList: ['thread-empty-state'], children: [
  { tag: 'strong', textContent: state.searchQuery ? 'No matching transmissions.' : folderEmpty(state.view) },
  { tag: 'span', textContent: state.searchQuery ? 'Clear search, change sender category, or open All Mail.' : 'Compose, switch folders, or filter by sender category.' },
  { tag: 'a', attributes: { href: '/email' }, textContent: '✉️ Full Mail Route' }
]}); }
function renderSenderHeader(ui, list, group) {
  const displayName = formatHandle(group.sender);
  ui.html({ parent: list, tag: 'div', classList: ['sender-group-card'], attributes: { 'data-sender': group.sender }, children: [
    { tag: 'div', classList: ['sender-group-head'], children: [
      { tag: 'span', classList: ['avatar-circle'], style: `background: ${avatarTone(displayName)}`, textContent: displayName[0].toUpperCase() },
      { tag: 'span', classList: ['sender-group-name'], textContent: displayName },
      { tag: 'b', classList: ['sender-group-count'], textContent: `${group.items.length}` }
    ] },
    { tag: 'div', classList: ['sender-group-items'], ready: container => group.items.forEach(thread => renderThread(ui, thread, window.__awtsmoosMailOpenThread, container)) }
  ] });
}
export function renderThread(ui, thread, onOpen, parent = ui.getHtml('threadList')) {
  const displayName = formatHandle(thread.correspondent || thread.from || thread.to || 'Unknown');
  const active = state.activeThread === thread.correspondent;
  ui.html({ parent, tag: 'button', classList: ['thread-item', active ? 'active' : null].filter(Boolean), attributes: { type: 'button', 'aria-pressed': String(active), 'aria-label': `Open thread with ${displayName}` }, events: { click: () => onOpen(thread, displayName) }, children: [
    { tag: 'div', classList: ['thread-content'], children: [
      { tag: 'div', classList: ['thread-top'], children: [{ tag: 'span', classList: ['thread-name'], textContent: displayName }, { tag: 'span', classList: ['thread-time'], textContent: formatTime(thread.timeSent) }] },
      { tag: 'div', classList: ['thread-subject'], textContent: thread.subject || thread.title || 'Transmission' },
      { tag: 'div', classList: ['thread-snippet'], textContent: (thread.snippet || thread.content || 'No preview yet.').substring(0, 96) }
    ]}
  ]});
}
export function renderThreadList(ui, onOpen) {
  const list = ui?.getHtml?.('threadList'); if (!list) return;
  window.__awtsmoosMailOpenThread = onOpen; list.replaceChildren();
  const threads = filteredThreads(); list.setAttribute('data-mail-view', state.view || 'inbox'); list.setAttribute('data-sender-category', state.senderCategory || 'all');
  if (!threads.length) return emptyState(ui, list);
  groupThreadsBySender(threads).forEach(group => renderSenderHeader(ui, list, group));
}
