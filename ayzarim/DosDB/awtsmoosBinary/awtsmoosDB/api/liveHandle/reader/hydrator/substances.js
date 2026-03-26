
// B"H
/**
 * @file substances.js
 * @description The raw physical materials of existence (Yetzirah/Asiyah).
 */

const constants = require('../../../../constants.js');
const TypedArrays = require('./substances/typed_arrays.js');
const T = constants.VAL_TYPE;

module.exports = {
    [T.BUFFER]: (buf) => Buffer.from(buf),
    
    [T.ARRAY_BUFFER]: (buf) => {
        const ab = new ArrayBuffer(buf.length);
        new Uint8Array(ab).set(buf);
        return ab;
    },
    
    [T.TYPED_ARRAY]: (buf) => {
        if (buf.length < 1) return new Uint8Array(0);
        const vt = buf[0];
        const raw = buf.subarray(1);
        
        return TypedArrays.resurrect(vt, raw);
    }
};
