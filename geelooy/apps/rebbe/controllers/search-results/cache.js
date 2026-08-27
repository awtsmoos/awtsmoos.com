//B"H
import * as Store from '../../store.js';
import * as Render from '../../render.js';
import { blobForTrack, trackTitle } from '../../modules/download/files.js';
import { bookmarkResult, bookmarkTrack } from './bookmarks.js';
import { loadTracks } from './loader.js';

/**
 * B"H
 * Cache chamber. Remote audio descends into IndexedDB, and every successful
 * cache also receives a bookshelf memory so the offline vessel has a doorway.
 * @param {object} item Event item.
 * @param {Array<object>} tracks Optional preloaded tracks.
 * @returns {Promise<void>}
 */
export async function cacheEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to cache', true);
  for (let i = 0; i < files.length; i++) { await cacheTrack(files[i], item); Render.log(`Cached ${i + 1}/${files.length}`); }
  await bookmarkResult(item);
}

/** @param {object} track Track row. @param {object} item Event context. @returns {Promise<void>} */
export async function cacheTrack(track, item = {}) {
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
