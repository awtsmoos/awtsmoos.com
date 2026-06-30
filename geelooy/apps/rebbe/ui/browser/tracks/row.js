//B"H
import { fmt } from '../../utils.js';
import { createCommandButton, durationPill } from './commands.js';
import { selectionBox } from './selection.js';

/**
 * B"H
 * Track row chamber. The audio spark gets one big title door and five clean
 * action gates; no row must become a battlefield of tiny unmarked circles.
 * @param {object} args Row construction payload.
 * @returns {HTMLDivElement} Track row node.
 */
export function renderTrackRow(args) {
  const item = document.createElement('div');
  item.className = 'item track-item premium-track-item';
  item.id = `track-${args.index}`;
  item.appendChild(selectionBox(args.track, args.folderTitle));
  item.appendChild(mainButton(args.track, args.index, args.onSelect));
  item.appendChild(actionButtons(args.track, args.onAction));
  if (args.checkStatus) args.markCacheStatus(args.track, item, args.checkStatus);
  return item;
}

function mainButton(track, index, onSelect) {
  const left = document.createElement('button');
  left.type = 'button';
  left.className = 'track-left track-main-button';
  left.innerHTML = `<span class="status-slot"></span><span class="track-number">${String(index + 1).padStart(2, '0')}</span><span class="t-name"></span>`;
  left.querySelector('.t-name').textContent = track.title || track.name || 'Audio';
  left.onclick = () => onSelect(index);
  return left;
}

function actionButtons(track, onAction) {
  const wrap = document.createElement('div');
  wrap.className = 'item-actions';
  wrap.appendChild(durationPill(fmt(track.duration)));
  [
    ['▶', 'Play', 'Play this file', 'play-row'],
    ['♫', 'Add', 'Add this file to playlist', 'playlist-track'],
    ['⬇', 'Download', 'Download this file', 'download'],
    ['⚡', 'Cache', 'Cache this file offline', 'cache'],
    ['☆', 'Save', 'Save this file to bookshelf', 'bookmark-track']
  ].forEach(([icon, label, title, action]) => wrap.appendChild(createCommandButton({ icon, label, title, action, track, onAction })));
  return wrap;
}
