//B"H
/**
 * AwtsmoosDB - A robust wrapper class for IndexedDB operations
 * 
 */
class AwtsmoosDB {
    static db = null;
    static dbName = 'myDatabase';
    static dbVersion = 1;

    /**
     * Initializes the database connection.
     */
    static async init() {
        if (this.db) return;

        // Check the current version of the database if it exists
        try {
            const databases = await indexedDB.databases();
            const existingDb = databases.find(db => db.name === this.dbName);
            if (existingDb && existingDb.version) {
                this.dbVersion = existingDb.version;
            }
        } catch(e) {
            console.warn("Could not read database list, may be unsupported by browser.");
        }


        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = (event) => reject("IndexedDB error: " + event.target.errorCode);
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            // This will only run if the version we open with is higher than the existing one
            request.onupgradeneeded = (event) => {
                this.db = event.target.result;
            };
        });
    }

    /**
     * Ensures an object store exists, upgrading the DB version if needed.
     * @param {string} storeName - The name of the store to ensure exists.
     */
    static async ensureStore(storeName) {
        await this.init();
        if (this.db.objectStoreNames.contains(storeName)) {
            return; // Already exists
        }

        // If the store does not exist, we must close, upgrade version, and re-open
        this.db.close();
        this.db = null;
        this.dbVersion++;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);
            request.onerror = (event) => reject("IndexedDB upgrade error: " + event.target.errorCode);
            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve();
            };
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName);
                }
            };
        });
    }

    /**
     * Gets a transaction-ready object store.
     * @param {string} storeName - The name of the object store.
     * @param {string} mode - 'readwrite' or 'readonly'.
     */
    static async getObjectStore(storeName, mode = 'readwrite') {
        if (!storeName) return Promise.reject("Store name cannot be empty.");
        await this.ensureStore(storeName);
        const transaction = this.db.transaction(storeName, mode);
        return transaction.objectStore(storeName);
    }
    
    static async write(storeName, key, value) {
        const objectStore = await this.getObjectStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = objectStore.put(value, key);
            request.onsuccess = resolve;
            request.onerror = () => reject(request.error);
        });
    }

    static async read(storeName, key) {
        // If a store doesn't exist, we can't read from it. It's an empty read.
        await this.init();
        if (!this.db.objectStoreNames.contains(storeName)) {
            return undefined;
        }
        const objectStore = await this.getObjectStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = objectStore.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    static async delete(storeName, key) {
        const objectStore = await this.getObjectStore(storeName, 'readwrite');
        return new Promise((resolve, reject) => {
            const request = objectStore.delete(key);
            request.onsuccess = resolve;
            request.onerror = () => reject(request.error);
        });
    }
    
    static async getAllKeys(storeName) {
        // If a store doesn't exist, it has no keys. Return an empty array.
        await this.init();
        if (!this.db.objectStoreNames.contains(storeName)) {
            return [];
        }
        const objectStore = await this.getObjectStore(storeName, 'readonly');
        return new Promise((resolve, reject) => {
            const request = objectStore.getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
  
    static Koysayv(storeName, key, value) { return this.write(storeName, key, value); }
    static Laynin(storeName, key) { return this.read(storeName, key); }
}