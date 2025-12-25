// B"H
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

    async resolveSelf() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();

            const decoded = SmartPointer.decode(this.handle.ptr);
            if (decoded && decoded.mode === constants.MODE_INLINE) {
                if (decoded.type === constants.TYPE_SMART_OBJECT) {
                    const keys = SmartBinary.getObjectKeys(decoded.payload);
                    const obj = {};
                    for(const k of keys) {
                        const valBuf = SmartBinary.getObjectProperty(decoded.payload, k);
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
                return SmartPointer.decodeInline(decoded.type, decoded.payload);
            }

            const context = new Map();
            let structPtr = await this._resolveStructPtr();
            
            if (!structPtr) {
                const isRoot = (this.handle.context === null || (this.db.root && HandleRegistry.getSoul(this.db.root) === this.handle));
                return isRoot ? {} : undefined;
            }

            const val = await SmartPointer.resolve(this.handle.ptr || this.db.rootPtrRaw, this.db.allocator, context);
            if (val && val.isStructure) return await this._hydrateStructure(val, context);
            if (val && typeof val === 'object' && val.__className__) {
                await this._hydrateObjectProperties(val, context);
            }
            return val;
        });
    }

    async getItem(key) {
        return this.db.read(async () => {
            const res = await this.handle.nav.resolveKey(key);
            if (res && res.ptr) {
                return await SmartPointer.resolve(res.ptr, this.db.allocator);
            }
            return undefined;
        });
    }

    async length() {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const structPtr = await this._resolveStructPtr();
                if (!structPtr) return 0;
                const seq = new Sequence(this.db.allocator, structPtr);
                return await seq.length();
            }
            if (this.handle.type === constants.TYPE_SMART_ARRAY) {
                const decoded = SmartPointer.decode(this.handle.ptr);
                return decoded.payload.readUInt32BE(4);
            }
            return 0;
        });
    }

    async slice(start, end) {
        return this.db.read(async () => {
            await this.handle.ensureResolved();
            const structPtr = await this._resolveStructPtr();
            if (!structPtr) return [];

            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const seq = new Sequence(this.db.allocator, structPtr);
                const results = [];
                const len = await seq.length();
                let actualStart = start < 0 ? Math.max(0, len + start) : Math.min(len, start);
                let actualEnd = end === undefined ? len : (end < 0 ? Math.max(0, len + end) : Math.min(len, end));
                
                for(let i = actualStart; i < actualEnd; i++) {
                    const p = await seq.getPtr(i);
                    const val = await SmartPointer.resolve(p, this.db.allocator);
                    results.push(this._wrapIfNeeded(val, i));
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
        if (context.has(val.blockId)) return context.get(val.blockId);

        if (val.type === constants.TYPE_DICTIONARY) {
            const dict = new Dictionary(this.db.allocator, val);
            const obj = {}; context.set(val.blockId, obj);
            await this._hydrateDictionary(dict, obj, context);
            return obj;
        }
        
        if (val.type === constants.TYPE_SEQUENCE || val.type === constants.TYPE_SET) {
            const seq = new Sequence(this.db.allocator, val);
            const arr = (val.type === constants.TYPE_SET) ? new Set() : [];
            context.set(val.blockId, arr);
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
            const map = new Map(); context.set(val.blockId, map);
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

    _wrapIfNeeded(val, keyOrIndex) {
        if (val && val.isStructure) {
            const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
            return HandleRegistry.createHandle(this.db, buf, val.type, { parent: this.handle.self, key: keyOrIndex });
        }
        return val;
    }

    async *iterator() {
        await this.handle.ensureResolved();
        
        const decoded = SmartPointer.decode(this.handle.ptr);
        if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_OBJECT) {
                 for (const k of SmartBinary.getObjectKeys(decoded.payload)) {
                     const valBuf = SmartBinary.getObjectProperty(decoded.payload, k);
                     const val = await SmartPointer.resolve(valBuf, this.db.allocator);
                     yield [k, this._wrapIfNeeded(val, k)];
                 }
                 return;
             }
             if (decoded.type === constants.TYPE_SMART_ARRAY) {
                 const count = decoded.payload.readUInt32BE(4);
                 for (let i = 0; i < count; i++) {
                     const valBuf = SmartBinary.getArrayIndex(decoded.payload, i);
                     const val = await SmartPointer.resolve(valBuf, this.db.allocator);
                     yield this._wrapIfNeeded(val, i);
                 }
                 return;
             }
        }

        let structPtr = await this._resolveStructPtr();
        if (!structPtr) return;

        if (this.handle.type === constants.TYPE_DICTIONARY) {
            const dict = new Dictionary(this.db.allocator, structPtr);
            for await (const k of dict.keys()) {
                const val = await dict.get(k);
                const realKey = keyEncoding.decode(k);
                yield [realKey, this._wrapIfNeeded(val, realKey)];
            }
        } 
        else if (this.handle.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for await (const item of map.range()) {
                const realKey = keyEncoding.decode(item.key);
                yield [realKey, this._wrapIfNeeded(item.value, realKey)];
            }
        }
        else if (this.handle.type === constants.TYPE_SEQUENCE) {
            const seq = new Sequence(this.db.allocator, structPtr);
            const len = await seq.length();
            for(let i=0; i<len; i++) {
                const val = await seq.get(i);
                yield this._wrapIfNeeded(val, i);
            }
        }
    }
    
    async *keys() { for await (const entry of this.iterator()) yield (Array.isArray(entry) ? entry[0] : entry); }
    async *values() { for await (const entry of this.iterator()) yield (Array.isArray(entry) ? entry[1] : entry); }
    async *entries() { for await (const entry of this.iterator()) yield (Array.isArray(entry) ? entry : [undefined, entry]); }
}
module.exports = Reader;