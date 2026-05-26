//B"H
const DB_NAME = "BH_awtsmoos_ai_automation_archive";
const STORE = "messages";
const FALLBACK_KEY = "BH_awtsmoos_ai_automation_archive_fallback_v1";
const MAX_ARCHIVE_RECORDS = 500;
const MAX_ARCHIVE_TEXT_CHARS = 24000;
let fallbackMemory = [];

/**
 * IndexedDB-backed archive of assistant messages for automation graph reuse.
 * Falls back to localStorage/in-memory storage when IndexedDB is unavailable.
 */
export class AutomationArchiveStore {
  constructor(storage = localStorage) { this.storage = storage; }

  async add(entry = {}) {
    if (!entry.text) return null;
    const record = compactArchiveRecord({ id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`, createdAt: Date.now(), ...entry });
    if (!hasIndexedDb()) return fallbackAdd(this.storage, record);
    const db = await openDb();
    await txStore(db, "readwrite").add(record);
    return record;
  }

  async list(limit = MAX_ARCHIVE_RECORDS) {
    if (!hasIndexedDb()) return fallbackList(this.storage, limit);
    const db = await openDb();
    const all = await request(txStore(db, "readonly").getAll());
    const sorted = all.sort((a, b) => b.createdAt - a.createdAt).slice(0, Math.min(limit, MAX_ARCHIVE_RECORDS));
    return sorted.map(compactArchiveRecord);
  }

  async exportJson() { return JSON.stringify(await this.list(MAX_ARCHIVE_RECORDS), null, 2); }

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
  const next = [compactArchiveRecord(record), ...fallbackList(storage, MAX_ARCHIVE_RECORDS)].slice(0, MAX_ARCHIVE_RECORDS);
  fallbackWrite(storage, next);
  return record;
}

/**
 * B"H — trims archived replies before they harden into browser memory.
 *
 * The archive is for reuse, not for imprisoning every thunderous token forever.
 * Long assistant text is sliced with an explicit marker, preserving usefulness
 * while preventing storage from becoming a hidden heap of old lightning.
 *
 * @param {object} record Archive record.
 * @returns {object} Compact archive record.
 */
function compactArchiveRecord(record = {}) {
  const text = String(record.text || "");
  if (text.length <= MAX_ARCHIVE_TEXT_CHARS) return record;
  return { ...record, text: `${text.slice(0, MAX_ARCHIVE_TEXT_CHARS)}\n\n[Awtsmoos archive trimmed ${text.length - MAX_ARCHIVE_TEXT_CHARS} chars]`, trimmed: true, originalTextLength: text.length };
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
