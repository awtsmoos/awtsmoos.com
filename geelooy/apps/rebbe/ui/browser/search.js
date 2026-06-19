//B"H
// ui/browser/search.js

/**
 * B"H
 * Search results become a premium archive river: the Awtsmoos gathers every
 * event-card spark, every track-row ember, and every selected checkbox into one
 * obvious, touchable, offline-ready library surface. Event cards no longer drop
 * empty shells into playlists; they ask the controller to expand into playable
 * tracks before the custom playlist receives the light.
 * @param {Array<object>} results Event search results from the date index.
 * @param {object|Function} handlers Search action callbacks.
 * @returns {void}
 */
export function renderSearchResults(results, handlers = {}) {
  const root = document.getElementById('search-results');
  if (!root) return;
  const actions = typeof handlers === 'function' ? { onOpen: handlers } : handlers;
  const selected = new Map();
  root.innerHTML = '';
  root.appendChild(styles());
  if (!results?.length) return root.appendChild(empty('No date index matches found'));
  root.appendChild(summary(results.length, selected, actions));
  results.forEach((item, index) => root.appendChild(card(item, index, actions, selected)));
  syncCount(root, selected);
}

function summary(count, selected, actions) {
  const node = el('div', 'search-summary premium-selection');
  node.innerHTML = `<div><span class="summary-eyebrow">premium archive search</span><strong>${count}</strong> events · <b class="selected-count">0</b> selected tracks</div><div class="bulk-selection-actions"><button class="result-action" data-all="1">Select all tracks</button><button class="result-action" data-all="0">Clear selected</button><button class="result-action playlist-selected">Add selected to playlist</button><button class="result-action zip-selected">ZIP selected</button></div>`;
  node.querySelector('[data-all="1"]').onclick = e => selectAll(e, true, selected);
  node.querySelector('[data-all="0"]').onclick = e => selectAll(e, false, selected);
  node.querySelector('.playlist-selected').onclick = e => act(e, () => actions.onAddToPlaylist?.([...selected.values()]));
  node.querySelector('.zip-selected').onclick = e => act(e, () => actions.onDownloadSelectedTracks?.([...selected.values()]));
  return node;
}

function card(item, index, actions, selected) {
  const node = el('article', 'date-result premium-event-card');
  node.__searchItem = item;
  node.innerHTML = `<div class="result-head"><div><div class="result-date">${safe(item.month)} ${safe(item.day)}, ${safe(item.year)}</div><div class="result-title">${safe(item.title || item.folder || 'Untitled event')}</div></div><div class="event-action-grid"><button class="result-action play-event">Play</button><button class="result-action open">Open</button><button class="result-action playlist">Playlist</button><button class="result-action cache">Cache</button><button class="result-action zip">ZIP</button><button class="result-action bookmark">Bookmark</button></div></div><button class="result-action result-expand">Show tracks</button><div class="event-files hidden"><div class="track-selection-toolbar"><label><input class="select-event-tracks" type="checkbox"> Select all tracks in event</label><button class="result-action add-event-selected">Add event selection</button></div><div class="event-file-list"><div class="search-empty small">Open tracks to load files</div></div></div>`;
  bindEventActions(node, item, actions);
  const state = { loaded: false, tracks: [] };
  node.querySelector('.result-expand').onclick = e => toggleFiles(e, node, item, actions, selected, state);
  node.querySelector('.select-event-tracks').onchange = e => toggleEventTracks(node, e.target.checked, selected);
  node.querySelector('.add-event-selected').onclick = e => act(e, () => actions.onAddToPlaylist?.(eventSelected(node)));
  return node;
}

function bindEventActions(node, item, actions) {
  const bind = (sel, fn) => { node.querySelector(sel).onclick = e => act(e, fn); };
  bind('.play-event', () => actions.onPlayEvent?.(item) || actions.onOpen?.(item));
  bind('.open', () => actions.onOpen?.(item));
  bind('.playlist', () => actions.onAddEventToPlaylist?.(item) || actions.onAddToPlaylist?.([item]));
  bind('.cache', () => actions.onCacheEvent?.(item));
  bind('.zip', () => actions.onDownloadEvent?.(item));
  bind('.bookmark', () => actions.onBookmark?.(item));
}

async function toggleFiles(e, node, item, actions, selected, state) {
  e.stopPropagation();
  const box = node.querySelector('.event-files');
  const button = node.querySelector('.result-expand');
  box.classList.toggle('hidden');
  button.textContent = box.classList.contains('hidden') ? 'Show tracks' : 'Hide tracks';
  if (state.loaded) return;
  const list = node.querySelector('.event-file-list');
  list.innerHTML = '<div class="search-empty small">Loading event tracks...</div>';
  state.tracks = await (actions.onLoadTracks?.(item) || []);
  state.loaded = true;
  list.innerHTML = state.tracks.length ? '' : '<div class="search-empty small">No tracks found</div>';
  state.tracks.forEach((track, i) => list.appendChild(trackRow(track, item, i, actions, selected)));
}

