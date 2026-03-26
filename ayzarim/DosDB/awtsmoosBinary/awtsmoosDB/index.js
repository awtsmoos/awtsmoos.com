
// B"H
/**
 * @file index.js
 * @description
 * The Root of All Existence (Keter)
 * Here begins the Awtsmoos database, pulling all Sefirot, Algorithms, and Handlers
 * into one unified, synchronous force of creation.
 * 
 * THE TIKKUN OF TZIMTZUM:
 * The internal caches are meticulously balanced to ensure maximum speed 
 * without exceeding the 25MB boundary of the physical world.
 */

const Lifecycle = require('./core/db/lifecycle.js');
const Operations = require('./core/db/operations.js');
const Background = require('./core/db/background.js');
const Iteration = require('./core/db/iteration.js');
const IO = require('./core/db/io.js');
const HandleRegistry = require('./core/registry/handle.js');
const constants = require('./constants.js');
const SynchronousPager = require('./core/pager.js');
const AllocatorV2 = require('./core/type/allocator.js');
const GraphManager = require('./api/graph/index.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const AIManager = require('./api/ai/index.js');
const Query = require('./api/query/index.js');
const ReadWriteLock = require('./core/concurrency.js');

class AwtsmoosDB {
    constructor(filePath, options = {}) {
        this.options = options;
        this.debug = options.debug || false;
        this.mutationCount = 0;
        this._pendingIndexOps = [];
        this.lock = new ReadWriteLock();
        this.pager = new SynchronousPager(filePath, options);
        this.allocator = new AllocatorV2(this.pager, this);
        this.Map = class { constructor() { this._isAwtsmoosMap = true; } };
        this.List = class { constructor() { this._isAwtsmoosList = true; } };
        this.Object = class { constructor() { this._isAwtsmoosObject = true; } };
        this.Set = class { constructor() { this._isAwtsmoosSet = true; } };
        this.root = HandleRegistry.createHandle(this, null, constants.VAL_TYPE.DICTIONARY, null);
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.ai = new AIManager(this);
        this.sysCache = { loaded: false, search: new Set(), vector: new Set() };
        this._structureCache = new Map();
    }
    open() { return Lifecycle.open(this); }
    close() { return Lifecycle.close(this); }
    createMap(handle, key) { handle[key] = new this.Map(); return handle[key]; }
    createList(handle, key) { handle[key] = new this.List(); return handle[key]; }
    createObject(handle, key) { handle[key] = new this.Object(); return handle[key]; }
    createSet(handle, key) { handle[key] = new this.Set(); return handle[key]; }
    set(key, value) { return Operations.set(this, key, value); }
    get(key) { return Operations.get(this, key); }
    has(handle, key) { return Operations.has(this, handle, key); }
    size(handle) { return Operations.size(this, handle); }
    keys(handle) { return Iteration.keys(this, handle); }
    values(handle) { return Iteration.values(this, handle); }
    entries(handle) { return Iteration.entries(this, handle); }
    batch(fn) { return Background.batch(this, fn); }
    waitForIdle() { return Background.waitForIdle(this); }
    query(handle, q) { return Query.execute(handle, q); }
    * range(handle, start, end) { yield* Iteration.range(this, handle, start, end); }
    ensureOpen() { if (!this.pager.fd) this.open(); }
    _readChainSafe(ptr) { return IO.readChainSafe(this, ptr); }
    _writeChainSafe(ptr, data) { return IO.writeChainSafe(this, ptr, data); }
    
    cacheStructure(id, node) {
        const addr = (id && id.blockId !== undefined) ? `${id.blockId}:${id.offset || 0}` : String(id);
        // B"H: The Expansion of Binah. 
        // A limit of 1024 nodes provides ~1MB of pure memory retention, 
        // eliminating exponential parse times during deep Tree traversals.
        if (this._structureCache.size > 1024) {
            this._structureCache.delete(this._structureCache.keys().next().value);
        }
        this._structureCache.set(addr, node);
    }
    
    getCachedStructure(id) {
        if (!id) return null;
        const addr = (id.blockId !== undefined) ? `${id.blockId}:${id.offset || 0}` : String(id);
        return this._structureCache.get(addr);
    }
}
module.exports = AwtsmoosDB;
