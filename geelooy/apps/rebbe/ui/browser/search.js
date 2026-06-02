//B"H
// ui/browser/search.js

/**
 * B"H
 * The results view is no longer a compressed control panel. It is a calmer
 * table of discovered events: soft text, spacious cards, selected-event bulk
 * download, and expandable files only when the seeker asks.
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
    root.innerHTML += '<div class="search-empty">No date index matches found</div>';
    return;
  }
  const selection = new Map(results.map((item, index) => [selectionKey(item, index), item]));
  root.appendChild(summary(results.length, selection, actions));
  results.forEach((item, index) => root.appendChild(resultCard(item, index, actions, selection)));
  updateSelectionCount(root, selection);
}

function summary(count, selection, actions) {
  const div = document.createElement('div');
  div.className = 'search-summary';
  div.innerHTML = `
    <div class="summary-copy"><strong>${count}</strong> events found · <b class="selected-count">${count}</b> selected</div>
    <div class="bulk-selection-actions">
      <button class="result-action select-all-results">Select all</button>
      <button class="result-action unselect-all-results">Unselect all</button>
      <button class="result-action all-results-zip">Download selected zip</button>
    </div>`;
  div.querySelector('.select-all-results').onclick = event => bulkSelect(event, div, true, selection);
  div.querySelector('.unselect-all-results').onclick = event => bulkSelect(event, div, false, selection);
  div.querySelector('.all-results-zip').onclick = event => {
    event.stopPropagation();
    actions.onDownloadAllResults?.([...selection.values()]);
  };
  return div;
}

function bulkSelect(event, node, enabled, selection) {
  event.stopPropagation();
  const root = node.closest('#search-results') || document.getElementById('search-results');
  root.querySelectorAll('.result-select').forEach(input => {
    input.checked = enabled;
    const card = input.closest('.date-result');
    const item = card.__searchItem;
    const key = card.__searchKey;
    if (enabled) selection.set(key, item);
    else selection.delete(key);
    card.classList.toggle('not-selected', !enabled);
  });
  updateSelectionCount(root, selection);
}

function resultCard(item, index, actions, selection) {
  const card = document.createElement('article');
  const key = selectionKey(item, index);
  card.className = 'date-result';
  card.__searchItem = item;
  card.__searchKey = key;
  card.innerHTML = template(item, key);
  card.querySelector('.result-title').textContent = cleanTitle(item.title || item.folder || 'Untitled event');
  const state = { tracks: [], loaded: false, open: false };
  bindSelection(card, item, key, selection);
  bindEventActions(card, item, actions, state);
  return card;
}

function template(item, key) {
  const month = item.month || `Month ${item.month_id || '?'}`;
  const day = item.day || '?';
  const year = item.year || '????';
  return `
    <div class="result-head">
      <label class="result-select-row">
        <input class="result-select" type="checkbox" data-key="${key}" checked>
        <span>Include</span>
      </label>
      <div class="result-date">${month} ${day}, ${year}</div>
      <button class="result-action result-open">Open</button>
    </div>
    <div class="result-title"></div>
    <div class="result-meta"><span>${cleanTitle(item.folder || '')}</span></div>
    <div class="result-actions event-actions">
      <button class="result-action result-expand">Show files</button>
      <button class="result-action result-download-event">Event zip</button>
      <button class="result-action result-cache-event">Cache event</button>
      <button class="result-action result-bookmark">Bookmark</button>
    </div>
    <div class="event-files hidden"><div class="files-loading">Files not loaded</div></div>`;
}

function bindSelection(card, item, key, selection) {
  const checkbox = card.querySelector('.result-select');
  checkbox.addEventListener('click', event => event.stopPropagation());
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) selection.set(key, item);
    else selection.delete(key);
    card.classList.toggle('not-selected', !checkbox.checked);
    updateSelectionCount(card.closest('#search-results') || document.getElementById('search-results'), selection);
  });
}

function bindEventActions(card, item, actions, state) {
  bindAction(card, '.result-open', () => actions.onOpen?.(item));
  bindAction(card, '.result-bookmark', () => actions.onBookmark?.(item));
  bindAction(card, '.result-download-event', async () => actions.onDownloadEvent?.(item, await tracks(card, item, actions, state)));
  bindAction(card, '.result-cache-event', async () => actions.onCacheEvent?.(item, await tracks(card, item, actions, state)));
  bindAction(card, '.result-expand', () => toggleFiles(card, item, actions, state));
  card.addEventListener('click', event => {
    if (event.target.closest('button,input,label')) return;
    actions.onOpen?.(item);
  });
}

async function toggleFiles(card, item, actions, state) {
  const box = card.querySelector('.event-files');
  const button = card.querySelector('.result-expand');
  state.open = !state.open;
  box.classList.toggle('hidden', !state.open);
  button.textContent = state.open ? 'Hide files' : 'Show files';
  if (state.open) await tracks(card, item, actions, state);
}

async function tracks(card, item, actions, state) {
  if (state.loaded) return state.tracks;
  const box = card.querySelector('.event-files');
  box.classList.remove('hidden');
  box.innerHTML = '<div class="files-loading">Loading event files…</div>';
  state.tracks = await (actions.onLoadTracks?.(item) || []);
  state.loaded = true;
  box.innerHTML = '';
  if (!state.tracks.length) box.innerHTML = '<div class="files-loading">No audio files found</div>';
  state.tracks.forEach((track, index) => box.appendChild(trackRow(track, index, item, actions)));
  return state.tracks;
}

function trackRow(track, index, item, actions) {
  const row = document.createElement('div');
  row.className = 'event-file-row';
  row.innerHTML = `
    <div class="event-file-name"><span>${index + 1}.</span> <strong></strong></div>
    <div class="event-file-actions">
      <button class="result-action file-download">Download</button>
      <button class="result-action file-cache">Cache</button>
      <button class="result-action file-bookmark">Save</button>
    </div>`;
  row.querySelector('strong').textContent = cleanTitle(track.title || track.name || 'Audio file');
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

function updateSelectionCount(root, selection) {
  const count = root?.querySelector('.selected-count');
  if (count) count.textContent = selection.size;
}

function selectionKey(item, index) {
  return `${index}:${item.year || ''}:${item.folder || ''}`;
}

function actionStyles() {
  const style = document.createElement('style');
  style.textContent = `.search-summary{position:sticky;top:0;z-index:4;display:grid;gap:12px;background:#000;border-bottom:1px solid #244;padding:14px}.summary-copy{color:#cbd;font-size:15px;letter-spacing:.3px;text-transform:none}.summary-copy strong,.selected-count{color:var(--c-cyan);font-size:20px}.bulk-selection-actions,.result-actions,.event-file-actions{display:flex;gap:8px;flex-wrap:wrap}.date-result{border-bottom:1px solid #17343a!important;background:linear-gradient(180deg,rgba(0,243,255,.06),rgba(0,0,0,.96))!important;color:#eee!important;padding:16px!important;text-transform:none!important}.date-result.not-selected{opacity:.45}.date-result.not-selected .result-title{text-decoration:line-through}.result-head{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:12px}.result-select-row{display:flex;align-items:center;gap:7px;color:var(--c-cyan);font-family:monospace;font-weight:700;cursor:pointer;text-transform:none}.result-select{width:18px;height:18px;accent-color:var(--c-cyan)}.result-date{color:var(--c-yellow);font-weight:800;letter-spacing:.3px}.result-title{font-size:18px;font-weight:800;color:#fff;margin:12px 0 6px;line-height:1.32;word-break:break-word}.result-meta{display:flex;gap:8px;flex-wrap:wrap;color:#91a4ad;font:12px monospace;line-height:1.35;word-break:break-word}.result-action{border:1px solid #244;background:#020708;color:var(--c-cyan);font-family:monospace;font-weight:800;padding:8px 10px;letter-spacing:.3px;cursor:pointer;text-transform:none}.result-action:hover{background:var(--c-cyan);color:#000;box-shadow:0 0 12px rgba(0,243,255,.35)}.all-results-zip{color:#000!important;background:var(--c-yellow)!important;border-color:var(--c-yellow)!important}.event-files{margin-top:14px;border-top:1px solid #244;background:rgba(0,0,0,.34)}.files-loading{padding:14px;color:#889;text-align:center;letter-spacing:.4px}.event-file-row{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:12px;border-bottom:1px solid #132d31}.event-file-name{color:#ddd;min-width:0;word-break:break-word;line-height:1.35}.event-file-name span{color:var(--c-yellow)}.event-file-actions .result-action{font-size:12px;padding:7px 8px}@media(max-width:720px){.search-summary{position:relative}.bulk-selection-actions,.result-actions,.event-file-actions{display:grid;grid-template-columns:1fr}.result-head{grid-template-columns:1fr;align-items:start}.result-action{width:100%;text-align:center}.event-file-row{grid-template-columns:1fr}.date-result{padding:18px 14px!important}.result-title{font-size:17px}}`;
  return style;
}

function cleanTitle(value) {
  return String(value || '')
    .replace(/^BH[_\s-]*\d+[_\s-]*/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
