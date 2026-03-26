
// B"H
/**
 * @file index.js
 * @class SearchManager
 * @description
 *  =============================================================================
 *  CHAPTER 13: THE SEFIRAH OF DA'AT (KNOWLEDGE AND RETRIEVAL)
 *  =============================================================================
 *  "The hidden things belong to the Lord our G-d, but the revealed things belong 
 *   to us and to our children forever..." (Deuteronomy 29:28)
 * 
 *  The SearchManager is the manifestation of Da'at. It takes the chaotic, infinite 
 *  spread of data and creates meaningful connections, allowing hidden sparks (words) 
 *  to be revealed instantly upon request.
 *  
 *  THE TIKKUN OF OMNISCIENCE:
 *  The Archangel of Search now possesses the ability to see into all vessels: 
 *  Sequences, Maps, and Dictionaries. No spark is left unindexed.
 */

const tokenizer = require('./indexer/tokenizer.js'); 
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const SearchIndexer = require('./indexer.js');
const Reader = require('../liveHandle/reader/index.js');

class SearchManager {
    /**
     * @constructor
     * @param {Object} db - The AwtsmoosDB instance.
     */
    constructor(db) {
        this.db = db;
        this._indexer = null;
        this._updateBuffer = new Map();
    }

    /**
     * @method _ensureSysIndex
     * @description Guarantees the existence of the master index vessel in the root.
     */
    _ensureSysIndex() {
        if (!this.db.root.__sys_search__) {
             if (!this.db.has(this.db.root, "__sys_search__")) {
                 this.db.root.__sys_search__ = new this.db.Map();
                 this.db.waitForIdle();
             }
        }
    }

    /**
     * @method _getIndexer
     * @description Retrieves the active index scribe.
     */
    _getIndexer() {
        if (!this._indexer) this._indexer = new SearchIndexer(this.db, this.db.root.__sys_search__);
        return this._indexer;
    }

    /**
     * @method enable
     * @description Activates the all-seeing eye upon a specific path, backfilling existing data.
     * @param {Object} handle - The LiveHandle of the collection to monitor.
     */
    enable(handle) {
        this._ensureSysIndex();
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        h.ensureResolved();
        
        const path = h.getPath();
        const sysIndex = this.db.root.__sys_search__;
        
        if (!this.db.has(sysIndex, path)) {
            sysIndex[path] = new this.db.Map();
            this.db.waitForIdle();
        }
        
        if (this.db.sysCache) this.db.sysCache.search.add(path);
        
        // Immediately scan and index existing existence
        this.reindex(path);
    }

    /**
     * @method isIndexed
     * @description Checks if a path is under the watchful eye of the Search Engine.
     */
    isIndexed(path) {
        if (this.db.sysCache && this.db.sysCache.loaded) return this.db.sysCache.search.has(path);
        const sysIndex = this.db.root ? this.db.root.__sys_search__ : null;
        return sysIndex ? this.db.has(sysIndex, path) : false;
    }

