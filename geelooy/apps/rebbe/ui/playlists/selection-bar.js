//B"H
import { selectedCount, selectedPlaylistItems } from './state.js';

/**
 * B"H
 * Sticky selection bar. When scattered tracks are chosen, this bar gathers them
 * into a visible crown above the player so the user never wonders what happens.
 * @param {object} deps Action dependencies.
 * @returns {void}
 */
export function renderSelectionBar(deps = {}) {
  let bar = document.getElementById('playlist-selection-bar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'playlist-selection-bar'; document.body.appendChild(bar); }
  const count = selectedCount();
  bar.classList.toggle('hidden', !count);
  bar.innerHTML = count ? `<div class="playlist-selection-inner"><b>${count}</b><span>selected for playlist</span><button type="button" id="playlist-selection-add">ADD</button><button type="button" id="playlist-selection-clear">CLEAR</button></div>` : '';
  document.getElementById('playlist-selection-add')?.addEventListener('click', () => deps.openAddToPlaylist?.(selectedPlaylistItems()));
  document.getElementById('playlist-selection-clear')?.addEventListener('click', () => deps.clearPlaylistSelection?.());
}
