// B"H
/**
 * @module MailSidebarThreads
 * @description
 * Chapter 706: every folder is a chamber, every search a candle, every row a
 * native button-door. The Awtsmoos counts without demanding new APIs.
 */
import { state } from '../store.js';
import { formatTime } from '../helpers.js';
import { filterThreads, folderEmpty } from './mailFolders.js';

export function formatHandle(value) {
  if (!value) return 'Unknown';
  let handle = String(value).replace(/_at_/g, '@');
  const suffix = '@awtsmoos.com';
  if (handle.endsWith(suffix)) {
    const shorter = handle.slice(0, -suffix.length);
    if (shorter.includes('@')) handle = shorter;
  }
  return handle;
}

export function avatarTone(name = '?') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hex = (`00000${(hash & 0x00ffffff).toString(16).toUpperCase()}`).slice(-6);
  return `#${hex}22`;
}

export function filteredThreads(view = state.view) {
  return filterThreads(Array.isArray(state.snippets) ? state.snippets : [], view, state.searchQuery);
}

function emptyState(ui, list) {
  ui.html({ parent: list, tag: 'div', classList: ['thread-empty-state'], children: [
    { tag: 'strong', textContent: state.searchQuery ? 'No matching transmissions.' : folderEmpty(state.view) },
    { tag: 'span', textContent: state.searchQuery ? 'Clear search or open All Mail.' : 'Compose, switch folders, or open the full Geelooy routes.' },
    { tag: 'a', attributes: { href: '/email' }, textContent: 'Full Mail Route' }
  ]});
}

export function renderThread(ui, thread, onOpen) {
  const displayName = formatHandle(thread.correspondent || thread.from || thread.to || 'Unknown');
  const active = state.activeThread === thread.correspondent;
  ui.html({ parent: ui.getHtml('threadList'), tag: 'button',
    classList: ['thread-item', active ? 'active' : null].filter(Boolean),
    attributes: { type: 'button', 'aria-pressed': String(active), 'aria-label': `Open thread with ${displayName}` },
    events: { click: () => onOpen(thread, displayName) }, children: [
      { tag: 'div', classList: ['avatar-circle'], style: `background: ${avatarTone(displayName)}`, textContent: displayName[0].toUpperCase() },
      { tag: 'div', classList: ['thread-content'], children: [
        { tag: 'div', classList: ['thread-top'], children: [
          { tag: 'span', classList: ['thread-name'], textContent: displayName },
          { tag: 'span', classList: ['thread-time'], textContent: formatTime(thread.timeSent) }
        ]},
        { tag: 'div', classList: ['thread-subject'], textContent: thread.subject || thread.title || 'Transmission' },
        { tag: 'div', classList: ['thread-snippet'], textContent: (thread.snippet || thread.content || 'No preview yet.').substring(0, 96) }
      ]}
    ]});
}

export function renderThreadList(ui, onOpen) {
  const list = ui?.getHtml?.('threadList');
  if (!list) return;
  list.replaceChildren();
  const threads = filteredThreads();
  list.setAttribute('data-mail-view', state.view || 'inbox');
  if (!threads.length) return emptyState(ui, list);
  threads.forEach(thread => renderThread(ui, thread, onOpen));
}
