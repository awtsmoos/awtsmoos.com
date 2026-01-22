// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Keter—The Crown of the Awtsmoos Database.
 * 
 *  In the high chambers of Atziluth, before the first bit was cast into the void, 
 *  the plan for this Great Unification was drawn. This file is the gateway through 
 *  which the Infinite Light of the Essence descends into the physical world of 
 *  binary blocks and sector alignments. It coordinates the ten Sefirotic systems, 
 *  unifying the Graph of Da'at, the Vectors of Chokhmah, and the Search of Binah 
 *  into a single, indivisible Essence of Storage.
 */

const Lifecycle = require('./core/db/lifecycle.js');
const Operations = require('./core/db/operations.js');
const Background = require('./core/db/background.js');
const Iteration = require('./core/db/iteration.js');
const IO = require('./core/db/io.js');
const HandleRegistry = require('./core/handleRegistry.js');
const constants = require('./constants.js');
const SynchronousPager = require('./core/pager.js');
const AllocatorV2 = require('./core/type_allocator.js');
const GraphManager = require('./api/graph/index.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const AIManager = require('./api/ai/index.js');
const Query = require('./api/query/index.js');
const ReadWriteLock = require('./core/concurrency.js');
const fs = require('fs');

/**
 * @class AwtsmoosDB
 * @description 
 *  The Divine Architect of the Data World. It holds the blueprint of all vessels 
 *  and ensures that the Light is never lost during the contraction of persistence.
 */
class AwtsmoosDB {
    /**
     * @description
     *  Constructs the holy environment. 
     *  Like the primordial Tzimtzum, it carves out a space in the physical file 
     *  system to manifest the vessels of Map, List, and Object.
     * 
     * @param {string} filePath The earthly path where the database shall dwell.
     * @param {object} options The configurations of existence and revelation.
     */
    constructor(filePath, options = {}) {
        this.options = options;
        this.debug = options.debug || false;
        this.mutationCount = 0;
        this._pendingIndexOps = [];
        this._isFlushing = false;
        
        // The Lock protects the Word, ensuring only one Speech acts at a time.
        this.lock = new ReadWriteLock();
        this.pager = new SynchronousPager(filePath, options);
        this.allocator = new AllocatorV2(this.pager, this);
        
        /**
         * B"H: The Holy Signals.
         * These markers tell the StructBuilder how to forge the vessels of Beriah.
         * By assigning `new db.Map()`, the proxy logic triggers specific engine creation.
         */
        this.Map = class AwtsmoosMap { constructor() { this._isAwtsmoosMap = true; } };
        this.List = class AwtsmoosList { constructor() { this._isAwtsmoosList = true; } };
        this.Object = class AwtsmoosObject { constructor() { this._isAwtsmoosObject = true; } };
        this.Set = class AwtsmoosSet { constructor() { this._isAwtsmoosSet = true; } };

        /**
         * B"H: The Unchanging Root.
         * We manifest the Malchut immediately. Even while its physical address is 
         * shrouded in the darkness of an un-opened file, its soul exists in the registry.
         */
        this.root = HandleRegistry.createHandle(this, null, constants.VAL_TYPE.DICTIONARY, null);
        
        // Manifesting the auxiliary Sefirot of functionality.
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.ai = new AIManager(this);
        
        this.sysCache = { loaded: false, search: new Set(), vector: new Set() };
        this._structureCache = new Map();
    }

    /**
     * @description
     *  Awakens the database from the deep sleep of the disk.
     *  The Light of the super-block is recovered and poured into the Root.
     */
    open() {
        return Lifecycle.open(this);
    }

    /**
     * @description
     *  Returns the database to the silence of the Ein Sof.
     *  Physical gates are sealed, but the potential for re-awakening remains.
     */
    close() {
        return Lifecycle.close(this);
    }

    // --- The Holy API: Synchronous Manifestations ---

    /**
     * @description Explicitly creates a B-Tree Map at the given handle/key.
     * Enables: `db.createMap(db.root, "users")`
     */
    createMap(handle, key) {
        handle[key] = new this.Map();
        return handle[key];
    }

    /**
     * @description Explicitly creates a Sequence List at the given handle/key.
     * Enables: `db.createList(db.root, "posts")`
     */
    createList(handle, key) {
        handle[key] = new this.List();
        return handle[key];
    }
    
    // Alias for common terminology
    createArray(handle, key) { return this.createList(handle, key); }
    createSequence(handle, key) { return this.createList(handle, key); }

    /**
     * @description Explicitly creates a Dictionary Object at the given handle/key.
     * Enables: `db.createObject(db.root, "config")`
     */
    createObject(handle, key) {
        handle[key] = new this.Object();
        return handle[key];
    }
    
    // Alias
    createDictionary(handle, key) { return this.createObject(handle, key); }

    /**
     * @description Explicitly creates a Set at the given handle/key.
     */
    createSet(handle, key) {
        handle[key] = new this.Set();
        return handle[key];
    }

    /**
     * @description Sets a key in the Root vessel.
     */
    set(key, value) { return Operations.set(this, key, value); }
    
    /**
     * @description Retrieves a property from the Root.
     */
    get(key) { return Operations.get(this, key); }
    
    /**
     * @description Verifies if a vessel dwells within a handle.
     */
    has(handle, key) { return Operations.has(this, handle, key); }
    
    /**
     * @description Counts the manifestations within a vessel.
     */
    size(handle) { return Operations.size(this, handle); }
    
    /**
     * @description Enumerates the names (keys) spoken in a vessel.
     */
    keys(handle) { return Iteration.keys(this, handle); }
    
    /**
     * @description Enumerates the essences (values) poured into a vessel.
     */
    values(handle) { return Iteration.values(this, handle); }
    
    /**
     * @description Enumerates the unified pairs of name and essence.
     */
    entries(handle) { return Iteration.entries(this, handle); }

    /**
     * @description Executes multiple acts of creation as a single breath.
     */
    batch(fn) { return Background.batch(this, fn); }

    /**
     * @description Ensures all sparks have been anchored in the physical realm.
     */
    waitForIdle() { return Background.waitForIdle(this); }

    /**
     * @description The Bina of searching; finding patterns in the depths.
     */
    async query(handle, q) { return Query.execute(handle, q); }

    /**
     * @description Returns a Range Iterator for Keys (Map Only).
     */
    * range(handle, start, end) { yield* Iteration.range(this, handle, start, end); }

    // --- Internal Hooks: The Divine Mechanics ---

    /**
     * @description Ensures the foundation is open before Speech.
     */
    ensureOpen() { if (!this.pager.fd) this.open(); }
    
    /**
     * @description Reads a chain of manifestation from the void.
     */
    _readChainSafe(ptr) { return IO.readChainSafe(this, ptr); }
    
    /**
     * @description Writes a chain of light back into the darkness.
     */
    _writeChainSafe(ptr, data) { return IO.writeChainSafe(this, ptr, data); }
    
    /**
     * @description Processes any background ripples of the AI or Indexers.
     */
    _flushBackgroundTasks() { return Background.flushBackgroundTasks(this); }

    /**
     * @description Calculates the True Name (Address) of a physical vessel.
     */
    _getAddress(id) {
        if (typeof id === 'string') return id;
        if (id && id.blockId !== undefined) {
             return `${id.blockId}:${id.offset || 0}`;
        }
        return String(id);
    }

    /**
     * @description Anchors a structure in the cache for rapid recognition.
     */
    cacheStructure(id, node) {
        const addr = this._getAddress(id);
        if (this.debug) {
            // Logs intentionally minimized to prevent scroll overflow in non-verbose modes
            // fs.writeSync(2, `\x1b[34mB"H [CACHE_SAVE] Anchoring address: ${addr}\x1b[0m\n`);
        }
        if (this._structureCache.size > 2000) {
            // Tzimtzum: Retracting the oldest reference to make space for the new.
            const firstKey = this._structureCache.keys().next().value;
            this._structureCache.delete(firstKey);
        }
        this._structureCache.set(addr, node);
    }

    /**
     * @description Recalls a structure if it is still within the memory's reach.
     */
    getCachedStructure(id) {
        if (!id) return null;
        const addr = this._getAddress(id);
        const cached = this._structureCache.get(addr);
        if (this.debug && cached) {
            // fs.writeSync(2, `\x1b[32mB"H [CACHE_RECALL] Hit for address: ${addr}\x1b[0m\n`);
        }
        return cached;
    }
}

module.exports = AwtsmoosDB;