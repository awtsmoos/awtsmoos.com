// B"H

/**
 * The Scribe of the Database, master of the IndexedDB rites.
 * This module provides a simple, promise-based interface to a persistent,
 * asynchronous data store, forming the bedrock of the application's memory.
 */

const DB_NAME = 'BrickBlastDB';
const STORE_NAME = 'keyval';
const DB_VERSION = 1;
let dbPromise = null;

function init() {
    if (dbPromise) {
        return dbPromise;
    }

    dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = (event) => {
            resolve(event.target.result);
        };

        request.onerror = (event) => {
            console.error('A great disturbance in the sacred scrolls of IndexedDB:', event.target.error);
            reject('IndexedDB error: ' + event.target.error);
        };
    });
    return dbPromise;
}

/**
 * Reads a value from the sacred database.
 * @param {string} key The key to retrieve.
 * @returns {Promise<any>} A promise that resolves with the value, or undefined if not found.
 */
export async function dbGet(key) {
    const db = await init();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            reject('Error reading from the sacred scrolls: ' + event.target.error);
        };
    });
}

/**
 * Inscribes a value into the sacred database.
 * @param {string} key The key to set.
 * @param {any} value The value to store.
 * @returns {Promise<void>} A promise that resolves when the write is complete.
 */
export async function dbSet(key, value) {
    const db = await init();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            reject('Error inscribing upon the sacred scrolls: ' + event.target.error);
        };
    });
}