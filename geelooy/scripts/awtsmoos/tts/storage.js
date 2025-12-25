// B"H
/**
 * @file storage.js
 * @description
 * B"H
 * The Akashic Records of the application.
 * Manages the persistence of Divine Weights (Models) and Voices using IndexedDB.
 * 
 * V9: Integrity & Connection Hardening
 */

import { log } from './logger.js';

const DB_NAME = 'KokoroForgeDB';
const DB_VERSION = 1; 
const STORE_NAME = 'neural_assets';

export const AssetType = {
    MODEL: 'model_q8f16.onnx', 
    VOICE: 'am_michael.bin',
    TOKENIZER: 'tokenizer.json'
};

// Singleton instance
let dbInstance = null;
let connectionPromise = null;

/**
 * Opens the database connection securely.
 */
const openDB = () => {
    if (dbInstance) return Promise.resolve(dbInstance);
    if (connectionPromise) return connectionPromise;

    connectionPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);

        req.onblocked = () => {
             log("B\"H - Database Blocked. Waiting for release...", "warning");
        };

        req.onerror = (e) => {
            log(`DB Connection Error: ${e.target.error}`, 'error');
            connectionPromise = null;
            reject(e.target.error);
        };

        req.onupgradeneeded = (event) => {
            log("B\"H - Upgrading Neural Storage Schema...", "info");
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        req.onsuccess = (event) => {
            dbInstance = event.target.result;
            
            dbInstance.onclose = () => {
                dbInstance = null;
                connectionPromise = null;
            };
            
            dbInstance.onversionchange = () => {
                dbInstance.close();
                dbInstance = null;
                connectionPromise = null;
            };

            resolve(dbInstance);
        };
    });
    
    return connectionPromise;
};

/**
 * Saves a binary asset to the store and VERIFIES it.
 */
export const saveAsset = async (key, data) => {
    try {
        if (!data || (data.byteLength === 0 && data.length === 0)) {
            throw new Error("Attempted to save empty void.");
        }

        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(data, key);
            
            req.onerror = () => {
                if (req.error.name === 'QuotaExceededError') {
                    log("B\"H - STORAGE QUOTA EXCEEDED. Browser denied save.", "error");
                }
                reject(req.error);
            };

            tx.oncomplete = async () => {
                // Verify integrity
                try {
                    const savedData = await loadAsset(key);
                    if (savedData) {
                        log(`B"H - Asset Persisted & Verified: ${key}`, 'success');
                        resolve();
                    } else {
                        reject(new Error("Verification failed: Asset not found after save."));
                    }
                } catch(e) {
                    reject(e);
                }
            };
            
            tx.onerror = (e) => reject(tx.error || e.target.error);
            tx.onabort = () => reject(new Error("Transaction Aborted"));
        });
    } catch (err) {
        log(`Save Failed: ${err.message}`, 'error');
        throw err;
    }
};

/**
 * Retrieves a binary asset.
 */
export const loadAsset = async (key) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(key);
        
        req.onsuccess = () => {
            if (req.result) {
                resolve(req.result);
            } else {
                resolve(null);
            }
        };
        req.onerror = () => reject(req.error);
    });
};

/**
 * Checks if an asset exists.
 */
export const hasAsset = async (key) => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.count(key);
        
        req.onsuccess = () => resolve(req.result > 0);
        req.onerror = () => reject(req.error);
    });
};

/**
 * Lists all keys in the DB.
 */
export const debugStorage = async () => {
    try {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAllKeys();
            
            req.onsuccess = () => {
                const keys = req.result || [];
                log(`B"H - STORAGE AUDIT: Found ${keys.length} keys: ${keys.join(', ')}`, 'info');
                resolve(keys);
            };
            req.onerror = () => reject(req.error);
        });
    } catch (e) {
        log("Audit Failed: " + e.message, 'error');
        return [];
    }
};

/**
 * Clears all knowledge.
 */
export const clearAllAssets = async () => {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();
        
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
    });
};