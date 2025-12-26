
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const { readPointer48 } = require('../../utils/binaryHelpers.js');
const SmartBinary = require('../../utils/smartBinary.js');

module.exports = class ReaderResolver {
    constructor(reader) {
        this.reader = reader;
        this.db = reader.db;
        this.handle = reader.handle;
    }

    async resolveStructPtr() {
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
            if (!this.handle.ptr || (this.handle.type === constants.TYPE_DICTIONARY && !this.handle.ptr)) {
                if (this.handle !== this.db.root && !this.handle.ptr) return undefined;
                let structPtr = await this.resolveStructPtr();
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
};
