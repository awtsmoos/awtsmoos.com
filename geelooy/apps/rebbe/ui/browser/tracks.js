//B"H
// ui/browser/tracks.js
import { fmt } from '../utils.js';

/**
 * B"H
 * The event view mirrors search results: whole-event actions above, individual
 * file actions below. One logic, two doors, no divided kingdom.
 */
export function renderTracks(tracks, folderTitle, checkStatus, onSelect, onAction) {
  const list = document.getElementById('list-tracks');
  if (!list) return;
  list.innerHTML = '';
  list.appendChild(eventToolbar(folderTitle, onAction));
  tracks.forEach((track, index) => list.appendChild(row(track, index, checkStatus, onSelect, onAction)));
}

function eventToolbar(folderTitle, onAction) {
  const bar = document.createElement('div');
  bar.className = 'event-toolbar';
  bar.innerHTML = `<strong></strong><div class="event-toolbar-actions"></div>`;
  bar.querySelector('strong').textContent = folderTitle || 'EVENT';
  const actions = bar.querySelector('.event-toolbar-actions');
  actions.appendChild(mini('⬇ EVENT ZIP', 'Download all files in this event as ZIP', 'download-event', null, onAction));
  actions.appendChild(mini('⚡ CACHE EVENT', 'Cache all files in this event', 'cache-event', null, onAction));
  actions.appendChild(mini('☆ SAVE EVENT', 'Save this event to bookshelf', 'bookmark-folder', null, onAction));
  bar.appendChild(styles());
  return bar;
}

function row(track, index, checkStatus, onSelect, onAction) {
  const item = document.createElement('div');
  item.className = 'item track-item';
  item.id = `track-${index}`;
  item.appendChild(leftSide(track));
  item.appendChild(actions(track, onAction));
  if (checkStatus) markCacheStatus(track, item, checkStatus);
  item.onclick = () => onSelect(index);
  return item;
}

function leftSide(track) {
  const left = document.createElement('div');
  left.className = 'track-left';
  const status = document.createElement('span');
  status.className = 'status-slot';
  const name = document.createElement('span');
  name.className = 't-name';
  name.textContent = track.title;
  left.append(status, document.createTextNode(' '), name);
  return left;
}

function actions(track, onAction) {
  const wrap = document.createElement('div');
  wrap.className = 'item-actions';
  const dur = document.createElement('span');
  dur.className = 't-dur';
  dur.textContent = fmt(track.duration);
  wrap.appendChild(dur);
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
  button.onclick = event => {
    event.stopPropagation();
    onAction?.(action, track);
  };
  return button;
}

function markCacheStatus(track, item, checkStatus) {
  checkStatus(track.path).then(cached => {
    const status = item.querySelector('.status-slot');
    const cache = item.querySelector('.mini-cache');
    if (status) status.innerHTML = cached ? '<span style="color:var(--c-cyan);font-weight:bold;">●</span>' : '';
    if (cache && cached) cache.classList.add('saved');
  });
}

function styles() {
  const style = document.createElement('style');
  style.textContent = `.event-toolbar{border:1px solid #244;background:rgba(0,243,255,.08);padding:12px;margin-bottom:10px;display:grid;gap:10px}.event-toolbar strong{color:var(--c-yellow);letter-spacing:2px}.event-toolbar-actions{display:flex;gap:8px;flex-wrap:wrap}.event-toolbar .mini-btn{width:auto;padding:8px 10px}@media(max-width:720px){.event-toolbar-actions{display:grid;grid-template-columns:1fr}.event-toolbar .mini-btn{width:100%}}`;
  return style;
}
