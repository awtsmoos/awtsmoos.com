//B"H
export const YEARS = {
  "5711":"5711-1764816569","5712":"5712-1764816569","5713":"5713-1764816569",
  "5714":"5714-1764816569","5715":"5715-1764816569","5716":"5716-1764816569",
  "5717":"5717-1764816569","5718":"5718-1764816569","5719":"5719-1764816569",
  "5720":"5720-1764816569","5721":"5721-1764816569","5722":"5722-1764816569",
  "5723":"5723-1764816569","5724":"5724-1764816569","5725":"5725-1764816569",
  "5726":"5726-1764816569","5727":"5727-1764816569","5728":"5728-1764816569",
  "5729":"5729-1764816569","5730":"5730-1764805608","5732":"5732-1764805608",
  "5733":"5733-1764805608","5734":"5734-1764805608","5735":"5735-1764805608",
  "5736":"5736-1764805608","5737":"5737-1764805608","5738":"5738-1764805608",
  "5739":"5739-1764805608","5740":"5740-1764759611","5741":"5741-1764759611",
  "5742":"5742-1764759611","5743":"5743-1764759611","5744":"5744-1764882096",
  "5745":"5745-1764882096","5746":"5746-1764882096","5747":"5747-1764759611",
  "5748":"5748-1764805608","5749":"5749-1764833216","5750":"5750-1764833216",
  "5751":"5751-1764833216","5752":"5752-1764833216"
};

const DB_NAME = 'RebbeArchiveCore';
const DB_VERSION = 4;
const FALLBACK_SEARCH_HISTORY = 'rebbe-search-history-v1';
let db = null;

/**
 * B"H
 * Opens the IndexedDB vessel. The Awtsmoos engraves tracks, date scrolls,
 * bookshelf memories, and now search-history constellations with range gates.
 * @returns {Promise<void>}
 */
export function initDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = event => ensureStores(event.target.result);
    request.onsuccess = event => { db = event.target.result; resolve(); };
    request.onerror = event => reject(event);
  });
}

export async function saveTrack(path, blob) { if (db) return put('tracks', { path, blob }); }
export async function getTrack(path) { const row = db ? await get('tracks', path) : null; return row ? row.blob : null; }
export async function isCached(path) { return Boolean(await getTrack(path)); }
export async function saveSearchIndex(key, data) { if (db) return put('searchCache', { key, data, timestamp: Date.now() }); }
export async function getSearchIndex(key) { const row = db ? await get('searchCache', key) : null; return row ? row.data : null; }
export async function saveBookmark(bookmark) { if (db && bookmark) return put('bookmarks', { ...bookmark, updatedAt: Date.now() }); }
export async function removeBookmark(id) { if (db) return del('bookmarks', id); }
export async function isBookmarked(id) { return Boolean(db && await get('bookmarks', id)); }
export async function listBookmarks() { return db ? sortFresh(await all('bookmarks')) : []; }
export async function clearBookmarks() { if (db) return clear('bookmarks'); }

export async function saveSearchHistory(request, label) {
  const entry = normalizeHistoryEntry(request, label);
  if (!entry) return;
  if (db) await put('searchHistory', entry);
  saveSearchHistoryFallback(entry);
  return entry;
}

export async function listSearchHistory() {
  const rows = db ? await all('searchHistory') : readSearchHistoryFallback();
  const merged = new Map(readSearchHistoryFallback().map(item => [item.id, item]));
  rows.forEach(item => merged.set(item.id, item));
  return sortFresh([...merged.values()]).slice(0, 18);
}

export async function clearSearchHistory() {
  if (db) await clear('searchHistory');
  localStorage.removeItem(FALLBACK_SEARCH_HISTORY);
}

export async function clearAllTracks() {
  if (!db) return;
  await clear('tracks');
  await clear('searchCache');
}

function ensureStores(database) {
  ['tracks:path', 'searchCache:key', 'bookmarks:id', 'searchHistory:id'].forEach(spec => {
    const [name, keyPath] = spec.split(':');
    if (!database.objectStoreNames.contains(name)) database.createObjectStore(name, { keyPath });
  });
}

function normalizeHistoryEntry(request, label) {
  if (!request) return null;
  const clean = JSON.parse(JSON.stringify(request));
  const id = stableId(clean);
  return { id, request: clean, label: label || describeRequest(clean), updatedAt: Date.now() };
}

function stableId(value) {
  return 'search:' + JSON.stringify(value).replace(/\s+/g, ' ').slice(0, 260);
}

function describeRequest(request) {
  const parts = [];
  if (request.keyword) parts.push(`“${request.keyword}”`);
  ['year', 'month', 'day'].forEach(kind => {
    const value = request[kind];
    if (!value) return;
    if (typeof value === 'object' && (value.from || value.to)) parts.push(`${kind} ${value.from || '*'}-${value.to || '*'}`);
    else if (value) parts.push(`${kind} ${value}`);
  });
  return parts.join(' // ') || 'Search';
}

function saveSearchHistoryFallback(entry) {
  const rows = readSearchHistoryFallback().filter(item => item.id !== entry.id);
  rows.unshift(entry);
  localStorage.setItem(FALLBACK_SEARCH_HISTORY, JSON.stringify(rows.slice(0, 18)));
}

function readSearchHistoryFallback() {
  try { return JSON.parse(localStorage.getItem(FALLBACK_SEARCH_HISTORY) || '[]'); }
  catch { return []; }
}

function sortFresh(rows) { return rows.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)); }
function tx(storeName, mode) { return db.transaction(storeName, mode).objectStore(storeName); }
function put(storeName, value) { return promisify(tx(storeName, 'readwrite').put(value), value); }
function get(storeName, key) { return promisify(tx(storeName, 'readonly').get(key), null); }
function all(storeName) { return promisify(tx(storeName, 'readonly').getAll(), []); }
function del(storeName, key) { return promisify(tx(storeName, 'readwrite').delete(key)); }
function clear(storeName) { return promisify(tx(storeName, 'readwrite').clear()); }

function promisify(req, fallback) {
  return new Promise(resolve => {
    req.onsuccess = () => resolve(req.result === undefined ? fallback : req.result);
    req.onerror = () => resolve(fallback);
  });
}
