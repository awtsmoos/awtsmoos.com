//B"H
// ui/browser/search.js

/**
 * B"H
 * Result cards can bloom open: whole-event actions sit above the gate, while
 * individual files appear beneath. The Awtsmoos makes every found event into a
 * little control room instead of a dead link.
 * @param {object[]} results Events to show.
 * @param {object|Function} handlers Action handlers.
 */
export function renderSearchResults(results, handlers = {}) {
  const root = document.getElementById('search-results');
  if (!root) return;
  root.innerHTML = '';
  root.appendChild(actionStyles());
  const actions = typeof handlers === 'function' ? { onOpen: handlers } : handlers;
  if (!Array.isArray(results) || !results.length) {
    root.innerHTML += '<div class="search-empty">NO DATE INDEX MATCHES FOUND</div>';
    return;
  }
  root.appendChild(summary(results.length));
  results.forEach(item => root.appendChild(resultCard(item, actions)));
}

function summary(count) {
  const div = document.createElement('div');
  div.className = 'search-summary';
  div.innerHTML = `<span>${count}</span> EVENTS FOUND`;
  return div;
}

function resultCard(item, actions) {
  const card = document.createElement('article');
  card.className = 'date-result';
  card.innerHTML = template(item);
  card.querySelector('.result-title').textContent = cleanName(item.title || 'Unknown');
  const state = { tracks: [], loaded: false, open: false };
  bindEventActions(card, item, actions, state);
  return card;
}

function template(item) {
  const month = item.month || `Month ${item.month_id || '?'}`;
  const day = item.day || '?';
  const year = item.year || '????';
  return `
    <div class="result-topline">
      <span class="result-date">${month} ${day}, ${year}</span>
      <button class="result-action result-open">OPEN →</button>
    </div>
    <div class="result-title"></div>
    <div class="result-meta"><span>${item.bucket || ''}</span><span>${cleanName(item.folder || '')}</span></div>
    <div class="result-actions event-actions">
      <button class="result-action result-expand">EXPAND FILES</button>
      <button class="result-action result-download-event">⬇ EVENT ZIP</button>
      <button class="result-action result-cache-event">⚡ CACHE EVENT</button>
      <button class="result-action result-bookmark">☆ BOOKMARK</button>
    </div>
    <div class="event-files hidden"><div class="files-loading">FILES NOT LOADED</div></div>`;
}

function bindEventActions(card, item, actions, state) {
  bindAction(card, '.result-open', () => actions.onOpen?.(item));
  bindAction(card, '.result-bookmark', () => actions.onBookmark?.(item));
  bindAction(card, '.result-download-event', async () => actions.onDownloadEvent?.(item, await tracks(card, item, actions, state)));
  bindAction(card, '.result-cache-event', async () => actions.onCacheEvent?.(item, await tracks(card, item, actions, state)));
  bindAction(card, '.result-expand', () => toggleFiles(card, item, actions, state));
  card.addEventListener('click', event => {
    if (event.target.closest('button')) return;
    actions.onOpen?.(item);
  });
}

async function toggleFiles(card, item, actions, state) {
  const box = card.querySelector('.event-files');
  const button = card.querySelector('.result-expand');
  state.open = !state.open;
  box.classList.toggle('hidden', !state.open);
  button.textContent = state.open ? 'COLLAPSE FILES' : 'EXPAND FILES';
  if (state.open) await tracks(card, item, actions, state);
}

async function tracks(card, item, actions, state) {
  if (state.loaded) return state.tracks;
  const box = card.querySelector('.event-files');
  box.classList.remove('hidden');
  box.innerHTML = '<div class="files-loading">LOADING EVENT FILES...</div>';
  state.tracks = await (actions.onLoadTracks?.(item) || []);
  state.loaded = true;
  box.innerHTML = '';
  if (!state.tracks.length) box.innerHTML = '<div class="files-loading">NO AUDIO FILES FOUND</div>';
  state.tracks.forEach((track, index) => box.appendChild(trackRow(track, index, item, actions)));
  return state.tracks;
}

function trackRow(track, index, item, actions) {
  const row = document.createElement('div');
  row.className = 'event-file-row';
  row.innerHTML = `
    <div class="event-file-name"><span>${index + 1}.</span> <strong></strong></div>
    <div class="event-file-actions">
      <button class="result-action file-download">⬇ FILE</button>
      <button class="result-action file-cache">⚡ CACHE</button>
      <button class="result-action file-bookmark">☆ SAVE</button>
    </div>`;
  row.querySelector('strong').textContent = track.title || track.name || 'Audio file';
  bindAction(row, '.file-download', () => actions.onDownloadTrack?.(track, item));
  bindAction(row, '.file-cache', () => actions.onCacheTrack?.(track, item));
  bindAction(row, '.file-bookmark', () => actions.onBookmarkTrack?.(track, item));
  return row;
}

function bindAction(root, selector, callback) {
  const button = root.querySelector(selector);
  if (!button) return;
  button.addEventListener('click', event => {
    event.preventDefault();
    event.stopPropagation();
    callback();
  });
}

function actionStyles() {
  const style = document.createElement('style');
  style.textContent = `.result-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.result-action{border:1px solid #244;background:#020708;color:var(--c-cyan);font-family:monospace;font-weight:900;padding:8px 10px;letter-spacing:1px;cursor:pointer}.result-action:hover{background:var(--c-cyan);color:#000;box-shadow:0 0 12px rgba(0,243,255,.4)}.result-download-event,.file-download{color:var(--c-yellow)}.result-bookmark,.file-bookmark{color:#fff}.event-files{margin-top:14px;border-top:1px solid #244;background:rgba(0,0,0,.38)}.files-loading{padding:14px;color:#889;text-align:center;letter-spacing:2px}.event-file-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:10px;border-bottom:1px solid #132d31}.event-file-name{color:#ddd;min-width:0;word-break:break-word}.event-file-name span{color:var(--c-yellow)}.event-file-actions{display:flex;gap:6px;flex-wrap:wrap}.event-file-actions .result-action{font-size:11px;padding:7px 8px}.date-result .result-open{white-space:nowrap}@media(max-width:720px){.result-actions,.event-file-actions{display:grid;grid-template-columns:1fr}.result-action{width:100%;text-align:center}.event-file-row{grid-template-columns:1fr}}`;
  return style;
}

function cleanName(value) {
  return String(value || '')
    .replace(/^BH[_\s-]*\d+[_\s-]*/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
