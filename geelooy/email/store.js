// B"H
/**
 * @module AwtsmoosMailStore
 * @description
 * Chapter 705: identity, folder intent, and search are held in one quiet heart.
 * The Awtsmoos does not let the interface guess who is speaking or which gate
 * the user opened; every listener is told when the vessel turns.
 */
import { connectSocket, refreshSnippets } from './network.js';
import { switchChat } from './ui/chat.js';
import { ensureDefaultAlias, isValidAlias, cleanAlias } from '/scripts/awtsmoos/social/aliasIdentity.js';

export const state = {
  alias: null, threads: {}, snippets: [], activeThread: null, view: 'inbox', searchQuery: '', pagination: {},
  settings: { gatekeeperMode: false, approved: {}, rules: [] }, replyingTo: null,
  isLoadingHistory: false, listeners: new Set()
};

export function subscribe(fn) { state.listeners.add(fn); return () => state.listeners.delete(fn); }
export function notify(key, value) { state.listeners.forEach(fn => fn(key, value)); }
export function setMailView(view) { state.view = view || 'inbox'; notify('mailView', state.view); }
export function setMailSearch(query) { state.searchQuery = String(query || ''); notify('mailSearch', state.searchQuery); }

export async function initAuth(ui) {
  const params = new URLSearchParams(window.location.search);
  const requested = cleanAlias(params.get('alias') || window.curAlias);
  if (requested) return login(requested, ui);
  const identity = await ensureDefaultAlias();
  if (identity.alias) return login(identity.alias, ui);
  showLoginOverlay(ui, true);
  window.addEventListener('awtsmoosAliasChange', async event => {
    const id = cleanAlias(event.detail?.id);
    if (id) return login(id, ui);
    const healed = await ensureDefaultAlias();
    healed.alias ? login(healed.alias, ui) : showLoginOverlay(ui, true);
  });
}

async function login(alias, ui) {
  const clean = cleanAlias(alias);
  if (!isValidAlias(clean)) return showLoginOverlay(ui, true);
  state.alias = clean;
  window.curAlias = clean;
  showLoginOverlay(ui, false);
  updateStatus(ui, clean);
  connectSocket(clean);
  await refreshSnippets();
  openInitialTarget(ui);
  if (!window._mailPoll) window._mailPoll = setInterval(refreshSnippets, 30000);
}

function updateStatus(ui, alias) {
  try {
    const statusText = ui.getHtml('userStatusText');
    if (!statusText) return;
    statusText.textContent = `@${alias}`;
    statusText.style.color = 'var(--neon-emerald)';
    statusText.style.textShadow = '0 0 10px var(--neon-emerald)';
  } catch {}
}

function openInitialTarget(ui) {
  const params = new URLSearchParams(window.location.search);
  const threadId = params.get('thread');
  const toAlias = params.get('to');
  if (threadId) {
    const clean = normalizeThreadId(threadId);
    const found = state.snippets.find(s => s.correspondent === clean);
    const name = found ? found.correspondent.replace(/_at_/g, '@') : clean.replace(/_at_/g, '@');
    switchChat(ui, clean, name);
  } else if (toAlias) openComposeTo(ui, toAlias);
}

function normalizeThreadId(threadId) { return String(threadId || '').replace(/@/g, '_at_'); }
function openComposeTo(ui, toAlias) {
  const modal = ui.getHtml('composeModal');
  const to = ui.getHtml('newTo');
  const subject = ui.getHtml('newSub');
  if (!modal || !to) return;
  to.value = toAlias;
  if (subject && !subject.value) subject.value = `Message for @${toAlias}`;
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('visible'), 10);
}

function showLoginOverlay(ui, show) {
  const ov = ui.getHtml('loginOverlay');
  if (!ov) return;
  if (show) { ov.classList.remove('hidden'); setTimeout(() => ov.classList.add('visible'), 10); }
  else { ov.classList.remove('visible'); setTimeout(() => ov.classList.add('hidden'), 180); }
}
