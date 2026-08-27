//B"H
import * as Store from '../../store.js';
import { css, date, fmtBytes, fmtTime } from './format.js';
import { emptyHtml, playlistCard } from './html.js';

/**
 * B"H
 * Playlist home turns many saved crowns into simple cards: Play, Shuffle,
 * Details, Export, Cache, Copy, Delete. No mystery glyphs remain on the throne.
 * @param {object} deps Rendering dependencies.
 * @returns {Promise<void>}
 */
export async function renderPlaylistHome(deps = {}) {
  const root = document.getElementById('playlist-home');
  if (!root) return;
  const playlists = await Store.listPlaylists();
  root.innerHTML = playlists.length ? `<div class="playlist-home-actions"><button type="button" class="mini-btn" id="playlist-continue-last">CONTINUE LAST</button><button type="button" class="mini-btn playlist-new-btn">NEW PLAYLIST</button></div>${playlists.map(playlistCard).join('')}` : emptyHtml();
  bindHome(root, deps);
  await hydrateCardStats(root, playlists);
}

/** @param {object} deps Home dependencies. @returns {Promise<void>} */
export async function createEmptyPlaylist(deps = {}) {
  const title = prompt('Playlist name?');
  if (!title) return;
  await Store.savePlaylist({ title, items: [] });
  await deps.afterRender?.();
}

function bindHome(root, deps) {
  const cb = deps.callbacks || {};
  root.querySelector('#playlist-continue-last')?.addEventListener('click', () => cb.onContinueLastPlaylist?.());
  root.querySelector('.playlist-new-btn')?.addEventListener('click', () => deps.createEmptyPlaylist?.());
  root.querySelectorAll('[data-open-playlist]').forEach(btn => btn.onclick = () => deps.openPlaylist?.(btn.dataset.openPlaylist));
  root.querySelectorAll('[data-play-playlist]').forEach(btn => btn.onclick = () => cb.onPlayPlaylist?.(btn.dataset.playPlaylist));
  root.querySelectorAll('[data-shuffle-playlist]').forEach(btn => btn.onclick = () => cb.onPlayPlaylist?.(btn.dataset.shufflePlaylist, { shuffle: true }));
  root.querySelectorAll('[data-cache-playlist]').forEach(btn => btn.onclick = () => cb.onCachePlaylist?.(btn.dataset.cachePlaylist));
  root.querySelectorAll('[data-download-playlist]').forEach(btn => btn.onclick = () => cb.onDownloadPlaylist?.(btn.dataset.downloadPlaylist));
  root.querySelectorAll('[data-delete-playlist]').forEach(btn => btn.onclick = () => deletePlaylist(btn.dataset.deletePlaylist, deps));
  root.querySelectorAll('[data-duplicate-playlist]').forEach(btn => btn.onclick = () => duplicatePlaylist(btn.dataset.duplicatePlaylist, deps));
  root.querySelectorAll('[data-move-list]').forEach(btn => btn.onclick = () => movePlaylist(Number(btn.dataset.moveList), Number(btn.dataset.delta), deps));
}

async function hydrateCardStats(root, playlists) {
  for (const playlist of playlists) {
    const stats = await Store.playlistStats(playlist);
    const node = root.querySelector(`[data-card-stats="${css(playlist.id)}"]`);
    if (node) node.textContent = `${stats.itemCount} tracks · ${fmtTime(stats.duration)} · ${stats.cachedCount} cached · ${fmtBytes(stats.cachedBytes)} · last ${date(stats.lastPlayedAt)}`;
  }
}

async function deletePlaylist(id, deps) { if (confirm('Delete this playlist?')) { await Store.removePlaylist(id); await deps.afterRender?.(); } }
async function duplicatePlaylist(id, deps) { await Store.duplicatePlaylist(id); await deps.afterRender?.(); }
async function movePlaylist(from, delta, deps) { await Store.reorderPlaylist(null, from, from + delta); await deps.afterRender?.(); }
