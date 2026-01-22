// B"H
/**
 * @file serializeValue.js
 * @description Manifests raw JS primitives into binary. Strictly synchronous.
 */

const { packTypeAndLengthSize, writeConditional } = require("../../../utils/binaryHelpers.js");
const constants = require("../../../constants.js");
const floatHandler = require("../../../utils/floatHandler.js");
const stringPacker = require("../../../utils/stringPacker.js");
const bigIntUtils = require("../../../utils/bigIntUtils.js");

function serializeValue(value, fullBuffer = true) {
    const objModule = require("./obj.js");
    const arrModule = require("./array.js");

    let type = 0;
    let data; 

    if (value === null) { type = constants.VAL_TYPE.NULL; }
    else if (value === undefined) { type = constants.VAL_TYPE.UNDEFINED; }
    else if (value === true) { type = constants.VAL_TYPE.BOOLEAN_TRUE; data = Buffer.from([1]); }
    else if (value === false) { type = constants.VAL_TYPE.BOOLEAN_FALSE; data = Buffer.from([0]); }
    else if (typeof value === 'bigint') {
        const { buffer, isNegative } = bigIntUtils.toBuffer(value);
        data = buffer; 
        type = isNegative ? constants.VAL_TYPE.BIGINT_NEG : constants.VAL_TYPE.BIGINT_POS;
    }
    else if (typeof value === 'symbol') {
        type = constants.VAL_TYPE.SYMBOL;
        data = Buffer.from(Symbol.keyFor(value) || value.description || "Symbol", 'utf8');
    }
    else if (typeof value === 'number') {
        if (isNaN(value)) { type = constants.VAL_TYPE.NAN; }
        else if (value === Infinity) { type = constants.VAL_TYPE.INFINITY; }
        else if (value === -Infinity) { type = constants.VAL_TYPE.NEG_INFINITY; }
        else {
            const isNeg = value < 0; const absValue = Math.abs(value);
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
    } 
    else if (value instanceof Date) {
        type = constants.VAL_TYPE.DATE; data = Buffer.allocUnsafe(8); data.writeDoubleBE(value.getTime());
    }
    else if (value instanceof RegExp) {
        type = constants.VAL_TYPE.REGEXP;
        const sourceBuf = Buffer.from(value.source, 'utf8');
        const flagsBuf = Buffer.from(value.flags, 'utf8');
        data = Buffer.concat([objModule.localWriteVarInt(sourceBuf.length), sourceBuf, flagsBuf]);
    }
    else if (value instanceof Map) {
        type = constants.VAL_TYPE.MAP; data = arrModule(Array.from(value.entries()));
    }
    else if (value instanceof Set) {
        type = constants.VAL_TYPE.SET; data = arrModule(Array.from(value.values()));
    }
    else if (value instanceof Error) {
        type = constants.VAL_TYPE.ERROR;
        data = objModule.serializeJSON({ name: value.name, message: value.message, stack: value.stack, cause: value.cause });
    }
    else if (ArrayBuffer.isView(value) && !Buffer.isBuffer(value)) {
        type = constants.VAL_TYPE.TYPED_ARRAY;
        let vt = 0;
        if (value instanceof Int8Array) vt = 1; else if (value instanceof Uint8Array) vt = 2; else if (value instanceof Uint8ClampedArray) vt = 3;
        else if (value instanceof Int16Array) vt = 4; else if (value instanceof Uint16Array) vt = 5; else if (value instanceof Int32Array) vt = 6;
        else if (value instanceof Uint32Array) vt = 7; else if (value instanceof Float32Array) vt = 8; else if (value instanceof Float64Array) vt = 9;
        else if (value instanceof BigInt64Array) vt = 10; else if (value instanceof BigUint64Array) vt = 11;
        const raw = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
        data = Buffer.concat([Buffer.from([vt]), raw]);
    }
    else if (Buffer.isBuffer(value)) { type = constants.VAL_TYPE.BUFFER; data = value; }
    else if (Array.isArray(value)) { type = constants.VAL_TYPE.ARRAY; data = arrModule(value); } 
    else if (typeof value === 'object') { type = constants.VAL_TYPE.OBJECT; data = objModule.serializeJSON(value); }
    else if (typeof value === 'string') { type = constants.VAL_TYPE.STRING; data = Buffer.from(value, 'utf8'); }

    if (!data) data = Buffer.alloc(0);
    const lenInfo = writeConditional(data.length);
    const typeByte = packTypeAndLengthSize(type, lenInfo.size);

    if (!fullBuffer) {
        return { type, data, valueLengthInfo: lenInfo, typeLengthByte: typeByte };
    }

    const wrapper = Buffer.allocUnsafe(1 + lenInfo.size + data.length);
    wrapper[0] = typeByte;
    lenInfo.buffer.copy(wrapper, 1);
    data.copy(wrapper, 1 + lenInfo.size);
    return wrapper;
}
module.exports = serializeValue;