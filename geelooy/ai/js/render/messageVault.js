//B"H
const DB_NAME = "BH_ai_message_vault_v1";
const STORE = "messages";

/**
 * A tiny IndexedDB vault for heavy message bodies.
 * Long sparks leave the DOM, rest in browser storage, and return when scrolled near.
 */
export class MessageVault {
  constructor() {
    this.memory = new Map();
    this.dbPromise = this.open().catch(() => null);
  }

  async put(id, payload) {
    this.memory.set(id, payload);
    const db = await this.dbPromise;
    if (!db) return;
    await txRequest(db, "readwrite", store => store.put({ id, payload, savedAt: Date.now() }));
  }

  async get(id) {
    if (this.memory.has(id)) return this.memory.get(id);
    const db = await this.dbPromise;
    if (!db) return null;
    const row = await txRequest(db, "readonly", store => store.get(id));
    if (row?.payload) this.memory.set(id, row.payload);
    return row?.payload || null;
  }

  open() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE, { keyPath: "id" });
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
}

function txRequest(db, mode, fn) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const request = fn(tx.objectStore(STORE));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
