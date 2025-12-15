





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
        
        // B"H: Optimization - Direct check avoids full root hydration
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
        // console.log(`B"H SearchManager.reindex(${path}) START`);
        const parts = [];
        // B"H: Handle both 'root.users' and 'users' formats
        const rawParts = path.split('.');
        for(const p of rawParts) {
            if (p !== 'root') parts.push(p);
        }

        let curr = this.db.root;
        
        // B"H: Traverse Handles, not Values
        for (let i = 0; i < parts.length; i++) {
            curr = curr.get(parts[i]); // Get child handle
            await curr.ensureResolved(); // Ensure it points to data
            if (!curr.ptr) {
                // console.log(`B"H reindex: Path part '${parts[i]}' not found.`);
                return; // Path doesn't exist
            }
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
            // console.log(`B"H reindex: Unsupported type ${curr.type}`);
            return;
        }

        let count = 0;
        for await (const { ptr, value } of iterator) {
            // console.log(`B"H reindex: Item ${count++} Value=${JSON.stringify(value)}`);
            
            // B"H: Hydrate value so we can extract tokens from Dictionary/Map content
            const hydrated = await this._hydrateForIndex(value);
            
            // Reindex: treat as new insertion (oldPtr=null)
            await this.updateIndex(path, ptr, null, null, hydrated);
        }
        // console.log(`B"H reindex: Processed ${count} items.`);
    }

    /**
     * B"H: Updates the inverted index.
     * Handles Insertion (oldPtr=null), Deletion (newPtr=null), and Replacement.
     * Crucially, removes oldPtr from index if it differs from newPtr to avoid dangling refs.
     */
    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
        if (!await this.isIndexed(path)) return;

        const oldTokens = this._extractTokens(oldVal);
        const newTokens = this._extractTokens(newVal);
        const indexMap = this.sysIndex.get(path);

        // Scenario 1: Pointers are identical (In-place update or identical content ref)
        // We only need to update the token lists for changed words.
        if (this._ptrsEqual(newPtr, oldPtr)) {
            const toAdd = [...newTokens].filter(x => !oldTokens.has(x));
            const toRemove = [...oldTokens].filter(x => !newTokens.has(x));

            await this._removeFromIndex(indexMap, toRemove, oldPtr);
            await this._addToIndex(indexMap, toAdd, newPtr);
        } 
        else {
            // Scenario 2: Pointers differ (Replacement, Move, Insert, or Delete)
            // We must remove the OLD pointer from ALL its associated tokens.
            // And add the NEW pointer to ALL its associated tokens.
            
            if (oldPtr) {
                await this._removeFromIndex(indexMap, oldTokens, oldPtr);
            }
            
            if (newPtr) {
                await this._addToIndex(indexMap, newTokens, newPtr);
            }
        }
    }

    async _removeFromIndex(indexMap, tokens, ptr) {
        for (const word of tokens) {
            const list = indexMap.get(word);
            await list.ensureResolved();
            
            if (list.ptr) {
                const len = await list.length;
                for (let i = 0; i < len; i++) {
                    const storedPtr = await list.get(i);
                    if (this._ptrsEqual(storedPtr, ptr)) {
                        await list.splice(i, 1);
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
                // Refresh handle after creation
                list = indexMap.get(word);
                await list.ensureResolved();
            }
            await list.push(ptr);
        }
    }

    _extractTokens(val, set = new Set(), visited = new Set()) {
        if (!val) return set;
        
        // B"H: Cycle Detection
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
        const len = await candidatesHandle.length;
        for(let i=0; i<len; i++) resultPtrs.push(await candidatesHandle.get(i));

        for (let i = 1; i < queryTokens.length; i++) {
            const word = queryTokens[i];
            const listHandle = indexMap.get(word);
            await listHandle.ensureResolved();
            
            if (!listHandle.ptr) return []; 

            const currentListPtrs = [];
            const l = await listHandle.length;
            for(let j=0; j<l; j++) currentListPtrs.push(await listHandle.get(j));

            resultPtrs = resultPtrs.filter(p1 => currentListPtrs.some(p2 => p1.equals(p2)));
            if (resultPtrs.length === 0) return [];
        }

        const objects = [];
        for (const ptr of resultPtrs) {
            const obj = await SmartPointer.resolve(ptr, this.db.allocator);
            if (obj && obj.isStructure) {
                const tempHandle = new (require('../liveHandle/index.js'))(this.db, ptr, obj.type, null);
                objects.push(await tempHandle.reader.resolveSelf());
            } else {
                objects.push(obj);
            }
        }
        return objects;
    }
}
module.exports = SearchManager;