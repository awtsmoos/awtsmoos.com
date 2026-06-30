//B"H
import { fmt } from '../utils.js';
import { clearPlaylistSelection, openAddToPlaylist, playlistTrackItem, selectedPlaylistItems, togglePlaylistSelection } from '../playlists.js';

/**
 * B"H
 * Renders the event track column as a legible command palace. The Awtsmoos
 * separates icon from word, ZIP from single download, and row from toolbar so
 * the user sees what each spark will do before touching it.
 * @param {Array<object>} tracks Audio rows for the current event.
 * @param {string} folderTitle Event folder title.
 * @param {Function} checkStatus Async cache status checker.
 * @param {Function} onSelect Row playback callback.
 * @param {Function} onAction Event/track action callback.
 * @returns {void}
 */
export function renderTracks(tracks, folderTitle, checkStatus, onSelect, onAction) {
  const list = document.getElementById('list-tracks');
  if (!list) return;
  ensureTrackStyles();
  list.innerHTML = '';
  list.appendChild(eventToolbar(folderTitle, tracks, onAction));
  tracks.forEach((track, index) => list.appendChild(row(track, index, folderTitle, checkStatus, onSelect, onAction)));
  updatePickedCount();
}

function eventToolbar(folderTitle, tracks, onAction) {
  const bar = document.createElement('div');
  bar.className = 'event-toolbar premium-event-toolbar';
  bar.innerHTML = `<div class="event-toolbar-copy"><span class="toolbar-kicker">offline event library</span><strong></strong><div class="toolbar-sub"><b class="picked-event-count">0</b> selected · ${tracks.length} track${tracks.length === 1 ? '' : 's'}</div></div><div class="event-toolbar-actions"></div>`;
  bar.querySelector('strong').textContent = folderTitle || 'EVENT';
  const actions = bar.querySelector('.event-toolbar-actions');
  actions.appendChild(command('☑', 'Select all', 'Select all tracks in this event', 'select-all-tracks', null, onAction));
  actions.appendChild(command('+', 'Add selected', 'Add selected rows to a playlist', 'playlist-selected-tracks', null, onAction, true));
  actions.appendChild(command('♫', 'Playlist', 'Add whole event to a playlist', 'playlist-event', null, onAction));
  actions.appendChild(command('⬇', tracks.length === 1 ? 'Download event' : 'Export ZIP', tracks.length === 1 ? 'Download this event file' : 'Download all files in this event as one ZIP', 'download-event', null, onAction));
  actions.appendChild(command('⚡', 'Cache event', 'Cache all files in this event', 'cache-event', null, onAction));
  actions.appendChild(command('☆', 'Bookmark', 'Save this event to bookshelf', 'bookmark-folder', null, onAction));
  actions.querySelector('.mini-select-all-tracks').onclick = event => { event.stopPropagation(); selectAllVisible(true); };
  actions.querySelector('.mini-playlist-selected-tracks').onclick = event => { event.stopPropagation(); const items = selectedPlaylistItems(); if (items.length) openAddToPlaylist(items); };
  actions.querySelector('.mini-playlist-event').onclick = event => { event.stopPropagation(); openAddToPlaylist(tracks.map(track => playlistTrackItem(track, { folder: folderTitle, title: folderTitle }))); };
  return bar;
}

function row(track, index, folderTitle, checkStatus, onSelect, onAction) {
  const item = document.createElement('div');
  item.className = 'item track-item premium-track-item';
  item.id = `track-${index}`;
  item.appendChild(selector(track, folderTitle));
  item.appendChild(leftSide(track, index));
  item.appendChild(actions(track, onAction));
  if (checkStatus) markCacheStatus(track, item, checkStatus);
  item.querySelector('.track-main-button').onclick = () => onSelect(index);
  return item;
}

function selector(track, folderTitle) {
  const label = document.createElement('label');
  label.className = 'track-picker';
  label.innerHTML = '<input data-playlist-pick type="checkbox"><span></span>';
  label.querySelector('input').onchange = event => {
    event.stopPropagation();
    togglePlaylistSelection(playlistTrackItem(track, { folder: folderTitle, title: folderTitle }), event.target.checked);
    updatePickedCount();
  };
  label.onclick = event => event.stopPropagation();
  return label;
}

function leftSide(track, index) {
  const left = document.createElement('button');
  left.className = 'track-left track-main-button';
  left.innerHTML = `<span class="status-slot"></span><span class="track-number">${String(index + 1).padStart(2, '0')}</span><span class="t-name"></span>`;
  left.querySelector('.t-name').textContent = track.title || track.name || 'Audio';
  return left;
}