    /**
     * @method updateIndex
     * @description Buffers an update command for the Indexer to process.
     */
    updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        if (!this._updateBuffer.has(path)) {
            this._updateBuffer.set(path, []);
            this.db._pendingIndexOps.push(() => this._flushUpdates(path));
        }
        this._updateBuffer.get(path).push({ newPtr, oldPtr, oldVal, newVal });
    }

    _flushUpdates(path) {
        const batch = this._updateBuffer.get(path);
        if (!batch || batch.length === 0) return;
        this._updateBuffer.delete(path);
        this._ensureSysIndex();
        
        const indexer = this._getIndexer();
        for (const item of batch) {
            indexer.updateIndex(path, item.newPtr, item.oldPtr, item.oldVal, item.newVal);
        }
        indexer.flush();
    }

    /**
     * @method flush
     * @description Forces all pending index commands into reality.
     */
    flush() {
        if (this._updateBuffer.size > 0) {
            for(const path of this._updateBuffer.keys()) {
                this._flushUpdates(path);
            }
        }
        if (this._indexer) this._indexer.flush();
    }
    
    /**
     * @method _resolveForIndex
     * @description 
     *  B"H: The Great Hydrator. 
     *  If a pointer leads to a complex structure (like Beriah/Objects), 
     *  this method invokes the Reader to pull down its full JS manifestation. 
     *  This is crucial for the TokenExtractor to see the actual text inside, 
     *  rather than just structural metadata.
     */
    _resolveForIndex(ptr) {
        const val = SmartPointer.resolve(ptr, this.db.allocator);
        if (val && val.isStructure) {
            return (new Reader({ 
                db: this.db, 
                ptr, 
                type: val.type, 
                isLiveHandle: true, 
                ensureResolved: () => {}, 
                nav: { resolveStructPtr: () => val }, 
                getPath: () => "hydrated" 
            })).resolveSelf();
        }
        return val;
    }

    /**
     * @method reindex
     * @description 
     *  The Backfill. Scans an existing collection entirely and feeds it to the Indexer.
     *  Now possesses the Omniscience to read Maps, Sets, Dictionaries, and Sequences.
     */
    reindex(path) {
        this._ensureSysIndex();
        const indexer = this._getIndexer();
        const parts = path.split('.').filter(p => p !== 'root');
        
        let curr = this.db.root;
        for (const p of parts) { 
            curr = curr[p]; 
            if (!curr) return; 
        }
        
        const h = curr[constants.SYMBOLS.INTERNALS] || curr;
        h.ensureResolved();
        
        if (!h.ptr) return;
        
        const struct = SmartPointer.resolve(h.ptr, this.db.allocator);
        const T = constants.VAL_TYPE;
        let iterator = [];

        // B"H: The Omniscient Eye - It now sees into all Dimensions of Structure
        if (h.type === T.SEQUENCE || h.type === T.ARRAY || h.type === T.SET || h.type === T.JS_SET) {
            iterator = (new Sequence(this.db.allocator, struct)).iterateRaw();
        } else if (h.type === T.MAP || h.type === T.JS_MAP) {
            iterator = (new MapEngine(this.db.allocator, struct)).iterateRaw();
        } else if (h.type === T.DICTIONARY || h.type === T.OBJECT) {
            const dict = new Dictionary(this.db.allocator, struct);
            dict._init();
            if (dict.map) {
                iterator = dict.map.iterateRaw();
            }
        }
        
        for (const item of iterator) {
            if (!item || !item.ptr) continue;
            // B"H: Use the Great Hydrator so we extract TEXT, not metadata.
            const val = this._resolveForIndex(item.ptr);
            indexer.updateIndex(path, item.ptr, null, null, val);
        }
        
        indexer.flush();
    }

    _getPhysId(p) {
        if (!p || !Buffer.isBuffer(p) || p.length < 16) return "";
        const clone = Buffer.from(p);
        clone[0] &= 0xC0; 
        return clone.toString('hex');
    }

    /**
     * @method run
     * @description 
     *  Executes a query against the void, returning the illuminated vessels.
     */
    run(handleOrPath, query) {
        this.db.waitForIdle(); 
        
        let path = (typeof handleOrPath !== 'string') 
            ? (handleOrPath[constants.SYMBOLS.INTERNALS] || handleOrPath).getPath() 
            : handleOrPath;
            
        if (!this.isIndexed(path)) return [];
        this._ensureSysIndex();
        
        const indexMap = this.db.root.__sys_search__[path];
        if (!indexMap) return [];
        
        const queryTokens = [...tokenizer.tokenize(query)];
        if (queryTokens.length === 0) return [];
        if (!this.db.has(indexMap, queryTokens[0])) return [];
        
        const listInt = indexMap[queryTokens[0]][constants.SYMBOLS.INTERNALS];
        listInt.ensureResolved();
        
        const firstRes = SmartPointer.resolve(listInt.ptr, this.db.allocator);
        if (!firstRes) return [];

        let resultPtrs = [];
        const firstSeq = new Sequence(this.db.allocator, firstRes);
        for(let i=0; i<firstSeq.length(); i++) {
            const p = firstSeq.getPtr(i);
            if(p) resultPtrs.push(p);
        }

        // Intersect remaining tokens
        for (let i = 1; i < queryTokens.length; i++) {
            if (resultPtrs.length === 0) return [];
            
            const word = queryTokens[i];
            if (!this.db.has(indexMap, word)) return [];
            
            const wInt = indexMap[word][constants.SYMBOLS.INTERNALS];
            wInt.ensureResolved();
            const wRes = SmartPointer.resolve(wInt.ptr, this.db.allocator);
            if (!wRes) return [];
            
            const wSeq = new Sequence(this.db.allocator, wRes);
            const currentSet = new Set();
            for(let j=0; j<wSeq.length(); j++) {
                const p = wSeq.getPtr(j);
                if(p) currentSet.add(this._getPhysId(p));
            }
            
            resultPtrs = resultPtrs.filter(p => currentSet.has(this._getPhysId(p)));
        }

        // B"H: Hydrate the final surviving sparks into objects
        const objects = [];
        for (const ptr of resultPtrs) {
            objects.push(this._resolveForIndex(ptr));
        }
        return objects;
    }
}

module.exports = SearchManager;
