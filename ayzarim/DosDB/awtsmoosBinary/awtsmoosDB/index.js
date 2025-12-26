// B"H
/**
 * @file index.js
 * @description The Malchut - The manifestation of the Neural Nexus database.
 */

const SynchronousPager = require('./core/pager.js');
const AllocatorV2 = require('./core/type_allocator.js');
const Lifecycle = require('./core/db/lifecycle.js');
const Operations = require('./core/db/operations.js');
const Iteration = require('./core/db/iteration.js');
const Background = require('./core/db/background.js');
const Io = require('./core/db/io.js');
const Concurrency = require('./core/concurrency.js');
const AIManager = require('./api/ai/index.js');
const GraphManager = require('./api/graph/index.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const LiveHandle = require('./api/liveHandle/index.js');

class AwtsmoosDB {
    constructor(filePath, options = {}) {
        this.filePath = filePath;
        this.options = options;
        this.debug = options.debug || false;
        
        this.pager = new SynchronousPager(filePath, options);
        this.allocator = new AllocatorV2(this.pager, this);
        this.lock = new Concurrency();
        
        this.root = null;
        this.rootPtrRaw = null;
        this.mutationCount = 0;
        
        this.ai = new AIManager(this);
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        
        this.sysCache = { loaded: false, search: new Set(), vector: new Set() };
        this._pendingIndexOps = [];
        this._isFlushing = false;
        this._structureCache = new Map();
        
        // Helper Classes
        this.Map = function() { return { _isAwtsmoosMarker: true, type: 'Map' }; };
        this.List = function() { return { _isAwtsmoosMarker: true, type: 'List' }; };
        this.Object = function() { return { _isAwtsmoosMarker: true, type: 'Object' }; };
    }

    open() {
        Lifecycle.open(this);
        return this;
    }

    close() {
        Lifecycle.close(this);
    }

    ensureOpen() {
        if (!this.root) this.open();
    }

    // Facades
    set(key, value) { return Operations.set(this, key, value); }
    get(key) { return Operations.get(this, key); }
    has(handle, key) { return Operations.has(this, handle, key); }
    size(handle) { return Operations.size(this, handle); }
    
    keys(handle) { return Iteration.keys(this, handle); }
    values(handle) { return Iteration.values(this, handle); }
    entries(handle) { return Iteration.entries(this, handle); }

    batch(fn) { return Background.batch(this, fn); }
    waitForIdle() { return Background.waitForIdle(this); }
    _flushBackgroundTasks() { return Background.flushBackgroundTasks(this); }

    _readChainSafe(ptr) { return Io.readChainSafe(this, ptr); }
    _writeChainSafe(ptr, data) { return Io.writeChainSafe(this, ptr, data); }

    cacheStructure(id, node) { this._structureCache.set(id, node); }
    getCachedStructure(ptr) { return this._structureCache.get(ptr.blockId); }

    // Marker Support
    createMap(parent, key) {
        const handle = parent[key];
        handle.writer.createMap();
        return handle;
    }

    createList(parent, key) {
        const handle = parent[key];
        handle.writer.createSequence();
        return handle;
    }
}

module.exports = AwtsmoosDB;