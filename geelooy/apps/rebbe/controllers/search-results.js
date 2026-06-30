//B"H
import * as Network from '../modules/network.js';
import * as Store from '../store.js';
import * as Render from '../render.js';
import { safeName } from '../modules/zip-store.js';
import { blobForTrack, directDownloadTrack, folderFromPath, titleOf, trackTitle } from '../modules/download/files.js';
import { downloadRowsAsZip, playlistAudioRows, playlistExportRows, playlistZipName } from '../modules/download/exports.js';

const trackListCache = new Map();

/**
 * B"H
 * Search result actions are the archive courthouse. Downloads, cache, playlist,
 * bookshelf, and playback all testify here, but the heavy ZIP labor now lives in
 * smaller vessels so many tasks can sing at once.
 * @param {object} app Optional app callbacks for playback and playlist picker.
 * @returns {object} Stable callbacks consumed by result and playlist UI.
 */
export function createSearchResultHandlers(app = {}) {
  return {
    onOpen: openResult,
    onLoadTracks: loadTracks,
    onDownloadAllResults: downloadAllResults,
    onDownloadSelectedTracks: downloadSelectedTracks,
    onDownloadEvent: downloadEvent,
    onCacheEvent: cacheEvent,
    onBookmark: bookmarkResult,
    onDownloadTrack: downloadTrack,
    onCacheTrack: cacheTrack,
    onBookmarkTrack: bookmarkTrack,
    onAddToPlaylist: items => app.onAddToPlaylist?.(items),
    onAddEventToPlaylist: item => app.onAddEventToPlaylist?.(item) || addEventToPlaylist(item, app),
    onPlayEvent: item => app.onPlayEvent?.(item) || openResult(item),
    onPlayTrack: (track, item) => openResult({ ...item, track }),
    onDownloadPlaylist: downloadPlaylist,
    onCachePlaylist: cachePlaylist,
    onRefreshCachedPlaylist: cachePlaylist,
    onRemoveCachedPlaylist: removeCachedPlaylist
  };
}

async function addEventToPlaylist(item, app = {}) {
  const items = (await loadTracks(item)).map(track => Render.playlistTrackItem(track, item));
  return (app.onAddToPlaylist || Render.openAddToPlaylist)(items.length ? items : [item]);
}

async function openResult(item) {
  if (!item?.year || !item?.folder) return;
  const url = new URL(location);
  url.searchParams.set('year', String(item.year));
  url.searchParams.set('folder', item.folder);
  url.searchParams.set('track', item.trackIndex || '0');
  url.searchParams.set('autoplay', '1');
  location.href = url.toString();
}

async function loadTracks(item) {
  if (!item?.year || !item?.folder) return [];
  const key = `${item.year}::${item.folder}`;
  if (trackListCache.has(key)) return trackListCache.get(key);
  try {
    Render.log(`Loading files: ${titleOf(item)}`);
    const tracks = await Network.fetchFolder(String(item.year), item.folder);
    trackListCache.set(key, Array.isArray(tracks) ? tracks : []);
    return trackListCache.get(key);
  } catch (error) {
    console.error(error);
    Render.log('Event file load failed: ' + error.message, true);
    return [];
  }
}

async function downloadAllResults(results = []) {
  const rows = [];
  for (const item of results) (await loadTracks(item)).forEach(track => rows.push({ item, track, trackIndex: rows.length + 1 }));
  return downloadRowsAsZip(rows, `rebbe-search-results-${Date.now()}.zip`, 'Exporting search results');
}

async function downloadSelectedTracks(items = []) {
  const rows = items.map((item, i) => ({ item: item.event || item, track: item.track || item, trackIndex: i + 1 }));
  if (rows.length === 1) return downloadTrack(rows[0].track, rows[0].item);
  return downloadRowsAsZip(rows, `rebbe-selected-tracks-${Date.now()}.zip`, 'Exporting selected tracks');
}

async function downloadEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to download', true);
  if (files.length === 1) return downloadTrack(files[0], item);
  const rows = files.map((track, i) => ({ item, track, trackIndex: i + 1 }));
  return downloadRowsAsZip(rows, `${safeName(titleOf(item))}.zip`, `Exporting event: ${titleOf(item)}`);
}

async function cacheEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to cache', true);
  for (let i = 0; i < files.length; i++) { await cacheTrack(files[i], item); Render.log(`Cached ${i + 1}/${files.length}`); }
  await bookmarkResult(item);
}

async function downloadPlaylist(playlist) {
  const rows = await playlistExportRows(playlist, loadTracks);
  return downloadRowsAsZip(rows, playlistZipName(playlist), `Exporting playlist: ${playlist.title}`);
}

async function cachePlaylist(playlist) {
  const rows = await playlistAudioRows(playlist, loadTracks);
  for (let i = 0; i < rows.length; i++) await cacheTrack(rows[i].track, rows[i].item);
  Render.log(`Playlist cached: ${rows.length} file(s)`);
}

async function removeCachedPlaylist(playlist) {
  const rows = await playlistAudioRows(playlist, loadTracks);
  const paths = rows.map(row => row.track?.path).filter(Boolean);
  await Store.removeTracks(paths);
  Render.log(`Removed cached playlist files: ${paths.length}`);
}

async function bookmarkResult(item) {
  if (!item?.year || !item?.folder) return;
  await Store.saveBookmark({ id: `folder:${item.year}:${item.folder}`, type: 'folder', year: String(item.year), folder: item.folder, title: titleOf(item) });
  Render.log('Event saved to bookshelf');
}

async function downloadTrack(track, item = {}) {
  try { directDownloadTrack(track, item); }
  catch (error) { Render.log(error.message || 'No track URL', true); }
}

async function cacheTrack(track, item = {}) {
  const path = track?.path || item?.path;
  if (!path) return Render.log('No track path to cache', true);
  try {
    await Store.saveTrack(path, await blobForTrack(track));
    await bookmarkTrack(track, item);
    Render.log(`Cached file: ${trackTitle(track)}`);
  } catch (error) {
    console.warn('Cache skipped', track, error);
    Render.log('File cache skipped: ' + (trackTitle(track) || error.message), true);
  }
}

async function bookmarkTrack(track, item = {}) {
  const id = `track:${track.path || track.url || trackTitle(track)}`;
  await Store.saveBookmark({ id, type: 'track', year: String(item.year || '').replace(/-.*/, ''), folder: item.folder || folderFromPath(track.path), title: trackTitle(track), path: track.path, url: track.url });
  Render.log('File saved to bookshelf');
}
