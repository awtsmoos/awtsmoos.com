
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

    _effectiveType() {
        const T = constants.VAL_TYPE;
        if (this.handle.type !== T.ANCHOR) return this.handle.type;
        return this.handle.nav.resolveAnchorInnerType() || this.handle.type;
    }

    *iterator() { 
        const T = constants.VAL_TYPE; 
        const t = this._effectiveType();
        const isSeq = t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET || t === T.SMART_ARRAY;
        
        if (isSeq) yield* this.values(); 
        else yield* this.entries(); 
    }

    *keys() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldKeys(this.db, this._effectiveType(), structPtr);
    }

    *values() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldValues(this.reader, this.db, this._effectiveType(), structPtr, yieldEntries);
    }

    *entries() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldEntries(this.reader, this.db, this._effectiveType(), structPtr);
    }
    
    *range(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        const T = constants.VAL_TYPE;
        const t = this._effectiveType();
        if (!structPtr || (t !== T.MAP && t !== T.JS_MAP)) return;
        
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
