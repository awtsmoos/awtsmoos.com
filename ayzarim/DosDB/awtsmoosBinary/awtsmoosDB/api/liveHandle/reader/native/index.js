
// B"H

/**
 * @file api/liveHandle/reader/native/index.js
 * @chapter The Native Return Gate
 * @description
 * Some structures should return native JavaScript values on direct property
 * access. Native Set is one of them.
 */

const constants = require('../../../constants.js');
const SequenceReader = require('./sequenceReader.js');

const T = constants.VAL_TYPE;

/**
 * @function resolveNative
 * @description
 * Resolves structure types that should return native values.
 *
 * @param {object} db - DB instance.
 * @param {number} type - VAL_TYPE.
 * @param {Buffer|object} ptr - Pointer.
 * @param {object} ctx - Resolve context.
 * @returns {{hit:boolean,value:*}} Result.
 */
function resolveNative(db, type, ptr, ctx) {
  if (type === T.JS_SET || type === T.SET) {
    return {
      hit: true,
      value: SequenceReader.toSet(db, ptr, ctx)
    };
  }

  return {
    hit: false,
    value: undefined
  };
}

module.exports = {
  resolveNative
};
