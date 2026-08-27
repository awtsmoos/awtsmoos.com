//B"H
import * as Store from '../../store.js';
import * as Render from '../../render.js';
import { folderFromPath, titleOf, trackTitle } from '../../modules/download/files.js';

/**
 * B"H
 * Bookmark chamber. Events and tracks enter the bookshelf with stable ids, so
 * saved sparks can reopen the right year, folder, and file.
 * @param {object} item Event item.
 * @returns {Promise<void>}
 */
export async function bookmarkResult(item) {
  if (!item?.year || !item?.folder) return;
  await Store.saveBookmark({ id: `folder:${item.year}:${item.folder}`, type: 'folder', year: String(item.year), folder: item.folder, title: titleOf(item) });
  Render.log('Event saved to bookshelf');
}

/** @param {object} track Track row. @param {object} item Event context. @returns {Promise<void>} */
export async function bookmarkTrack(track, item = {}) {
  const id = `track:${track.path || track.url || trackTitle(track)}`;
  await Store.saveBookmark({ id, type: 'track', year: String(item.year || '').replace(/-.*/, ''), folder: item.folder || folderFromPath(track.path), title: trackTitle(track), path: track.path, url: track.url });
  Render.log('File saved to bookshelf');
}
