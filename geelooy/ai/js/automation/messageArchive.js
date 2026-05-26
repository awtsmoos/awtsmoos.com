//B"H
const DB_NAME = "BH_awtsmoos_ai_automation_archive";
const STORE = "messages";
const FALLBACK_KEY = "BH_awtsmoos_ai_automation_archive_fallback_v1";
let fallbackMemory = [];

/**
 * IndexedDB-backed archive of assistant messages for automation graph reuse.
 * Falls back to localStorage/in-memory storage when IndexedDB is unavailable.
 */
export class AutomationArchiveStore {
  constructor(storage = localStorage) { this.storage = storage; }

  async add(entry = {}) {
    if (!entry.text) return null;
    const record = { id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now(), ...entry };
    if (!hasIndexedDb()) return fallbackAdd(this.storage, record);
    const db = await openDb();
    await txStore(db, "readwrite").add(record);
    return record;
  }

  async list(limit = 500) {
    if (!hasIndexedDb()) return fallbackList(this.storage, limit);
    const db = await openDb();
    const all = await request(txStore(db, "readonly").getAll());
    return all.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
  }

  async exportJson() { return JSON.stringify(await this.list(5000), null, 2); }

  async clear() {
    if (!hasIndexedDb()) return fallbackWrite(this.storage, []);
    const db = await openDb();
    await request(txStore(db, "readwrite").clear());
  }
}

function hasIndexedDb() { return typeof indexedDB !== "undefined" && indexedDB?.open; }

function fallbackList(storage, limit = 500) {
  if (isRealLocalStorage(storage)) {
    try { return JSON.parse(storage.getItem(FALLBACK_KEY) || "[]").sort((a, b) => b.createdAt - a.createdAt).slice(0, limit); }
    catch { return []; }
  }
  return fallbackMemory.sort((a, b) => b.createdAt - a.createdAt).slice(0, limit);
}

function fallbackAdd(storage, record) {
  const next = [record, ...fallbackList(storage, 5000)].slice(0, 5000);
  fallbackWrite(storage, next);
  return record;
}

function fallbackWrite(storage, items) {
  if (isRealLocalStorage(storage)) {
    try { storage.setItem(FALLBACK_KEY, JSON.stringify(items)); } catch {}
    return;
  }
  fallbackMemory = items;
}

function isRealLocalStorage(storage) {
  return typeof window !== "undefined" && storage === window.localStorage;
}

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txStore(db, mode) { return db.transaction(STORE, mode).objectStore(STORE); }
function request(req) { return new Promise((resolve, reject) => { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); }); }

export function downloadTextFile(name, text, type = "application/json") {
  const href = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 30000);
}

export const automationArchiveStore = new AutomationArchiveStore();
