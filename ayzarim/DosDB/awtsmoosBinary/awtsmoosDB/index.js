//B"H

/**
 * @namespace AwtsmoosDB
 * @description 
 *  The Sefirah of Keter - The Absolute Source.
 *  A vessel for the Or Ein Sof (Infinite Light) to dwell within binary dust.
 */

const Pager = require('./core/pager.js');
const AllocatorV2 = require('./core/type_allocator.js');
const constants = require('./constants.js');
const ReadWriteLock = require('./core/concurrency.js');
const GraphManager = require('./api/graphManager.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const AIManager = require('./api/ai/index.js');
const HandleRegistry = require('./core/handleRegistry.js');

const Lifecycle = require('./core/db/lifecycle.js');
const Operations = require('./core/db/operations.js');
const Iteration = require('./core/db/iteration.js');
const Background = require('./core/db/background.js');
const IO = require('./core/db/io.js');
const Query = require('./api/query/index.js');

class AwtsmoosDB_V2 {
    constructor(filePath, options = {}) {
        let finalCacheSize = options.cacheSize || 5000;
        if (options.cacheSizeMB) {
            finalCacheSize = Math.ceil((options.cacheSizeMB * 1024 * 1024) / constants.BLOCK_SIZE);
        }

        this.config = { cacheSize: finalCacheSize, debug: options.debug || false, ...options };
        this.pager = new Pager(filePath, this.config);
        this.allocator = new AllocatorV2(this.pager, this, this.config);
        this.lock = new ReadWriteLock();
        this.root = null; 
        this.rootPtrRaw = null;
        this.debug = this.config.debug; 
        
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.ai = new AIManager(this);
        
        this.mutationCount = 0;
        this._pendingIndexOps = [];
        this._isFlushing = false;
        
        this.sysCache = { search: new Set(), vector: new Set(), loaded: false };
        this.structureCache = new Map();
        this.STRUCT_CACHE_LIMIT = Math.floor(this.config.cacheSize * 0.6); 
    }

    // --- Core Identity ---
    isHandle(obj) { return HandleRegistry.isHandle(obj); }
    _getSoul(handle) { return HandleRegistry.getSoul(handle); }
    async ensureResolved(handle, force = false) {
        const soul = this._getSoul(handle);
        if (soul && soul.ensureResolved) return await soul.ensureResolved(force);
    }

    // --- Modularized Lifecycle ---
    async open() { return Lifecycle.open(this); }
    async ensureOpen() { if (!this.root) await this.open(); }
    async close() { return Lifecycle.close(this); }

    // --- Modularized Operations ---
    async set(key, value) { return Operations.set(this, key, value); }
    async get(key) { return Operations.get(this, key); }
    async has(handle, key) { return Operations.has(this, handle, key); }
    async createMap(handle, key) { return Operations.createMap(this, handle, key); }
    async createList(handle, key) { return Operations.createList(this, handle, key); }
    async createObject(handle, key) { return Operations.createObject(this, handle, key); }
    async compact(handle) { return Operations.compact(this, handle); }
    async stats(handle) { return Operations.stats(this, handle); }
    async size(handle) { return Operations.size(this, handle); }

    // --- Modularized Iteration ---
    async keys(handle) { return Iteration.keys(this, handle); }
    async values(handle) { return Iteration.values(this, handle); }
    async entries(handle) { return Iteration.entries(this, handle); }
    streamKeys(handle) { return Iteration.streamKeys(this, handle); }
    streamValues(handle) { return Iteration.streamValues(this, handle); }
    streamEntries(handle) { return Iteration.streamEntries(this, handle); }
    range(handle, start, end) { return Iteration.range(this, handle, start, end); }

    // --- Modularized Background Processing ---
    async batch(fn) { return Background.batch(this, fn); }
    async waitForIdle() { return Background.waitForIdle(this); }
    async _flushBackgroundTasks() { return Background.flushBackgroundTasks(this); }

    // --- Modularized IO ---
    async _readChainSafe(ptr) { return IO.readChainSafe(this, ptr); }
    async _writeChainSafe(ptr, data) { return IO.writeChainSafe(this, ptr, data); }
    cacheStructure(ptr, node) { return IO.cacheStructure(this, ptr, node); }
    getCachedStructure(ptr) { return IO.getCachedStructure(this, ptr); }
    evictStructure(ptr) { return IO.evictStructure(this, ptr); }

    // --- Query Engine ---
    async query(handle, queryObj) { return await Query.execute(handle, queryObj); }
    async execute(fn) { return this.lock.runWrite(fn); }
    async read(fn) { return this.lock.runRead(fn); }
}

module.exports = AwtsmoosDB_V2;