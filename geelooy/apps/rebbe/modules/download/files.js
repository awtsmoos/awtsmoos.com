//B"H
import * as Network from '../network.js';
import { safeName } from '../zip-store.js';

const blobCache = new Map();

/**
 * B"H
 * A file is a spark in exile. This helper finds its URL, names it with dignity,
 * and carries the bytes without making every caller learn the same route again.
 * @param {object} track Archive track row or playlist item.
 * @returns {Promise<Blob>} Downloadable blob.
 */
export async function blobForTrack(track = {}) {
  const key = cacheKey(track);
  if (blobCache.has(key)) return blobCache.get(key);
  const source = downloadSource(track);
  if (!source) throw new Error('No URL available');
  const promise = Network.fetchBlob(source);
  blobCache.set(key, promise);
  try {
    const blob = await promise;
    blobCache.set(key, blob);
    return blob;
  } catch (error) {
    blobCache.delete(key);
    throw error;
  }
}

export function directDownloadTrack(track = {}, item = {}) {
  const url = firstUrl(track);
  if (!url) throw new Error('No track URL');
  clickDownload(url, entryName({ item, track, trackIndex: 1 }), true);
}

export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  clickDownload(url, filename);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function entryName(row = {}) {
  const ext = extensionOf(row.track);
  const index = row.trackIndex || 1;
  const base = safeName(`${String(index).padStart(3, '0')} ${titleOf(row.item)} - ${trackTitle(row.track)}`);
  return base.toLowerCase().endsWith(ext.toLowerCase()) ? base : `${base}${ext}`;
}

export function titleOf(item) {
  return cleanName(item?.title || item?.folder || 'event');
}

export function trackTitle(track) {
  return cleanName(track?.title || track?.name || track?.path || 'audio');
}

export function folderFromPath(path) {
  return String(path || '').split('/').slice(1, -1).join('/');
}

function clickDownload(url, filename, external = false) {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  if (external) { anchor.target = '_blank'; anchor.rel = 'noopener noreferrer'; }
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

function downloadSource(track) {
  return track?.fallbackUrls?.length ? track.fallbackUrls : track?.url;
}

function firstUrl(track) {
  return track?.url || track?.fallbackUrls?.[0] || '';
}

function cacheKey(track) {
  return track?.path || track?.url || JSON.stringify(track?.fallbackUrls || []);
}

function extensionOf(track = {}) {
  const source = String(track.name || track.path || track.url || '');
  const match = source.match(/\.(mp3|m4a|wav|ogg|flac|aac)(?:$|[?#])/i);
  return match ? `.${match[1].toLowerCase()}` : '.mp3';
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
