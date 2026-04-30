
// B"H
/**
 * @file values.js
 * @description Yields the pure light contents.
 */
const constants = require('../../../../constants.js');
const Sequence = require('../../../../structure/sequence/index.js');
const FlatArray = require('../../../../structure/flat/array/index.js');
const SmartPointer = require('../../../../utils/smartPointer/index.js');

module.exports = function* yieldValues(reader, db, t, structPtr, entriesGen) {
    const T = constants.VAL_TYPE;
    if (t === T.SEQUENCE || t === T.ARRAY || t === T.SET || t === T.JS_SET) {
        const seq = new Sequence(db.allocator, structPtr);
        for(let i=0; i<seq.length(); i++) {
            yield reader._wrapIfNeeded(seq.get(i), i, seq.getPtr(i));
        }
    } else if (t === T.SMART_ARRAY) {
        const arr = new FlatArray(db.allocator, structPtr);
        const len = arr.length();
        for(let i=0; i<len; i++) {
            const ptr = arr.get(i);
            const val = SmartPointer.resolve(ptr, db.allocator);
            yield reader._wrapIfNeeded(val, i, ptr);
        }
    } else { 
        for (const entry of entriesGen(reader, db, t, structPtr)) yield entry[1]; 
    }
};
