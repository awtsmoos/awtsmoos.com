// B"H
/** @module MailSidebar — every thread is a real keyboard-openable door. */
import { state, subscribe } from '../store.js';
import { formatTime } from '../helpers.js';
import { FX } from './fx.js';
import { switchChat } from './chat.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';

let uiRef = null;

export function renderSidebar(ui, parent) {
  uiRef = ui;
  subscribe(key => { if (key === 'snippets') renderThreadList(); });
  ui.html({ parent, tag:'div', classList:['sidebar-header','mail-sidebar-header'], children:[
    { tag:'div', classList:['mail-sidebar-identity'], children:[
      { tag:'div', classList:['brand-title'], textContent:'Awtsmoos Mail' },
      { tag:'div', shaym:'sidebarProfileMount', classList:['mail-sidebar-profile-mount'], ready:mountProfile }
    ]}
  ]});
  ui.html({ parent, tag:'button', classList:['fab-compose'], attributes:{ type:'button','aria-label':'Compose a new Awtsmoos transmission' }, textContent:'+ NEW TRANSMISSION', events:{ click:() => openCompose(ui) }});
  ui.html({ parent, tag:'div', classList:['tabs-container'], attributes:{ role:'tablist','aria-label':'Mail views' }, children:[tab('Inbox','inbox',true), tab('Requests','requests',false)] });
  ui.html({ parent, tag:'div', shaym:'threadList', classList:['thread-list'], attributes:{ 'aria-live':'polite' }});
}

function mountProfile(el) { try { createProfileDropdown(el); } catch (error) { console.error('Profile Mount Error', error); } }
function openCompose(ui) {
  const modal = ui.getHtml('composeModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('visible'), 10);
  FX.playSound?.('hover');
}
function tab(label, view, active) {
  return { tag:'button', classList:['nav-tab', active ? 'active' : null].filter(Boolean), attributes:{ type:'button', role:'tab', 'aria-selected':String(active) }, textContent:label, events:{ click:event => updateTabs(event, view) } };
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
function formatHandle(value) {
  if (!value) return 'Unknown';
  let handle = String(value).replace(/_at_/g, '@');
  const suffix = '@awtsmoos.com';
  if (handle.endsWith(suffix)) {
    const shorter = handle.slice(0, -suffix.length);
    if (shorter.includes('@')) handle = shorter;
  }
  return handle;
}
function quantumColor(name = '?') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const hex = (`00000${(hash & 0x00FFFFFF).toString(16).toUpperCase()}`).slice(-6);
  return `linear-gradient(135deg, #${hex}44, #${hex}aa)`;
}
function filteredThreads() {
  const snippets = Array.isArray(state.snippets) ? state.snippets : [];
  return snippets.filter(thread => state.view === 'requests' ? thread.status === 'request' : (!thread.status || thread.status === 'inbox'));
}
function emptyState(list) {
  uiRef.html({ parent:list, tag:'div', classList:['thread-empty-state'], children:[
    { tag:'strong', textContent:'No transmissions here yet' },
    { tag:'span', textContent:'Choose New Transmission, open a profile, or wait for the next spark to arrive.' }
  ]});
}
function openThread(thread, displayName) {
  FX.playSound?.('hover');
  switchChat(uiRef, thread.correspondent, displayName);
  renderThreadList();
}
function renderThread(thread) {
  const displayName = formatHandle(thread.correspondent || 'Unknown');
  const active = state.activeThread === thread.correspondent;
  uiRef.html({ parent:uiRef.getHtml('threadList'), tag:'button', classList:['thread-item', active ? 'active' : null].filter(Boolean), attributes:{ type:'button', 'aria-pressed':String(active), 'aria-label':`Open thread with ${displayName}` }, events:{ click:() => openThread(thread, displayName) }, children:[
    { tag:'div', classList:['avatar-circle'], style:`background: ${quantumColor(displayName)}`, textContent:displayName[0].toUpperCase() },
    { tag:'div', classList:['thread-content'], children:[
      { tag:'div', classList:['thread-top'], children:[
        { tag:'span', classList:['thread-name'], textContent:displayName },
        { tag:'span', classList:['thread-time'], textContent:formatTime(thread.timeSent) }
      ]},
      { tag:'div', classList:['thread-snippet'], textContent:(thread.snippet || '...').substring(0, 72) }
    ]}
  ]});
}
export function renderThreadList() {
  if (!uiRef) return;
  const list = uiRef.getHtml('threadList');
  if (!list) return;
  list.replaceChildren();
  const threads = filteredThreads();
  if (!threads.length) return emptyState(list);
  threads.forEach(renderThread);
}
