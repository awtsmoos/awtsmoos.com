//B"H
import { clearPlaylistSelection, openAddToPlaylist, playlistTrackItem, selectedPlaylistItems, togglePlaylistSelection } from '../../playlists.js';

/**
 * B"H
 * Selection law. Many visible track sparks may become one playlist offering, and
 * this chamber keeps checkbox state, count, and add button truth aligned.
 * @param {object} track Track to select.
 * @param {string} folderTitle Current event title.
 * @returns {HTMLLabelElement} Checkbox label.
 */
export function selectionBox(track, folderTitle) {
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

/** @param {boolean} checked Desired checkbox state. @returns {void} */
export function selectAllVisible(checked) {
  document.querySelectorAll('#list-tracks [data-playlist-pick]').forEach(input => {
    input.checked = checked;
    input.dispatchEvent(new Event('change'));
  });
  if (!checked) clearPlaylistSelection();
  updatePickedCount();
}

/** @returns {void} Open the picker only when real selected items exist. */
export function openSelectedPlaylistPicker() {
  const items = selectedPlaylistItems();
  if (items.length) openAddToPlaylist(items);
}

/** @returns {void} Refresh selected count and disabled Add buttons. */
export function updatePickedCount() {
  const count = selectedPlaylistItems().length;
  document.querySelectorAll('.picked-event-count').forEach(node => { node.textContent = count; });
  document.querySelectorAll('.mini-playlist-selected-tracks').forEach(node => { node.disabled = !count; });
}
