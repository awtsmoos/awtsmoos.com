//B"H
/**
 * Moderation queue vessel.
 * The Awtsmoos lets keepers see pending sparks by page, act only where action
 * remains possible, and keep old browsers from cracking the note selector.
 */
const state = { offset: 0, limit: 25, loading: false, hasMore: false, token: 0 };
const form = document.getElementById('filters');
const queue = document.getElementById('queue');
const statusBox = document.getElementById('status');
const more = document.getElementById('more');
const searchInput = form?.elements?.search;
function esc(value) { return String(value || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function selectorId(value) { return window.CSS?.escape ? CSS.escape(value) : String(value || '').replace(/["\\]/g, '\\$&'); }
function say(text, mode = '') { statusBox.textContent = text; statusBox.dataset.mode = mode; }
function formData() { return new FormData(form); }
function heichelId() { return String(formData().get('heichelId') || '').trim(); }
function aliasId() { return String(formData().get('aliasId') || '').trim(); }
function params() {
  const data = formData();
  return new URLSearchParams({ limit: String(state.limit), offset: String(state.offset), status: data.get('status') || 'pending', type: data.get('type') || '', search: data.get('search') || '' });
}
async function api(path, options) {
  const res = await fetch(`/api/social${path}`, options);
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json.error) throw new Error(json.error?.message || json.error?.code || res.statusText || 'Request failed');
  return json;
}
function payloadText(item) { const p = item.payload || {}; return p.title || p.content || p.body || p.text || p.description || 'No preview text.'; }
function pendingControls(item) {
  if (item.status !== 'pending') return '<p class="awt-muted">This item is already reviewed.</p>';
  return `<label>Moderator note <input data-note="${esc(item.id)}" placeholder="Optional note"></label><div class="awt-action-row"><button data-action="approve" data-id="${esc(item.id)}">Approve</button><button data-action="reject" data-id="${esc(item.id)}">Reject</button></div>`;
}
function card(item) {
  return `<article class="awt-review-card" data-id="${esc(item.id)}"><h2>${esc(item.payload?.title || item.id)}</h2><p>${esc(payloadText(item))}</p><small>${esc(item.contentType)} · ${esc(item.status)} · ${esc(item.aliasId)}</small>${pendingControls(item)}</article>`;
}
function renderPage(page, reset) {
  if (reset) queue.innerHTML = '';
  queue.insertAdjacentHTML('beforeend', page.items.map(card).join(''));
  if (!page.items.length && reset) queue.innerHTML = '<article class="awt-review-card"><h2>No submissions found</h2><p>The queue is quiet for these filters.</p></article>';
  state.offset += page.items.length;
  state.hasMore = Boolean(page.hasMore);
  more.hidden = !state.hasMore;
  say(`${page.total || 0} submissions found. Showing ${state.offset}.`, 'ready');
}
async function load(reset = true) {
  const id = heichelId();
  if (!id || state.loading) return say('Enter a Heichel ID first.', 'error');
  const token = ++state.token;
  state.loading = true; more.disabled = true;
  if (reset) { state.offset = 0; queue.innerHTML = '<article class="awt-review-card"><h2>Loading queue…</h2><p>The sparks are being gathered.</p></article>'; }
  say('Loading moderation queue…', 'loading');
  try {
    const data = await api(`/heichelos/${encodeURIComponent(id)}/moderation?${params()}`);
    if (token === state.token) renderPage(data.success || { items: [], total: 0 }, reset);
  } catch (error) {
    if (token === state.token) { more.hidden = true; queue.innerHTML = `<article class="awt-review-card"><h2>Queue failed</h2><p>${esc(error.message)}</p></article>`; say('Could not load queue.', 'error'); }
  } finally { if (token === state.token) { state.loading = false; more.disabled = false; } }
}
function noteFor(id) { return queue.querySelector(`article[data-id="${selectorId(id)}"] input[data-note]`)?.value || ''; }
async function decide(id, action) {
  const hid = heichelId(); const aid = aliasId();
  if (!hid || !aid) return say('Enter Heichel ID and moderator alias first.', 'error');
  say(`${action === 'approve' ? 'Approving' : 'Rejecting'} submission…`, 'loading');
  await api(`/heichelos/${encodeURIComponent(hid)}/review/${encodeURIComponent(id)}/${action}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ aliasId: aid, note: noteFor(id), publish: action === 'approve' }) });
  await load(true);
}
function debounce(fn, wait = 300) { let timer; return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); }; }
form.addEventListener('submit', event => { event.preventDefault(); load(true); });
more.addEventListener('click', () => load(false));
searchInput?.addEventListener('input', debounce(() => { if (heichelId()) load(true); }));
queue.addEventListener('click', event => { const button = event.target.closest('button[data-action]'); if (!button || state.loading) return; decide(button.dataset.id, button.dataset.action).catch(error => say(error.message, 'error')); });
say('Enter a Heichel ID and load the queue.', 'ready');
