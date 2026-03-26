
// B"H
/**
 * @file magnitudes.js
 * @description The quantitative dimensions of existence (Atziluth/Beriah).
 */

const constants = require('../../../../constants.js');
// B"H: Four-level ascent to the root utils folder
const bigintUtils = require('../../../../utils/bigIntUtils.js');
const floatUtils = require('../../../../utils/math/float.js');
const T = constants.VAL_TYPE;

module.exports = {
    [T.UINT8]: (buf) => buf.readUInt8(0),
    [T.UINT16]: (buf) => buf.readUInt16BE(0),
    [T.UINT32]: (buf) => buf.readUInt32BE(0),
    [T.UINT64]: (buf) => Number(buf.readBigUInt64BE(0)),
    
    [T.INT8_NEG]: (buf) => -buf.readUInt8(0),
    [T.INT16_NEG]: (buf) => -buf.readUInt16BE(0),
    [T.INT32_NEG]: (buf) => -buf.readUInt32BE(0),
    [T.INT64_NEG]: (buf) => -Number(buf.readBigUInt64BE(0)),
    
    [T.NUMBER]: (buf) => buf.readDoubleBE(0),
    [T.DOUBLE_POS]: (buf) => buf.readDoubleBE(0),
    [T.DOUBLE_NEG]: (buf) => -buf.readDoubleBE(0),
    
    [T.NAN]: () => NaN,
    [T.INFINITY]: () => Infinity,
    [T.NEG_INFINITY]: () => -Infinity,
    
    [T.DATE]: (buf) => new Date(buf.readDoubleBE(0)),

    // B"H: The lossless resurrection of the massive and the precise
    [T.BIGINT]: (buf) => bigintUtils.fromBuffer(buf, false),
    [T.BIGINT_POS]: (buf) => bigintUtils.fromBuffer(buf, false),
    [T.BIGINT_NEG]: (buf) => bigintUtils.fromBuffer(buf, true),

    [T.FLOAT_DYNAMIC]: (buf) => floatUtils.deserialize(buf).value
};
