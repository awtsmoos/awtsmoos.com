


// B"H
const tokenizer = require('./tokenizer.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const SearchIndexer = require('./indexer.js');

class SearchManager {
    constructor(db) {
        this.db = db;
        // B"H: Persistent Indexer Instance to hold the buffer
        this._indexer = null;
        
        // B"H: Batch Buffering
        // Map<Path, Array<{newPtr, oldPtr, oldVal, newVal}>>
        this._updateBuffer = new Map();
    }

    async _ensureSysIndex() {
        const hasSys = await this.db.has(this.db.root, "__sys_search__");
        if (!hasSys) {
            await this.db.createMap(this.db.root, "__sys_search__");
        }
    }
    
    _getIndexer() {
        if (!this._indexer) {
             const sysIndex = this.db.root.__sys_search__;
             this._indexer = new SearchIndexer(this.db, sysIndex);
        }
        return this._indexer;
    }

    async enable(handle) {
        await this._ensureSysIndex();
        
        const h = handle[constants.SYMBOLS.INTERNALS] || handle;
        await h.ensureResolved();
        const path = h.getPath();
        
        const sysIndex = this.db.root.__sys_search__;
        if (!await this.db.has(sysIndex, path)) {
            await this.db.createMap(sysIndex, path);
        }
        
        this.db.sysCache.search.add(path);
        await this.reindex(path);
    }

    async isIndexed(path) {
        if (this.db.sysCache.loaded) {
            return this.db.sysCache.search.has(path);
        }
        const sysIndex = this.db.root.__sys_search__;
        if (!sysIndex) return false;
        return await this.db.has(sysIndex, path);
    }

    async _hydrateStructure(val, context = new Map()) {
        if (!val) return val;
        
        let descriptor = val;

        if (Buffer.isBuffer(val) && val.length === 16) {
             const decoded = SmartPointer.decode(val);
             if (decoded && decoded.mode === constants.MODE_BLOCK) {
                 descriptor = {
                     isStructure: true,
                     type: decoded.type,
                     blockId: readPointer48(decoded.payload, 0),
                     length: decoded.payload.readUInt32BE(6),
                     offset: decoded.payload.readUInt32BE(10),
                     isChain: decoded.payload.readUInt8(14) === 1
                 };
             } else {
                 descriptor = await SmartPointer.resolve(val, this.db.allocator, context);
             }
        }

        if (!descriptor || !descriptor.isStructure) return descriptor;
        if (context.has(descriptor.blockId)) return context.get(descriptor.blockId);

        try {
            if (descriptor.type === constants.TYPE_DICTIONARY || descriptor.type === constants.TYPE_CUSTOM_INSTANCE) {
                const dict = new Dictionary(this.db.allocator, descriptor);
                const obj = {};
                context.set(descriptor.blockId, obj);
                
                try {
                    for await (const k of dict.keys()) {
                        let v = await dict.get(k, context);
                        if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) {
                            v = await this._hydrateStructure(v, context);
                        }
                        const realKey = keyEncoding.decode(k);
                        obj[realKey] = v;
                    }
                } catch(e) {
                    if (this.db.debug) console.warn(`B"H Search: Error iterating Dictionary keys in hydration: ${e.message}`);
                    return undefined; 
                }
                return obj;
            }
            
            if (descriptor.type === constants.TYPE_MAP) {
                const mapEngine = new MapEngine(this.db.allocator, descriptor);
                const mapObj = {}; 
                context.set(descriptor.blockId, mapObj);
                
                let count = 0;
                try {
                    for await (const item of mapEngine.range()) {
                        if (count++ > 5000) break;
                        let v = item.value;
                        if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) {
                            v = await this._hydrateStructure(v, context);
                        }
                        const realKey = keyEncoding.decode(item.key);
                        mapObj[realKey] = v;
                    }
                } catch(e) {
                     if (this.db.debug) console.error("B\"H Search: Error iterating Map:", e);
                     return undefined;
                }
                return mapObj;
            }

            if (descriptor.type === constants.TYPE_SEQUENCE || descriptor.type === constants.TYPE_SET) {
                const seq = new Sequence(this.db.allocator, descriptor);
                const arr = [];
                context.set(descriptor.blockId, arr);
                
                try {
                    const len = await seq.length();
                    const limit = Math.min(len, 5000);
                    for(let i=0; i<limit; i++) {
                        let v = await seq.get(i, context);
                        if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) {
                            v = await this._hydrateStructure(v, context);
                        }
                        arr.push(v);
                    }
                } catch(e) {
                    if (this.db.debug) console.error("B\"H Search: Error iterating Sequence:", e);
                    return undefined;
                }
                return arr;
            }
        } catch(e) {
            if (this.db.debug) console.error("B\"H Search: Structure Hydration Fatal Error:", e);
            return undefined;
        }

        return descriptor;
    }

    async _hydrateForIndex(val) {
        if (val && (val.isStructure || (Buffer.isBuffer(val) && val.length === 16))) {
             return await this._hydrateStructure(val);
        }
        return val;
    }

    async reindex(path) {
        await this._ensureSysIndex();
        const indexer = this._getIndexer();
        
        const parts = [];
        const rawParts = path.split('.');
        for(const p of rawParts) {
            if (p !== 'root') parts.push(p);
        }

        let curr = this.db.root[constants.SYMBOLS.INTERNALS] || this.db.root;
        for (let i = 0; i < parts.length; i++) {
            const next = curr.nav.navigate(parts[i]); 
            const nextInt = next[constants.SYMBOLS.INTERNALS] || next;
            await nextInt.ensureResolved(); 
            if (!nextInt.ptr) return; 
            curr = nextInt;
        }

        const ptr = curr.ptr;
        if (!ptr) return;

        const res = await SmartPointer.resolve(ptr, this.db.allocator);
        
        let iterator;
        if (curr.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, res);
            iterator = map.iterateRaw();
        } else if (curr.type === constants.TYPE_SEQUENCE) {
            const seq = new Sequence(this.db.allocator, res);
            iterator = seq.iterateRaw();
        } else {
            return;
        }

        for await (const item of iterator) {
            const ptr = item.ptr;
            const val = await SmartPointer.resolve(ptr, this.db.allocator);
            const hydrated = await this._hydrateForIndex(val);
            
            const stablePtr = Buffer.alloc(16);
            ptr.copy(stablePtr);
            await indexer.updateIndex(path, stablePtr, null, null, hydrated);
        }
        await indexer.flush();
    }

    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        // B"H: Optimized Batching
        if (!this._updateBuffer.has(path)) {
            this._updateBuffer.set(path, []);
            this.db._pendingIndexOps.push(() => this._flushUpdates(path));
        }
        this._updateBuffer.get(path).push({ newPtr, oldPtr, oldVal, newVal });
    }
    
    async _flushUpdates(path) {
        const batch = this._updateBuffer.get(path);
        if (!batch || batch.length === 0) return;
        this._updateBuffer.delete(path);
        
        try {
            await this._ensureSysIndex();
            const indexer = this._getIndexer();
            
            for(const item of batch) {
                await indexer.updateIndex(path, item.newPtr, item.oldPtr, item.oldVal, item.newVal);
            }
            
            // indexer manages its own double-buffer for disk writes
        } catch(e) {
            console.error(`B"H Search Index Update Failed for ${path}:`, e);
        }
    }

    // B"H: New Flush method for db.waitForIdle()
    async flush() {
        // Flush all pending batches from buffers to indexer
        if (this._updateBuffer.size > 0) {
            for(const path of this._updateBuffer.keys()) {
                await this._flushUpdates(path);
            }
        }
        
        if (this._indexer) await this._indexer.flush();
    }

    async run(handleOrPath, query) {
        await this.db._flushBackgroundTasks();
        await this.flush();

        let path = handleOrPath;
        if (typeof handleOrPath !== 'string') {
             const h = handleOrPath[constants.SYMBOLS.INTERNALS] || handleOrPath;
             if (h.getPath) path = h.getPath();
             else throw new Error("Invalid Handle or Path");
        }

        if (!await this.isIndexed(path)) throw new Error(`Path ${path} is not indexed. Call db.search.enable(handle) first.`);

        await this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__;
        
        const indexMap = sysIndex[path];
        
        const queryTokens = [...tokenizer.tokenize(query)];
        if (queryTokens.length === 0) return [];

        const firstWord = queryTokens[0];
        const candidatesHandle = indexMap[firstWord];
        
        const exists = await this.db.has(indexMap, firstWord);
        if (!exists) return [];

        let resultPtrs = [];
        
        const h = candidatesHandle[constants.SYMBOLS.INTERNALS] || candidatesHandle;
        await h.ensureResolved();
        
        const firstRes = await SmartPointer.resolve(h.ptr, this.db.allocator);
        const firstSeq = new Sequence(this.db.allocator, firstRes);
        const len = await firstSeq.length();
        
        for(let i=0; i<len; i++) {
            const val = await firstSeq.getPtr(i);
            if(val) resultPtrs.push(val);
        }
        
        for (let i = 1; i < queryTokens.length; i++) {
            if (resultPtrs.length === 0) return [];

            const word = queryTokens[i];
            
            if (!await this.db.has(indexMap, word)) return [];
            
            const listHandle = indexMap[word];
            const lh = listHandle[constants.SYMBOLS.INTERNALS] || listHandle;
            await lh.ensureResolved();

            const currentListHex = new Set();
            const listRes = await SmartPointer.resolve(lh.ptr, this.db.allocator);
            const listSeq = new Sequence(this.db.allocator, listRes);
            const l = await listSeq.length();
            
            for(let j=0; j<l; j++) {
                const val = await listSeq.getPtr(j); 
                if(val) {
                    currentListHex.add(val.toString('hex'));
                }
            }

            resultPtrs = resultPtrs.filter(p1 => currentListHex.has(p1.toString('hex')));
        }

        const objects = [];
        const hydrationContext = new Map();

        for (const ptr of resultPtrs) {
            if (!Buffer.isBuffer(ptr)) continue;
            
            try {
                let resolved = undefined;
                let tempResolved = await SmartPointer.resolve(ptr, this.db.allocator, hydrationContext);
                
                if (tempResolved && tempResolved.isStructure) {
                    resolved = await this._hydrateStructure(tempResolved, hydrationContext);
                } else if (Buffer.isBuffer(ptr) && ptr.length === 16) {
                    resolved = await this._hydrateStructure(ptr, hydrationContext);
                } else {
                    resolved = tempResolved;
                }
                
                if (Buffer.isBuffer(resolved) && resolved.length === 16) {
                    const decoded = SmartPointer.decode(resolved);
                    if (decoded && (decoded.type === constants.TYPE_DICTIONARY || decoded.type === constants.TYPE_MAP || decoded.type === constants.TYPE_SEQUENCE)) {
                        continue;
                    }
                }

                if (resolved !== undefined && resolved !== null) {
                    objects.push(resolved);
                }
                
            } catch (e) {
                if (this.db.debug) console.warn(`B"H Search: Skipped result due to read error: ${e.message}`);
            }
        }
        return objects;
    }
}
module.exports = SearchManager;