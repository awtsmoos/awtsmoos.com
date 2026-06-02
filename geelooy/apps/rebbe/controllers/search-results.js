//B"H
import * as Network from '../modules/network.js';
import * as Store from '../store.js';
import * as Render from '../render.js';
import { makeZip, safeName } from '../modules/zip-store.js';

const trackListCache = new Map();
const blobCache = new Map();

/**
 * B"H
 * Search-result actions gather bytes only once per file where possible, skip
 * blocked CORS stones, and name every ZIP entry from event + file in a sane way.
 */
export function createSearchResultHandlers() {
  return {
    onOpen: openResult,
    onLoadTracks: loadTracks,
    onDownloadAllResults: downloadAllResults,
    onDownloadEvent: downloadEvent,
    onCacheEvent: cacheEvent,
    onBookmark: bookmarkResult,
    onDownloadTrack: downloadTrack,
    onCacheTrack: cacheTrack,
    onBookmarkTrack: bookmarkTrack
  };
}

async function openResult(item) {
  if (!item?.year || !item?.folder) return;
  const url = new URL(location);
  url.searchParams.set('year', String(item.year));
  url.searchParams.set('folder', item.folder);
  url.searchParams.set('track', '0');
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
  const events = Array.isArray(results) ? results : [];
  if (!events.length) return Render.log('No selected results to zip', true);
  const meter = openZipProgress('Preparing selected search results');
  const rows = [];
  for (let i = 0; i < events.length; i++) {
    meter.step(i, events.length, `Reading event ${i + 1} of ${events.length}`, titleOf(events[i]));
    const tracks = await loadTracks(events[i]);
    tracks.forEach((track, j) => rows.push({ item: events[i], track, eventIndex: i + 1, trackIndex: j + 1 }));
  }
  if (!rows.length) return meter.done('No audio files found', ['No reachable audio files were discovered.']);
  await zipRows(rows, `rebbe-search-selected-${Date.now()}.zip`, meter);
}

async function downloadEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to download', true);
  if (files.length === 1) return downloadTrack(files[0], item);
  const meter = openZipProgress(`Preparing ${titleOf(item)}`);
  const rows = files.map((track, index) => ({ item, track, eventIndex: 1, trackIndex: index + 1 }));
  await zipRows(rows, `${safeName(titleOf(item))}.zip`, meter);
}

async function cacheEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to cache', true);
  Render.log(`Caching ${files.length} event files...`);
  for (let i = 0; i < files.length; i++) {
    await cacheTrack(files[i], item);
    Render.log(`Cached ${i + 1}/${files.length}`);
  }
  await bookmarkResult(item);
}

async function bookmarkResult(item) {
  if (!item?.year || !item?.folder) return;
  await Store.saveBookmark({
    id: `folder:${item.year}:${item.folder}`,
    type: 'folder',
    year: String(item.year),
    folder: item.folder,
    title: titleOf(item)
  });
  Render.log('Event saved to bookshelf');
}

async function downloadTrack(track, item = {}) {
  const url = track?.url || track?.fallbackUrls?.[0];
  if (!url) return Render.log('No track URL', true);
  openExternalDownload(url, `${entryName({ item, track, eventIndex: 1, trackIndex: 1 })}`);
  Render.log('Opened download in new tab');
}

async function cacheTrack(track, item = {}) {
  if (!track?.path) return Render.log('No track path to cache', true);
  try {
    const blob = await blobForTrack(track);
    await Store.saveTrack(track.path, blob);
    await bookmarkTrack(track, item);
    Render.log(`Cached file: ${trackTitle(track)}`);
  } catch (e) {
    console.warn('Cache skipped', track, e);
    Render.log('File cache skipped: ' + (trackTitle(track) || e.message), true);
  }
}

async function bookmarkTrack(track, item = {}) {
  await Store.saveBookmark({
    id: `track:${track.path}`,
    type: 'track',
    year: String(item.year || '').replace(/-.*/, ''),
    folder: item.folder || folderFromPath(track.path),
    title: trackTitle(track),
    path: track.path,
    url: track.url
  });
  Render.log('File saved to bookshelf');
}

