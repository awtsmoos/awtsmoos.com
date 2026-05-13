
// B"H

/**
 * @file api/liveHandle/reader/hydrator/magnitudes.js
 * @chapter The Measures Rise From Dust
 * @description
 * Numbers and BigInts are restored without confusing finite doubles with
 * infinite integer mountains.
 */

const constants = require('../../../../constants.js');
const bigintUtils = require('../../../../utils/bigIntUtils.js');
const floatUtils = require('../../../../utils/math/float.js');
const T = constants.VAL_TYPE;

module.exports = {
  [T.UINT8]: buf => buf.readUInt8(0),
  [T.UINT16]: buf => buf.readUInt16BE(0),
  [T.UINT32]: buf => buf.readUInt32BE(0),
  [T.UINT64]: buf => Number(buf.readBigUInt64BE(0)),
  [T.INT8_NEG]: buf => -buf.readUInt8(0),
  [T.INT16_NEG]: buf => -buf.readUInt16BE(0),
  [T.INT32_NEG]: buf => -buf.readUInt32BE(0),
  [T.INT64_NEG]: buf => -Number(buf.readBigUInt64BE(0)),
  [T.NUMBER]: buf => buf.readDoubleBE(0),
  [T.DOUBLE_POS]: buf => buf.readDoubleBE(0),
  [T.DOUBLE_NEG]: buf => -buf.readDoubleBE(0),
  [T.NAN]: () => NaN,
  [T.INFINITY]: () => Infinity,
  [T.NEG_INFINITY]: () => -Infinity,
  [T.DATE]: buf => new Date(buf.readDoubleBE(0)),
  [T.BIGINT]: buf => bigintUtils.fromBuffer(buf, false),
  [T.BIGINT_POS]: buf => bigintUtils.fromBuffer(buf, false),
  [T.BIGINT_NEG]: buf => bigintUtils.fromBuffer(buf, true),
  [T.FLOAT_DYNAMIC]: buf => floatUtils.deserialize(buf).value
};
