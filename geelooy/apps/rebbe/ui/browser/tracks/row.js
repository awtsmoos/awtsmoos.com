//B"H
import { fmt } from '../../utils.js';
import { createCommandButton, durationPill } from './commands.js';
import { selectionBox } from './selection.js';

/**
 * B"H
 * Track row chamber. The title is the main doorway, and every side action is a
 * labeled command gate: Play, Add, Download, Cache, Save.
 * @param {object} args Row construction payload.
 * @returns {HTMLDivElement} Track row node.
 */
export function renderTrackRow(args) {
  const item = document.createElement('div');
  item.className = 'item track-item premium-track-item';
  item.id = `track-${args.index}`;
  item.append(selectionBox(args.track, args.folderTitle), mainButton(args.track, args.index, args.onSelect), actionButtons(args.track, args.onAction));
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
  wrap.className = 'item-actions command-deck row-command-deck';
  wrap.appendChild(durationPill(fmt(track.duration)));
  commandSpecs().forEach(spec => wrap.appendChild(createCommandButton({ ...spec, track, onAction })));
  return wrap;
}

function commandSpecs() {
  return [
    { icon: '▶', label: 'Play', title: 'Play this file', action: 'play-row', variant: 'primary' },
    { icon: '♫', label: 'Add', title: 'Add this file to playlist', action: 'playlist-track', variant: 'accent' },
    { icon: '⬇', label: 'Download', title: 'Download this file', action: 'download', variant: 'primary' },
    { icon: '⚡', label: 'Cache', title: 'Cache this file offline', action: 'cache', variant: 'cache' },
    { icon: '☆', label: 'Save', title: 'Save this file to bookshelf', action: 'bookmark-track', variant: 'accent' }
  ];
}
