// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Sequence = require('../../structure/sequence/index.js');
const Dictionary = require('../../structure/dictionary/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const SmartBinary = require('../../utils/smartBinary.js');

const ReaderResolver = require('./reader_resolve.js');
const ReaderIterator = require('./reader_iter.js');

class Reader {
    constructor(handle) {
        this.handle = handle;
        this.db = handle.db;
        this.resolver = new ReaderResolver(this);
        this.iter = new ReaderIterator(this);
    }

    // Facade methods
    async resolveSelf() { return this.resolver.resolveSelf(); }
    async _hydrateStructure(val, context) { return this.resolver._hydrateStructure(val, context); }
    
    _wrapIfNeeded(val) {
        if (val && val.isStructure) {
            const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
            const LH = require('./index.js');
            return new LH(this.db, buf, val.type, null);
        }
        return val;
    }

    async *iterator() { yield* this.iter.iterator(); }
    async *keys() { yield* this.iter.keys(); }
    
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
    
    async length() {
        await this.handle.ensureResolved();
        const decoded = SmartPointer.decode(this.handle.ptr);
        if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_ARRAY) return decoded.payload.readUInt32BE(4);
             if (decoded.type === constants.TYPE_SMART_OBJECT) return decoded.payload.readUInt16BE(4);
             if (typeof decoded.payload === 'string') return decoded.payload.length;
             return 0;
        }
        
        return this.db.read(async () => {
             let structPtr = await this.resolver.resolveStructPtr();
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
                        arr.push(await this.resolver._hydrateStructure(val, context));
                    } else {
                        arr.push(val);
                    }
                }
                return arr;
            }

            let structPtr = await this.resolver.resolveStructPtr();
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const seq = new Sequence(this.db.allocator, structPtr);
                const rawSlice = await seq.slice(start, end);
                const hydratedSlice = [];
                const context = new Map();
                for(const val of rawSlice) {
                     if (val && val.isStructure) {
                         hydratedSlice.push(await this.resolver._hydrateStructure(val, context));
                     } else {
                         hydratedSlice.push(val);
                     }
                }
                return hydratedSlice;
            }
            return [];
        });
    }

    async getItem(keyOrIndex) {
         await this.handle.ensureResolved();
         if (!this.handle.ptr) return undefined;

         const decoded = SmartPointer.decode(this.handle.ptr);
         
         if (decoded && decoded.mode === constants.MODE_INLINE) {
             if (decoded.type === constants.TYPE_SMART_ARRAY) {
                 const idx = parseInt(keyOrIndex);
                 if (isNaN(idx)) return undefined;
                 const valBuf = SmartBinary.getArrayIndex(decoded.payload, idx);
                 return await SmartPointer.resolve(valBuf, this.db.allocator);
             }
             if (decoded.type === constants.TYPE_SMART_OBJECT) {
                 const valBuf = SmartBinary.getObjectProperty(decoded.payload, String(keyOrIndex));
                 return await SmartPointer.resolve(valBuf, this.db.allocator);
             }
             return undefined;
         }
         
         return this.db.read(async () => {
            const res = await SmartPointer.resolve(this.handle.ptr, this.db.allocator);
            let val = undefined;
            if (this.handle.type === constants.TYPE_SEQUENCE) {
                const seq = new Sequence(this.db.allocator, res);
                const idx = parseInt(keyOrIndex);
                if (!isNaN(idx)) val = await seq.get(idx);
            } 
            else if (this.handle.type === constants.TYPE_MAP) {
                const map = new MapEngine(this.db.allocator, res);
                const encodedKey = keyEncoding.encode(keyOrIndex);
                val = await map.get(encodedKey);
            }
            else if (this.handle.type === constants.TYPE_DICTIONARY) {
                const dict = new Dictionary(this.db.allocator, res);
                const encodedKey = keyEncoding.encode(keyOrIndex);
                val = await dict.get(encodedKey);
            }
            if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                return await this.resolver._hydrateStructure(val, new Map());
            }
            if (val && val.isStructure) {
                 const buf = SmartPointer.block(val.type, val.blockId, val.length, val.isChain, val.offset);
                 const LH = require('./index.js');
                 return new LH(this.db, buf, val.type, { parent: this.handle, key: keyOrIndex });
            }
            return val;
        });
    }

    async *range(start, end) {
        await this.handle.ensureResolved();
        let structPtr = await this.resolver.resolveStructPtr();
        
        if (this.handle.type === constants.TYPE_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for await (const item of map.range(start, end)) {
                let val = item.value;
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    val = await this.resolver._hydrateStructure(val, new Map());
                } else {
                    val = this._wrapIfNeeded(val);
                }
                const decodedKey = keyEncoding.decode(item.key);
                yield { key: decodedKey, value: val };
            }
        }
    }

    async stats() {
        await this.handle.ensureResolved();
        let structPtr = await this.resolver.resolveStructPtr();
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