function actions(track, onAction) {
  const wrap = document.createElement('div');
  wrap.className = 'item-actions';
  wrap.appendChild(duration(track));
  wrap.appendChild(command('▶', 'Play', 'Play this file', 'play-row', track, onAction));
  wrap.appendChild(command('♫', 'Playlist', 'Add this file to playlist', 'playlist-track', track, onAction));
  wrap.appendChild(command('⬇', 'Download', 'Download this file', 'download', track, onAction));
  wrap.appendChild(command('⚡', 'Cache', 'Cache this file offline', 'cache', track, onAction));
  wrap.appendChild(command('☆', 'Save', 'Save this file to bookshelf', 'bookmark-track', track, onAction));
  return wrap;
}

function command(icon, label, title, action, track, onAction, startsDisabled = false) {
  const button = document.createElement('button');
  button.type = 'button';
  button.title = title;
  button.className = `mini-btn command-btn mini-${action}`;
  button.innerHTML = `<span class="cmd-icon">${icon}</span><span class="cmd-label">${label}</span>`;
  button.disabled = startsDisabled;
  button.onclick = event => { event.stopPropagation(); onAction?.(action, track); };
  return button;
}

function duration(track) { const span = document.createElement('span'); span.className = 't-dur'; span.textContent = fmt(track.duration); return span; }

function selectAllVisible(checked) {
  document.querySelectorAll('#list-tracks [data-playlist-pick]').forEach(input => { input.checked = checked; input.dispatchEvent(new Event('change')); });
  if (!checked) clearPlaylistSelection();
  updatePickedCount();
}

function updatePickedCount() {
  const count = selectedPlaylistItems().length;
  document.querySelectorAll('.picked-event-count').forEach(node => { node.textContent = count; });
  document.querySelectorAll('.mini-playlist-selected-tracks').forEach(node => { node.disabled = !count; });
}

function markCacheStatus(track, item, checkStatus) {
  checkStatus(track.path).then(cached => {
    const status = item.querySelector('.status-slot');
    const cache = item.querySelector('.mini-cache');
    if (status) status.innerHTML = cached ? '<span class="cached-dot">●</span>' : '';
    if (cache && cached) cache.classList.add('saved');
  });
}

function ensureTrackStyles() {
  if (document.getElementById('track-command-styles')) return;
  const style = document.createElement('style');
  style.id = 'track-command-styles';
  style.textContent = `.premium-event-toolbar{border:1px solid rgba(0,243,255,.38);border-radius:22px;background:radial-gradient(circle at top left,rgba(0,243,255,.16),transparent 44%),linear-gradient(135deg,rgba(0,0,0,.78),rgba(255,204,0,.045));padding:16px;margin-bottom:12px;display:grid;grid-template-columns:minmax(190px,1fr) auto;gap:16px;align-items:center}.event-toolbar-copy{min-width:0}.toolbar-kicker{display:block;color:var(--c-yellow);font-size:10px;letter-spacing:3px;text-transform:uppercase}.premium-event-toolbar strong{display:block;color:#fff;font-size:clamp(18px,2.4vw,24px);letter-spacing:1px;line-height:1.1;word-break:break-word}.toolbar-sub{color:#9cc;margin-top:6px}.event-toolbar-actions,.item-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.premium-track-item{grid-template-columns:auto minmax(0,1fr) auto!important;border:1px solid rgba(0,243,255,.14);border-radius:14px;margin:8px 0;background:rgba(255,255,255,.025);padding:12px!important}.track-picker input{width:20px;height:20px;accent-color:var(--c-yellow)}.track-main-button{background:transparent;border:0;color:white;text-align:left;display:flex;align-items:center;gap:9px;min-width:0;cursor:pointer}.track-number{color:var(--c-yellow);font-weight:900}.t-name{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.t-dur{color:#dff;opacity:.86;align-self:center}.cached-dot{color:var(--c-cyan);font-weight:900;text-shadow:0 0 10px var(--c-cyan)}.command-btn{display:inline-flex!important;align-items:center;gap:6px;min-height:36px;border-radius:999px!important;padding:8px 11px!important;line-height:1!important;white-space:nowrap}.command-btn:disabled{opacity:.45;cursor:not-allowed}.cmd-icon{font-size:15px;color:var(--c-yellow)}.cmd-label{font-size:11px;letter-spacing:.8px}.mini-playlist-track,.mini-playlist-event,.mini-playlist-selected-tracks{border-color:rgba(255,204,0,.66)!important;color:var(--c-yellow)!important}.mini-download-event,.mini-download{border-color:rgba(0,243,255,.7)!important}@media(max-width:960px){.premium-event-toolbar{grid-template-columns:1fr}.event-toolbar-actions{justify-content:stretch;display:grid;grid-template-columns:repeat(3,minmax(0,1fr))}.command-btn{justify-content:center;width:100%}}@media(max-width:720px){.premium-track-item{display:grid!important;grid-template-columns:auto 1fr!important}.item-actions{grid-column:1/-1;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));justify-content:stretch}.event-toolbar-actions{grid-template-columns:1fr 1fr}.track-picker{align-self:center}.command-btn{width:100%}}`;
  document.head.appendChild(style);
}
