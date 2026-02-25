// B"H
// FILE: js/vibe/db.js

export const VibeDB = {
    DB_NAME: 'AwtsmoosVibeMemory',
    VERSION: 1,
    STORES: { SESSIONS: 'sessions', CHECKPOINTS: 'checkpoints' },

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
            };
            req.onsuccess = function() { resolve(req.result); };
            req.onerror = function() { reject(req.error); };
        });
    },

    async saveSession(id, data) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.SESSIONS, 'readwrite');
            tx.objectStore(self.STORES.SESSIONS).put({ 
                id: id, 
                ...data, 
                lastUpdated: Date.now() 
            });
            tx.oncomplete = res;
        });
    },

    // B"H - RESTORED: This was missing in the previous turn
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

    async saveCheckpoint(sessionId, history) {
        var db = await this.init();
        var self = this;
        var cpId = sessionId + "::" + Date.now();
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.CHECKPOINTS, 'readwrite');
            tx.objectStore(self.STORES.CHECKPOINTS).put({ 
                id: cpId, 
                sessionId: sessionId, 
                timestamp: Date.now(), 
                history: JSON.parse(JSON.stringify(history)) 
            });
            tx.oncomplete = res;
        });
    },

    async getCheckpoints(sessionId) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var req = db.transaction(self.STORES.CHECKPOINTS).objectStore(self.STORES.CHECKPOINTS).getAll();
            req.onsuccess = function() {
                var all = req.result || [];
                res(all.filter(function(cp) { return cp.sessionId === sessionId; }));
            };
        });
    },

    async deleteCheckpoint(cpId) {
        var db = await this.init();
        var self = this;
        return new Promise(function(res) {
            var tx = db.transaction(self.STORES.CHECKPOINTS, 'readwrite');
            tx.objectStore(self.STORES.CHECKPOINTS).delete(cpId);
            tx.oncomplete = res;
        });
    }
};