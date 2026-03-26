
// B"H
/**
 * @file typed_arrays.js
 * @description Specialized ritual for resurrecting numerical matrices.
 */

const floatUtils = require('../../../../../utils/math/float.js');
const bigintUtils = require('../../../../../utils/bigIntUtils.js');

const BasicViews = {
    1: Int8Array, 2: Uint8Array, 3: Uint8ClampedArray,
    4: Int16Array, 5: Uint16Array, 6: Int32Array, 7: Uint32Array
};

/**
 * @function resurrectNumericalStream
 * @description Pulls dynamic packets from the void into a living array.
 */
function resurrectNumericalStream(Constructor, raw, isFloat) {
    const list = []; 
    let cursor = 0;
    while (cursor < raw.length) {
        let isNeg = false;
        if (!isFloat) isNeg = raw[cursor++] === 1;
        const len = raw[cursor++];
        const value = isFloat 
            ? floatUtils.deserialize(raw, cursor).value 
            : bigintUtils.fromBuffer(raw.subarray(cursor, cursor + len), isNeg);
        list.push(value); 
        cursor += len;
    }
    return new Constructor(list);
}

const ComplexViews = {
    8: (raw) => resurrectNumericalStream(Float32Array, raw, true),
    9: (raw) => resurrectNumericalStream(Float64Array, raw, true),
    10: (raw) => resurrectNumericalStream(BigInt64Array, raw, false),
    11: (raw) => resurrectNumericalStream(BigUint64Array, raw, false)
};

module.exports = {
    resurrect(vt, raw) {
        const complexRite = ComplexViews[vt];
        if (complexRite) return complexRite(raw);

        const Constructor = BasicViews[vt] || Uint8Array;
        const ab = new ArrayBuffer(raw.length);
        new Uint8Array(ab).set(raw);
        return new Constructor(ab);
    }
};
