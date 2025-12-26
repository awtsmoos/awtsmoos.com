//B"H

/**
 * @namespace AwtsmoosDB
 * @description 
 *  The Sefirah of Keter - The Absolute Source.
 *  Everything is immediate. Everything is persistent. Zero Await.
 */

const Pager = require('./core/pager.js');
const AllocatorV2 = require('./core/type_allocator.js');
const constants = require('./constants.js');
const Lifecycle = require('./core/db/lifecycle.js');

class AwtsmoosDB {
    constructor(filePath, options = {}) {
        this.config = { debug: options.debug || false, ...options };
        this.pager = new Pager(filePath, this.config);
        this.allocator = new AllocatorV2(this.pager, this, this.config);
        this.root = null; 
        this.rootPtrRaw = null;
        this.mutationCount = 0;
        
        this.Map = class AwtsmoosMap extends Map {};
        this.List = class AwtsmoosList extends Array {};
        this.Set = class AwtsmoosSet extends Set {};
        this.Object = class AwtsmoosObject {};
        
        this.structureCache = new Map();
        this.STRUCT_CACHE_LIMIT = 200; // Minimal cache for 20MB RAM
    }

    /**
     * @description Opens the database vessels immediately.
     */
    open() {
        this.pager.init();
        this.allocator.init();
        Lifecycle.open(this);
        return this;
    }

    ensureOpen() { if (!this.root) this.open(); }

    close() {
        this.pager.close();
        this.root = null;
    }

    set(key, value) {
        this.ensureOpen();
        return this.root.set(key, value);
    }

    get(key) {
        this.ensureOpen();
        return this.root[key];
    }

    batch(fn) {
        return fn();
    }

    // B"H: Provided for backward compatibility in existing test scripts.
    async waitForIdle() { return true; }

    _readChainSafe(ptr) { return require('./core/db/io.js').readChainSafe(this, ptr); }
    _writeChainSafe(ptr, data) { return require('./core/db/io.js').writeChainSafe(this, ptr, data); }
    
    cacheStructure(blockId, node) {
        if (this.structureCache.size >= this.STRUCT_CACHE_LIMIT) {
            this.structureCache.delete(this.structureCache.keys().next().value);
        }
        this.structureCache.set(blockId, node);
    }

    getCachedStructure(ptr) {
        return this.structureCache.get(ptr.blockId);
    }
}

module.exports = AwtsmoosDB;
