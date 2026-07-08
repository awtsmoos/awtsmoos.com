// B"H
/**
 * @module MailSidebar
 * @description Sidebar with a profile card, folders, search, sender category grid, and grouped GET mail threads.
 */
import { state, subscribe, setMailView, setMailSearch, setMailSenderCategory } from '../store.js';
import { FX } from './fx.js';
import { switchChat } from './chat.js';
import { openModal } from './modalFields.js';
import { renderThreadList as paintThreadList } from './sidebarThreads.js';
import { MAIL_FOLDERS, SENDER_CATEGORIES, folderCounts, categoryCounts } from './mailFolders.js';
import createProfileDropdown from '/scripts/awtsmoos/social/profileDropdown.js';
let uiRef = null;
let subscribed = false;
export function renderThreadList(ui = uiRef) { if (!ui) return; renderFolders(ui); renderSenderCategories(ui); paintThreadList(ui, openThread); }
export function renderSidebar(ui, parent) {
  uiRef = ui; bindSidebarSubscription();
  ui.html({ parent, tag: 'div', classList: ['sidebar-header', 'mail-sidebar-header'], children: [
    { tag: 'div', classList: ['mail-sidebar-identity'], children: [
      { tag: 'div', classList: ['brand-title'], textContent: '✉️ Awtsmoos Mail' },
      { tag: 'div', classList: ['mail-profile-card'], children: [
        { tag: 'span', classList: ['mail-profile-card-icon'], textContent: '👤' },
        { tag: 'div', classList: ['mail-profile-copy'], children: [
          { tag: 'small', textContent: 'Current profile' },
          { tag: 'div', shaym: 'sidebarProfileMount', classList: ['mail-sidebar-profile-mount'], ready: mountProfile }
        ]}
      ]}
    ] }
  ] });
  ui.html({ parent, tag: 'button', classList: ['fab-compose'], attributes: { type: 'button', 'aria-label': 'Compose a new Awtsmoos transmission', title: 'Compose a new Awtsmoos transmission' }, textContent: '✍️ New Transmission', events: { click: () => openCompose(ui) } });
  ui.html({ parent, tag: 'section', classList: ['mail-search-panel'], attributes: { 'aria-label': 'Search mail' }, children: [
    { tag: 'label', attributes: { for: 'mailSearchInput' }, textContent: '🔎 Search transmissions' },
    { tag: 'input', shaym: 'mailSearchInput', attributes: { id: 'mailSearchInput', type: 'search', placeholder: 'Sender, subject, body…', autocomplete: 'off', value: state.searchQuery, 'aria-label': 'Search mail transmissions' }, events: { input: event => updateSearch(event.currentTarget.value) } }
  ] });
  ui.html({ parent, tag: 'div', shaym: 'mailSenderCategoryGrid', classList: ['mail-sender-category-grid'], attributes: { role: 'tablist', 'aria-label': 'Sender categories' } });
  ui.html({ parent, tag: 'div', shaym: 'mailFolderList', classList: ['mail-folder-list'], attributes: { role: 'tablist', 'aria-label': 'Mail folders' } });
  ui.html({ parent, tag: 'div', shaym: 'threadList', classList: ['thread-list'], attributes: { 'aria-live': 'polite' } });
  renderThreadList(ui);
}
function bindSidebarSubscription() { if (subscribed) return; subscribed = true; subscribe(key => { if (['snippets', 'mailView', 'mailSearch', 'mailSenderCategory'].includes(key)) renderThreadList(); }); }
function renderFolders(ui) { const list = ui.getHtml('mailFolderList'); if (!list) return; const counts = folderCounts(state.snippets || []); list.replaceChildren(); MAIL_FOLDERS.forEach(folder => ui.html({ parent: list, tag: 'button', classList: ['mail-folder-tab', state.view === folder.id ? 'active' : null].filter(Boolean), attributes: { type: 'button', role: 'tab', 'aria-selected': String(state.view === folder.id), 'aria-label': `${folder.label}, ${counts[folder.id] || 0} threads` }, events: { click: () => updateFolder(folder.id) }, children: [{ tag: 'span', textContent: folder.label }, { tag: 'span', classList: ['mail-folder-count'], textContent: String(counts[folder.id] || 0) }] })); }
function renderSenderCategories(ui) { const grid = ui.getHtml('mailSenderCategoryGrid'); if (!grid) return; const counts = categoryCounts(state.snippets || []); grid.replaceChildren(); SENDER_CATEGORIES.forEach(cat => ui.html({ parent: grid, tag: 'button', classList: ['mail-sender-category', state.senderCategory === cat.id ? 'active' : null].filter(Boolean), attributes: { type: 'button', role: 'tab', 'aria-selected': String(state.senderCategory === cat.id), 'aria-label': `${cat.label}, ${counts[cat.id] || 0} senders` }, events: { click: () => updateSenderCategory(cat.id) }, children: [{ tag: 'span', textContent: cat.label }, { tag: 'b', textContent: String(counts[cat.id] || 0) }] })); }
function mountProfile(el) { try { createProfileDropdown(el); } catch (error) { console.error('Profile Mount Error', error); } }
function openCompose(ui) { openModal(ui, 'composeModal'); FX.playSound?.('hover'); }
function updateFolder(view) { setMailView(view); FX.playSound?.('hover'); }
function updateSenderCategory(category) { setMailSenderCategory(category); FX.playSound?.('hover'); }
function updateSearch(value) { setMailSearch(value); }
function openThread(thread, displayName) { FX.playSound?.('hover'); switchChat(uiRef, thread.correspondent, displayName); renderThreadList(); }
