// B"H
// IndexedDB becomes the quiet ark; localStorage remains the emergency candle.
const DB_NAME = "awtsmoos-mitzvah-pushkuh";
const STORE = "entries";
const META = "meta";
const VERSION = 1;
const FALLBACK_KEY = "awtsmoos.mitzvahPushkuh.entries.v5";
const LEGACY_KEYS = [
  "awtsmoos.mitzvahPushkuh.entries.v5",
  "awtsmoos.mitzvahPushkuh.entries.v4",
  "awtsmoos.mitzvahPushkuh.entries.v3"
];

export async function loadPersistedEntries() {
  try {
    const db = await openDb();
    await migrateLegacy(db);
    return await getAll(db);
  } catch (error) {
    console.warn("IndexedDB unavailable; using localStorage fallback", error);
    return loadFallback();
  }
}

export async function savePersistedEntries(entries) {
  try {
    const db = await openDb();
    await replaceAll(db, entries);
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(entries));
    return { ok: true, driver: "indexeddb" };
  } catch (error) {
    localStorage.setItem(FALLBACK_KEY, JSON.stringify(entries));
    return { ok: false, driver: "localStorage", error };
  }
}

export async function clearPersistedEntries() {
  try {
    const db = await openDb();
    await clearStore(db);
  } finally {
    localStorage.setItem(FALLBACK_KEY, "[]");
  }
}

function openDb() {
  return new Promise((resolve, reject) => {
    if (!globalThis.indexedDB) return reject(new Error("indexedDB missing"));
    const request = indexedDB.open(DB_NAME, VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE, { keyPath: "id" });
      if (!db.objectStoreNames.contains(META)) db.createObjectStore(META, { keyPath: "key" });
    };
  });
}

async function migrateLegacy(db) {
  const migrated = await getMeta(db, "legacyMigrated");
  if (migrated?.value) return;
  const legacy = loadFallback();
  if (legacy.length) await replaceAll(db, legacy);
  await putMeta(db, { key: "legacyMigrated", value: true, at: new Date().toISOString() });
}

function getAll(db) {
  return txPromise(db, STORE, "readonly", store => store.getAll());
}

function replaceAll(db, entries) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    store.clear();
    entries.forEach(entry => store.put(entry));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

function clearStore(db) {
  return txPromise(db, STORE, "readwrite", store => store.clear());
}

function getMeta(db, key) {
  return txPromise(db, META, "readonly", store => store.get(key));
}

function putMeta(db, row) {
  return txPromise(db, META, "readwrite", store => store.put(row));
}

function txPromise(db, storeName, mode, action) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, mode);
    const request = action(tx.objectStore(storeName));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.onerror = () => reject(tx.error);
  });
}

function loadFallback() {
  for (const key of LEGACY_KEYS) {
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const rows = JSON.parse(raw);
      if (Array.isArray(rows)) return rows;
    } catch {}
  }
  return [];
}
