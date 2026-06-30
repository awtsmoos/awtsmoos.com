// B"H
/**
 * @module MailSidebar
 * @description Chapter 651: the mail sidebar becomes the public thread-list
 * gate for both the sidebar itself and chat actions that need to refresh it.
 * @contracts exports `renderSidebar` and a zero-argument `renderThreadList`
 * wrapper while preserving the lower-level sidebarThreads renderer contract.
 */
import { state, subscribe } from '../store.js';
import { FX } from './fx.js';
import { switchChat } from './chat.js';
import { openModal } from './modalFields.js';
import { renderThreadList as paintThreadList } from './sidebarThreads.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';

let uiRef = null;
let subscribed = false;

export function renderThreadList(ui = uiRef) {
  if (!ui) return;
  paintThreadList(ui, openThread);
}

export function renderSidebar(ui, parent) {
  uiRef = ui;
  bindSnippetSubscription();
  ui.html({ parent, tag: 'div', classList: ['sidebar-header', 'mail-sidebar-header'], children: [
    { tag: 'div', classList: ['mail-sidebar-identity'], children: [
      { tag: 'div', classList: ['brand-title'], textContent: 'Awtsmoos Mail' },
      { tag: 'div', shaym: 'sidebarProfileMount', classList: ['mail-sidebar-profile-mount'], ready: mountProfile }
    ] }
  ] });
  ui.html({ parent, tag: 'button', classList: ['fab-compose'], attributes: { type: 'button', 'aria-label': 'Compose a new Awtsmoos transmission', title: 'Compose a new Awtsmoos transmission' }, textContent: '+ NEW TRANSMISSION', events: { click: () => openCompose(ui) } });
  ui.html({ parent, tag: 'div', classList: ['tabs-container'], attributes: { role: 'tablist', 'aria-label': 'Mail views' }, children: [tab('Inbox', 'inbox', true), tab('Requests', 'requests', false)] });
  ui.html({ parent, tag: 'div', shaym: 'threadList', classList: ['thread-list'], attributes: { 'aria-live': 'polite' } });
  renderThreadList(ui);
}

function bindSnippetSubscription() {
  if (subscribed) return;
  subscribed = true;
  subscribe(key => { if (key === 'snippets') renderThreadList(); });
}

function mountProfile(el) {
  try { createProfileDropdown(el); }
  catch (error) { console.error('Profile Mount Error', error); }
}

function openCompose(ui) {
  openModal(ui, 'composeModal');
  FX.playSound?.('hover');
}

function tab(label, view, active) {
  return { tag: 'button', classList: ['nav-tab', active ? 'active' : null].filter(Boolean), dataset: { mailView: view }, attributes: { type: 'button', role: 'tab', 'aria-selected': String(active), title: `Show ${label}` }, textContent: label, events: { click: event => updateTabs(event, view) } };
}

function updateTabs(event, view) {
  document.querySelectorAll('.nav-tab').forEach(button => {
    const active = button === event.currentTarget;
    button.classList.toggle('active', active);
    button.setAttribute('aria-selected', String(active));
  });
  state.view = view;
  renderThreadList();
}

function openThread(thread, displayName) {
  FX.playSound?.('hover');
  switchChat(uiRef, thread.correspondent, displayName);
  renderThreadList();
}
