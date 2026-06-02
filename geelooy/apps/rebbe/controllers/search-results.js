//B"H
import * as Network from '../modules/network.js';
import * as Store from '../store.js';
import * as Render from '../render.js';
import { makeZip, safeName } from '../modules/zip-store.js';

/**
 * B"H
 * Action handlers for result cards. The Awtsmoos lets a whole event be opened,
 * expanded, zipped, cached, or shelved, while each individual file may still be
 * handled alone like one spark from the larger flame.
 */
export function createSearchResultHandlers() {
  return {
    onOpen: openResult,
    onLoadTracks: loadTracks,
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
  try {
    Render.log(`LOADING EVENT FILES: ${item.folder}`);
    return await Network.fetchFolder(String(item.year), item.folder);
  } catch (e) {
    console.error(e);
    Render.log('EVENT FILE LOAD FAILED: ' + e.message, true);
    return [];
  }
}

async function downloadEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('NO EVENT FILES TO DOWNLOAD', true);
  if (files.length === 1) return downloadTrack(files[0], item);
  Render.log(`ZIPPING ${files.length} EVENT FILES...`);
  const blobs = await blobsForTracks(files, (i, total) => Render.log(`FETCHED ${i}/${total} FOR ZIP`));
  const zip = await makeZip(blobs.map(row => ({ name: row.name, blob: row.blob })));
  saveBlob(zip, `${safeName(item.title || item.folder)}.zip`);
  Render.log('EVENT ZIP READY');
}

async function cacheEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('NO EVENT FILES TO CACHE', true);
  Render.log(`CACHING ${files.length} EVENT FILES...`);
  for (let i = 0; i < files.length; i++) {
    await cacheTrack(files[i], item);
    Render.log(`CACHED ${i + 1}/${files.length}`);
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
    title: item.title || item.folder
  });
  Render.log('EVENT SAVED TO BOOKSHELF');
}

async function downloadTrack(track, item = {}) {
  if (!track?.url) return Render.log('NO TRACK URL', true);
  saveUrl(track.url, `${safeName(track.title || item.title || 'sicha')}.mp3`);
  Render.log('DOWNLOADING FILE...');
}

async function cacheTrack(track, item = {}) {
  if (!track?.path) return Render.log('NO TRACK PATH TO CACHE', true);
  try {
    const blob = await Network.fetchBlob(track.fallbackUrls || track.url);
    await Store.saveTrack(track.path, blob);
    await bookmarkTrack(track, item);
    Render.log(`CACHED FILE: ${track.title}`);
  } catch (e) {
    console.error(e);
    Render.log('FILE CACHE FAILED: ' + e.message, true);
  }
}

async function bookmarkTrack(track, item = {}) {
  await Store.saveBookmark({
    id: `track:${track.path}`,
    type: 'track',
    year: String(item.year || '').replace(/-.*/, ''),
    folder: item.folder || folderFromPath(track.path),
    title: track.title,
    path: track.path,
    url: track.url
  });
  Render.log('FILE SAVED TO BOOKSHELF');
}

async function blobsForTracks(tracks, progress) {
  const out = [];
  for (let i = 0; i < tracks.length; i++) {
    const track = tracks[i];
    const blob = await Network.fetchBlob(track.fallbackUrls || track.url);
    out.push({ name: `${String(i + 1).padStart(2, '0')} ${safeName(track.title)}.mp3`, blob });
    progress?.(i + 1, tracks.length);
  }
  return out;
}

function folderFromPath(path) {
  return String(path || '').split('/').slice(1, -1).join('/');
}

function saveUrl(url, filename) {
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  saveUrl(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
