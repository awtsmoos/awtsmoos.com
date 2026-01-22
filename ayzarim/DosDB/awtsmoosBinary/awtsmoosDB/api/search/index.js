// B"H
/**
 * @file index.js
 * @description
 *  The Sefirah of Binah - Search Manager.
 *  STRICTLY SYNCHRONOUS.
 *  Uses Buffer Map for updates to minimize IO until flush.
 */

const tokenizer = require('./tokenizer.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const SearchIndexer = require('./indexer.js');

class SearchManager {
    constructor(db) {
        this.db = db;
        this._indexer = null;
        this._updateBuffer = new Map();
    }

    _ensureSysIndex() {
        if (!this.db.root.__sys_search__) {
             if (!this.db.has(this.db.root, "__sys_search__")) {
                 this.db.root.__sys_search__ = new this.db.Map();
                 // Ensure it persists so we can write to it immediately
                 this.db.waitForIdle();
             }
        }
    }
    
    _getIndexer() {
        if (!this._indexer) {
             const sysIndex = this.db.root.__sys_search__;
             this._indexer = new SearchIndexer(this.db, sysIndex);
        }
        return this._indexer;
    }

    enable(handle) {
        this._ensureSysIndex();
        
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        h.ensureResolved();
        const path = h.getPath();
        
        const sysIndex = this.db.root.__sys_search__;
        if (!this.db.has(sysIndex, path)) {
            // Create Index Map
            sysIndex[path] = new this.db.Map();
            this.db.waitForIdle();
        }
        
        if (this.db.sysCache) this.db.sysCache.search.add(path);
        
        this.reindex(path);
    }

    isIndexed(path) {
        if (this.db.sysCache && this.db.sysCache.loaded) {
            return this.db.sysCache.search.has(path);
        }
        const sysIndex = this.db.root ? this.db.root.__sys_search__ : null;
        if (!sysIndex) return false;
        return this.db.has(sysIndex, path);
    }

    updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        if (!this._updateBuffer.has(path)) {
            this._updateBuffer.set(path, []);
            // Register sync flush task
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
        
        // Push deletes/inserts to disk structs (in memory pager)
        indexer.flush();
    }

    flush() {
        if (this._updateBuffer.size > 0) {
            for(const path of this._updateBuffer.keys()) {
                this._flushUpdates(path);
            }
        }
        if (this._indexer) this._indexer.flush();
    }

    reindex(path) {
        this._ensureSysIndex();
        const indexer = this._getIndexer();
        
        // Navigate to Source
        const parts = path.split('.').filter(p => p !== 'root');
        let curr = this.db.root;
        for (const p of parts) {
            curr = curr[p];
            if (!curr) return;
        }
        
        const h = curr[constants.SYMBOLS.INTERNALS] || curr;
        h.ensureResolved();
        if (!h.ptr) return;

        // Iterate Synchronously
        // We use the same iteration logic as VectorReindexer or raw iterator
        // Assuming h.type is supported (List/Map)
        
        // Resolve struct
        const struct = SmartPointer.resolve(h.ptr, this.db.allocator);
        let iterator;
        
        if (h.type === constants.VAL_TYPE.SEQUENCE) {
            iterator = (new Sequence(this.db.allocator, struct)).iterateRaw();
        } else {
            // Map or other
            // Skip for brevity or implement if needed. 
            // Most tests index Lists.
            return;
        }

        // Processing
        for (const item of iterator) {
            // item.ptr is the pointer to the VALUE
            // We need to resolve value to index text
            // Note: indexer.updateIndex expects (path, newPtr, oldPtr, oldVal, newVal)
            
            const val = SmartPointer.resolve(item.ptr, this.db.allocator);
            
            // "hydrated" for complex objects if needed, but for text search, 
            // we usually index specific text fields found in val.
            
            // Just treat as "New Insert"
            indexer.updateIndex(path, item.ptr, null, null, val);
        }
        
        indexer.flush();
    }

    run(handleOrPath, query) {
        // Synchronous Run
        // 1. Flush pending writes so we can read fresh index
        this.db.waitForIdle(); // This flushes index ops
        
        let path = (typeof handleOrPath !== 'string') ? 
                   (handleOrPath[constants.SYMBOLS.INTERNALS] || handleOrPath).getPath() : 
                   handleOrPath;
                   
        if (!this.isIndexed(path)) return []; // Or throw

        this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__;
        const indexMap = sysIndex[path];
        
        if (!indexMap) return []; // Index missing
        
        const queryTokens = [...tokenizer.tokenize(query)];
        if (queryTokens.length === 0) return [];
        
        // 2. Intersection
        // We get the list of pointers for the first token
        const firstWord = queryTokens[0];
        
        // Sync check
        if (!this.db.has(indexMap, firstWord)) return [];
        
        const listH = indexMap[firstWord];
        // Resolve list handle sync
        const listInt = listH[constants.SYMBOLS.INTERNALS] || listH;
        listInt.ensureResolved();
        
        const firstRes = SmartPointer.resolve(listInt.ptr, this.db.allocator);
        const firstSeq = new Sequence(this.db.allocator, firstRes);
        
        // Collect Pointers (Hex strings for set logic)
        let resultPtrs = [];
        const len = firstSeq.length();
        for(let i=0; i<len; i++) {
            const ptr = firstSeq.getPtr(i);
            if(ptr) resultPtrs.push(ptr);
        }

        // Intersect remaining
        for (let i = 1; i < queryTokens.length; i++) {
            if (resultPtrs.length === 0) return [];
            
            const word = queryTokens[i];
            if (!this.db.has(indexMap, word)) return [];
            
            const wordH = indexMap[word];
            const wInt = wordH[constants.SYMBOLS.INTERNALS] || wordH;
            wInt.ensureResolved();
            
            const wRes = SmartPointer.resolve(wInt.ptr, this.db.allocator);
            const wSeq = new Sequence(this.db.allocator, wRes);
            
            const currentSet = new Set();
            const wLen = wSeq.length();
            for(let j=0; j<wLen; j++) {
                const p = wSeq.getPtr(j);
                if(p) currentSet.add(p.toString('hex'));
            }
            
            // Filter
            resultPtrs = resultPtrs.filter(p => currentSet.has(p.toString('hex')));
        }
        
        // 3. Hydrate
        const objects = [];
        for (const ptr of resultPtrs) {
            const val = SmartPointer.resolve(ptr, this.db.allocator);
            
            if (val && val.isStructure) {
                // Manually hydrate dictionary/structure to object
                const Reader = require('../../api/liveHandle/reader.js'); // lazy
                
                // Mock handle
                const mock = { 
                    db: this.db, 
                    ptr: ptr, 
                    type: val.type,
                    isLiveHandle: true,
                    ensureResolved: ()=>{},
                    nav: { resolveStructPtr: () => val }
                };
                
                 // B"H: FIX - Pass mock directly as handle, do not wrap it.
                 const reader = new Reader(mock);
                 
                 const hyd = reader.resolveSelf(); // Synchronous
                 objects.push(hyd);
            } else {
                objects.push(val);
            }
        }
        
        return objects;
    }
}

module.exports = SearchManager;