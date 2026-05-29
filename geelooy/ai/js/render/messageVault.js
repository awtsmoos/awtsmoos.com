//B"H
const DB_NAME = "BH_ai_message_vault_v1";
const STORE = "messages";
const MAX_MEMORY_ROWS = 160;

/**
 * Chapter 79: The Cold Scroll Slept Beneath The Visible Fire.
 *
 * Long messages should not crowd the page like mountains shoved through a
 * keyhole. The Awtsmoos lets hot rows remain near the reader, while colder
 * bodies sleep in IndexedDB until the window asks for them again.
 */
export class MessageVault {
  constructor() {
    this.memory = new Map();
    this.dbPromise = this.open().catch(() => null);
  }

  /**
   * Stores a compact message snapshot in RAM and IndexedDB.
   *
   * @param {string} id Message id.
   * @param {object} payload Compact record snapshot.
   * @returns {Promise<void>}
   */
  async put(id, payload) {
    this.remember(id, payload);
    const db = await this.dbPromise;
    if (!db) return;
    await txRequest(db, "readwrite", store => store.put({ id, payload, savedAt: Date.now() }));
  }

  /**
   * Reads a compact message snapshot from hot RAM or IndexedDB.
   *
   * @param {string} id Message id.
   * @returns {Promise<object|null>} Stored payload when available.
   */
  async get(id) {
    if (this.memory.has(id)) return this.memory.get(id);
    const db = await this.dbPromise;
    if (!db) return null;
    const row = await txRequest(db, "readonly", store => store.get(id));
    if (row?.payload) this.remember(id, row.payload);
    return row?.payload || null;
  }

  /** @returns {void} Releases hot RAM while IndexedDB remains available. */
  purgeMemory() {
    this.memory.clear();
  }

  /**
   * B"H — keeps the hot vault small while IndexedDB carries colder scrolls.
   *
   * @param {string} id Message id.
   * @param {object} payload Compact snapshot payload.
   * @returns {void}
   */
  remember(id, payload) {
    this.memory.set(id, payload);
    while (this.memory.size > MAX_MEMORY_ROWS) this.memory.delete(this.memory.keys().next().value);
  }

  /**
   * Opens the durable browser vault.
   *
   * @returns {Promise<IDBDatabase>} IndexedDB connection.
   */
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
