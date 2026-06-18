// B"H
/**
 * @file IndexedDbSectorStore.js
 * @description Chapter 461: cold sector truth descends into browser earth,
 * waiting to be recalled without forcing all RAM to remember at once.
 */
export class IndexedDbSectorStore {
  constructor({ dbName = "awtsmoos-mitzvah-world", storeName = "sector_payloads", version = 1, indexedDBRef = globalThis.indexedDB } = {}) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.version = version;
    this.indexedDB = indexedDBRef;
    this.dbPromise = null;
  }
  async db() {
    if (!this.indexedDB) throw new Error("IndexedDB unavailable");
    if (this.dbPromise) return this.dbPromise;
    this.dbPromise = new Promise((resolve, reject) => {
      const req = this.indexedDB.open(this.dbName, this.version);
      req.onupgradeneeded = () => {
        if (!req.result.objectStoreNames.contains(this.storeName)) req.result.createObjectStore(this.storeName, { keyPath: "key" });
      };
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });
    return this.dbPromise;
  }
  makeKey({ worldId = "default", sectorId, kind, version = "v1" }) {
    return `${worldId}:${sectorId}:${kind}:${version}`;
  }
  async tx(mode, fn) {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(this.storeName, mode);
      const req = fn(tx.objectStore(this.storeName));
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result?.payload ?? req.result ?? null);
    });
  }
  async put(args) {
    await this.tx("readwrite", store => store.put({ key: this.makeKey(args), payload: args.payload, at: Date.now() }));
    return true;
  }
  async get(args) { return this.tx("readonly", store => store.get(this.makeKey(args))); }
  async delete(args) {
    await this.tx("readwrite", store => store.delete(this.makeKey(args)));
    return true;
  }
}
export default IndexedDbSectorStore;
