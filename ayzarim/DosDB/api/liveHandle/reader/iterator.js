
// B"H
/**
 * @file iterator.js
 * @description
 *  Chapter 60: The River of Life (Nahara De-Oraisa).
 * 
 *  "The Scribes of the Eternal Flow." This module oversees the movement of 
 *  data from the depths of the structure to the surface of the iteration.
 *  It knows when to flow as an Array of values and when to present itself 
 *  as a pair of Names (Keys) and Essences (Values).
 */
const constants = require('../../../constants.js');
const yieldKeys = require('./iterator_core/keys.js');
const yieldValues = require('./iterator_core/values.js');
const yieldEntries = require('./iterator_core/entries.js');
const MapEngine = require('../../../structure/map/index.js');
const keysCodec = require('../../../utils/binary/keys.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

module.exports = class ReaderIterator {
    /**
     * @constructor
     * @param {Object} reader - The Binah instance.
     */
    constructor(reader) { 
        this.reader = reader; 
        this.db = reader.db; 
        this.handle = reader.handle; 
    }

    /**
     * @method _getEffectiveType
     * @description Identifies the truth, peeling any anchor skins.
     */
    _getEffectiveType() {
        const type = this.handle.type;
        if (type !== constants.VAL_TYPE.ANCHOR) return type;
        return this.handle.nav.resolveAnchorInnerType() || constants.VAL_TYPE.DICTIONARY;
    }

    /**
     * @generator iterator
     * @description The default entry-point for for...of loops.
     */
    *iterator() { 
        const T = constants.VAL_TYPE; 
        const t = this._getEffectiveType();
        
        // Differentiate based on the vessel's soul
        const SequenceTypes = new Set([T.SEQUENCE, T.ARRAY, T.SET, T.JS_SET, T.SMART_ARRAY]);
        
        if (SequenceTypes.has(t)) {
             yield* this.values(); 
        } else {
             yield* this.entries(); 
        }
    }

    /**
     * @generator keys
     * @description Just the Names of the Sparks.
     */
    *keys() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldKeys(this.db, this._getEffectiveType(), structPtr);
    }

    /**
     * @generator values
     * @description Just the Essences of the Sparks.
     */
    *values() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldValues(this.reader, this.db, this._getEffectiveType(), structPtr, yieldEntries);
    }

    /**
     * @generator entries
     * @description Both Name and Essence paired together.
     */
    *entries() {
        this.handle.ensureResolved(); 
        const structPtr = this.handle.nav.resolveStructPtr(); 
        if (!structPtr) return;
        yield* yieldEntries(this.reader, this.db, this._getEffectiveType(), structPtr);
    }
    
    /**
     * @generator range
     * @description Focused walk through a segment of a sorted B-Tree.
     */
    *range(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        const T = constants.VAL_TYPE;
        const t = this._getEffectiveType();
        
        if (!structPtr || (t !== T.MAP && t !== T.JS_MAP)) return;
        
        const map = new MapEngine(this.db.allocator, structPtr);
        for (const item of map.range(start, end)) {
            const k = keysCodec.decode(item.key);
            const val = this.reader._wrapIfNeeded(SmartPointer.resolve(item.ptr, this.db.allocator), k, item.ptr);
            const res = [k, val]; 
            res.key = k; 
            res.value = val;
            res[Symbol.iterator] = function* () { yield k; yield val; };
            yield res;
        }
    }
};
