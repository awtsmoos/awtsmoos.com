
// B"H

/**
 * @file structure/manifest/complex/builder/vessel/sequence/typeSeal.js
 * @chapter The Body Is Sequence But The Name May Be Set
 * @description
 * Arrays, Lists, and Sets can share the same on-disk sequence body.
 * The outer pointer type must still preserve the original JavaScript identity.
 */

const SmartPointer = require('../../../../../../utils/smartPointer/index.js');

/**
 * @function retagSeal
 * @description
 * Re-encodes a sequence pointer with the requested outer type.
 *
 * @param {Buffer} seal - Sequence pointer seal.
 * @param {number} type - Desired outer VAL_TYPE.
 * @returns {Buffer} Retagged pointer seal.
 */
function retagSeal(seal, type) {
  const ptr = SmartPointer.decode(seal);

  return SmartPointer.encode({
    type,
    offset: ptr.offset,
    length: ptr.length
  });
}

module.exports = retagSeal;
