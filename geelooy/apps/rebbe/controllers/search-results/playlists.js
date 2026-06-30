//B"H
import * as Store from '../../store.js';
import * as Render from '../../render.js';
import { downloadRowsAsZip, playlistAudioRows, playlistExportRows, playlistZipName } from '../../modules/download/exports.js';
import { cacheTrack } from './cache.js';
import { loadTracks } from './loader.js';

/**
 * B"H
 * Playlist bridge. Search events expand into playlist sparks, while playlist
 * export/cache/remove reuse the same download and cache chambers.
 * @param {object} item Event item.
 * @param {object} app Optional app callbacks.
 * @returns {Promise<void>}
 */
export async function addEventToPlaylist(item, app = {}) {
  const items = (await loadTracks(item)).map(track => Render.playlistTrackItem(track, item));
  return (app.onAddToPlaylist || Render.openAddToPlaylist)(items.length ? items : [item]);
}

/** @param {object} playlist Playlist record. @returns {Promise<void>} */
export async function downloadPlaylist(playlist) {
  const rows = await playlistExportRows(playlist, loadTracks);
  return downloadRowsAsZip(rows, playlistZipName(playlist), `Exporting playlist: ${playlist.title}`);
}

/** @param {object} playlist Playlist record. @returns {Promise<void>} */
export async function cachePlaylist(playlist) {
  const rows = await playlistAudioRows(playlist, loadTracks);
  for (let i = 0; i < rows.length; i++) await cacheTrack(rows[i].track, rows[i].item);
  Render.log(`Playlist cached: ${rows.length} file(s)`);
}

/** @param {object} playlist Playlist record. @returns {Promise<void>} */
export async function removeCachedPlaylist(playlist) {
  const rows = await playlistAudioRows(playlist, loadTracks);
  const paths = rows.map(row => row.track?.path).filter(Boolean);
  await Store.removeTracks(paths);
  Render.log(`Removed cached playlist files: ${paths.length}`);
}
