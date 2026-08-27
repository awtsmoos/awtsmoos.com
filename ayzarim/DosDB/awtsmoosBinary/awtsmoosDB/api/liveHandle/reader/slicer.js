
// B"H
/**
 * @file slicer.js
 * @description The Angel of the Slice, extracting boundaries from sequences.
 */

const constants = require('../../../constants.js');
const Sequence = require('../../../structure/sequence/index.js');
const FlatArray = require('../../../structure/flat/array/index.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

module.exports = class ReaderSlicer {
    constructor(reader) {
        this.reader = reader;
        this.db = reader.db;
        this.handle = reader.handle;
    }

    slice(start, end) {
        this.handle.ensureResolved();
        const structPtr = this.handle.nav.resolveStructPtr();
        if (!structPtr) return [];
        
        const T = constants.VAL_TYPE;
        const type = this.handle.type;
        
        if (type === T.SMART_ARRAY) {
            const arr = new FlatArray(this.db.allocator, structPtr);
            const len = arr.length();
            let s = start < 0 ? Math.max(len + start, 0) : Math.min(start, len);
            let e = (end === undefined) ? len : (end < 0 ? Math.max(len + end, 0) : Math.min(end, len));
            
            const res = [];
            for (let i = s; i < e; i++) {
                const ptr = arr.get(i);
                const val = SmartPointer.resolve(ptr, this.db.allocator);
                res.push(this.reader._wrapIfNeeded(val, i, ptr));
            }
            return res;
        }

        if (type !== T.SEQUENCE && type !== T.ARRAY && type !== T.SET && type !== T.JS_SET) return [];
        
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
};
