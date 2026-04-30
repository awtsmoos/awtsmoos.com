
// B"H
/**
 * @file iterator.js
 * @description
 *  The Scribe of the Eternal Flow. 
 *  Delegates the looping rituals to the highly fragmented micro-angels.
 */
const constants = require('../../../constants.js');
const yieldKeys = require('./iterator_core/keys.js');
const yieldValues = require('./iterator_core/values.js');
const yieldEntries = require('./iterator_core/entries.js');
const MapEngine = require('../../../structure/map/index.js');
const keysCodec = require('../../../utils/binary/keys.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

module.exports = class ReaderIterator {
    constructor(reader) { 
        this.reader = reader; 
        this.db = reader.db; 
        this.handle = reader.handle; 
    }

    *iterator() { 
        const T = constants.VAL_TYPE; 
        const t = this.handle.type;
        const isSeq = t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET || t === T.SMART_ARRAY;
        
        if (isSeq) yield* this.values(); 
        else yield* this.entries(); 
    }

    *keys() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldKeys(this.db, this.handle.type, structPtr);
    }

    *values() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldValues(this.reader, this.db, this.handle.type, structPtr, yieldEntries);
    }

    *entries() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldEntries(this.reader, this.db, this.handle.type, structPtr);
    }
    
    *range(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        const T = constants.VAL_TYPE;
        if (!structPtr || (this.handle.type !== T.MAP && this.handle.type !== T.JS_MAP)) return;
        
        const map = new MapEngine(this.db.allocator, structPtr);
        for (const item of map.range(start, end)) {
            const k = keysCodec.decode(item.key);
            const val = this.reader._wrapIfNeeded(SmartPointer.resolve(item.ptr, this.db.allocator), k, item.ptr);
            const res = { key: k, value: val };
            res[Symbol.iterator] = function* () { yield k; yield val; };
            yield res;
        }
    }
};
