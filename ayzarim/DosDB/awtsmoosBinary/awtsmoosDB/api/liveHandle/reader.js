//B"H
/**
 * @file reader.js
 * @description
 *  The Sefirah of Binah - The Understanding of the Vessels.
 *  Handles the extraction and hydration of data from physical blocks.
 */

const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartBinary = require('../../utils/smartBinary.js');
const HandleRegistry = require('../../core/handleRegistry.js');

class Reader {
    constructor(handle) {
        this.handle = handle; 
        this.db = handle.db;
    }

    /**
     * @description Resolves the physical structure pointer for the current handle.
     */
    async _resolveStructPtr() {
        if (this.handle.ptr) {
            const decoded = SmartPointer.decode(this.handle.ptr);
            if (decoded && decoded.mode === constants.MODE_BLOCK) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    length: decoded.payload.readUInt32BE(6),
                    offset: decoded.payload.readUInt32BE(10),
                    isChain: decoded.payload.readUInt8(14) === 1
                };
            }
            if (decoded && decoded.mode === constants.MODE_HEAP) {
                return {
                    blockId: readPointer48(decoded.payload, 0),
                    offset: decoded.payload.readUInt32BE(6),
                    length: decoded.payload.readUInt32BE(10),
                    isChain: false,
                    isHeap: true
                };
            }
        }
        
        const isRoot = (this.handle.context === null || (this.db.root && HandleRegistry.getSoul(this.db.root) === this.handle));
        if (isRoot && this.db.rootPtrRaw) {
             const decoded = SmartPointer.decode(this.db.rootPtrRaw);
             return {
                 blockId: readPointer48(decoded.payload, 0),
                 length: decoded.payload.readUInt32BE(6),
                 offset: decoded.payload.readUInt32BE(10),
                 isChain: decoded.payload.readUInt8(14) === 1
             };
        }
        return null;
    }

    /**
     * @description Hydrates a structure or primitive into its final JS form.
     */
    async _resolveAndHydrate(ptr, context = new Map()) {
        const val = await SmartPointer.resolve(ptr, this.db.allocator, context);
        if (val && val.isStructure) return await this._hydrateStructure(val, context);
        if (val && typeof val === 'object' && val.__className__) {
            await this._hydrateObjectProperties(val, context);
        }
        return val;
    }

    /**
     * @description Resolves the entire structure pointed to by the handle into a native object.
     */
    async resolveSelf() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (!this.handle.ptr) {
                const isRoot = (this.handle.context === null || (this.db.root && HandleRegistry.getSoul(this.db.root) === this.handle));
                return isRoot ? {} : undefined;
            }
            return await this._resolveAndHydrate(this.handle.ptr);
        });
    }

    /**
     * @description Retrieves and hydrates a specific item by key or index.
     */
    async getItem(key) {
        return this.db.read(async () => {
            const res = await this.handle.nav.resolveKey(key);
            if (res && res.ptr) {
                return await this._resolveAndHydrate(res.ptr);
            }
            return undefined;
        });
    }

    /**
     * @description Returns the count of items in the container.
     */
    async length() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (!this.handle.ptr) return 0;
            const type = this.handle.type;

            if (type === constants.TYPE_SEQUENCE || type === constants.TYPE_SET) {
                const structPtr = await this._resolveStructPtr();
                if (!structPtr) return 0;
                const seq = new Sequence(this.db.allocator, structPtr);
                return await seq.length();
            }
            if (type === constants.TYPE_MAP || type === constants.TYPE_DICTIONARY) {
                const structPtr = await this._resolveStructPtr();
                if (!structPtr) return 0;
                const engine = (type === constants.TYPE_MAP) ? new MapEngine(this.db.allocator, structPtr) : new Dictionary(this.db.allocator, structPtr);
                const stats = await engine.stats();
                return stats.count;
            }
            if (type === constants.TYPE_SMART_ARRAY) {
                const decoded = SmartPointer.decode(this.handle.ptr);
                return decoded.payload.readUInt32BE(4);
            }
            return 0;
        });
    }

    /**
     * @description Returns a hydrated slice of the sequence.
     */
    async slice(start, end) {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (!this.handle.ptr) return [];

            const decoded = SmartPointer.decode(this.handle.ptr);
            if (decoded && decoded.mode === constants.MODE_INLINE && decoded.type === constants.TYPE_SMART_ARRAY) {
                const count = decoded.payload.readUInt32BE(4);
                let s = (start === undefined) ? 0 : (start < 0 ? Math.max(0, count + start) : Math.min(count, start));
                let e = (end === undefined) ? count : (end < 0 ? Math.max(0, count + end) : Math.min(count, end));
                const results = [];
                for(let i = s; i < e; i++) {
                    const valBuf = SmartBinary.getArrayIndex(decoded.payload, i);
                    results.push(await this._resolveAndHydrate(valBuf));
                }
                return results;
            }

            const structPtr = await this._resolveStructPtr();
            if (structPtr && (this.handle.type === constants.TYPE_SEQUENCE || this.handle.type === constants.TYPE_SET)) {
                const seq = new Sequence(this.db.allocator, structPtr);
                const results = [];
                const len = await seq.length();
                let actualStart = (start === undefined) ? 0 : (start < 0 ? Math.max(0, len + start) : Math.min(len, start));
                let actualEnd = (end === undefined) ? len : (end < 0 ? Math.max(0, len + end) : Math.min(len, end));
                
                const context = new Map();
                for(let i = actualStart; i < actualEnd; i++) {
                    const p = await seq.getPtr(i);
                    results.push(await this._resolveAndHydrate(p, context));
                }
                return results;
            }
            return [];
        });
    }

    async stats() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            const structPtr = await this._resolveStructPtr();
            if (!structPtr) return { count: 0, size: 0, capacity: 0, fragmentation: 0 };
            if (this.handle.type === constants.TYPE_SEQUENCE) return await (new Sequence(this.db.allocator, structPtr)).stats();
            if (this.handle.type === constants.TYPE_MAP) return await (new MapEngine(this.db.allocator, structPtr)).stats();
            if (this.handle.type === constants.TYPE_DICTIONARY) return await (new Dictionary(this.db.allocator, structPtr)).stats();
            return { count: 1, size: structPtr.length, capacity: structPtr.length, fragmentation: 0 };
        });
    }

    async _hydrateObjectProperties(obj, context) {
        for (const key in obj) {
            let val = obj[key];
            if (val && val.isStructure) obj[key] = await this._hydrateStructure(val, context);
        }
    }

    async _hydrateStructure(val, context) {
        if (!val || !val.isStructure) return val;
        
        const ctxKey = `b:${val.blockId}:${val.offset || 0}`;
        if (context.has(ctxKey)) return context.get(ctxKey);

        if (val.type === constants.TYPE_DICTIONARY) {
            const dict = new Dictionary(this.db.allocator, val);
            const obj = {}; context.set(ctxKey, obj);
            await this._hydrateDictionary(dict, obj, context);
            return obj;
        }
        
        if (val.type === constants.TYPE_SEQUENCE || val.type === constants.TYPE_SET) {
            const seq = new Sequence(this.db.allocator, val);
            const arr = (val.type === constants.TYPE_SET) ? new Set() : [];
            context.set(ctxKey, arr);
            const len = await seq.length();
            for(let i=0; i<len; i++) {
                let item = await seq.get(i, context);
                if (item && item.isStructure) item = await this._hydrateStructure(item, context);
                if (val.type === constants.TYPE_SET) arr.add(item); else arr.push(item);
            }
            return arr;
        }

        if (val.type === constants.TYPE_MAP) {
            const mapEngine = new MapEngine(this.db.allocator, val);
            const map = new Map(); context.set(ctxKey, map);
            for await (const item of mapEngine.range()) {
                const realKey = keyEncoding.decode(item.key);
                let realVal = item.value;
                if (realVal && realVal.isStructure) realVal = await this._hydrateStructure(realVal, context);
                map.set(realKey, realVal);
            }
            return map;
        }
        return val;
    }

    async _hydrateDictionary(dict, targetObj, context) {
        for await (const k of dict.keys()) {
            let val = await dict.get(k, context);
            const realKey = keyEncoding.decode(k);
            if (val && val.isStructure) val = await this._hydrateStructure(val, context);
            targetObj[realKey] = val;
        }
    }

    /**
     * @description Provides an asynchronous iterator over the collection, returning hydrated values.
     */
    async *iterator() {
        await this.handle.ensureResolved();
        if (!this.handle.ptr) return;

        const decoded = SmartPointer.decode(this.handle.ptr);
        if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_OBJECT) {
                 for (const k of SmartBinary.getObjectKeys(decoded.payload)) {
                     const valBuf = SmartBinary.getObjectProperty(decoded.payload, k);
                     yield [k, await this._resolveAndHydrate(valBuf)];
                 }
                 return;
             }
             if (decoded.type === constants.TYPE_SMART_ARRAY) {
                 const count = decoded.payload.readUInt32BE(4);
                 for (let i = 0; i < count; i++) {
                     const valBuf = SmartBinary.getArrayIndex(decoded.payload, i);
                     yield await this._resolveAndHydrate(valBuf);
                 }
                 return;
             }
        }

        let structPtr = await this._resolveStructPtr();
        if (!structPtr) return;

        if (this.handle.type === constants.TYPE_DICTIONARY) {
            const dict = new Dictionary(this.db.allocator, structPtr);
            const context = new Map();
            for await (const k of dict.keys()) {
                const val = await dict.get(k, context);
                const realKey = keyEncoding.decode(k);
                yield [realKey, await this._hydrateStructure(val, context)];
            }
        } 
        else if (this.handle.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            const context = new Map();
            for await (const item of map.range()) {
                const realKey = keyEncoding.decode(item.key);
                yield [realKey, await this._hydrateStructure(item.value, context)];
            }
        }
        else if (this.handle.type === constants.TYPE_SEQUENCE) {
            const seq = new Sequence(this.db.allocator, structPtr);
            const len = await seq.length();
            const context = new Map();
            for(let i=0; i<len; i++) {
                const ptr = await seq.getPtr(i);
                yield await this._resolveAndHydrate(ptr, context);
            }
        }
    }
    
    async *keys() { for await (const entry of this.iterator()) yield (Array.isArray(entry) ? entry[0] : entry); }
    async *values() { for await (const entry of this.iterator()) yield (Array.isArray(entry) ? entry[1] : entry); }
    async *entries() { 
        let i = 0;
        for await (const entry of this.iterator()) {
            if (this.handle.type === constants.TYPE_SEQUENCE || this.handle.type === constants.TYPE_SMART_ARRAY) {
                yield [i++, entry];
            } else {
                yield (Array.isArray(entry) ? entry : [undefined, entry]);
            }
        }
    }

    async *range(start, end) {
        await this.handle.ensureResolved();
        const structPtr = await this._resolveStructPtr();
        if (structPtr && this.handle.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            const context = new Map();
            for await (const item of map.range(start, end)) {
                const realKey = keyEncoding.decode(item.key);
                yield { key: realKey, value: await this._hydrateStructure(item.value, context) };
            }
        }
    }
}
module.exports = Reader;