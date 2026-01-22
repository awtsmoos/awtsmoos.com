// B"H
/**
 * @file indexer.js
 * @description Synchronous Search Indexing Core.
 */
const constants = require('../../constants.js');
const ops = require('./indexer_ops.js');
const LiveHandle = require('../liveHandle/index.js');

class SearchIndexer {
    constructor(db, sysIndex) {
        this.db = db;
        this.sysIndex = sysIndex;
        // Map<token, { adds: Set<hex>, removes: Set<hex>, ptrs: Map<hex, Buffer> }>
        // Instead of buffering globally by path (done in Manager), this buffers by token.
        // We actually execute immediately-ish or buffer small batches.
        // Since SearchManager loops tokens, let's execute directly to avoid complex state.
        // SearchManager calls updateIndex per item.
    }

    updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        let oldTokens = new Set();
        let newTokens = new Set();
        
        if (oldVal) oldTokens = ops.extractTokens(oldVal);
        if (newVal) newTokens = ops.extractTokens(newVal);

        const ptrHex = newPtr ? newPtr.toString('hex') : (oldPtr ? oldPtr.toString('hex') : null);
        if (!ptrHex) return;

        // Diff
        const toAdd = [];
        const toRemove = [];

        for (const t of newTokens) {
            if (!oldTokens.has(t)) toAdd.push(t);
        }
        for (const t of oldTokens) {
            if (!newTokens.has(t)) toRemove.push(t);
        }
        
        // Execute synchronously (writing to DB handles)
        // Access index root for path
        const indexHandle = this._getPathIndexHandle(path);
        if (!indexHandle) return; // Error creating index?

        if (toRemove.length > 0) {
            for (const token of toRemove) {
                 ops.removeToken(this.db, indexHandle, token, ptrHex);
            }
        }
        
        if (toAdd.length > 0 && newPtr) {
            for (const token of toAdd) {
                 ops.addToken(this.db, indexHandle, token, newPtr);
            }
        }
    }

    flush() {
        // No-op if strictly synchronous execution above.
        // If buffering was implemented here, dump it.
    }

    _getPathIndexHandle(path) {
        // Synchronous navigation via Proxy
        let h = this.sysIndex[path];
        
        // Ensure physically exists
        if (!h) {
            // Create map
            this.sysIndex[path] = new this.db.Map();
            h = this.sysIndex[path];
        }
        
        // Internal check
        const i = h[constants.SYMBOLS.INTERNALS] || h;
        i.ensureResolved(true);
        return i.self || i;
    }
}

module.exports = SearchIndexer;