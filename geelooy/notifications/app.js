//B"H
/**
 * Notification center river.
 * The Awtsmoos gives each bell a measured page: search waits for the hand to
 * stop moving, old responses fall away, and the inbox shows quiet, error, and
 * loading states without summoning the whole sea at once.
 */
const state = { offset: 0, limit: 25, aliasId: '', type: '', search: '', hasMore: false, loading: false, token: 0 };
const form = document.getElementById('filters');
const list = document.getElementById('list');
const more = document.getElementById('more');
const summary = document.getElementById('summary');
const searchInput = form?.elements?.search;
function esc(s) { return String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function setStatus(text, mode = '') { summary.textContent = text; summary.dataset.mode = mode; }
function stateRow(title, body) { list.innerHTML = `<article class="notification state"><h2>${esc(title)}</h2><p>${esc(body)}</p></article>`; }
async function api(path, options) {
  const res = await fetch(`/api/social${path}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.error) throw new Error(data.error?.message || res.statusText || 'Request failed');
  return data;
}
function row(n) {
  const title = esc(n.title || n.type || 'Notification');
  const body = esc(n.body || n.message || 'A quiet movement was recorded.');
  const time = new Date(n.createdAt || Date.now()).toLocaleString();
  const link = n.actionUrl ? `<p><a href="${esc(n.actionUrl)}">Open</a></p>` : '';
  return `<article class="notification ${n.read ? 'read' : 'unread'}"><h2>${title}</h2><p>${body}</p><small>${esc(n.type)} · ${esc(time)}</small>${link}</article>`;
}
function params() {
  return new URLSearchParams({ limit: String(state.limit), offset: String(state.offset), includeRead: 'true', type: state.type, search: state.search });
}
function applyPage(page, reset) {
  const html = page.items.map(row).join('');
  if (reset) list.innerHTML = html;
  else list.insertAdjacentHTML('beforeend', html);
  if (!page.items.length && reset) stateRow('No notifications found', state.search ? 'No bells matched this search.' : 'The chamber is quiet.');
  state.offset += page.items.length;
  state.hasMore = Boolean(page.hasMore);
  more.hidden = !state.hasMore;
  setStatus(`${page.total || 0} notifications${state.search ? ` matching “${state.search}”` : ''}`);
}
async function load(reset = true) {
  if (!state.aliasId || state.loading) return;
  const token = ++state.token;
  state.loading = true;
  more.disabled = true;
  if (reset) { state.offset = 0; stateRow('Loading notifications…', 'The bells are being gathered page by page.'); }
  setStatus('Loading…', 'loading');
  try {
    const data = await api(`/notifications/${encodeURIComponent(state.aliasId)}?${params()}`);
    if (token === state.token) applyPage(data.success || { items: [], total: 0 }, reset);
  } catch (error) {
    if (token === state.token) { more.hidden = true; setStatus('Could not load notifications', 'error'); stateRow('Notifications could not load', error.message); }
  } finally {
    if (token === state.token) { state.loading = false; more.disabled = false; }
  }
}
function readForm() {
  const data = new FormData(form);
  Object.assign(state, { aliasId: data.get('aliasId') || '', type: data.get('type') || '', search: data.get('search') || '' });
}
function debounce(fn, wait = 300) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); }; }
form.addEventListener('submit', event => { event.preventDefault(); readForm(); load(true); });
searchInput?.addEventListener('input', debounce(() => { if (!state.aliasId) return; readForm(); load(true); }));
more.addEventListener('click', () => load(false));
document.getElementById('markAll').addEventListener('click', async () => { if (!state.aliasId || state.loading) return; await api(`/notifications/${encodeURIComponent(state.aliasId)}/read/all`, { method: 'POST' }); await load(true); });
