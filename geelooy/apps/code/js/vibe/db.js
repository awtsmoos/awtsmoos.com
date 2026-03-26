
// B"H
// FILE: js/vibe/db.js

export const VibeDB = {
    DB_NAME: 'AwtsmoosVibeMemory',
    VERSION: 2, // B"H - Upgraded to introduce the Timeline
    STORES: { 
        SESSIONS: 'sessions', 
        CHECKPOINTS: 'checkpoints',
        TIMELINE: 'timeline' 
    },

    async init() {
        var self = this;
        return new Promise(function(resolve, reject) {
            var req = indexedDB.open(self.DB_NAME, self.VERSION);
            req.onupgradeneeded = function(e) {
                var db = e.target.result;
                if (!db.objectStoreNames.contains(self.STORES.SESSIONS)) {
                    db.createObjectStore(self.STORES.SESSIONS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(self.STORES.CHECKPOINTS)) {
                    db.createObjectStore(self.STORES.CHECKPOINTS, { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains(self.STORES.TIMELINE)) {
                    db.createObjectStore(self.STORES.TIMELINE, { keyPath: 'id' });
                }
            };
            req.onsuccess = function() { resolve(req.result); };
            req.onerror = function() { reject(req.error); };
        });
    },

    // --- SESSIONS ---
    async saveSession(id, data) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.SESSIONS, 'readwrite');
            tx.objectStore(self.STORES.SESSIONS).put({ id: id, ...data, lastUpdated: Date.now() });
            tx.oncomplete = res;
        });
    },

    async getSession(id) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var req = db.transaction(self.STORES.SESSIONS).objectStore(self.STORES.SESSIONS).get(id);
            req.onsuccess = function() { res(req.result); };
            req.onerror = function() { res(null); };
        });
    },

    async getAllSessions() {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var req = db.transaction(self.STORES.SESSIONS).objectStore(self.STORES.SESSIONS).getAll();
            req.onsuccess = function() { res(req.result || []); };
        });
    },

    async deleteSession(id) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.SESSIONS, 'readwrite');
            tx.objectStore(self.STORES.SESSIONS).delete(id);
            tx.oncomplete = res;
        });
    },

    // --- TIMELINE (The New Snapshot System) ---
    async saveTimelineRecord(record) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.TIMELINE, 'readwrite');
            tx.objectStore(self.STORES.TIMELINE).put(record);
            tx.oncomplete = res;
        });
    },

    async getTimelineRecords(sessionId) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var req = db.transaction(self.STORES.TIMELINE).objectStore(self.STORES.TIMELINE).getAll();
            req.onsuccess = function() {
                var all = req.result || [];
                res(all.filter(function(cp) { return cp.sessionId === sessionId; }));
            };
        });
    },

    async deleteTimelineRecord(id) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.TIMELINE, 'readwrite');
            tx.objectStore(self.STORES.TIMELINE).delete(id);
            tx.oncomplete = res;
        });
    }
};
