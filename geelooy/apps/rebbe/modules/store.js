//B"H
import { normalizePlaylistItems, playlistItemKey, playlistStatsSnapshot } from './playlist/model.js';

export const YEARS = {
  "5711":"5711-1764816569","5712":"5712-1764816569","5713":"5713-1764816569","5714":"5714-1764816569","5715":"5715-1764816569","5716":"5716-1764816569","5717":"5717-1764816569","5718":"5718-1764816569","5719":"5719-1764816569","5720":"5720-1764816569","5721":"5721-1764816569","5722":"5722-1764816569","5723":"5723-1764816569","5724":"5724-1764816569","5725":"5725-1764816569","5726":"5726-1764816569","5727":"5727-1764816569","5728":"5728-1764816569","5729":"5729-1764816569","5730":"5730-1764805608","5732":"5732-1764805608","5733":"5733-1764805608","5734":"5734-1764805608","5735":"5735-1764805608","5736":"5736-1764805608","5737":"5737-1764805608","5738":"5738-1764805608","5739":"5739-1764805608","5740":"5740-1764759611","5741":"5741-1764759611","5742":"5742-1764759611","5743":"5743-1764759611","5744":"5744-1764882096","5745":"5745-1764882096","5746":"5746-1764882096","5747":"5747-1764759611","5748":"5748-1764805608","5749":"5749-1764833216","5750":"5750-1764833216","5751":"5751-1764833216","5752":"5752-1764833216"
};

const DB_NAME = 'RebbeArchiveCore';
const DB_VERSION = 5;
const FALLBACK_SEARCH_HISTORY = 'rebbe-search-history-v1';
let db = null;

/** B"H: One indexed palace for tracks, bookmarks, searches, and playlists. */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => ensureStores(event.target.result);
    request.onsuccess = event => { db = event.target.result; resolve(); };
    request.onerror = event => reject(event);
  });
}

export async function saveTrack(path, blob) { if (db && path) return put('tracks', { path, blob, size: blob?.size || 0, updatedAt: Date.now() }); }
export async function getTrack(path) { const row = db && path ? await get('tracks', path) : null; return row ? row.blob : null; }
export async function isCached(path) { return Boolean(await getTrack(path)); }
export async function removeTrack(path) { if (db && path) return del('tracks', path); }
export async function removeTracks(paths = []) { for (const path of paths) await removeTrack(path); }
export async function listCachedTracks() { return db ? await all('tracks') : []; }
export async function cacheStats(paths = []) { const rows = await listCachedTracks(); const map = new Map(rows.map(row => [row.path, row])); const scoped = paths.length ? paths.map(path => map.get(path)).filter(Boolean) : rows; return { count: scoped.length, bytes: scoped.reduce((sum, row) => sum + (row.size || row.blob?.size || 0), 0) }; }
export async function saveSearchIndex(key, data) { if (db) return put('searchCache', { key, data, timestamp: Date.now() }); }
export async function getSearchIndex(key) { const row = db ? await get('searchCache', key) : null; return row ? row.data : null; }
export async function saveBookmark(bookmark) { if (db && bookmark) return put('bookmarks', { ...bookmark, updatedAt: Date.now() }); }
export async function removeBookmark(id) { if (db) return del('bookmarks', id); }
export async function isBookmarked(id) { return Boolean(db && await get('bookmarks', id)); }
export async function listBookmarks() { return db ? sortFresh(await all('bookmarks')) : []; }
export async function clearBookmarks() { if (db) return clear('bookmarks'); }

