//B"H
import { makeZip, safeName } from '../zip-store.js';
import { createDownloadTask } from './tasks.js';
import { blobForTrack, entryName, saveBlob } from './files.js';

/**
 * B"H
 * The ZIP river now flows from newest to oldest while every file keeps its
 * original name-number. The order may turn around, but `001` remains `001`.
 * @param {Array<object>} rows Audio or metadata rows.
 * @param {string} filename ZIP file name.
 * @param {string} title Progress card title.
 * @returns {Promise<void>}
 */
export async function downloadRowsAsZip(rows = [], filename = 'rebbe-files.zip', title = 'Zipping files newest-first') {
  const task = createDownloadTask(title);
  const zipRows = orderedZipRows(rows);
  const files = [];
  const skipped = [];

  for (let i = 0; i < zipRows.length; i++) {
    const row = zipRows[i];
    task.step(i, zipRows.length, row.meta ? 'Adding metadata' : `Fetching ${i + 1} of ${zipRows.length}`, statusName(row));
    try {
      files.push(row.meta ? metaFile(row) : { name: entryName(row), blob: await blobForTrack(row.track) });
    } catch (error) {
      skipped.push(`${entryName(row)} — ${error.message || 'failed'}`);
    }
  }

  if (!files.length) return task.fail('Download failed', ['Every file failed or was blocked.']);
  task.step(zipRows.length, zipRows.length, 'Building ZIP vessel', `${files.length} files · ${skipped.length} skipped`);
  saveBlob(await makeZip(files), filename);
  task.done('ZIP ready', [`${files.length} files zipped newest-first`, `${skipped.length} skipped`, ...skipped.slice(0, 8)]);
}

export async function playlistExportRows(playlist = {}, expandEvent) {
  const rows = await playlistAudioRows(playlist, expandEvent);
  rows.push({ meta: true, name: 'playlist-manifest.json', text: JSON.stringify(playlistManifest(playlist), null, 2), type: 'application/json' });
  rows.push({ meta: true, name: 'playlist-metadata.txt', text: playlistMetadata(playlist), type: 'text/plain' });
  rows.push({ meta: true, name: 'playlist-artwork.svg', text: playlistArtwork(playlist), type: 'image/svg+xml' });
  return rows;
}

export async function playlistAudioRows(playlist = {}, expandEvent) {
  const rows = [];
  for (const item of playlist.items || []) {
    if (isPlayableItem(item)) rows.push({ item: item.event || item, track: trackFromPlaylistItem(item), trackIndex: rows.length + 1 });
    else if (item?.year && item?.folder && expandEvent) {
      const tracks = await expandEvent(item);
      tracks.forEach(track => rows.push({ item, track, trackIndex: rows.length + 1 }));
    }
  }
  return rows;
}

export function playlistZipName(playlist = {}) {
  return `${safeName(playlist.title || 'playlist')}.zip`;
}

function orderedZipRows(rows = []) {
  const audioRows = rows.filter(row => !row?.meta).slice().reverse();
  const metaRows = rows.filter(row => row?.meta);
  return [...audioRows, ...metaRows];
}

function metaFile(row) {
  return { name: safeName(row.name || 'metadata.txt'), blob: new Blob([row.text || ''], { type: row.type || 'text/plain' }) };
}

function statusName(row) {
  return row.name || row.track?.title || row.track?.name || row.item?.title || 'audio';
}

function trackFromPlaylistItem(item) {
  const source = item.track || item;
  return { ...source, title: item.title || source.title, path: item.path || source.path, url: item.url || source.url, fallbackUrls: item.fallbackUrls || source.fallbackUrls || [], playlistItem: item };
}

function isPlayableItem(item) {
  return Boolean(item?.path || item?.url || item?.fallbackUrls?.length || item?.track?.path || item?.track?.url || item?.track?.fallbackUrls?.length);
}

function playlistManifest(playlist) {
  return { id: playlist.id, title: playlist.title, description: playlist.description || '', exportedAt: new Date().toISOString(), count: (playlist.items || []).length, items: playlist.items || [] };
}

function playlistMetadata(playlist) {
  return [`Playlist: ${playlist.title}`, `Items: ${(playlist.items || []).length}`, `Last played: ${playlist.lastPlayedAt ? new Date(playlist.lastPlayedAt).toISOString() : 'never'}`].join('\n');
}

function playlistArtwork(playlist) {
  const title = escapeHtml(playlist.title || 'Playlist');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1200"><rect width="1200" height="1200" fill="#02090b"/><circle cx="260" cy="300" r="220" fill="#00f3ff" opacity=".28"/><circle cx="880" cy="780" r="260" fill="#ffcc00" opacity=".22"/><text x="90" y="610" fill="#fff" font-size="84" font-family="monospace" font-weight="900">${title}</text></svg>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}
