//B"H
import { markCacheStatus } from './tracks/cache.js';
import { renderTrackRow } from './tracks/row.js';
import { updatePickedCount } from './tracks/selection.js';
import { ensureTrackStyles } from './tracks/styles.js';
import { renderEventToolbar } from './tracks/toolbar.js';

/**
 * B"H
 * Public track-column gateway. The Awtsmoos no longer lets a crowded file carry
 * the entire event palace; this vessel only opens the gate, while each chamber
 * below handles toolbar, rows, cache marks, selection, and command styling.
 * @param {Array<object>} tracks Audio rows for the current event.
 * @param {string} folderTitle Human event title.
 * @param {Function} checkStatus Cache status probe.
 * @param {Function} onSelect Play-row callback.
 * @param {Function} onAction Event/track action callback.
 * @returns {void}
 */
export function renderTracks(tracks = [], folderTitle = '', checkStatus, onSelect, onAction) {
  const list = document.getElementById('list-tracks');
  if (!list) return;
  ensureTrackStyles();
  list.innerHTML = '';
  list.appendChild(renderEventToolbar(folderTitle, tracks, onAction));
  tracks.forEach((track, index) => {
    list.appendChild(renderTrackRow({ track, index, folderTitle, checkStatus, onSelect, onAction, markCacheStatus }));
  });
  updatePickedCount();
}
