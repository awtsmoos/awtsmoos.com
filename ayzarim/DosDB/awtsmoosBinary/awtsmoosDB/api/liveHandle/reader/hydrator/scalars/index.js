
// B"H

/**
 * @file api/liveHandle/reader/hydrator/scalars/index.js
 * @chapter The Table Of Returning Sparks
 * @description
 * Every primitive type returns through this one table. No scattered fallthrough.
 * No broken ../../../ path guessing. The root loader finds constants correctly.
 */

const rootRequire = require('../root.js');
const constants = rootRequire('constants.js');
const BigIntScalar = require('./bigint.js');
const reviveRegExp = require('./regexp.js');
const reviveFunction = require('./function.js');
const reviveTypedArray = require('./typedArrays.js');
const reviveError = require('./error.js');

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

/**
 * @function unpackOmni
 * @description Restores an Omni-compressed binary frame.
 *
 * @param {Buffer} b - Stored bytes.
 * @returns {Buffer} Raw bytes.
 */
function unpackOmni(b) {
  return rootRequire('utils', 'compression', 'omni.js').unpackBuffer(b);
}

const TABLE = {
  [T.NULL]: () => null,
  [T.UNDEFINED]: () => undefined,
  [T.BOOLEAN]: b => b.length ? b.readUInt8(0) === 1 : false,
  [T.BOOLEAN_TRUE]: () => true,
  [T.BOOLEAN_FALSE]: () => false,

  [T.NUMBER]: b => b.readDoubleBE(0),
  [T.NUMBER_ZERO]: () => 0,
  [T.NUMBER_ONE]: () => 1,
  [T.NUMBER_NEG_ONE]: () => -1,
  [T.NUMBER_ZERO]: () => 0,
  [T.NUMBER_ONE]: () => 1,
  [T.NUMBER_NEG_ONE]: () => -1,
  [T.DOUBLE_POS]: b => b.readDoubleBE(0),
  [T.DOUBLE_NEG]: b => -b.readDoubleBE(0),
  [T.NAN]: () => NaN,
  [T.INFINITY]: () => Infinity,
  [T.NEG_INFINITY]: () => -Infinity,

  [T.SMALL_INT]: b => b.readUInt8(0),
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
  [T.JSON]: b => {
    try {
      return JSON.parse(b.toString('utf8'));
    } catch (_err) {
      return {};
    }
  },
  [T.OPAQUE]: b => ({ __unserializable__: b.toString('utf8') || 'Object' }),
  [T.PACKED_OBJECT]: (b, context) => rootRequire('api', 'packed', 'objectCodec.js').decode(b, context),
  [T.PACKED_ARRAY]: (b, context) => rootRequire('api', 'packed', 'arrayCodec.js').decode(b, context),

  [T.DATE]: b => new Date(b.readDoubleBE(0)),
  [T.BIGINT]: b => BigIntScalar.fromBuffer(b, false),
  [T.BIGINT_POS]: b => BigIntScalar.fromBuffer(b, false),
  [T.BIGINT_NEG]: b => BigIntScalar.fromBuffer(b, true),

  [T.BUFFER]: b => Buffer.from(b),
  [T.BUFFER_OMNI]: b => unpackOmni(b),
  [T.ERROR]: reviveError,
  [T.FUNCTION]: reviveFunction,
  [T.SYMBOL]: b => Symbol.for(b.toString('utf8')),
  [T.REGEXP]: reviveRegExp,
  [T.ARRAY_BUFFER]: arrayBufferFromBuffer,
  [T.ARRAY_BUFFER_OMNI]: b => arrayBufferFromBuffer(unpackOmni(b)),
  [T.TYPED_ARRAY]: reviveTypedArray,
  [T.TYPED_ARRAY_OMNI]: b => reviveTypedArray(unpackOmni(b)),
  [T.ENCRYPTED]: b => {
    const EnvelopeCodec = rootRequire('utils', 'crypto', 'envelopeCodec.js');
    const packed = EnvelopeCodec.decode(b);
    return packed || JSON.parse(b.toString('utf8'));
  },
  [T.BLOB]: b => {
    const BlobToken = rootRequire('api', 'blob', 'tokenCodec.js');
    const packed = BlobToken.decode(b);
    return packed || JSON.parse(b.toString('utf8'));
  },
  [T.TEXT]: b => {
    const TextToken = rootRequire('api', 'text', 'tokenCodec.js');
    const packed = TextToken.decode(b);
    return packed || JSON.parse(b.toString('utf8'));
  },
  [T.COMPACT_JSON]: (b, context) => context.db.compactJson.hydrateToken(b)
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
function hydrateScalar(type, buffer, context = {}) {
  const fn = TABLE[type];

  if (!fn) {
    return {
      hit: false,
      value: undefined
    };
  }

  return {
    hit: true,
    value: fn(buffer || Buffer.alloc(0), context)
  };
}

module.exports = {
  TABLE,
  hydrateScalar
};
