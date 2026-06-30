//B"H
import { playlistItemKey } from '../../store.js';
import { clearSelectedItems, requestSelectionRender, selectedPlaylistItems as selectedItems, setSelectedItem } from './state.js';

/**
 * B"H
 * Item forge. A raw archive track becomes a playlist spark with enough identity
 * to survive export, cache, playback, and reordering inside one ordered vessel.
 * @param {object} track Archive track.
 * @param {object} event Event context.
 * @returns {object} Normalized playlist track item.
 */
export function playlistTrackItem(track = {}, event = {}) {
  return { type: 'track', year: String(event.year || ''), folder: event.folder || '', title: track.title || track.name || event.title || 'Audio', path: track.path || '', url: track.url || '', fallbackUrls: track.fallbackUrls || [], duration: track.duration || 0, track, event };
}

/** @param {object} event Event shell. @param {Array<object>} tracks Optional expanded tracks. @returns {Array<object>} Playlist-ready items. */
export function playlistEventItem(event = {}, tracks = []) {
  return tracks.length ? tracks.map(track => playlistTrackItem(track, event)) : [{ type: 'event', year: String(event.year || ''), folder: event.folder || '', title: event.title || event.folder || 'Event', event }];
}

/** @param {object} item Item to select. @param {boolean} checked Desired state. @returns {void} */
export function togglePlaylistSelection(item, checked) {
  setSelectedItem(playlistItemKey(item), item, checked);
  requestSelectionRender();
}

/** @returns {Array<object>} Currently selected playlist sparks. */
export function selectedPlaylistItems() { return selectedItems(); }

/** @returns {void} Clear DOM and state selection without leaving ghost checkmarks. */
export function clearPlaylistSelection() {
  clearSelectedItems();
  document.querySelectorAll('[data-playlist-pick]').forEach(input => { input.checked = false; });
  requestSelectionRender();
}
