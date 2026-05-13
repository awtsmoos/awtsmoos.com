
// B"H
/**
 * @file index.js
 * @chapter The Prime Atom of Unity (Etz Chaim)
 * @description
 * This index is the singular focal point from which all binary dimensions expand.
 * Like the Ein Sof (The Infinite), it contains the potential of all things 
 * within itself, then allows them to emanate through the specific channels 
 * of Maps, Lists, and Primitives.
 * 
 * "Everything was for His Honor created." 
 * We have increased the Light (Performance) by expanding the `StructureCache`
 * into a global barrier against redundant physical reads. Every handle is a 
 * unique Spark (Nitzotz) that remembers its place on disk.
 */

const Pager = require('./core/pager/firmament.js');
const Allocator = require('./core/allocator/chesed.js');
const Builder = require('./structure/manifest/complex/builder.js');
const Handle = require('./api/liveHandle/index.js');
const constants = require('./constants.js');
const SmartPointer = require('./utils/smartPointer/index.js');

const GraphManager = require('./api/graph/index.js');
const SearchManager = require('./api/search/index.js');
const VectorManager = require('./api/vector/index.js');
const AIManager = require('./api/ai/index.js');
const QueryExecutor = require('./api/query/index.js');

/**
 * @class AwtsmoosDB
 * @description
 * The Omnipresent Database Core. Holds the Sefirotic structure of indices.
 */
class AwtsmoosDB {
    /**
     * @constructor
     * @param {string} filePath - Absolute path to the physical Stone.
     * @param {Object} [options={}] - Config parameters for this manifestation.
     */
    constructor(filePath, options = {}) {
        this.options = { debug: false, ...options };
        
        /** 
         * Chapter: Firmament (Asiyah)
         * High-speed mirror that eliminates traditional IO friction. 
         */
        this.pager = new Pager(filePath);
        this.pager.db = this;
        
        /**
         * Chapter: Chesed (Giving)
         * Unrestrained byte-sequential space granting mechanism. 
         */
        this.allocator = new Allocator(this.pager);
        this.allocator.db = this;
        this.allocator.v1 = this.allocator; 
        
        /**
         * Chapter: Architecture (Beriah)
         * Constructing shapes and vessels from JSON archetypes.
         */
        this.builder = new Builder(this.allocator);
        this.primitiveSaver = this.builder.scribe;
        
        /** 
         * The Five Angels of Retrieval and Connection. 
         */
        this.graph = new GraphManager(this);
        this.search = new SearchManager(this);
        this.vector = new VectorManager(this);
        this.ai = new AIManager(this);
        
        // Internal state buffers
        this.sysCache = { search: new Set(), vector: new Set(), loaded: true };
        this._pendingIndexOps = [];
        
        /**
         * Chapter: Reshimu (Impression Cache)
         * Speeds up traversal by remembering handled offsets.
         */
        this._structureCache = new Map();
        
        /** 
         * chapter: Gevurah (Control) 
         * Counter of entropy and modification events.
         */
        this.mutationCount = 0;

        // TYPES FOR CREATION
        this.Map = class { constructor() { this._isAwtsmoosMap = true; } };
        this.List = class { constructor() { this._isAwtsmoosList = true; } };
        this.Object = class { constructor() { this._isAwtsmoosObject = true; } };
        
        this.root = null;
        this.lock = new (require('./core/concurrency.js'))();
    }

    /**
     * @method open
     * @description Awaken from the sleep of bytes. Immediate Sync Revelation.
     */
    open() {
        this.pager.init();
        this.allocator.init();
        
        // 64-byte SUPERBLOCK Protocol [Cursor:8][Null:0][Length:1][Seal:...]
        const sb = this.pager.readExact(0, 64) || Buffer.alloc(64).fill(0);
        
        // Root identification. 
        // Length occupies Byte 8. Pointer Seal begins at Byte 9.
        const rootSealLength = sb.readUInt8(8);

        if (rootSealLength === 0) {
            // THE BEGINNING (GENESIS)
            const DictionaryEngine = require('./structure/dictionary/index.js');
            const StableAnchor = require('./structure/anchor/stable.js');
            
            const startDict = new DictionaryEngine(this.allocator);
            const apexAnchor = new StableAnchor(this);
            
            // Build absolute Foundation
            const dataVessel = startDict.create(); 
            const identitySeal = apexAnchor.create(constants.VAL_TYPE.DICTIONARY, dataVessel); 
            
            this.root = new Handle(this, identitySeal, constants.VAL_TYPE.ANCHOR);
            this.rootPtrRaw = identitySeal;

            // Commit initial cosmos metadata
            this._flushSuperblock(identitySeal);
        } else {
            // THE RECONCILIATION
            const rootBytes = sb.subarray(9, 9 + rootSealLength);
            this.root = new Handle(this, rootBytes, constants.VAL_TYPE.ANCHOR);
            this.rootPtrRaw = rootBytes;
        }

        if (this.options.debug) {
            console.log(`B"H - Existence manifests at root address [${this.rootPtrRaw.toString('hex')}]`);
        }
    }

