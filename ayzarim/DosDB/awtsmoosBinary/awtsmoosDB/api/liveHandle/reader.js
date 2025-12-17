
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');

class Reader {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

    // B"H: Helper to get the underlying structure pointer
    async _resolveStructPtr() {
        if (this.handle.ptr) {
            return await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
        } else if (this.db.rootPtrRaw) {
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

    async resolveSelf() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();

            const context = new Map();
            if (!this.handle.ptr || (this.handle.type === constants.TYPE_DICTIONARY && !this.handle.ptr)) {
                if (this.handle !== this.db.root && !this.handle.ptr) return undefined;

                let structPtr = await this._resolveStructPtr();
                if (!structPtr) return {}; 

                const dict = new Dictionary(this.db.allocator, structPtr);
                const obj = {};
                context.set(structPtr.blockId, obj); 
                await this._hydrateDictionary(dict, obj, context);
                return obj;
            }
            const val = await SmartPointer.resolve(this.handle.ptr, this.db.allocator, context);
            
            if (val && val.isStructure) return await this._hydrateStructure(val, context);
            
            if (val && typeof val === 'object' && val.__className__) {
                await this._hydrateObjectProperties(val, context);
            }
            
            return val;
        });
    }

    async _hydrateObjectProperties(obj, context) {
        for (const key in obj) {
            const val = obj[key];
            if (val && val.isStructure) {
                obj[key] = await this._hydrateStructure(val, context);
            }
        }
    }

    async _hydrateStructure(val, context) {
        if (!val || !val.isStructure) return val;
        if (context.has(val.blockId)) return context.get(val.blockId);

        if (val.type === constants.TYPE_DICTIONARY) {
            const dict = new Dictionary(this.db.allocator, val);
            const obj = {};
            context.set(val.blockId, obj);
            await this._hydrateDictionary(dict, obj, context);
            return obj;
        }
        
        if (val.type === constants.TYPE_SEQUENCE) {
            const seq = new Sequence(this.db.allocator, val);
            const arr = [];
            context.set(val.blockId, arr);
            const len = await seq.length();
            const limit = Math.min(len, 2000);
            for(let i=0; i<limit; i++) {
                let item = await seq.get(i, context);
                if (item && item.isStructure) item = await this._hydrateStructure(item, context);
                arr.push(item);
            }
            return arr;
        }

        if (val.type === constants.TYPE_SET) {
            const seq = new Sequence(this.db.allocator, val);
            const set = new Set();
            context.set(val.blockId, set);
            const len = await seq.length();
            const limit = Math.min(len, 2000);
            for(let i=0; i<limit; i++) {
                let item = await seq.get(i, context);
                if (item && item.isStructure) item = await this._hydrateStructure(item, context);
                set.add(item);
            }
            return set;
        }

        if (val.type === constants.TYPE_MAP) {
            const mapEngine = new MapEngine(this.db.allocator, val);
            const map = new Map();
            context.set(val.blockId, map);
            let count = 0;
            for await (const item of mapEngine.range()) {
                if (count++ > 2000) break;
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
        let count = 0;
        for await (const k of dict.keys()) {
            if (count++ > 2000) break;
            if (k === undefined || k === null) continue;
            let val = await dict.get(k, context);
            const realKey = keyEncoding.decode(k);
            if (val && val.isStructure) val = await this._hydrateStructure(val, context);
            targetObj[realKey] = val;
        }
    }

    _wrapIfNeeded(val, keyOrIndex) {
        if (val && val.isStructure) {
            const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
            const LH = require('./index.js');
            return new LH(this.db, buf, val.type, null);
        }
        return val;
    }

    async getItem(index) {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (!this.handle.ptr) return undefined;

            const res = await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            const seq = new Sequence(this.db.allocator, res);
            const val = await seq.get(index);
            
            if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                return await this._hydrateStructure(val, new Map());
            }

            if (val && val.isStructure) {
                 const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
                 const LH = require('./index.js');
                 return new LH(this.db, buf, val.type, { parent: this.handle, key: index });
            }
            return val;
        });
    }

    async slice(start, end) {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (!this.handle.ptr) return [];

            const res = await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            const seq = new Sequence(this.db.allocator, res);
            const rawItems = await seq.slice(start, end);
            
            const processed = [];
            for (let item of rawItems) {
                if (item && item.isStructure && item.type === constants.TYPE_DICTIONARY) {
                     processed.push(await this._hydrateStructure(item, new Map()));
                } else {
                     processed.push(this._wrapIfNeeded(item));
                }
            }
            return processed;
        });
    }

    async length() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (!this.handle.ptr) return 0;

            const res = await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            
            if (this.handle.type === constants.TYPE_SEQUENCE || this.handle.type === constants.TYPE_SET) {
                const seq = new Sequence(this.db.allocator, res);
                return seq.length();
            } else if (this.handle.type === constants.TYPE_MAP) {
                const map = new MapEngine(this.db.allocator, res);
                const s = await map.stats();
                return s.count;
            } else if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = new Dictionary(this.db.allocator, res);
                const s = await dict.stats();
                return s.count;
            }
            
            // B"H: Primitives Support (Strings, Buffers, Arrays)
            if (res && (typeof res === 'string' || Buffer.isBuffer(res) || Array.isArray(res))) {
                return res.length;
            }
            if (res && res.size !== undefined) { // JS Set/Map
                return res.size;
            }
            
            return 0;
        });
    }

    async byteSize() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            let structPtr = await this._resolveStructPtr();
            
            if (this.handle.type === constants.TYPE_SEQUENCE || this.handle.type === constants.TYPE_SET) {
                const seq = new Sequence(this.db.allocator, structPtr);
                return seq.byteSize();
            }
            if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = new Dictionary(this.db.allocator, structPtr);
                const stats = await dict.stats();
                return stats.size;
            }
            if (this.handle.type === constants.TYPE_MAP) {
                const map = new MapEngine(this.db.allocator, structPtr);
                const stats = await map.stats();
                return stats.size;
            }
            
            const val = await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            if (Buffer.isBuffer(val)) return val.length;
            if (typeof val === 'string') return Buffer.byteLength(val, 'utf8');
            return 8; 
        });
    }

    async stats() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            let structPtr = await this._resolveStructPtr();

            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const seq = new Sequence(this.db.allocator, structPtr);
                return seq.stats();
            } 
            else if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = new Dictionary(this.db.allocator, structPtr);
                return dict.stats();
            }
            else if (this.handle.type === constants.TYPE_MAP) {
                const map = new MapEngine(this.db.allocator, structPtr);
                return map.stats();
            }
            return { error: "Stats not available for this type" };
        });
    }

    async *range(start, end) {
        await this.handle.ensureResolved();
        let structPtr = await this._resolveStructPtr();

        if (this.handle.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for await (const item of map.range(start, end)) {
                const realKey = keyEncoding.decode(item.key);
                let val = item.value;
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    val = await this._hydrateStructure(val, new Map());
                } else {
                    val = this._wrapIfNeeded(val);
                }
                yield { key: realKey, value: val };
            }
        }
    }

    async *iterator() {
        await this.handle.ensureResolved();
        let structPtr = await this._resolveStructPtr();
        
        // B"H: Explicitly check handle type after resolution
        const type = this.handle.type;

        if (type === constants.TYPE_DICTIONARY) {
            const keys = await this.db.read(async () => {
                const dict = new Dictionary(this.db.allocator, structPtr);
                const k = [];
                for await (const key of dict.keys()) k.push(key);
                return k;
            });
            for(const k of keys) {
                const val = await this.db.read(async () => {
                    const dict = new Dictionary(this.db.allocator, structPtr);
                    return dict.get(k);
                });
                let wrappedVal = val;
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    wrappedVal = await this._hydrateStructure(val, new Map());
                } else {
                    wrappedVal = this._wrapIfNeeded(val);
                }
                const realKey = keyEncoding.decode(k);
                
                // B"H: Standard Iteration: Yield [Key, Value] array only. No extra props.
                yield [realKey, wrappedVal];
            }
        } 
        else if (type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for await (const item of map.range()) {
                const realKey = keyEncoding.decode(item.key);
                let val = item.value;
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    val = await this._hydrateStructure(val, new Map());
                } else {
                    val = this._wrapIfNeeded(val);
                }
                // B"H: Standard Iteration: Yield [Key, Value]
                yield [realKey, val];
            }
        }
        else if (type === constants.TYPE_SEQUENCE) {
            const len = await this.db.read(async () => {
                const seq = new Sequence(this.db.allocator, structPtr);
                return seq.length();
            });
            for(let i=0; i<len; i++) {
                const val = await this.db.read(async () => {
                    const seq = new Sequence(this.db.allocator, structPtr);
                    return seq.get(i);
                });
                let wrappedVal = val;
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    wrappedVal = await this._hydrateStructure(val, new Map());
                } else {
                    wrappedVal = this._wrapIfNeeded(val);
                }
                // B"H: Standard Array Iteration: Yield Value only
                yield wrappedVal;
            }
        }
    }

    async *keys() {
        await this.handle.ensureResolved();
        let structPtr = await this._resolveStructPtr();
        const type = this.handle.type;

        if (type === constants.TYPE_DICTIONARY) {
            const dict = new Dictionary(this.db.allocator, structPtr);
            for await (const k of dict.keys()) yield keyEncoding.decode(k);
        } else if (type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for await (const item of map.range()) yield keyEncoding.decode(item.key);
        } else if (type === constants.TYPE_SEQUENCE) {
            const seq = new Sequence(this.db.allocator, structPtr);
            const len = await seq.length();
            for(let i=0; i<len; i++) yield i;
        }
    }

    async *values() {
        // B"H: FIX - Ensure type is resolved BEFORE creating iterator
        await this.handle.ensureResolved();
        const type = this.handle.type;
        const iterator = this.iterator();
        
        for await (const entry of iterator) {
            if (Array.isArray(entry) && entry.length === 2 && (type === constants.TYPE_DICTIONARY || type === constants.TYPE_MAP)) {
                yield entry[1];
            } else {
                yield entry;
            }
        }
    }

    async *entries() { 
        await this.handle.ensureResolved();
        // B"H: Grab type immediately after resolution to avoid race/stale props
        const type = this.handle.type;
        
        if (type === constants.TYPE_SEQUENCE) {
            let i = 0;
            // Directly call iterator, which for sequence yields ONLY values
            for await (const val of this.iterator()) {
                yield [i++, val];
            }
        } else {
            // For Map/Dict, iterator already yields [key, val]
            yield* this.iterator(); 
        }
    }
}
module.exports = Reader;