function trackRow(track, item, index, actions, selected) {
  const wrapped = normalizeTrack(track, item);
  const key = keyOf(wrapped, index);
  const row = el('div', 'event-file-row premium-track-row');
  row.__playlistItem = wrapped;
  row.__playlistKey = key;
  row.innerHTML = `<label class="track-check-shell"><input class="track-select" type="checkbox"><span></span></label><button class="track-play-title">${safe(wrapped.title || 'Audio')}</button><div class="track-row-actions"><button class="result-action play">Play</button><button class="result-action playlist">Playlist</button><button class="result-action cache">Cache</button><button class="result-action download">Download</button><button class="result-action bookmark">Bookmark</button></div>`;
  row.querySelector('.track-select').onchange = e => { e.target.checked ? selected.set(key, wrapped) : selected.delete(key); row.classList.toggle('selected', e.target.checked); syncCount(document.getElementById('search-results'), selected); };
  row.querySelector('.track-play-title').onclick = e => act(e, () => actions.onPlayTrack?.(track, item));
  row.querySelector('.play').onclick = e => act(e, () => actions.onPlayTrack?.(track, item));
  row.querySelector('.playlist').onclick = e => act(e, () => actions.onAddToPlaylist?.([wrapped]));
  row.querySelector('.cache').onclick = e => act(e, () => actions.onCacheTrack?.(track, item));
  row.querySelector('.download').onclick = e => act(e, () => actions.onDownloadTrack?.(track, item));
  row.querySelector('.bookmark').onclick = e => act(e, () => actions.onBookmarkTrack?.(track, item));
  return row;
}

function toggleEventTracks(node, checked, selected) {
  node.querySelectorAll('.track-select').forEach(input => { input.checked = checked; input.dispatchEvent(new Event('change')); });
}

function selectAll(e, checked, selected) {
  e.stopPropagation();
  document.querySelectorAll('#search-results .track-select').forEach(input => { input.checked = checked; input.dispatchEvent(new Event('change')); });
  if (!checked) selected.clear();
  syncCount(document.getElementById('search-results'), selected);
}

function eventSelected(node) { return [...node.querySelectorAll('.premium-track-row.selected')].map(row => row.__playlistItem).filter(Boolean); }
function normalizeTrack(track, event) { return { type: 'track', year: String(event.year || ''), folder: event.folder || '', title: track.title || track.name || event.title || 'Audio', path: track.path || '', url: track.url || '', fallbackUrls: track.fallbackUrls || [], track, event }; }
function keyOf(item, index) { return item.path || `${item.year}:${item.folder}:${item.title}:${index}`; }
function syncCount(root, selected) { const c = root?.querySelector('.selected-count'); if (c) c.textContent = selected.size; }
function act(e, fn) { e.stopPropagation(); return fn?.(); }
function empty(text) { const node = el('div', 'search-empty'); node.textContent = text; return node; }
function el(tag, cls) { const node = document.createElement(tag); node.className = cls; return node; }
function safe(value) { return String(value ?? '').replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch])); }
function styles() { const s = document.createElement('style'); s.textContent = `.premium-event-card{border:1px solid rgba(0,243,255,.28);border-radius:22px;margin:14px 0;padding:16px;background:linear-gradient(135deg,rgba(0,243,255,.08),rgba(255,204,0,.035),rgba(0,0,0,.82));box-shadow:0 18px 48px rgba(0,0,0,.34)}.premium-event-card:hover{border-color:rgba(0,243,255,.75);box-shadow:0 22px 70px rgba(0,243,255,.12)}.result-head{display:flex;justify-content:space-between;gap:16px;align-items:flex-start}.summary-eyebrow{display:block;color:var(--c-yellow);font-size:11px;letter-spacing:3px;text-transform:uppercase}.premium-selection{position:sticky;top:0;z-index:20;border:1px solid rgba(255,204,0,.36);border-radius:18px;padding:14px;background:rgba(2,8,10,.96);display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap}.event-action-grid,.bulk-selection-actions,.track-row-actions{display:flex;gap:8px;flex-wrap:wrap}.result-action{border:1px solid rgba(0,243,255,.45);border-radius:999px;background:rgba(0,0,0,.58);color:#eaffff;padding:8px 12px;font-weight:900;letter-spacing:.6px;cursor:pointer}.result-action:hover,.result-action:focus{background:var(--c-cyan);color:#001014;outline:2px solid rgba(255,204,0,.45)}.result-title{font-size:clamp(18px,3vw,28px);color:white;font-weight:900}.result-date{color:var(--c-yellow);letter-spacing:2px}.event-files{margin-top:12px;border-top:1px solid rgba(0,243,255,.18);padding-top:12px}.track-selection-toolbar{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:10px;color:#dff}.premium-track-row{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;padding:12px;border:1px solid rgba(0,243,255,.12);border-radius:14px;margin:8px 0;background:rgba(255,255,255,.025)}.premium-track-row.selected{border-color:var(--c-yellow);background:rgba(255,204,0,.12);box-shadow:inset 4px 0 0 var(--c-yellow)}.track-play-title{background:transparent;border:0;color:white;text-align:left;font-weight:900;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.track-check-shell input{width:20px;height:20px;accent-color:var(--c-yellow)}.search-empty.small{padding:16px}@media(max-width:760px){.result-head,.premium-track-row,.premium-selection,.track-selection-toolbar{display:grid;grid-template-columns:1fr}.event-action-grid,.track-row-actions,.bulk-selection-actions{display:grid;grid-template-columns:1fr 1fr}.result-action{width:100%}}`; return s; }
