
// B"H

/**
 * @file api/liveHandle/reader/hydrator/substances.js
 * @chapter The Raw Materials Return
 * @description
 * Buffers, ArrayBuffers, and typed arrays revive from bytes.
 */

const constants = require('../../../../constants.js');
const TypedArrays = require('./substances/typed_arrays.js');
const T = constants.VAL_TYPE;

module.exports = {
  [T.BUFFER]: buf => Buffer.from(buf),
  [T.ARRAY_BUFFER]: buf => {
    const ab = new ArrayBuffer(buf.length);
    new Uint8Array(ab).set(buf);
    return ab;
  },
  [T.TYPED_ARRAY]: buf => {
    if (buf.length < 1) return new Uint8Array(0);
    return TypedArrays.resurrect(buf[0], buf.subarray(1));
  }
};