export async function savePlaylist(playlist) {
  if (!db || !playlist) return;
  const now = Date.now();
  const old = playlist.id ? await getPlaylist(playlist.id) : null;
  const clean = normalizePlaylistRecord({
    id: playlist.id || `playlist:${now}:${Math.random().toString(36).slice(2)}`,
    title: cleanText(playlist.title || old?.title || 'Untitled Playlist') || 'Untitled Playlist',
    description: cleanText(playlist.description ?? old?.description ?? ''),
    artwork: playlist.artwork ?? old?.artwork ?? '',
    favorite: Boolean(playlist.favorite ?? old?.favorite),
    pinned: Boolean(playlist.pinned ?? old?.pinned),
    folder: cleanText(playlist.folder ?? old?.folder ?? ''),
    sortOrder: finiteNumber(playlist.sortOrder ?? old?.sortOrder, now),
    items: playlist.items || old?.items || [],
    createdAt: playlist.createdAt || old?.createdAt || now,
    updatedAt: playlist.keepUpdatedAt ? (old?.updatedAt || now) : now,
    lastPlayedAt: playlist.lastPlayedAt ?? old?.lastPlayedAt ?? 0,
    playhead: playlist.playhead || old?.playhead || { index: 0, time: 0 },
    playback: { shuffle: false, loop: 'off', ...(old?.playback || {}), ...(playlist.playback || {}) }
  });
  await put('playlists', clean);
  return clean;
}

export async function listPlaylists() { return db ? sortPlaylists((await all('playlists')).map(normalizePlaylistRecord)) : []; }
export async function getPlaylist(id) { const row = db ? await get('playlists', id) : null; return row ? normalizePlaylistRecord(row) : null; }
export async function removePlaylist(id) { if (db) return del('playlists', id); }
export async function clearPlaylists() { if (db) return clear('playlists'); }
export async function touchPlaylistPlayback(id, playhead = {}, playback = {}) { const playlist = await getPlaylist(id); return playlist ? savePlaylist({ ...playlist, playhead, playback: { ...(playlist.playback || {}), ...playback }, lastPlayedAt: Date.now() }) : null; }
export async function duplicatePlaylist(id) { const playlist = await getPlaylist(id); return playlist ? savePlaylist({ ...playlist, id: null, title: `${playlist.title} Copy`, createdAt: null, sortOrder: Date.now() }) : null; }
export async function addItemsToPlaylist(id, items = []) { const playlist = await getPlaylist(id); if (!playlist) return null; const map = new Map((playlist.items || []).map(item => [playlistItemKey(item), item])); normalizePlaylistItems(items).forEach(item => map.set(playlistItemKey(item), item)); return savePlaylist({ ...playlist, items: [...map.values()] }); }
export async function removeItemFromPlaylist(id, key) { const playlist = await getPlaylist(id); return playlist ? savePlaylist({ ...playlist, items: (playlist.items || []).filter(item => playlistItemKey(item) !== key) }) : null; }
export async function reorderPlaylistItem(id, from, to) { const playlist = await getPlaylist(id); if (!playlist) return null; const items = [...(playlist.items || [])]; const [moved] = items.splice(from, 1); if (!moved) return playlist; items.splice(clamp(to, 0, items.length), 0, moved); return savePlaylist({ ...playlist, items }); }
export async function reorderPlaylist(_id, from, to) { const rows = await listPlaylists(); const [moved] = rows.splice(from, 1); if (!moved) return rows; rows.splice(clamp(to, 0, rows.length), 0, moved); for (let i = 0; i < rows.length; i++) await savePlaylist({ ...rows[i], sortOrder: i, keepUpdatedAt: true }); return listPlaylists(); }
export async function moveItemsBetweenPlaylists(fromId, toId, keys = []) { const from = await getPlaylist(fromId); const to = await getPlaylist(toId); if (!from || !to) return null; const chosen = (from.items || []).filter(item => keys.includes(playlistItemKey(item))); await savePlaylist({ ...from, items: from.items.filter(item => !keys.includes(playlistItemKey(item))) }); return addItemsToPlaylist(toId, chosen); }
export async function mergePlaylists(targetId, sourceIds = []) { const target = await getPlaylist(targetId); if (!target) return null; const items = [...(target.items || [])]; for (const id of sourceIds) { const source = await getPlaylist(id); if (source?.items?.length) items.push(...source.items); } return savePlaylist({ ...target, items }); }
export async function playlistStats(playlist) { const snapshot = playlistStatsSnapshot(playlist); const paths = (playlist?.items || []).flatMap(item => [item.path, item.url, ...(item.fallbackUrls || [])]).filter(Boolean); const cached = await cacheStats(paths); return { ...snapshot, cachedCount: cached.count, cachedBytes: cached.bytes, lastPlayedAt: playlist?.lastPlayedAt || 0 }; }
export { playlistItemKey };

