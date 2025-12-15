
// B"H
const tokenizer = require('./tokenizer.js');
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const MapEngine = require('../../structure/map/index.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');

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

    // Hydrate a structure pointer into a JS object/array
    async _hydrateStructure(val, context = new Map()) {
        if (!val) return val;
        
        // Handle Pointer Buffer passed directly (Manual Resolve)
        if (Buffer.isBuffer(val) && val.length === 16) {
             const decoded = SmartPointer.decode(val);
             if (decoded && decoded.mode === constants.MODE_BLOCK) {
                 // Convert Buffer to Descriptor manually to ensure hydration logic triggers
                 val = {
                     isStructure: true,
                     type: decoded.type,
                     blockId: readPointer48(decoded.payload, 0),
                     length: decoded.payload.readUInt32BE(6),
                     offset: decoded.payload.readUInt32BE(10),
                     isChain: decoded.payload.readUInt8(14) === 1
                 };
             } else {
                 // Try normal resolve
                 val = await SmartPointer.resolve(val, this.db.allocator, context);
             }
        }

        if (!val || !val.isStructure) return val;
        
        if (context.has(val.blockId)) return context.get(val.blockId);

        if (val.type === constants.TYPE_DICTIONARY || val.type === constants.TYPE_CUSTOM_INSTANCE) {
            const dict = new Dictionary(this.db.allocator, val);
            const obj = {};
            context.set(val.blockId, obj);
            
            // B"H: Iterate keys and hydrate values
            try {
                for await (const k of dict.keys()) {
                    let v = await dict.get(k, context);
                    // Recursively hydrate if it's a structure or pointer
                    if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) {
                        v = await this._hydrateStructure(v, context);
                    }
                    const realKey = keyEncoding.decode(k);
                    obj[realKey] = v;
                }
            } catch(e) {
                if(this.db.debug) console.warn("B\"H Search: Error hydrating Dictionary:", e.message);
                return obj; // Return what we have (or empty) if init/iter fails
            }
            return obj;
        }
        
        if (val.type === constants.TYPE_MAP) {
            const mapEngine = new MapEngine(this.db.allocator, val);
            const mapObj = {}; 
            context.set(val.blockId, mapObj);
            
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
            } catch(e) {}
            return mapObj;
        }

        if (val.type === constants.TYPE_SEQUENCE || val.type === constants.TYPE_SET) {
            const seq = new Sequence(this.db.allocator, val);
            const arr = [];
            context.set(val.blockId, arr);
            
            const len = await seq.length();
            const limit = Math.min(len, 5000);
            for(let i=0; i<limit; i++) {
                let v = await seq.get(i, context);
                if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) {
                    v = await this._hydrateStructure(v, context);
                }
                arr.push(v);
            }
            return arr;
        }

        return val;
    }

    async _hydrateForIndex(val) {
        if (val && (val.isStructure || (Buffer.isBuffer(val) && val.length === 16))) {
             return await this._hydrateStructure(val);
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
                // 1. Try to resolve the pointer
                let resolved = await SmartPointer.resolve(ptr, this.db.allocator, hydrationContext);
                
                // 2. If it's a structure, hydrate it
                if (resolved && resolved.isStructure) {
                    resolved = await this._hydrateStructure(resolved, hydrationContext);
                } 
                else if (Buffer.isBuffer(ptr) && ptr.length === 16) {
                    // Fallback: If SmartPointer.resolve returned raw buffer (shouldn't happen for structs)
                    // or if we have a raw pointer that needs explicit hydration check
                    const decoded = SmartPointer.decode(ptr);
                    
                    // Explicitly hydrate Dictionaries and Maps if they weren't caught
                    if (decoded && (decoded.type === constants.TYPE_DICTIONARY || decoded.type === constants.TYPE_MAP || decoded.type === constants.TYPE_CUSTOM_INSTANCE)) {
                         resolved = await this._hydrateStructure(ptr, hydrationContext);
                    }
                }
                
                // B"H: Strict Filter
                // If the result remains a Buffer(16), it means it's a raw pointer that wasn't hydrated to an Object.
                // We should only keep it if the original data WAS a Buffer or String.
                if (Buffer.isBuffer(resolved) && resolved.length === 16) {
                    const decoded = SmartPointer.decode(ptr);
                    const allowedTypes = [constants.TYPE_BUFFER, constants.TYPE_STRING, constants.TYPE_JSON];
                    
                    if (!allowedTypes.includes(decoded.type)) {
                        // If it's a Dictionary(7) or Map(8) but still a Buffer, hydration failed. Skip.
                        if (this.db.debug) console.warn(`B"H Search: Discarding unhydrated pointer of Type ${decoded.type}.`);
                        continue; 
                    }
                }

                if (resolved !== undefined) {
                    objects.push(resolved);
                }
                
            } catch (e) {
                if (this.db.debug) console.warn(`B"H Search: Skipping stale index entry. ${e.message}`);
            }
        }
        return objects;
    }
}
module.exports = SearchManager;
