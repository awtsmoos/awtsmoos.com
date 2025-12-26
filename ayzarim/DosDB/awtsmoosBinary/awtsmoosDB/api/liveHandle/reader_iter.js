
// B"H
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const SmartBinary = require('../../utils/smartBinary.js');
const Dictionary = require('../../structure/dictionary/index.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');

module.exports = class ReaderIterator {
    constructor(reader) {
        this.reader = reader;
        this.db = reader.db;
        this.handle = reader.handle;
        this.resolver = reader.resolver;
    }

    async *iterator() {
        await this.handle.ensureResolved();
        
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

        let structPtr = await this.resolver.resolveStructPtr();
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
                let wrappedVal = this.reader._wrapIfNeeded(val);
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    wrappedVal = await this.resolver._hydrateStructure(val, new Map());
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
                    val = await this.resolver._hydrateStructure(val, new Map());
                } else {
                    val = this.reader._wrapIfNeeded(val);
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
                let wrappedVal = this.reader._wrapIfNeeded(val);
                if (val && val.isStructure && val.type === constants.TYPE_DICTIONARY) {
                    wrappedVal = await this.resolver._hydrateStructure(val, new Map());
                }
                yield wrappedVal;
            }
        }
    }

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
         
         let structPtr = await this.resolver.resolveStructPtr();
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
};
