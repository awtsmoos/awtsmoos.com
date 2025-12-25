
/**
 * B"H
 * LocalDatabase.js
 * IndexedDB Wrapper for Offline World Storage.
 */

export default class LocalDatabase {
    static DB_NAME = 'MitzvahWorldDB';
    static STORE_NAME = 'worlds';
    static VERSION = 1;

    static async open() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                reject("IndexedDB not supported");
                return;
            }
            const request = window.indexedDB.open(this.DB_NAME, this.VERSION);

            request.onerror = (event) => reject("Database error: " + event.target.error);

            request.onsuccess = (event) => resolve(event.target.result);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: "id" });
                }
            };
        });
    }

    static async saveWorld(metadata, content) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);
            
            const id = metadata.name || "world_" + Date.now();
            const record = {
                id: id,
                name: metadata.name,
                description: metadata.description,
                date: Date.now(),
                content: content
            };

            const request = store.put(record);

            request.onsuccess = () => resolve(id);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    static async getWorlds() {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], "readonly");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                // Return metadata only (lightweight)
                const results = request.result.map(r => ({
                    id: r.id,
                    name: r.name,
                    description: r.description,
                    date: r.date
                }));
                resolve(results);
            };
            request.onerror = (e) => reject(e.target.error);
        });
    }

    static async loadWorld(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], "readonly");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result ? request.result.content : null);
            request.onerror = (e) => reject(e.target.error);
        });
    }

    static async deleteWorld(id) {
        const db = await this.open();
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([this.STORE_NAME], "readwrite");
            const store = transaction.objectStore(this.STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve(true);
            request.onerror = (e) => reject(e.target.error);
        });
    }
}
