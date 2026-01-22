// B"H
/**
 * @file reader_iter.js
 * @description 
 *  The Sefirah of Tiferet (Harmony) — Iterating through the binary manifestation.
 * 
 *  REWRITTEN: Fixes Map and Dictionary iteration to ensure 'range' and 'keys'
 *  methods are always available on the structural engines.
 */
const constants = require('../../constants.js');
const SmartPointer = require('../../utils/smartPointer.js');
const Dictionary = require('../../structure/dictionary/index.js');
const Sequence = require('../../structure/sequence/index.js');
const MapEngine = require('../../structure/map/index.js');
const keyEncoding = require('../../utils/keyEncoding.js');
const fs = require('fs');

module.exports = class ReaderIterator {
    constructor(reader) {
        this.reader = reader;
        this.db = reader.db;
        this.handle = reader.handle;
    }

    _log(msg) {
        if (this.db && this.db.debug) {
            try { fs.writeSync(2, `\x1b[36mB"H [ITER_LOG] ${msg}\x1b[0m\n`); } catch(e) {}
        }
    }

    /**
     * @description Primary JS Iterator compatibility.
     */
    *iterator() {
        const type = this.handle.type;
        const T = constants.VAL_TYPE;
        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            yield* this.values();
        } else {
            yield* this.entries();
        }
    }

    /**
     * @description Yields only the keys (names) of the vessel.
     */
    *keys() {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        const type = this.handle.type;
        const T = constants.VAL_TYPE;

        if (type === T.DICTIONARY || type === T.OBJECT) {
            this._log("Iterating Dictionary Keys");
            const dict = new Dictionary(this.db.allocator, structPtr);
            for (const k of dict.keys()) yield String(k);
        } else if (type === T.MAP) {
            this._log("Iterating Map Keys via range()");
            const map = new MapEngine(this.db.allocator, structPtr);
            // GUARANTEED: map.range exists in the rewritten MapEngine
            for (const item of map.range()) {
                yield keyEncoding.decode(item.key);
            }
        } else if (type === T.SEQUENCE || type === T.ARRAY) {
            this._log("Iterating Sequence Indices");
            const seq = new Sequence(this.db.allocator, structPtr);
            const len = seq.length();
            for(let i=0; i<len; i++) yield i;
        }
    }

    /**
     * @description Yields only the values (essences) of the vessel.
     */
    *values() {
        const type = this.handle.type;
        const T = constants.VAL_TYPE;
        if (type === T.SEQUENCE || type === T.ARRAY || type === T.SET) {
            this.handle.ensureResolved();
            const structPtr = this.handle.nav.resolveStructPtr();
            const seq = new Sequence(this.db.allocator, structPtr);
            const len = seq.length();
            for(let i=0; i<len; i++) {
                const ptr = seq.getPtr(i);
                const rawVal = SmartPointer.resolve(ptr, this.db.allocator);
                yield this.reader._wrapIfNeeded(rawVal, i, ptr);
            }
        } else {
            for (const entry of this.entries()) {
                yield entry[1];
            }
        }
    }

    /**
     * @description Yields [key, value] pairs.
     */
    *entries() {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        const type = this.handle.type;
        const T = constants.VAL_TYPE;

        if (type === T.DICTIONARY || type === T.OBJECT) {
            const dict = new Dictionary(this.db.allocator, structPtr);
            for (const [k, v] of dict.entries()) {
                const realKey = String(k);
                const val = this.reader._wrapIfNeeded(v, realKey);
                const entry = [realKey, val];
                entry.key = realKey; entry.value = val;
                yield entry;
            }
        } 
        else if (type === T.MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            for (const item of map.range()) {
                const realKey = keyEncoding.decode(item.key);
                const rawVal = SmartPointer.resolve(item.ptr, this.db.allocator);
                const val = this.reader._wrapIfNeeded(rawVal, realKey, item.ptr);
                const entry = [realKey, val];
                entry.key = realKey; entry.value = val;
                yield entry;
            }
        }
        else if (type === T.SEQUENCE || type === T.ARRAY) {
            const seq = new Sequence(this.db.allocator, structPtr);
            const len = seq.length();
            for(let i=0; i<len; i++) {
                const ptr = seq.getPtr(i);
                const rawVal = SmartPointer.resolve(ptr, this.db.allocator);
                const val = this.reader._wrapIfNeeded(rawVal, i, ptr);
                const entry = [i, val];
                entry.key = i; entry.value = val;
                yield entry;
            }
        }
    }

    /**
     * @description Yields a specific range for B-Tree Maps.
     */
    *range(start, end) {
        this.handle.ensureResolved();
        const type = this.handle.type;
        const T = constants.VAL_TYPE;
        const structPtr = this.handle.nav.resolveStructPtr();

        if (type === T.MAP) {
            const map = new MapEngine(this.db.allocator, structPtr);
            const sBuf = start ? keyEncoding.encode(start) : null;
            const eBuf = end ? keyEncoding.encode(end) : null;
            
            for (const item of map.range()) {
                const cmpStart = sBuf ? item.key.compare(sBuf) : 1;
                const cmpEnd = eBuf ? item.key.compare(eBuf) : -1;
                
                if (cmpStart >= 0 && cmpEnd <= 0) {
                    const realKey = keyEncoding.decode(item.key);
                    const rawVal = SmartPointer.resolve(item.ptr, this.db.allocator);
                    const val = this.reader._wrapIfNeeded(rawVal, realKey, item.ptr);
                    yield { key: realKey, value: val };
                }
            }
        }
    }
};