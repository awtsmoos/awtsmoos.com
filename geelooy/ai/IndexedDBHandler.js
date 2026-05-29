//B"H
/**
 * B"H
 * Chapter 169: The Indexed Gate Opened A Side Door While The Palace Slept.
 *
 * IndexedDB can be blocked by old Chrome contexts. The cockpit must still boot,
 * stream, stop, render tools, and ask for keys. This keeper tries IndexedDB
 * first, then falls back to localStorage-backed stores without deleting a byte
 * of the original database.
 */
class IndexedDBHandler {
  constructor(dbName) {
    this.dbName = dbName;
    this.db = null;
    this.degraded = false;
    this.openPromise = null;
    this.upgradeQueue = Promise.resolve();
  }

  async Koysayv(storeName, key, value) { return await this.write(storeName, key, value); }
  async Laynin(storeName, key) { return await this.read(storeName, key); }

  async init({ timeoutMs = 2500 } = {}) {
    if (this.db || this.degraded) return this.db;
    if (!this.openPromise) this.openPromise = this.open();
    try {
      this.db = await withTimeout(this.openPromise, timeoutMs, `IndexedDB ${this.dbName} open`);
      return this.db;
    } catch (error) {
      this.degraded = true;
      console.warn(`B"H IndexedDB fallback active for ${this.dbName}:`, error?.message || error);
      this.openPromise.then(db => { this.db = db; this.degraded = false; }).catch(() => {});
      return null;
    }
  }

  async ensureStore(storeName) {
    await this.init();
    if (this.degraded) return;
    if (this.hasStore(storeName)) return;
    this.upgradeQueue = this.upgradeQueue.then(() => this.upgradeForStore(storeName));
    return await this.upgradeQueue;
  }

  async write(storeName, key, value) {
    await this.ensureStore(storeName);
    if (this.degraded) return fallbackWrite(this.dbName, storeName, key, value);
    return await this.withStore(storeName, "readwrite", store => store.put({ key, value }));
  }

  async read(storeName, key) {
    await this.ensureStore(storeName);
    if (this.degraded) return fallbackRead(this.dbName, storeName, key);
    const row = await this.withStore(storeName, "readonly", store => store.get(key));
    return row ? row.value : null;
  }

  async getAllKeys(storeName) {
    const data = await this.getAllData(storeName);
    return data.map(row => Object.keys(row)[0]);
  }

  async getAllStoreNames() {
    await this.init();
    if (this.degraded) return fallbackStoreNames(this.dbName);
    return Array.from(this.db.objectStoreNames);
  }

  async getAllData(storeName) {
    await this.ensureStore(storeName);
    if (this.degraded) return fallbackRows(this.dbName, storeName);
    return await this.cursorRows(storeName);
  }

  async renameFile(storeName, oldKey, newKey) {
    const value = await this.read(storeName, oldKey);
    if (!value) throw new Error(`Key "${oldKey}" does not exist.`);
    await this.write(storeName, newKey, value);
    await this.delete(storeName, oldKey);
  }

  async deleteFile(storeName, key) { return await this.delete(storeName, key); }

  async delete(storeName, key) {
    await this.ensureStore(storeName);
    if (this.degraded) return fallbackDelete(this.dbName, storeName, key);
    return await this.withStore(storeName, "readwrite", store => store.delete(key));
  }

  async clearStore(storeName) {
    await this.ensureStore(storeName);
    if (this.degraded) return fallbackClear(this.dbName, storeName);
    return await this.withStore(storeName, "readwrite", store => store.clear());
  }

  hasStore(storeName) { return Boolean(this.db?.objectStoreNames?.contains?.(storeName)); }

  open(version = undefined) {
    return new Promise((resolve, reject) => {
      const request = version ? indexedDB.open(this.dbName, version) : indexedDB.open(this.dbName);
      request.onerror = event => reject(event.target.error);
      request.onblocked = () => console.warn(`IndexedDB open blocked for ${this.dbName}`);
      request.onupgradeneeded = event => ensureDefaultStore(event.target.result);
      request.onsuccess = event => resolve(wireDb(event.target.result));
    });
  }

  async upgradeForStore(storeName) {
    await this.init();
    if (this.degraded || this.hasStore(storeName)) return;
    const nextVersion = Number(this.db.version || 1) + 1;
    this.db.close();
    this.db = null;
    this.openPromise = null;
    this.db = await this.openWithStore(nextVersion, storeName);
  }

  openWithStore(version, storeName) {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, version);
      request.onerror = event => reject(event.target.error);
      request.onblocked = () => console.warn(`IndexedDB upgrade blocked while creating ${storeName}`);
      request.onupgradeneeded = event => {
        const db = event.target.result;
        ensureDefaultStore(db);
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName, { keyPath: "key" });
      };
      request.onsuccess = event => resolve(wireDb(event.target.result));
    });
  }

  withStore(storeName, mode, makeRequest) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(storeName, mode);
      const request = makeRequest(tx.objectStore(storeName));
      request.onerror = event => reject(event.target.error);
      request.onsuccess = () => resolve(request.result);
      tx.onerror = event => reject(event.target.error);
    });
  }

  cursorRows(storeName) {
    return new Promise((resolve, reject) => {
      const rows = [];
      const request = this.db.transaction(storeName, "readonly").objectStore(storeName).openCursor();
      request.onerror = event => reject(event.target.error);
      request.onsuccess = event => {
        const cursor = event.target.result;
        if (!cursor) return resolve(rows);
        rows.push({ [cursor.value.key]: cursor.value.value });
        cursor.continue();
      };
    });
  }
}

function withTimeout(promise, ms, label) {
  return Promise.race([promise, new Promise((_, reject) => setTimeout(() => reject(new Error(`${label} timed out`)), ms))]);
}
function fallbackKey(dbName, storeName) { return `BH_IDB_FALLBACK:${dbName}:${storeName}`; }
function fallbackObject(dbName, storeName) { try { return JSON.parse(localStorage.getItem(fallbackKey(dbName, storeName)) || "{}"); } catch { return {}; } }
function saveFallbackObject(dbName, storeName, value) { localStorage.setItem(fallbackKey(dbName, storeName), JSON.stringify(value)); }
function fallbackWrite(dbName, storeName, key, value) { const data = fallbackObject(dbName, storeName); data[key] = value; saveFallbackObject(dbName, storeName, data); return true; }
function fallbackRead(dbName, storeName, key) { return fallbackObject(dbName, storeName)[key] ?? null; }
function fallbackRows(dbName, storeName) { return Object.entries(fallbackObject(dbName, storeName)).map(([key, value]) => ({ [key]: value })); }
function fallbackDelete(dbName, storeName, key) { const data = fallbackObject(dbName, storeName); delete data[key]; saveFallbackObject(dbName, storeName, data); return true; }
function fallbackClear(dbName, storeName) { localStorage.removeItem(fallbackKey(dbName, storeName)); return true; }
function fallbackStoreNames(dbName) { return Object.keys(localStorage).filter(key => key.startsWith(`BH_IDB_FALLBACK:${dbName}:`)).map(key => key.split(":").pop()); }
function wireDb(db) { db.onversionchange = () => db.close(); return db; }
function ensureDefaultStore(db) { if (!db.objectStoreNames.contains("default")) db.createObjectStore("default", { keyPath: "key" }); }

export default IndexedDBHandler;
