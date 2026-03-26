
// B"H
/**
 * @file reader/iterator.js
 * @description
 *  The Scribe of the Eternal Flow. 
 *  Traverses the database vessels and yields their contents as a sequence of lights.
 */

const constants = require('../../../constants.js');
const Dictionary = require('../../../structure/dictionary/index.js');
const Sequence = require('../../../structure/sequence/index.js');
const MapEngine = require('../../../structure/map/index.js');
const keys = require('../../../utils/binary/keys.js');
const SmartPointer = require('../../../utils/smartPointer.js');

module.exports = class ReaderIterator {
    constructor(reader) { 
        this.reader = reader; 
        this.db = reader.db; 
        this.handle = reader.handle; 
    }

    *iterator() { 
        const T = constants.VAL_TYPE; 
        const t = this.handle.type;
        const isSequenceLike = t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET;
        
        if (isSequenceLike) yield* this.values(); 
        else yield* this.entries(); 
    }

    *keys() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        
        const T = constants.VAL_TYPE;
        const t = this.handle.type;

        // B"H: The Scribe recognizes the two primary architectures
        if (t === T.DICTIONARY || t === T.OBJECT) { 
            for (const k of (new Dictionary(this.db.allocator, structPtr)).keys()) yield String(k); 
        }
        else if (t === T.MAP || t === T.JS_MAP) { 
            for (const item of (new MapEngine(this.db.allocator, structPtr)).range()) yield keys.decode(item.key); 
        }
        else if (t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET) { 
            const len = (new Sequence(this.db.allocator, structPtr)).length(); 
            for(let i=0; i<len; i++) yield i; 
        }
    }

    *values() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        
        const T = constants.VAL_TYPE;
        const t = this.handle.type;

        if (t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET) {
            const seq = new Sequence(this.db.allocator, structPtr);
            for(let i=0; i<seq.length(); i++) {
                yield this.reader._wrapIfNeeded(seq.get(i), i, seq.getPtr(i));
            }
        } else { 
            for (const entry of this.entries()) yield entry[1]; 
        }
    }

    *entries() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        
        const T = constants.VAL_TYPE;
        const t = this.handle.type;

        if (t === T.DICTIONARY || t === T.OBJECT) {
            for (const [k, v] of (new Dictionary(this.db.allocator, structPtr)).entries()) {
                yield [String(k), this.reader._wrapIfNeeded(v, String(k))];
            }
        } else if (t === T.MAP || t === T.JS_MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for (const item of map.range()) {
                const k = keys.decode(item.key);
                const val = this.reader._wrapIfNeeded(SmartPointer.resolve(item.ptr, this.db.allocator), k, item.ptr);
                const entry = [k, val]; entry.key = k; entry.value = val; yield entry;
            }
        } else if (t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET) {
            const seq = new Sequence(this.db.allocator, structPtr);
            for(let i=0; i<seq.length(); i++) { 
                const ptr = seq.getPtr(i); 
                yield [i, this.reader._wrapIfNeeded(SmartPointer.resolve(ptr, this.db.allocator), i, ptr)]; 
            }
        }
    }
    
    /**
     * @method range
     * @description Navigates a range of the Map's sorted light.
     */
    *range(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        const T = constants.VAL_TYPE;
        if (!structPtr || (this.handle.type !== T.MAP && this.handle.type !== T.JS_MAP)) return;
        
        const map = new MapEngine(this.db.allocator, structPtr);
        for (const item of map.range(start, end)) {
            const k = keys.decode(item.key);
            const val = this.reader._wrapIfNeeded(SmartPointer.resolve(item.ptr, this.db.allocator), k, item.ptr);
            const res = { key: k, value: val };
            res[Symbol.iterator] = function* () { yield k; yield val; };
            yield res;
        }
    }
};