async function zipRows(rows, filename, meter) {
  const files = [];
  const skipped = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const name = entryName(row);
    meter.step(i, rows.length, `Fetching ${i + 1} of ${rows.length}`, name);
    try {
      files.push({ name, blob: await blobForTrack(row.track) });
    } catch (e) {
      console.warn('ZIP file skipped', row.track, e);
      skipped.push(`${name} — ${e.message || 'failed'}`);
    }
  }
  if (!files.length) return meter.done('ZIP failed', ['Every file failed or was blocked.']);
  meter.step(rows.length, rows.length, 'Building zip', `${files.length} files · ${skipped.length} skipped`);
  saveBlob(await makeZip(files), filename);
  meter.done('Zip ready', [`${files.length} files downloaded`, `${skipped.length} skipped`, ...skipped.slice(0, 8)]);
  Render.log(`ZIP ready: ${files.length} downloaded, ${skipped.length} skipped`);
}

async function blobForTrack(track) {
  const key = track?.path || track?.url || JSON.stringify(track?.fallbackUrls || []);
  if (blobCache.has(key)) return blobCache.get(key);
  const promise = Network.fetchBlob(track.fallbackUrls || track.url);
  blobCache.set(key, promise);
  try {
    const blob = await promise;
    blobCache.set(key, blob);
    return blob;
  } catch (e) {
    blobCache.delete(key);
    throw e;
  }
}

function entryName(row) {
  const event = titleOf(row.item);
  const title = removeRepeatedEvent(trackTitle(row.track), event);
  const eventNo = String(row.eventIndex).padStart(3, '0');
  const trackNo = String(row.trackIndex).padStart(2, '0');
  return safeName(`${eventNo} ${event} - ${trackNo} ${title}`) + '.mp3';
}

function titleOf(item) {
  return cleanName(item?.title || item?.folder || 'event');
}

function trackTitle(track) {
  return cleanName(track?.title || track?.name || 'audio');
}

function cleanName(value) {
  return String(value || '')
    .replace(/^BH[_\s-]*\d+[_\s-]*/i, '')
    .replace(/\.[a-z0-9]{2,5}$/i, '')
    .replace(/_/g, ' ')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function removeRepeatedEvent(title, event) {
  const cleanEvent = event.toLowerCase();
  const cleanTitle = title.toLowerCase();
  if (cleanTitle === cleanEvent) return 'audio';
  if (cleanTitle.startsWith(cleanEvent)) return title.slice(event.length).replace(/^\s+/, '') || 'audio';
  return title;
}

function eventKey(item) {
  return `${item?.year || ''}::${item?.folder || ''}`;
}

function folderFromPath(path) {
  return String(path || '').split('/').slice(1, -1).join('/');
}

function openExternalDownload(url, filename) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function openZipProgress(title) {
  let box = document.getElementById('zip-progress-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'zip-progress-box';
    document.body.appendChild(box);
  }
  box.innerHTML = `<style>${progressCss()}</style>
    <div class="zip-card">
      <button class="zip-close">×</button><h3></h3>
      <div class="zip-status"></div><div class="zip-name"></div>
      <div class="zip-track"><div class="zip-fill"></div></div><div class="zip-log"></div>
    </div>`;
  box.querySelector('h3').textContent = title;
  box.querySelector('.zip-close').onclick = () => box.remove();
  return {
    step(done, total, status, name) {
      const pct = total ? Math.round((done / total) * 100) : 0;
      box.querySelector('.zip-status').textContent = `${status} · ${pct}%`;
      box.querySelector('.zip-name').textContent = name || '';
      box.querySelector('.zip-fill').style.width = `${pct}%`;
    },
    done(status, lines = []) {
      box.querySelector('.zip-status').textContent = status;
      box.querySelector('.zip-fill').style.width = '100%';
      box.querySelector('.zip-log').innerHTML = lines.map(line => `<div>${escapeHtml(line)}</div>`).join('');
    }
  };
}

function progressCss() {
  return `#zip-progress-box{position:fixed;left:14px;right:14px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:10020}.zip-card{background:rgba(2,7,7,.98);border:1px solid #266;box-shadow:0 8px 28px rgba(0,0,0,.55);padding:14px;color:#dff;font-family:monospace;border-radius:10px}.zip-card h3{margin:0 34px 8px 0;color:var(--c-cyan);font-size:15px;text-transform:none}.zip-close{position:absolute;right:24px;top:12px;background:#16080d;color:#fff;border:1px solid var(--c-magenta);font-size:18px}.zip-status{font-weight:800;color:var(--c-yellow);text-transform:none}.zip-name{margin:8px 0;color:#bcd;word-break:break-word;font-size:12px;line-height:1.35}.zip-track{height:10px;border:1px solid #244;background:#000;overflow:hidden;border-radius:999px}.zip-fill{height:100%;width:0;background:var(--c-cyan);transition:width .2s}.zip-log{max-height:90px;overflow:auto;margin-top:10px;color:#aab;font-size:11px;line-height:1.35}`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}
