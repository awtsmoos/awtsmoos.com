//B"H
// ui/browser/tracks.js
import { fmt } from '../utils.js';
import { togglePlaylistSelection, selectedPlaylistItems, clearPlaylistSelection, openAddToPlaylist, playlistTrackItem } from '../playlists.js';

/**
 * B"H
 * Renders the event track column as a native playlist workshop. The Awtsmoos
 * turns every audio row into a selectable, cacheable, bookmarkable spark, while
 * the toolbar crowns the whole event with ZIP, cache, playlist, and bookshelf.
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
  list.innerHTML = '';
  list.appendChild(eventToolbar(folderTitle, tracks, onAction));
  tracks.forEach((track, index) => list.appendChild(row(track, index, folderTitle, checkStatus, onSelect, onAction)));
  list.appendChild(styles());
}

function eventToolbar(folderTitle, tracks, onAction) {
  const bar = document.createElement('div');
  bar.className = 'event-toolbar premium-event-toolbar';
  bar.innerHTML = `<div><span class="toolbar-kicker">offline event library</span><strong></strong><div class="toolbar-sub"><b class="picked-event-count">0</b> selected · ${tracks.length} tracks</div></div><div class="event-toolbar-actions"></div>`;
  bar.querySelector('strong').textContent = folderTitle || 'EVENT';
  const actions = bar.querySelector('.event-toolbar-actions');
  actions.appendChild(mini('Select all', 'Select all tracks in this event', 'select-all-tracks', null, onAction));
  actions.appendChild(mini('Add selected', 'Add selected rows to a playlist', 'playlist-selected-tracks', null, onAction));
  actions.appendChild(mini('♫ Playlist', 'Add whole event to a playlist', 'playlist-event', null, onAction));
  actions.appendChild(mini('⬇ Event ZIP', 'Download all files in this event as ZIP', 'download-event', null, onAction));
  actions.appendChild(mini('⚡ Cache event', 'Cache all files in this event', 'cache-event', null, onAction));
  actions.appendChild(mini('☆ Bookmark', 'Save this event to bookshelf', 'bookmark-folder', null, onAction));
  actions.querySelector('.mini-select-all-tracks').onclick = event => { event.stopPropagation(); selectAllVisible(true); };
  actions.querySelector('.mini-playlist-selected-tracks').onclick = event => { event.stopPropagation(); openAddToPlaylist(selectedPlaylistItems()); };
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
  const dur = document.createElement('span');
  dur.className = 't-dur';
  dur.textContent = fmt(track.duration);
  wrap.appendChild(dur);
  wrap.appendChild(mini('▶', 'Play this file', 'play-row', track, onAction));
  wrap.appendChild(mini('♫', 'Add this file to playlist', 'playlist-track', track, onAction));
  wrap.appendChild(mini('⬇', 'Download this file', 'download', track, onAction));
  wrap.appendChild(mini('⚡', 'Cache this file offline', 'cache', track, onAction));
  wrap.appendChild(mini('☆', 'Save this file to bookshelf', 'bookmark-track', track, onAction));
  return wrap;
}

function mini(text, title, action, track, onAction) {
  const button = document.createElement('button');
  button.innerHTML = text;
  button.title = title;
  button.className = `mini-btn mini-${action}`;
  button.onclick = event => { event.stopPropagation(); onAction?.(action, track); };
  return button;
}

function selectAllVisible(checked) {
  document.querySelectorAll('#list-tracks [data-playlist-pick]').forEach(input => {
    input.checked = checked;
    input.dispatchEvent(new Event('change'));
  });
  if (!checked) clearPlaylistSelection();
  updatePickedCount();
}

function updatePickedCount() {
  const count = selectedPlaylistItems().length;
  document.querySelectorAll('.picked-event-count').forEach(node => { node.textContent = count; });
}

function markCacheStatus(track, item, checkStatus) {
  checkStatus(track.path).then(cached => {
    const status = item.querySelector('.status-slot');
    const cache = item.querySelector('.mini-cache');
    if (status) status.innerHTML = cached ? '<span class="cached-dot">●</span>' : '';
    if (cache && cached) cache.classList.add('saved');
  });
}

function styles() {
  const style = document.createElement('style');
  style.textContent = `.premium-event-toolbar{border:1px solid rgba(0,243,255,.35);border-radius:20px;background:linear-gradient(135deg,rgba(0,243,255,.1),rgba(255,204,0,.045));padding:14px;margin-bottom:12px;display:flex;justify-content:space-between;gap:14px}.toolbar-kicker{display:block;color:var(--c-yellow);font-size:11px;letter-spacing:3px;text-transform:uppercase}.premium-event-toolbar strong{color:#fff;font-size:20px;letter-spacing:1px}.toolbar-sub{color:#9cc;margin-top:4px}.event-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}.premium-track-item{grid-template-columns:auto 1fr auto!important;border:1px solid rgba(0,243,255,.14);border-radius:14px;margin:8px 0;background:rgba(255,255,255,.025)}.track-picker input{width:20px;height:20px;accent-color:var(--c-yellow)}.track-main-button{background:transparent;border:0;color:white;text-align:left;display:flex;align-items:center;gap:9px;min-width:0;cursor:pointer}.track-number{color:var(--c-yellow);font-weight:900}.cached-dot{color:var(--c-cyan);font-weight:900;text-shadow:0 0 10px var(--c-cyan)}.mini-playlist-track,.mini-playlist-event,.mini-playlist-selected-tracks{border-color:var(--c-yellow)!important;color:var(--c-yellow)!important}@media(max-width:720px){.premium-event-toolbar,.premium-track-item{display:grid!important;grid-template-columns:1fr!important}.event-toolbar-actions,.item-actions{display:grid;grid-template-columns:1fr 1fr}.mini-btn{width:100%}.track-picker{position:absolute;right:12px;top:12px}}`;
  return style;
}
