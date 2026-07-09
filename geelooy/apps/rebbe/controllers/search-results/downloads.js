//B"H
import * as Render from '../../render.js';
import { safeName } from '../../modules/zip-store.js';
import { directDownloadTrack, titleOf } from '../../modules/download/files.js';
import { downloadRowsAsZip } from '../../modules/download/exports.js';
import { loadTracks } from './loader.js';

/**
 * B"H
 * Download chamber. One file says Download and descends alone. Many files say
 * ZIP and enter a newest-first vessel. No button lies about its garment.
 */
export async function downloadAllResults(results = []) {
  const rows = [];
  for (const item of results) (await loadTracks(item)).forEach(track => rows.push({ item, track, trackIndex: rows.length + 1 }));
  return downloadRowsAsZip(rows, `rebbe-search-results-${Date.now()}.zip`, 'Zipping search results newest-first');
}

/** @param {Array<object>} items Selected track items. @returns {Promise<void>} */
export async function downloadSelectedTracks(items = []) {
  const rows = items.map((item, i) => ({ item: item.event || item, track: item.track || item, trackIndex: i + 1 }));
  if (rows.length === 1) return downloadTrack(rows[0].track, rows[0].item);
  return downloadRowsAsZip(rows, `rebbe-selected-tracks-${Date.now()}.zip`, 'Zipping selected files newest-first');
}

/** @param {object} item Event item. @param {Array<object>} tracks Optional tracks. @returns {Promise<void>} */
export async function downloadEvent(item, tracks) {
  const files = tracks?.length ? tracks : await loadTracks(item);
  if (!files.length) return Render.log('No event files to download', true);
  if (files.length === 1) return downloadTrack(files[0], item);
  const rows = files.map((track, i) => ({ item, track, trackIndex: i + 1 }));
  return downloadRowsAsZip(rows, `${safeName(titleOf(item))}.zip`, `Zipping event newest-first: ${titleOf(item)}`);
}

/** @param {object} track Track row. @param {object} item Event context. @returns {Promise<void>} */
export async function downloadTrack(track, item = {}) {
  try { directDownloadTrack(track, item); }
  catch (error) { Render.log(error.message || 'No track URL', true); }
}
