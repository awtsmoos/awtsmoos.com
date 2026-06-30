//B"H
import * as Network from '../../modules/network.js';
import * as Render from '../../render.js';
import { titleOf } from '../../modules/download/files.js';

const trackListCache = new Map();

/**
 * B"H
 * Loader chamber. Search cards and playlist shells both ask this one gate to
 * unfold an event into playable tracks, so cache and error language stay one.
 * @param {object} item Search/event item.
 * @returns {Promise<Array<object>>} Event tracks.
 */
export async function loadTracks(item) {
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
