// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartBinary = require('../../utils/smartBinary.js');

class Reader {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
    }

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

            // --- Smart Binary (Inline) ---
            const decoded = SmartPointer.decode(this.handle.ptr);
            if (decoded && decoded.mode === constants.MODE_INLINE) {
                if (decoded.type === constants.TYPE_SMART_OBJECT) {
                    const keys = SmartBinary.getObjectKeys(decoded.payload);
                    const obj = {};
                    for(const k of keys) {
                        const valBuf = SmartBinary.getObjectProperty(decoded.payload, k);
                        // Recursively resolve the value (it's a pointer buffer)
                        obj[k] = await SmartPointer.resolve(valBuf, this.db.allocator);
                    }
                    return obj;
                }
                if (decoded.type === constants.TYPE_SMART_ARRAY) {
                    const count = decoded.payload.readUInt32BE(4);
                    const arr = [];
                    for(let i=0; i<count; i++) {
                        const valBuf = SmartBinary.getArrayIndex(decoded.payload, i);
                        arr.push(await SmartPointer.resolve(valBuf, this.db.allocator));
                    }
                    return arr;
                }
                // Other inline types
                return SmartPointer.decodeInline(decoded.type, decoded.payload);
            }

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
                // B"H: keyEncoding.decode handles Buffer->String conversion
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

    // --- Iteration for Smart Types ---
    async *iterator() {
        await this.handle.ensureResolved();
        
        // Smart Binary
        const decoded = SmartPointer.decode(this.handle.ptr);
        if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_OBJECT) {
                 const keys = SmartBinary.getObjectKeys(decoded.payload);
                 for (const k of keys) {
                     const valBuf = SmartBinary.getObjectProperty(decoded.payload, k);
                     const val = await SmartPointer.resolve(valBuf, this.db.allocator);
                     yield [k, val];
                 }
                 return;
             }
             if (decoded.type === constants.TYPE_SMART_ARRAY) {
                 const count = decoded.payload.readUInt32BE(4);
                 for (let i = 0; i < count; i++) {
                     const valBuf = SmartBinary.getArrayIndex(decoded.payload, i);
                     const val = await SmartPointer.resolve(valBuf, this.db.allocator);
                     yield val;
                 }
                 return;
             }
        }

        // Heavy Block Types (Existing Logic)
        let structPtr = await this._resolveStructPtr();
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
                yield [keyEncoding.decode(k), wrappedVal];
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
                yield wrappedVal;
            }
        }
    }
    
    // Pass-through for other methods like keys(), values() which depend on iterator()
    async *keys() {
         await this.handle.ensureResolved();
         const decoded = SmartPointer.decode(this.handle.ptr);
         
         if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_OBJECT) {
                 const k = SmartBinary.getObjectKeys(decoded.payload);
                 for(const key of k) yield key;
                 return;
             }
             if (decoded.type === constants.TYPE_SMART_ARRAY) {
                 const count = decoded.payload.readUInt32BE(4);
                 for(let i=0; i<count; i++) yield i;
                 return;
             }
         }
         
         // Fallback to Heavy Block logic
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
        for await (const entry of this.iterator()) {
            if (Array.isArray(entry) && entry.length === 2) yield entry[1];
            else yield entry;
        }
    }

    async *entries() { 
        await this.handle.ensureResolved();
        const type = this.handle.type;
        const decoded = SmartPointer.decode(this.handle.ptr);
        
        if (decoded && decoded.mode === constants.MODE_INLINE && decoded.type === constants.TYPE_SMART_ARRAY) {
             let i=0;
             for await (const val of this.iterator()) yield [i++, val];
        } else if (type === constants.TYPE_SEQUENCE) {
            let i = 0;
            for await (const val of this.iterator()) yield [i++, val];
        } else {
            yield* this.iterator(); 
        }
    }
    
    // Add slice() and length() overrides for Smart Types
    async length() {
        await this.handle.ensureResolved();
        const decoded = SmartPointer.decode(this.handle.ptr);
        if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_ARRAY) return decoded.payload.readUInt32BE(4);
             if (decoded.type === constants.TYPE_SMART_OBJECT) return decoded.payload.readUInt16BE(4);
             if (typeof decoded.payload === 'string') return decoded.payload.length;
             return 0;
        }
        
        // Block Logic
        return this.db.read(async () => {
             let structPtr = await this._resolveStructPtr();
             if (this.handle.type === constants.TYPE_SEQUENCE || this.handle.type === constants.TYPE_SET) {
                const seq = new Sequence(this.db.allocator, structPtr);
                return seq.length();
            } else if (this.handle.type === constants.TYPE_MAP) {
                const map = new MapEngine(this.db.allocator, structPtr);
                const s = await map.stats();
                return s.count;
            } else if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = new Dictionary(this.db.allocator, structPtr);
                const s = await dict.stats();
                return s.count;
            }
             // Primitives
            const res = await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            if (res && (typeof res === 'string' || Buffer.isBuffer(res) || Array.isArray(res))) return res.length;
            if (res && res.size !== undefined) return res.size;
            return 0;
        });
    }
    
    async slice(start, end) {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            
            const decoded = SmartPointer.decode(this.handle.ptr);
            if (decoded && decoded.mode === constants.MODE_INLINE && decoded.type === constants.TYPE_SMART_ARRAY) {
                const count = decoded.payload.readUInt32BE(4);
                let s = start === undefined ? 0 : start;
                let e = end === undefined ? count : end;
                if (s < 0) s = Math.max(0, count + s);
                if (e < 0) e = Math.max(0, count + e);
                if (s > count) s = count;
                if (e > count) e = count;
                if (s > e) s = e;
                
                const arr = [];
                const context = new Map();
                for(let i=s; i<e; i++) {
                    const valBuf = SmartBinary.getArrayIndex(decoded.payload, i);
                    const val = await SmartPointer.resolve(valBuf, this.db.allocator, context);
                    if (val && val.isStructure) {
                        arr.push(await this._hydrateStructure(val, context));
                    } else {
                        arr.push(val);
                    }
                }
                return arr;
            }

            let structPtr = await this._resolveStructPtr();
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const seq = new Sequence(this.db.allocator, structPtr);
                const rawSlice = await seq.slice(start, end);
                const hydratedSlice = [];
                const context = new Map();
                for(const val of rawSlice) {
                     if (val && val.isStructure) {
                         hydratedSlice.push(await this._hydrateStructure(val, context));
                     } else {
                         hydratedSlice.push(val);
                     }
                }
                return hydratedSlice;
            }
            return [];
        });
    }

    async getItem(index) {
         await this.handle.ensureResolved();
         const decoded = SmartPointer.decode(this.handle.ptr);
         if (decoded && decoded.mode === constants.MODE_INLINE && decoded.type === constants.TYPE_SMART_ARRAY) {
             const valBuf = SmartBinary.getArrayIndex(decoded.payload, index);
             return await SmartPointer.resolve(valBuf, this.db.allocator);
         }
         
         // Block Logic
         return this.db.read(async () => {
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

    async *range(start, end) {
        await this.handle.ensureResolved();
        
        let structPtr = await this._resolveStructPtr();
        
        if (this.handle.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for await (const item of map.range(start, end)) {
                let val = item.value;
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    val = await this._hydrateStructure(val, new Map());
                } else {
                    val = this._wrapIfNeeded(val);
                }
                yield { key: item.key, value: val };
            }
        }
    }

    async stats() {
        await this.handle.ensureResolved();
        let structPtr = await this._resolveStructPtr();
        return this.db.read(async () => {
             if (this.handle.type === constants.TYPE_SEQUENCE) {
                 const seq = new Sequence(this.db.allocator, structPtr);
                 return seq.stats();
             } else if (this.handle.type === constants.TYPE_MAP) {
                 const map = new MapEngine(this.db.allocator, structPtr);
                 return map.stats();
             } else if (this.handle.type === constants.TYPE_DICTIONARY) {
                 const dict = new Dictionary(this.db.allocator, structPtr);
                 return dict.stats();
             }
             return { count: 0, size: 0, capacity: 0 };
        });
    }
}
module.exports = Reader;
