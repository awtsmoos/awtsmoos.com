//B"H
import * as Network from '../modules/network.js';
import * as Store from '../store.js';
import * as Render from '../render.js';
import { makeZip, safeName } from '../modules/zip-store.js';

const trackListCache = new Map();
const blobCache = new Map();

/**
 * B"H
 * Builds the one action table for search, events, tracks, playlists, cache, and
 * ZIP. No parallel kingdom: the Awtsmoos lets every button drink from the same
 * known archive streams and the same IndexedDB store. Event shells are now
 * escorted toward playable tracks before the playlist vessel seals around them.
 * @param {object} app Optional app callbacks for playback and playlist picker.
 * @returns {object} Stable callbacks consumed by result and playlist UI.
 */
export function createSearchResultHandlers(app = {}) {
  return {
    onOpen: openResult,
    onLoadTracks: loadTracks,
    onDownloadAllResults: downloadAllResults,
    onDownloadSelectedTracks: rows => downloadSelectedTracks(rows),
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
  const tracks = await loadTracks(item);
  const items = tracks.map(track => Render.playlistTrackItem(track, item));
  if (items.length) return app.onAddToPlaylist?.(items) || Render.openAddToPlaylist(items);
  return app.onAddToPlaylist?.([item]) || Render.openAddToPlaylist([item]);
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
  const key = eventKey(item);
  if (trackListCache.has(key)) return trackListCache.get(key);
  try {
    Render.log(`Loading files: ${titleOf(item)}`);
    const tracks = await Network.fetchFolder(String(item.year), item.folder);
    trackListCache.set(key, tracks);
    return tracks;
  } catch (e) {
    console.error(e);
    Render.log('Event file load failed: ' + e.message, true);
    return [];
  }
}

async function downloadAllResults(results = []) {
  const rows = [];
  for (const item of results) (await loadTracks(item)).forEach((track, i) => rows.push({ item, track, trackIndex: i + 1 }));
  return zipRows(rows, `rebbe-search-selected-${Date.now()}.zip`, openZipProgress('Preparing selected search results'));
}

async function downloadSelectedTracks(items = []) {
  const rows = items.map((item, i) => ({ item: item.event || item, track: item.track || item, trackIndex: i + 1 }));
  return zipRows(rows, `rebbe-selected-tracks-${Date.now()}.zip`, openZipProgress('Preparing selected tracks'));
}

async function downloadEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to download', true);
  if (files.length === 1) return downloadTrack(files[0], item);
  return zipRows(files.map((track, i) => ({ item, track, trackIndex: i + 1 })), `${safeName(titleOf(item))}.zip`, openZipProgress(`Preparing ${titleOf(item)}`));
}

async function cacheEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to cache', true);
  for (let i = 0; i < files.length; i++) { await cacheTrack(files[i], item); Render.log(`Cached ${i + 1}/${files.length}`); }
  await bookmarkResult(item);
}

async function downloadPlaylist(playlist) {
  const rows = (playlist.items || []).map((item, i) => ({ item: item.event || item, track: item.track || item, trackIndex: i + 1 }));
  rows.push({ meta: true, name: 'playlist-manifest.json', text: JSON.stringify(playlistManifest(playlist), null, 2) });
  rows.push({ meta: true, name: 'playlist-metadata.txt', text: playlistMetadata(playlist) });
  rows.push({ meta: true, name: 'playlist-artwork.svg', text: playlistArtwork(playlist) });
  return zipRows(rows, `${safeName(playlist.title || 'playlist')}.zip`, openZipProgress(`Preparing playlist: ${playlist.title}`));
}

async function cachePlaylist(playlist) {
  const items = playlist.items || [];
  for (let i = 0; i < items.length; i++) await cacheTrack(items[i].track || items[i], items[i].event || items[i]);
  Render.log(`Playlist cached: ${items.length} item(s)`);
}

async function removeCachedPlaylist(playlist) {
  const paths = (playlist.items || []).map(item => item.path || item.track?.path).filter(Boolean);
  await Store.removeTracks(paths);
  Render.log(`Removed cached playlist files: ${paths.length}`);
}

async function bookmarkResult(item) {
  if (!item?.year || !item?.folder) return;
  await Store.saveBookmark({ id: `folder:${item.year}:${item.folder}`, type: 'folder', year: String(item.year), folder: item.folder, title: titleOf(item) });
  Render.log('Event saved to bookshelf');
}

