// B"H
// FILE: js/vibe/db.js

export const VibeDB = {
    DB_NAME: 'AwtsmoosVibeMemory',
    VERSION: 1,
    STORES: { SESSIONS: 'sessions', CHECKPOINTS: 'checkpoints' },

    async init() {
        return new Promise((resolve, reject) => {
            const req = indexedDB.open(this.DB_NAME, this.VERSION);
            req.onupgradeneeded = (e) => {
                const db = e.target.result;
                if (!db.objectStoreNames.contains(this.STORES.SESSIONS)) {
                    db.createObjectStore(this.STORES.SESSIONS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(this.STORES.CHECKPOINTS)) {
                    db.createObjectStore(this.STORES.CHECKPOINTS, { keyPath: 'id' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    async saveSession(id, data) {
        const db = await this.init();
        return new Promise((res, rej) => {
            const tx = db.transaction(this.STORES.SESSIONS, 'readwrite');
            tx.objectStore(this.STORES.SESSIONS).put({ id, ...data, lastUpdated: Date.now() });
            tx.oncomplete = res;
            tx.onerror = () => rej(tx.error);
        });
    },

    async getSession(id) {
        const db = await this.init();
        return new Promise((res, rej) => {
            const req = db.transaction(this.STORES.SESSIONS).objectStore(this.STORES.SESSIONS).get(id);
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
        });
    },

    async getAllSessions() {
        const db = await this.init();
        return new Promise((res, rej) => {
            const req = db.transaction(this.STORES.SESSIONS).objectStore(this.STORES.SESSIONS).getAll();
            req.onsuccess = () => res(req.result);
            req.onerror = () => rej(req.error);
        });
    },

    async deleteSession(id) {
        const db = await this.init();
        return new Promise((res, rej) => {
            const tx = db.transaction([this.STORES.SESSIONS], 'readwrite');
            tx.objectStore(this.STORES.SESSIONS).delete(id);
            tx.oncomplete = res;
            tx.onerror = () => rej(tx.error);
        });
    }
};