    /**
     * @private
     * @description Materializes the anchor coordinate into the absolute origin (Block 0).
     */
    _flushSuperblock(seal = this.rootPtrRaw) {
        if (!seal) return;
        const layout = Buffer.alloc(64).fill(0);
        
        // 1. EOF physical coordinate (Sourced from Chesed)
        layout.writeBigUInt64BE(BigInt(this.allocator.cursor), 0);
        // 2. Apex coordinates (Sourced from Malchut)
        layout.writeUInt8(seal.length, 8);
        seal.copy(layout, 9);
        
        this.pager.writeExact(0, layout);
    }

    /**
     * @method close
     * @description Melts from the Mirrored form back into stone reality.
     */
    close() { 
        this.waitForIdle(); 
        this.pager.close(); 
        this._structureCache.clear();
        if (this.options.debug) {
            const fs = require('fs');
            if (fs.existsSync(this.pager.filePath)) {
                 const phys = fs.statSync(this.pager.filePath).size;
                 console.log(`[SIZE_REPORT] physical: ${phys}, pure: ${phys}`);
            }
        }
    }
    
    /**
     * @method waitForIdle
     * @description Syncs the spiritual indices and physical cursors.
     */
    waitForIdle() { 
        this._flushSuperblock();

        // Drain the pending angels of updates
        const list = [...this._pendingIndexOps]; 
        this._pendingIndexOps = [];
        list.forEach(m => { try { m(); } catch(e){} });
        
        if (this.search && typeof this.search.flush === 'function') {
             this.search.flush();
        }

        // Condense Mirror back to physical world (Asiyah)
        this.pager.fsync(true); 
    }
    
    /**
     * @method batch
     * @description Suspends entropy triggers for bulk creation velocity.
     */
    batch(fn) { 
        const prevStatus = this.pager.isBatching;
        this.pager.isBatching = true; 
        try { 
            return fn(); 
        } finally { 
            this.pager.isBatching = prevStatus; 
            if (!prevStatus) this.waitForIdle(); 
        } 
    }

    /**
     * @method keys
     * @description Reveals names written in the Heavens. Synchronous.
     */
    keys(handle) {
        const soul = handle && handle[constants.SYMBOLS.INTERNALS];
        if (!soul) return [];
        soul.ensureResolved();
        return soul.reader ? Array.from(soul.reader.keys()) : [];
    }

    /**
     * @method range
     * @description Sliced walk through the Alphabet of data.
     */
    range(h, s, e) {
        const soul = h && h[constants.SYMBOLS.INTERNALS];
        if (!soul) return [];
        soul.ensureResolved();
        return soul.reader && soul.reader.iter ? soul.reader.iter.range(s, e) : [];
    }

    values(handle) {
        const soul = handle && handle[constants.SYMBOLS.INTERNALS];
        if (!soul) return [];
        soul.ensureResolved();
        return soul.reader ? Array.from(soul.reader.values()) : [];
    }
    
    /** Query Perception gateway. */
    query(h, opts) { return QueryExecutor.execute(h, opts); }
    
    /** Marker creation for Maps. */
    createMap(p, k) { p[k] = new this.Map(); }
    
    /** Marker creation for Lists. */
    createList(p, k) { p[k] = new this.List(); }
    
    /** Presence check in the World of Forms. */
    has(h, k) {
        const s = h && h[constants.SYMBOLS.INTERNALS];
        if (!s) return false;
        s.ensureResolved();
        return (s.nav.resolveKey(k)) !== null;
    }
    
    // Core physical perception methods.
    _readChainSafe(ptr) { return this.pager.readExact(ptr.offset, ptr.length); }
    _writeChainSafe(ptr, data) { 
        if (ptr && ptr.offset !== undefined) {
            this.pager.writeExact(ptr.offset, data); 
            // Invalidate spiritual mirrors upon every physical modification.
            this.mutationCount++;
        }
    }
}

module.exports = AwtsmoosDB;
