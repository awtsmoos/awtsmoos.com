
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
        // B"H: Do not cache sysIndex permanently to avoid stale pointers if root moves
    }

    // B"H: Changed to _ensureSysIndex to prevent Thenable unwrapping of LiveHandle
    async _ensureSysIndex() {
        const hasSys = await this.db.root.has("__sys_search__");
        if (!hasSys) {
            await this.db.root.createMap("__sys_search__");
        }
    }

    async enableIndex(path) {
        await this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__; // Get Handle synchronously
        const existing = sysIndex.get(path);
        await existing.ensureResolved();
        if (!existing.ptr) {
            await sysIndex.createMap(path);
        }
        await this.reindex(path);
    }

    async isIndexed(path) {
        await this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__; // Get Handle synchronously
        const idx = sysIndex.get(path);
        await idx.ensureResolved();
        return !!idx.ptr;
    }

    // Hydrate a structure pointer into a JS object/array
    async _hydrateStructure(val, context = new Map()) {
        if (!val) return val;
        
        let descriptor = val;

        // Handle Pointer Buffer passed directly (Manual Resolve)
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
                    if (this.db.debug) console.error("B\"H Search: Error iterating Dictionary keys:", e);
                    return undefined; // Mark as invalid
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
            return undefined; // Return undefined on error to signal invalid/freed data
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
        const sysIndex = this.db.root.__sys_search__;
        
        const indexer = new SearchIndexer(this.db, sysIndex);
        
        const parts = [];
        const rawParts = path.split('.');
        for(const p of rawParts) {
            if (p !== 'root') parts.push(p);
        }

        let curr = this.db.root;
        for (let i = 0; i < parts.length; i++) {
            curr = curr.get(parts[i]); 
            await curr.ensureResolved(); 
            if (!curr.ptr) return; 
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

        for await (const { ptr, value } of iterator) {
            const hydrated = await this._hydrateForIndex(value);
            const stablePtr = Buffer.alloc(16);
            ptr.copy(stablePtr);
            await indexer.updateIndex(path, stablePtr, null, null, hydrated);
        }
    }

    // Proxy to Indexer
    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        await this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__;
        
        const indexer = new SearchIndexer(this.db, sysIndex);
        return indexer.updateIndex(path, newPtr, oldPtr, oldVal, newVal);
    }

    async search(path, query) {
        if (!await this.isIndexed(path)) throw new Error(`Path ${path} is not indexed. Call .enableSearch() first.`);

        await this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__;
        const indexMap = sysIndex.get(path);
        const queryTokens = [...tokenizer.tokenize(query)];
        if (queryTokens.length === 0) return [];

        const firstWord = queryTokens[0];
        const candidatesHandle = indexMap.get(firstWord);
        await candidatesHandle.ensureResolved();
        
        if (!candidatesHandle.ptr) return [];

        let resultPtrs = [];
        
        const firstRes = await SmartPointer.resolve(candidatesHandle.ptr, this.db.allocator);
        const firstSeq = new Sequence(this.db.allocator, firstRes);
        const len = await firstSeq.length();
        
        for(let i=0; i<len; i++) {
            const val = await firstSeq.getPtr(i);
            if(val) resultPtrs.push(val);
        }
        
        for (let i = 1; i < queryTokens.length; i++) {
            if (resultPtrs.length === 0) return [];

            const word = queryTokens[i];
            const listHandle = indexMap.get(word);
            await listHandle.ensureResolved();
            if (!listHandle.ptr) {
                return []; 
            }

            const currentListHex = new Set();
            const listRes = await SmartPointer.resolve(listHandle.ptr, this.db.allocator);
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
                
                // Strict Filter: Reject Buffers that claim to be structures but weren't hydrated
                // B"H: Safety - Check if resolved is still a pointer to a freed block
                if (Buffer.isBuffer(resolved) && resolved.length === 16) {
                    const decoded = SmartPointer.decode(resolved);
                    if (decoded && (decoded.type === constants.TYPE_DICTIONARY || decoded.type === constants.TYPE_MAP || decoded.type === constants.TYPE_SEQUENCE)) {
                        // Unhydrated structure pointer -> likely freed or corrupted. Skip.
                        continue;
                    }
                }

                // B"H: Explicit check against undefined/null results from failed hydration
                if (resolved !== undefined && resolved !== null) {
                    objects.push(resolved);
                }
                
            } catch (e) {
                // B"H: If hydration fails (e.g. block corrupted/freed), we MUST ignore this result.
                if (this.db.debug) console.warn(`B"H Search: Skipped result due to read error: ${e.message}`);
            }
        }
        return objects;
    }
}
module.exports = SearchManager;
