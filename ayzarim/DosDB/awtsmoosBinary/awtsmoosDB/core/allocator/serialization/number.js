
// B"H
const constants = require("../../../constants.js");

module.exports = function serializeNumber(value) {
    let type = 0;
    let data = null;

    if (isNaN(value)) type = constants.VAL_TYPE.NAN;
    else if (value === Infinity) type = constants.VAL_TYPE.INFINITY;
    else if (value === -Infinity) type = constants.VAL_TYPE.NEG_INFINITY;
    else {
        const isNeg = value < 0; 
        const absValue = Math.abs(value);
        if (absValue <= Number.MAX_SAFE_INTEGER && absValue % 1 === 0) {
            if (absValue <= 0xFF) { data = Buffer.allocUnsafe(1); data.writeUInt8(absValue, 0); type = isNeg ? constants.VAL_TYPE.INT8_NEG : constants.VAL_TYPE.UINT8; }
            else if (absValue <= 0xFFFF) { data = Buffer.allocUnsafe(2); data.writeUInt16BE(absValue, 0); type = isNeg ? constants.VAL_TYPE.INT16_NEG : constants.VAL_TYPE.UINT16; }
            else if (absValue <= 0xFFFFFFFF) { data = Buffer.allocUnsafe(4); data.writeUInt32BE(absValue, 0); type = isNeg ? constants.VAL_TYPE.INT32_NEG : constants.VAL_TYPE.UINT32; }
            else { data = Buffer.allocUnsafe(8); data.writeBigUInt64BE(BigInt(absValue), 0); type = isNeg ? constants.VAL_TYPE.INT64_NEG : constants.VAL_TYPE.UINT64; }
        } else {
            type = isNeg ? constants.VAL_TYPE.DOUBLE_NEG : constants.VAL_TYPE.DOUBLE_POS;
            data = Buffer.allocUnsafe(8); data.writeDoubleBE(absValue);
        }
    }
    return { type, data: data || Buffer.alloc(0) };
};
