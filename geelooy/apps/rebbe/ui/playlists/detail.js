//B"H
import * as Store from '../../store.js';
import { date, fmtBytes, fmtTime } from './format.js';
import { detailHtml } from './html.js';

/**
 * B"H
 * Detail chamber. Here a playlist is edited, played, exported, cached, looped,
 * merged, and reordered through named gates instead of a storm of cramped icons.
 * @param {string} id Playlist id.
 * @param {object} deps Rendering dependencies.
 * @returns {Promise<void>}
 */
export async function renderPlaylistDetail(id, deps = {}) {
  const playlist = await Store.getPlaylist(id);
  const root = document.getElementById('playlist-home');
  if (!root || !playlist) return;
  root.innerHTML = detailHtml(playlist);
  bindDetail(root, playlist, deps);
  const stats = await Store.playlistStats(playlist);
  root.querySelector('#playlist-detail-stats').textContent = `${stats.itemCount} tracks · ${fmtTime(stats.duration)} · ${stats.cachedCount} cached · ${fmtBytes(stats.cachedBytes)} · last ${date(stats.lastPlayedAt)}`;
}

function bindDetail(root, playlist, deps) {
  const cb = deps.callbacks || {};
  root.querySelector('#playlist-back').onclick = () => deps.renderHome?.();
  root.querySelector('#playlist-save-title').onclick = () => savePlaylistEdits(playlist, deps);
  root.querySelector('#playlist-play').onclick = () => cb.onPlayPlaylist?.(playlist.id);
  root.querySelector('#playlist-shuffle').onclick = () => cb.onPlayPlaylist?.(playlist.id, { shuffle: true });
  root.querySelector('#playlist-loop-list').onclick = () => cb.onSetPlaylistLoop?.(playlist.id, 'playlist');
  root.querySelector('#playlist-loop-track').onclick = () => cb.onSetPlaylistLoop?.(playlist.id, 'track');
  root.querySelector('#playlist-cache-missing').onclick = () => cb.onCachePlaylist?.(playlist.id);
  root.querySelector('#playlist-refresh-cache').onclick = () => cb.onRefreshCachedPlaylist?.(playlist.id);
  root.querySelector('#playlist-remove-cache').onclick = () => cb.onRemoveCachedPlaylist?.(playlist.id);
  root.querySelector('#playlist-zip').onclick = () => cb.onDownloadPlaylist?.(playlist.id);
  root.querySelector('#playlist-merge').onclick = () => mergeInto(playlist.id, deps);
  root.querySelectorAll('[data-remove-key]').forEach(btn => btn.onclick = () => removeItem(playlist.id, btn.dataset.removeKey, deps));
  root.querySelectorAll('[data-move-up]').forEach(btn => btn.onclick = () => moveItem(playlist.id, Number(btn.dataset.moveUp), -1, deps));
  root.querySelectorAll('[data-move-down]').forEach(btn => btn.onclick = () => moveItem(playlist.id, Number(btn.dataset.moveDown), 1, deps));
  root.querySelectorAll('[data-play-from]').forEach(btn => btn.onclick = () => cb.onPlayPlaylist?.(playlist.id, { index: Number(btn.dataset.playFrom) }));
}

async function savePlaylistEdits(playlist, deps) {
  const title = document.getElementById('playlist-title-edit')?.value;
  const description = document.getElementById('playlist-desc-edit')?.value;
  const artwork = document.getElementById('playlist-art-edit')?.value;
  await Store.savePlaylist({ ...playlist, title, description, artwork });
  await renderPlaylistDetail(playlist.id, deps);
}
async function removeItem(id, key, deps) { await Store.removeItemFromPlaylist(id, key); await renderPlaylistDetail(id, deps); }
async function moveItem(id, from, delta, deps) { await Store.reorderPlaylistItem(id, from, from + delta); await renderPlaylistDetail(id, deps); }
async function mergeInto(targetId, deps) { const other = prompt('Paste playlist id to merge into this playlist'); if (other) { await Store.mergePlaylists(targetId, [other]); await renderPlaylistDetail(targetId, deps); } }