async function downloadTrack(track, item = {}) {
  const url = track?.url || track?.fallbackUrls?.[0];
  if (!url) return Render.log('No track URL', true);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.download = entryName({ item, track, trackIndex: 1 });
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

async function cacheTrack(track, item = {}) {
  const path = track?.path || item?.path;
  if (!path) return Render.log('No track path to cache', true);
  try {
    await Store.saveTrack(path, await blobForTrack(track));
    await bookmarkTrack(track, item);
    Render.log(`Cached file: ${trackTitle(track)}`);
  } catch (e) {
    console.warn('Cache skipped', track, e);
    Render.log('File cache skipped: ' + (trackTitle(track) || e.message), true);
  }
}

async function bookmarkTrack(track, item = {}) {
  await Store.saveBookmark({ id: `track:${track.path}`, type: 'track', year: String(item.year || '').replace(/-.*/, ''), folder: item.folder || folderFromPath(track.path), title: trackTitle(track), path: track.path, url: track.url });
  Render.log('File saved to bookshelf');
}

async function zipRows(rows, filename, meter) {
  const files = [];
  const skipped = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (row.meta) { files.push({ name: row.name, blob: new Blob([row.text], { type: row.name.endsWith('.svg') ? 'image/svg+xml' : 'application/json' }) }); continue; }
    const name = entryName(row);
    meter.step(i, rows.length, `Fetching ${i + 1} of ${rows.length}`, name);
    try { files.push({ name, blob: await blobForTrack(row.track) }); }
    catch (e) { skipped.push(`${name} — ${e.message || 'failed'}`); }
  }
  if (!files.length) return meter.done('ZIP failed', ['Every file failed or was blocked.']);
  meter.step(rows.length, rows.length, 'Building zip', `${files.length} files · ${skipped.length} skipped`);
  saveBlob(await makeZip(files), filename);
  meter.done('Zip ready', [`${files.length} files exported`, `${skipped.length} skipped`, ...skipped.slice(0, 8)]);
}

async function blobForTrack(track) {
  const key = track?.path || track?.url || JSON.stringify(track?.fallbackUrls || []);
  if (blobCache.has(key)) return blobCache.get(key);
  const promise = Network.fetchBlob(track.fallbackUrls || track.url);
  blobCache.set(key, promise);
  try { const blob = await promise; blobCache.set(key, blob); return blob; }
  catch (e) { blobCache.delete(key); throw e; }
}

function playlistManifest(playlist) { return { id: playlist.id, title: playlist.title, description: playlist.description || '', exportedAt: new Date().toISOString(), count: (playlist.items || []).length, items: playlist.items || [] }; }
function playlistMetadata(playlist) { return [`Playlist: ${playlist.title}`, `Items: ${(playlist.items || []).length}`, `Last played: ${playlist.lastPlayedAt ? new Date(playlist.lastPlayedAt).toISOString() : 'never'}`].join('\n'); }
function playlistArtwork(playlist) { const title = escapeHtml(playlist.title || 'Playlist'); return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#02090b"/><circle cx="260" cy="300" r="220" fill="#00f3ff" opacity=".28"/><circle cx="880" cy="780" r="260" fill="#ffcc00" opacity=".22"/><text x="90" y="610" fill="#fff" font-size="84" font-family="monospace" font-weight="900">${title}</text></svg>`; }
function entryName(row) { return safeName(`${String(row.trackIndex || 1).padStart(3, '0')} ${titleOf(row.item)} - ${trackTitle(row.track)}`) + '.mp3'; }
function titleOf(item) { return cleanName(item?.title || item?.folder || 'event'); }
function trackTitle(track) { return cleanName(track?.title || track?.name || 'audio'); }
function cleanName(value) { return String(value || '').replace(/^BH[_\s-]*\d+[_\s-]*/i, '').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/_/g, ' ').replace(/\s*-\s*/g, ' ').replace(/\s+/g, ' ').trim(); }
function eventKey(item) { return `${item?.year || ''}::${item?.folder || ''}`; }
function folderFromPath(path) { return String(path || '').split('/').slice(1, -1).join('/'); }
function saveBlob(blob, filename) { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.rel = 'noopener noreferrer'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000); }
function openZipProgress(title) { let box = document.getElementById('zip-progress-box'); if (!box) { box = document.createElement('div'); box.id = 'zip-progress-box'; document.body.appendChild(box); } box.innerHTML = `<style>${progressCss()}</style><div class="zip-card"><button class="zip-close">×</button><h3>${escapeHtml(title)}</h3><div class="zip-status"></div><div class="zip-name"></div><div class="zip-track"><div class="zip-fill"></div></div><div class="zip-log"></div></div>`; box.querySelector('.zip-close').onclick = () => box.remove(); return { step(done, total, status, name) { const pct = total ? Math.round((done / total) * 100) : 0; box.querySelector('.zip-status').textContent = `${status} · ${pct}%`; box.querySelector('.zip-name').textContent = name || ''; box.querySelector('.zip-fill').style.width = `${pct}%`; }, done(status, lines = []) { box.querySelector('.zip-status').textContent = status; box.querySelector('.zip-fill').style.width = '100%'; box.querySelector('.zip-log').innerHTML = lines.map(line => `<div>${escapeHtml(line)}</div>`).join(''); } }; }
function progressCss() { return `#zip-progress-box{position:fixed;left:14px;right:14px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:10020}.zip-card{background:rgba(2,7,7,.98);border:1px solid #266;box-shadow:0 8px 28px rgba(0,0,0,.55);padding:14px;color:#dff;font-family:monospace;border-radius:14px}.zip-close{position:absolute;right:24px;top:12px;background:#16080d;color:#fff;border:1px solid var(--c-magenta);font-size:18px}.zip-status{font-weight:800;color:var(--c-yellow)}.zip-name{margin:8px 0;color:#bcd;word-break:break-word;font-size:12px}.zip-track{height:10px;border:1px solid #244;background:#000;overflow:hidden;border-radius:999px}.zip-fill{height:100%;width:0;background:var(--c-cyan);transition:width .2s}.zip-log{max-height:90px;overflow:auto;margin-top:10px;color:#aab;font-size:11px}`; }
function escapeHtml(value) { return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])); }
