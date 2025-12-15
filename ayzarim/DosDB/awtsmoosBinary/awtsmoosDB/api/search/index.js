
// B"H
const tokenizer = require('./tokenizer.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');

class SearchManager {
    constructor(db) {
        this.db = db;
        this.sysIndex = null;
    }

    async _init() {
        if (this.sysIndex) return;
        const hasSys = await this.db.root.has("__sys_search__");
        if (!hasSys) {
            await this.db.root.createMap("__sys_search__");
        }
        this.sysIndex = this.db.root.__sys_search__;
    }

    async enableIndex(path) {
        await this._init();
        const existing = this.sysIndex.get(path);
        await existing.ensureResolved();
        if (!existing.ptr) {
            await this.sysIndex.createMap(path);
        }
        await this.reindex(path);
    }

    async isIndexed(path) {
        await this._init();
        const idx = this.sysIndex.get(path);
        await idx.ensureResolved();
        return !!idx.ptr;
    }

    async _hydrateForIndex(val) {
        if (val && val.isStructure) {
             const LH = require('../liveHandle/index.js');
             const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
             const h = new LH(this.db, buf, val.type, null);
             return await h.reader.resolveSelf();
        }
        return val;
    }

    async reindex(path) {
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
            // B"H: Copy ptr to ensure stability. 
            // 'ptr' from iterateRaw is a subarray view which might be unstable across async ops.
            const stablePtr = Buffer.alloc(16);
            ptr.copy(stablePtr);
            await this.updateIndex(path, stablePtr, null, null, hydrated);
        }
    }

    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        if (!await this.isIndexed(path)) return;

        const oldTokens = this._extractTokens(oldVal);
        const newTokens = this._extractTokens(newVal);
        const indexMap = this.sysIndex.get(path);

        if (this._ptrsEqual(newPtr, oldPtr)) {
            const toAdd = [...newTokens].filter(x => !oldTokens.has(x));
            const toRemove = [...oldTokens].filter(x => !newTokens.has(x));

            await this._removeFromIndex(indexMap, toRemove, oldPtr);
            await this._addToIndex(indexMap, toAdd, newPtr);
        } 
        else {
            if (oldPtr) await this._removeFromIndex(indexMap, oldTokens, oldPtr);
            if (newPtr) await this._addToIndex(indexMap, newTokens, newPtr);
        }
    }

    async _removeFromIndex(indexMap, tokens, ptr) {
        for (const word of tokens) {
            const listHandle = indexMap.get(word);
            await listHandle.ensureResolved();
            
            if (listHandle.ptr) {
                const res = await SmartPointer.resolve(listHandle.ptr, this.db.allocator);
                const seq = new Sequence(this.db.allocator, res);
                
                const len = await seq.length();
                for (let i = 0; i < len; i++) {
                    const valPtr = await seq.getPtr(i);
                    if (this._ptrsEqual(valPtr, ptr)) {
                        await listHandle.splice(i, 1);
                        break;
                    }
                }
            }
        }
    }

    async _addToIndex(indexMap, tokens, ptr) {
        for (const word of tokens) {
            let list = indexMap.get(word);
            await list.ensureResolved();
            
            if (!list.ptr) {
                await indexMap.createList(word);
                list = indexMap.get(word);
                await list.ensureResolved();
            }
            await list.writer.push(ptr, { isPtr: true });
        }
    }

    _extractTokens(val, set = new Set(), visited = new Set()) {
        if (!val) return set;
        if (typeof val === 'object' && val !== null) {
            if (visited.has(val)) return set;
            visited.add(val);
        }

        if (typeof val === 'string') {
            const tokens = tokenizer.tokenize(val);
            tokens.forEach(t => set.add(t));
        } else if (typeof val === 'object') {
            for (const key in val) {
                this._extractTokens(val[key], set, visited);
            }
        }
        return set;
    }

    _ptrsEqual(a, b) {
        if (!a && !b) return true;
        if (!a || !b) return false;
        if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) return a.equals(b);
        return false;
    }

    async search(path, query) {
        if (!await this.isIndexed(path)) throw new Error(`Path ${path} is not indexed. Call .enableSearch() first.`);

        const indexMap = this.sysIndex.get(path);
        const queryTokens = [...tokenizer.tokenize(query)];
        if (queryTokens.length === 0) return [];

        // B"H: Sort tokens by frequency (heuristic: or just process). 
        // Optimization: Process smallest list first? For now, standard order.
        
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
        
        // B"H: Optimization - Use Hex String Set for O(N) intersection
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
        for (const ptr of resultPtrs) {
            // B"H: Resolve the pointer to the actual object
            // Use resolvePointer helper to handle block/heap modes cleanly
            const obj = await SmartPointer.resolve(ptr, this.db.allocator);
            
            if (obj && obj.isStructure) {
                const tempHandle = new (require('../liveHandle/index.js'))(this.db, ptr, obj.type, null);
                objects.push(await tempHandle.reader.resolveSelf());
            } else {
                // Check if it's a pointer to a Dictionary/Map (e.g. from a Collection)
                // resolve returns the pointer details if MODE_BLOCK/HEAP
                // But SmartPointer.resolve above handles it.
                // If it returned a primitive, push it.
                objects.push(obj);
            }
        }
        return objects;
    }
}
module.exports = SearchManager;
