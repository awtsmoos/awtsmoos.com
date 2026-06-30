// B"H
/**
 * @module MailSidebarThreads
 * @description
 * Every transmission row becomes a real door: a native button with a visible
 * name, active state, time, and keyboard focus.
 *
 * Responsibilities:
 * - Filter thread snippets by the selected mailbox view.
 * - Render thread buttons through the existing UI builder.
 * - Keep formatting and color helpers out of the sidebar orchestrator.
 *
 * Safety:
 * - Does not call APIs directly.
 * - Reads mail store state but does not mutate it.
 * - Emits native buttons with real labels and type="button".
 */
import { state } from '../store.js';
import { formatTime } from '../helpers.js';

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

export function quantumColor(name = '?') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hex = (`00000${(hash & 0x00ffffff).toString(16).toUpperCase()}`).slice(-6);
  return `linear-gradient(135deg, #${hex}44, #${hex}aa)`;
}

export function filteredThreads(view = state.view) {
  const snippets = Array.isArray(state.snippets) ? state.snippets : [];
  return snippets.filter(thread => view === 'requests'
    ? thread.status === 'request'
    : (!thread.status || thread.status === 'inbox'));
}

function emptyState(ui, list) {
  ui.html({ parent: list, tag: 'div', classList: ['thread-empty-state'], children: [
    { tag: 'strong', textContent: 'No transmissions here yet' },
    { tag: 'span', textContent: 'Choose New Transmission, open Profile, or wait for the next spark.' },
    { tag: 'a', attributes: { href: '/profile' }, textContent: 'Choose Alias' }
  ]});
}

export function renderThread(ui, thread, onOpen) {
  const displayName = formatHandle(thread.correspondent || 'Unknown');
  const active = state.activeThread === thread.correspondent;
  ui.html({ parent: ui.getHtml('threadList'), tag: 'button',
    classList: ['thread-item', active ? 'active' : null].filter(Boolean),
    attributes: { type: 'button', 'aria-pressed': String(active), 'aria-label': `Open thread with ${displayName}` },
    events: { click: () => onOpen(thread, displayName) }, children: [
      { tag: 'div', classList: ['avatar-circle'], style: `background: ${quantumColor(displayName)}`, textContent: displayName[0].toUpperCase() },
      { tag: 'div', classList: ['thread-content'], children: [
        { tag: 'div', classList: ['thread-top'], children: [
          { tag: 'span', classList: ['thread-name'], textContent: displayName },
          { tag: 'span', classList: ['thread-time'], textContent: formatTime(thread.timeSent) }
        ]},
        { tag: 'div', classList: ['thread-snippet'], textContent: (thread.snippet || 'No preview yet.').substring(0, 72) }
      ]}
    ]});
}

export function renderThreadList(ui, onOpen) {
  const list = ui?.getHtml?.('threadList');
  if (!list) return;
  list.replaceChildren();
  const threads = filteredThreads();
  if (!threads.length) return emptyState(ui, list);
  threads.forEach(thread => renderThread(ui, thread, onOpen));
}
