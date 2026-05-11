
// B"H
/**
 * @file db.js
 * @brief The Deep Memory of the Vibe.
 */

export const VibeDB = {
    DB_NAME: 'AwtsmoosVibeMemory',
    VERSION: 2,
    STORES: { 
        SESSIONS: 'sessions', 
        CHECKPOINTS: 'checkpoints',
        TIMELINE: 'timeline' 
    },

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
                if (!db.objectStoreNames.contains(this.STORES.TIMELINE)) {
                    db.createObjectStore(this.STORES.TIMELINE, { keyPath: 'id' });
                }
            };
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => reject(req.error);
        });
    },

    /**
     * @async
     * @function saveSession
     * @description B"H - Safeguarded save ritual. If ID is missing, we forge a new one.
     */
    async saveSession(id, data) {
        // Absolute failsafe ID generation
        let safeId = id;
        if (!safeId || typeof safeId !== 'string') {
            safeId = data.id || ('vibe-sess-' + Date.now());
            data.id = safeId;
            console.warn(`[VibeDB] B"H - Null ID intercepted. Forged new Identity: ${safeId}`);
        }

        const db = await this.init();
        return new Promise((res, rej) => {
            try {
                const tx = db.transaction(this.STORES.SESSIONS, 'readwrite');
                tx.objectStore(this.STORES.SESSIONS).put({ ...data, id: safeId, lastUpdated: Date.now() });
                tx.oncomplete = () => res();
                tx.onerror = () => rej(tx.error);
            } catch (e) { rej(e); }
        });
    },

    async getSession(id) {
        if (!id) return null;
        const db = await this.init();
        return new Promise((res) => {
            const req = db.transaction(this.STORES.SESSIONS).objectStore(this.STORES.SESSIONS).get(id);
            req.onsuccess = () => res(req.result);
            req.onerror = () => res(null);
        });
    },

    async getAllSessions() {
        const db = await this.init();
        return new Promise((res) => {
            const req = db.transaction(this.STORES.SESSIONS).objectStore(this.STORES.SESSIONS).getAll();
            req.onsuccess = () => res(req.result ||[]);
        });
    },

    async deleteSession(id) {
        const db = await this.init();
        return new Promise((res) => {
            const tx = db.transaction(this.STORES.SESSIONS, 'readwrite');
            tx.objectStore(this.STORES.SESSIONS).delete(id);
            tx.oncomplete = () => res();
        });
    },

    async saveTimelineRecord(record) {
        const db = await this.init();
        return new Promise((res) => {
            const tx = db.transaction(this.STORES.TIMELINE, 'readwrite');
            tx.objectStore(this.STORES.TIMELINE).put(record);
            tx.oncomplete = () => res();
        });
    },

    async getTimelineRecords(sessionId) {
        const db = await this.init();
        return new Promise((res) => {
            const req = db.transaction(this.STORES.TIMELINE).objectStore(this.STORES.TIMELINE).getAll();
            req.onsuccess = () => {
                const all = req.result ||[];
                res(all.filter(cp => cp.sessionId === sessionId));
            };
        });
    },

    async deleteTimelineRecord(id) {
        const db = await this.init();
        return new Promise((res) => {
            const tx = db.transaction(this.STORES.TIMELINE, 'readwrite');
            tx.objectStore(this.STORES.TIMELINE).delete(id);
            tx.oncomplete = () => res();
        });
    }
};
