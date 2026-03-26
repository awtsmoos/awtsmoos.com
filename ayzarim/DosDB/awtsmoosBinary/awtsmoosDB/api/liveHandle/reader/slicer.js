
// B"H
/**
 * @file reader/slicer.js
 * @description
 *  The Sefirah of Gevurah (Strength/Boundary).
 */

const constants = require('../../../constants.js');
const Sequence = require('../../../structure/sequence/index.js');

module.exports = class ReaderSlicer {
    constructor(reader) {
        this.reader = reader;
        this.db = reader.db;
        this.handle = reader.handle;
    }

    /**
     * @method slice
     * @description
     *  Extracts a finite segment from the eternal flow of a Sequence.
     */
    slice(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        if (!structPtr) return [];
        
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        if (type !== T.SEQUENCE && type !== T.ARRAY && type !== T.SET) return [];
        
        const seq = new Sequence(this.db.allocator, structPtr);
        
        const len = seq.length();
        let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
        let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));
        
        const res = [];
        for (let i = s; i < e; i++) {
            const ptr = seq.getPtr(i);
            const val = seq.get(i);
            res.push(this.reader._wrapIfNeeded(val, i, ptr));
        }
        return res;
    }
}
