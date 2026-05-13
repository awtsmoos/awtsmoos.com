
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/index.js
 * @chapter The Table Of Returning Sparks
 * @description
 * Every primitive type returns through this one table. No scattered fallthrough.
 * No broken ../../ path guessing. The root loader finds constants correctly.
 */

const rootRequire = require('../root.js');
const constants = rootRequire('constants.js');
const BigIntScalar = require('./bigint.js');
const reviveRegExp = require('./regexp.js');
const reviveFunction = require('./function.js');
const reviveTypedArray = require('./typedArrays.js');

const T = constants.VAL_TYPE;

/**
 * @function arrayBufferFromBuffer
 * @description
 * Converts Buffer into standalone ArrayBuffer.
 *
 * @param {Buffer} b - Source bytes.
 * @returns {ArrayBuffer} Standalone ArrayBuffer.
 */
function arrayBufferFromBuffer(b) {
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

const TABLE = {
  [T.NULL]: () => null,
  [T.UNDEFINED]: () => undefined,
  [T.BOOLEAN]: b => b.length ? b.readUInt8(0) === 1 : false,

  [T.NUMBER]: b => b.readDoubleBE(0),
  [T.DOUBLE_POS]: b => b.readDoubleBE(0),
  [T.DOUBLE_NEG]: b => -b.readDoubleBE(0),
  [T.NAN]: () => NaN,
  [T.INFINITY]: () => Infinity,
  [T.NEG_INFINITY]: () => -Infinity,

  [T.UINT8]: b => b.readUInt8(0),
  [T.UINT16]: b => b.readUInt16BE(0),
  [T.UINT32]: b => b.readUInt32BE(0),
  [T.UINT64]: b => Number(b.readBigUInt64BE(0)),
  [T.INT8_NEG]: b => -b.readUInt8(0),
  [T.INT16_NEG]: b => -b.readUInt16BE(0),
  [T.INT32_NEG]: b => -b.readUInt32BE(0),
  [T.INT64_NEG]: b => -Number(b.readBigUInt64BE(0)),

  [T.STRING]: b => b.toString('utf8'),
  [T.STRING_OMNI]: b => {
    try {
      return rootRequire('utils', 'compression', 'omni.js').unpack(b);
    } catch (_err) {
      return b.toString('utf8');
    }
  },

  [T.DATE]: b => new Date(b.readDoubleBE(0)),
  [T.BIGINT]: b => BigIntScalar.fromBuffer(b, false),
  [T.BIGINT_POS]: b => BigIntScalar.fromBuffer(b, false),
  [T.BIGINT_NEG]: b => BigIntScalar.fromBuffer(b, true),

  [T.BUFFER]: b => Buffer.from(b),
  [T.FUNCTION]: reviveFunction,
  [T.SYMBOL]: b => Symbol.for(b.toString('utf8')),
  [T.REGEXP]: reviveRegExp,
  [T.ARRAY_BUFFER]: arrayBufferFromBuffer,
  [T.TYPED_ARRAY]: reviveTypedArray
};

/**
 * @function hydrateScalar
 * @description
 * Hydrates a scalar if the type is in the scalar table.
 *
 * @param {number} type - VAL_TYPE.
 * @param {Buffer} buffer - Stored bytes.
 * @returns {{hit:boolean,value:*}} Result object.
 */
function hydrateScalar(type, buffer) {
  const fn = TABLE[type];

  if (!fn) {
    return {
      hit: false,
      value: undefined
    };
  }

  return {
    hit: true,
    value: fn(buffer || Buffer.alloc(0))
  };
}

module.exports = {
  TABLE,
  hydrateScalar
};
