// B"H
/**
 * @file index.js
 * @description
 *  The full-text search manager. Refactored to use idiomatic assignments.
 */

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
        this._indexer = null;
        this._updateBuffer = new Map();
    }

    async _ensureSysIndex() {
        if (!await this.db.has(this.db.root, "__sys_search__")) {
            // B"H: New assignment paradigm.
            this.db.root.__sys_search__ = new this.db.Map();
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
            // B"H: Marker Assignment.
            sysIndex[path] = new this.db.Map();
        }
        
        this.db.sysCache.search.add(path);
        await this.reindex(path);
    }
    // ... rest of logic preserved ...
    async isIndexed(path) {
        if (this.db.sysCache.loaded) return this.db.sysCache.search.has(path);
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
                     isStructure: true, type: decoded.type, blockId: readPointer48(decoded.payload, 0),
                     length: decoded.payload.readUInt32BE(6), offset: decoded.payload.readUInt32BE(10),
                     isChain: decoded.payload.readUInt8(14) === 1
                 };
             } else { descriptor = await SmartPointer.resolve(val, this.db.allocator, context); }
        }
        if (!descriptor || !descriptor.isStructure) return descriptor;
        if (context.has(descriptor.blockId)) return context.get(descriptor.blockId);
        try {
            if (descriptor.type === constants.TYPE_DICTIONARY || descriptor.type === constants.TYPE_CUSTOM_INSTANCE) {
                const dict = new Dictionary(this.db.allocator, descriptor);
                const obj = {}; context.set(descriptor.blockId, obj);
                for await (const k of dict.keys()) {
                    let v = await dict.get(k, context);
                    if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) v = await this._hydrateStructure(v, context);
                    obj[keyEncoding.decode(k)] = v;
                }
                return obj;
            }
            if (descriptor.type === constants.TYPE_MAP) {
                const mapEngine = new MapEngine(this.db.allocator, descriptor);
                const mapObj = {}; context.set(descriptor.blockId, mapObj);
                for await (const item of mapEngine.range()) {
                    let v = item.value;
                    if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) v = await this._hydrateStructure(v, context);
                    mapObj[keyEncoding.decode(item.key)] = v;
                }
                return mapObj;
            }
            if (descriptor.type === constants.TYPE_SEQUENCE || descriptor.type === constants.TYPE_SET) {
                const seq = new Sequence(this.db.allocator, descriptor);
                const arr = []; context.set(descriptor.blockId, arr);
                const len = await seq.length();
                for(let i=0; i<Math.min(len, 5000); i++) {
                    let v = await seq.get(i, context);
                    if (v && (v.isStructure || (Buffer.isBuffer(v) && v.length === 16))) v = await this._hydrateStructure(v, context);
                    arr.push(v);
                }
                return arr;
            }
        } catch(e) { return undefined; }
        return descriptor;
    }

    async _hydrateForIndex(val) {
        if (val && (val.isStructure || (Buffer.isBuffer(val) && val.length === 16))) return await this._hydrateStructure(val);
        return val;
    }

    async reindex(path) {
        await this._ensureSysIndex();
        const indexer = this._getIndexer();
        const parts = path.split('.').filter(p => p !== 'root');
        let curr = this.db.root[constants.SYMBOLS.INTERNALS] || this.db.root;
        for (let i = 0; i < parts.length; i++) {
            const next = curr.nav.navigate(parts[i]); 
            const nextInt = next[constants.SYMBOLS.INTERNALS] || next;
            await nextInt.ensureResolved(); 
            if (!nextInt.ptr) return; curr = nextInt;
        }
        const ptr = curr.ptr; if (!ptr) return;
        const res = await SmartPointer.resolve(ptr, this.db.allocator);
        let iterator;
        if (curr.type === constants.TYPE_MAP) iterator = (new MapEngine(this.db.allocator, res)).iterateRaw();
        else if (curr.type === constants.TYPE_SEQUENCE) iterator = (new Sequence(this.db.allocator, res)).iterateRaw();
        else return;
        for await (const item of iterator) {
            const val = await SmartPointer.resolve(item.ptr, this.db.allocator);
            const hydrated = await this._hydrateForIndex(val);
            const stablePtr = Buffer.alloc(16); item.ptr.copy(stablePtr);
            await indexer.updateIndex(path, stablePtr, null, null, hydrated);
        }
        await indexer.flush();
    }

    async updateIndex(path, newPtr, oldPtr, oldVal, newVal) {
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
            for(const item of batch) await indexer.updateIndex(path, item.newPtr, item.oldPtr, item.oldVal, item.newVal);
        } catch(e) {}
    }

    async flush() {
        if (this._updateBuffer.size > 0) {
            for(const path of this._updateBuffer.keys()) await this._flushUpdates(path);
        }
        if (this._indexer) await this._indexer.flush();
    }

    async run(handleOrPath, query) {
        await this.db._flushBackgroundTasks();
        await this.flush();
        let path = (typeof handleOrPath !== 'string') ? (handleOrPath[constants.SYMBOLS.INTERNALS] || handleOrPath).getPath() : handleOrPath;
        if (!await this.isIndexed(path)) throw new Error(`Path ${path} is not indexed.`);
        await this._ensureSysIndex();
        const sysIndex = this.db.root.__sys_search__;
        const indexMap = sysIndex[path];
        const queryTokens = [...tokenizer.tokenize(query)];
        if (queryTokens.length === 0) return [];
        const firstWord = queryTokens[0];
        if (!await this.db.has(indexMap, firstWord)) return [];
        const h = indexMap[firstWord][constants.SYMBOLS.INTERNALS] || indexMap[firstWord];
        await h.ensureResolved();
        const firstRes = await SmartPointer.resolve(h.ptr, this.db.allocator);
        const firstSeq = new Sequence(this.db.allocator, firstRes);
        let resultPtrs = [];
        for(let i=0; i<await firstSeq.length(); i++) {
            const val = await firstSeq.getPtr(i); if(val) resultPtrs.push(val);
        }
        for (let i = 1; i < queryTokens.length; i++) {
            if (resultPtrs.length === 0) return [];
            const word = queryTokens[i];
            if (!await this.db.has(indexMap, word)) return [];
            const lh = indexMap[word][constants.SYMBOLS.INTERNALS] || indexMap[word];
            await lh.ensureResolved();
            const currentListHex = new Set();
            const listRes = await SmartPointer.resolve(lh.ptr, this.db.allocator);
            const listSeq = new Sequence(this.db.allocator, listRes);
            for(let j=0; j<await listSeq.length(); j++) {
                const val = await listSeq.getPtr(j); if(val) currentListHex.add(val.toString('hex'));
            }
            resultPtrs = resultPtrs.filter(p => currentListHex.has(p.toString('hex')));
        }
        const objects = []; const ctx = new Map();
        for (const ptr of resultPtrs) {
            try {
                let r = await SmartPointer.resolve(ptr, this.db.allocator, ctx);
                if (r && r.isStructure) r = await this._hydrateStructure(r, ctx);
                if (r !== undefined && r !== null) objects.push(r);
            } catch (e) {}
        }
        return objects;
    }
}
module.exports = SearchManager;