export async function saveSearchHistory(request, label) { const entry = normalizeHistoryEntry(request, label); if (!entry) return; if (db) await put('searchHistory', entry); saveSearchHistoryFallback(entry); return entry; }
export async function listSearchHistory() { const rows = db ? await all('searchHistory') : readSearchHistoryFallback(); const merged = new Map(readSearchHistoryFallback().map(item => [item.id, item])); rows.forEach(item => merged.set(item.id, item)); return sortFresh([...merged.values()]).slice(0, 18); }
export async function clearSearchHistory() { if (db) await clear('searchHistory'); localStorage.removeItem(FALLBACK_SEARCH_HISTORY); }
export async function clearAllTracks() { if (!db) return; await clear('tracks'); await clear('searchCache'); }

function normalizePlaylistRecord(row = {}) {
  const items = normalizePlaylistItems(row.items || []);
  const stats = playlistStatsSnapshot({ items });
  return { ...row, items, stats, updatedAt: row.updatedAt || Date.now(), createdAt: row.createdAt || Date.now(), playback: { shuffle: false, loop: 'off', ...(row.playback || {}) }, playhead: row.playhead || { index: 0, time: 0 } };
}
function ensureStores(database) { ['tracks:path', 'searchCache:key', 'bookmarks:id', 'searchHistory:id', 'playlists:id'].forEach(spec => { const [name, keyPath] = spec.split(':'); if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath }); }); }
function cleanText(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
function finiteNumber(value, fallback) { const n = Number(value); return Number.isFinite(n) ? n : fallback; }
function normalizeHistoryEntry(request, label) { if (!request) return null; const clean = JSON.parse(JSON.stringify(request)); return { id: stableId(clean), request: clean, label: label || describeRequest(clean), updatedAt: Date.now() }; }
function stableId(value) { return 'search:' + JSON.stringify(value).replace(/\s+/g, ' ').slice(0, 260); }
function describeRequest(request) { const parts = []; if (request.keyword) parts.push(`“${request.keyword}”`); ['year', 'month', 'day'].forEach(kind => { const value = request[kind]; if (!value) return; if (typeof value === 'object' && (value.from || value.to)) parts.push(`${kind} ${value.from || '*'}-${value.to || '*'}`); else if (value) parts.push(`${kind} ${value}`); }); return parts.join(' // ') || 'Search'; }
function saveSearchHistoryFallback(entry) { const rows = readSearchHistoryFallback().filter(item => item.id !== entry.id); rows.unshift(entry); localStorage.setItem(FALLBACK_SEARCH_HISTORY, JSON.stringify(rows.slice(0, 18))); }
function readSearchHistoryFallback() { try { return JSON.parse(localStorage.getItem(FALLBACK_SEARCH_HISTORY) || '[]'); } catch { return []; } }
function sortFresh(rows) { return rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); }
function sortPlaylists(rows) { return rows.sort((a, b) => { const ao = finiteNumber(a.sortOrder, Number.MAX_SAFE_INTEGER); const bo = finiteNumber(b.sortOrder, Number.MAX_SAFE_INTEGER); return ao === bo ? (b.updatedAt || 0) - (a.updatedAt || 0) : ao - bo; }); }
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function tx(storeName, mode) { return db.transaction(storeName, mode).objectStore(storeName); }
function put(storeName, value) { return req(tx(storeName, 'readwrite').put(value)); }
function get(storeName, key) { return req(tx(storeName, 'readonly').get(key)); }
function del(storeName, key) { return req(tx(storeName, 'readwrite').delete(key)); }
function clear(storeName) { return req(tx(storeName, 'readwrite').clear()); }
function all(storeName) { return req(tx(storeName, 'readonly').getAll()); }
function req(request) { return new Promise((resolve, reject) => { request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); }); }
