// B"H
import { getDefaultAlias, getAliasDetails, setDefaultAlias } from './api.js';
import { state } from './state.js';
import { loadNotificationPreview, notificationPreviewCard } from '/scripts/awtsmoos/social/shared/notificationsPreview.js';

const drawer = () => document.querySelector('[data-profile-action-drawer]');

export function bindProfileInlineActions() {
  document.querySelectorAll('[data-profile-action]').forEach(btn => btn.addEventListener('click', () => openAction(btn)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') close(document.querySelector('[data-profile-action][aria-expanded="true"]'));
  });
}

async function openAction(btn) {
  const panel = drawer();
  if (!panel) return;
  btn.setAttribute('aria-expanded', 'true');
  panel.hidden = false;
  panel.innerHTML = `<div class="profile-action-head"><h2>${title(btn.dataset.profileAction)}</h2><button type="button" data-close-profile-action aria-label="Close profile action">×</button></div><div data-profile-action-body></div>`;
  panel.querySelector('[data-close-profile-action]').addEventListener('click', () => close(btn));
  const body = panel.querySelector('[data-profile-action-body]');
  if (btn.dataset.profileAction === 'alias') body.append(await aliasDrawer());
  if (btn.dataset.profileAction === 'notifications') body.append(await notificationDrawer());
  if (btn.dataset.profileAction === 'heichel') body.append(heichelShortcut());
  if (btn.dataset.profileAction === 'message') body.append(await messageDrawer(btn));
  panel.querySelector('button,a,input,select,textarea')?.focus({ preventScroll: true });
}

function close(btn) {
  const panel = drawer();
  if (panel) { panel.hidden = true; panel.replaceChildren(); }
  btn?.setAttribute('aria-expanded', 'false');
  btn?.focus({ preventScroll: true });
}

function title(kind) {
  return kind === 'alias' ? 'Alias quick switcher' : kind === 'notifications' ? 'Notification preview' : kind === 'message' ? 'Message alias' : 'Heichel shortcut';
}

async function ensureAliases() {
  if (!state.aliases.length) {
    state.defaultAlias = await getDefaultAlias();
    state.aliases = await getAliasDetails();
  }
}

async function aliasDrawer() {
  try { await ensureAliases(); } catch {}
  const box = document.createElement('div');
  box.className = 'profile-action-list';
  const status = document.createElement('p');
  status.className = 'g-social-status';
  box.append(...state.aliases.map(alias => aliasButton(alias, status)), status, link('./alias-manage/', 'Open alias manager'));
  return box;
}

function aliasButton(alias, status) {
  const button = document.createElement('button');
  button.className = 'g-social-button';
  button.type = 'button';
  button.textContent = `@${alias.id}${alias.id === state.defaultAlias ? ' — default' : ''}`;
  button.setAttribute('aria-pressed', String(alias.id === state.defaultAlias));
  button.addEventListener('click', () => saveAlias(alias.id, status));
  return button;
}

async function saveAlias(id, status) {
  status.dataset.tone = 'loading';
  status.textContent = 'Saving default alias…';
  try {
    await setDefaultAlias(id);
    state.defaultAlias = id;
    status.dataset.tone = 'success';
    status.textContent = `@${id} is default.`;
    window.dispatchEvent(new CustomEvent('awtsmoosAliasChange', { detail: { id } }));
  } catch (error) { status.dataset.tone = 'error'; status.textContent = error.message; }
}

async function messageDrawer(btn) {
  try { await ensureAliases(); } catch {}
  try {
    const mod = await import('/scripts/awtsmoos/social/shared/inlineMessaging.js');
    return mod.inlineMessaging({ aliases: state.aliases, defaultAlias: state.defaultAlias, to: btn.dataset.toAlias || '', opener: btn, onClose: close });
  } catch (error) { return empty(`Mail composer is loading from the full inbox. ${error.message || ''}`); }
}

async function notificationDrawer() {
  const box = document.createElement('div');
  box.className = 'inline-notification-list';
  const alias = state.defaultAlias || await getDefaultAlias();
  try {
    const page = await loadNotificationPreview(alias, { limit: 5 });
    const items = page.items || [];
    box.replaceChildren(...(items.length ? items.map(notificationPreviewCard) : [empty('No recent notifications.')]), link('/notifications', 'Open full notifications'));
  } catch (error) { box.replaceChildren(empty(error.message), link('/notifications', 'Open full notifications')); }
  return box;
}

function heichelShortcut() {
  const box = document.createElement('div');
  box.className = 'profile-action-list';
  box.append(empty('Create or manage a Heichel from the ownership cockpit.'), link(`/heichelos/manage-alias-heichelos/?alias=${encodeURIComponent(state.defaultAlias || '')}`, 'Open Heichel cockpit'));
  return box;
}

function link(href, text) { const a = document.createElement('a'); a.className = 'g-social-button primary'; a.href = href; a.textContent = text; return a; }
function empty(text) { const p = document.createElement('article'); p.className = 'g-social-empty'; p.textContent = text; return p; }
