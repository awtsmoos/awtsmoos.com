//B"H
import * as Store from '../../store.js';
import { getPendingItems } from './state.js';
import { pickerCard } from './html.js';

/**
 * B"H
 * Picker chamber. Selected sparks can enter an existing crown or create a new
 * crown immediately, with the count visible before the gate opens.
 * @param {object} deps Rendering dependencies.
 * @returns {Promise<void>}
 */
export async function renderPlaylistPicker(deps = {}) {
  const root = document.getElementById('playlist-picker');
  if (!root) return;
  const playlists = await Store.listPlaylists();
  const pending = getPendingItems();
  root.innerHTML = `<div class="playlist-pending"><b>${pending.length}</b> selected item(s)</div>` + (playlists.length ? playlists.map(pickerCard).join('') : '<div class="playlist-empty small">No playlists yet. Create one above.</div>');
  root.querySelectorAll('[data-add-existing]').forEach(btn => btn.onclick = () => addToExisting(btn.dataset.addExisting, deps));
}

/** @param {object} deps Rendering dependencies. @returns {Promise<void>} */
export async function createAndAddPending(deps = {}) {
  const input = document.getElementById('playlist-new-name');
  const title = input?.value.trim();
  if (!title) return;
  const playlist = await Store.savePlaylist({ title, items: getPendingItems() });
  input.value = '';
  await renderPlaylistPicker(deps);
  await deps.afterCreate?.();
  deps.toast?.(`Added ${getPendingItems().length} item(s) to ${playlist.title}`);
}

async function addToExisting(id, deps) {
  const playlist = await Store.addItemsToPlaylist(id, getPendingItems());
  await renderPlaylistPicker(deps);
  deps.toast?.(`Added to ${playlist?.title || 'playlist'}`);
}
