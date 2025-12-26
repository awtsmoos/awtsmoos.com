// B"H
/**
 * @file serializeValue.js
 * @description
 *  The Sefirah of Chesed - The Infinite Flow of Data.
 *  Serializes JS values into binary.
 */

module.exports = serializeValue;

const { packTypeAndLengthSize, writeConditional } = require("../../../utils/binaryHelpers.js");
const constants = require("../../../constants.js");
const floatHandler = require("../../../utils/floatHandler.js");
const stringPacker = require("../../../utils/stringPacker.js");
const bigIntUtils = require("../../../utils/bigIntUtils.js");

let serializeArray_fn = null;
let serializeJSON_fn = null;

function log(msg) {
    console.error(`B"H [SERIALIZE] ${msg}`);
}

function serializeValue(value, fullBuffer = true) {
    const traceId = Math.floor(Math.random() * 0xFFFFFF).toString(16);
    
    if (!serializeArray_fn) {
        serializeArray_fn = require("./array.js");
    }
    if (!serializeJSON_fn) {
        const objModule = require("./obj.js");
        serializeJSON_fn = objModule.serializeJSON;
    }

    let type = 0;
    let data; 

    if (value === null) {
        type = constants.VAL_TYPE.NULL;
    }
    else if (value === undefined) {
        type = constants.VAL_TYPE.UNDEFINED;
    }
    else if (value === true) {
        type = constants.VAL_TYPE.BOOLEAN_TRUE;
        data = Buffer.from([1]);
    }
    else if (value === false) {
        type = constants.VAL_TYPE.BOOLEAN_FALSE;
        data = Buffer.from([0]);
    }
    else if (typeof value === 'bigint') {
        const { buffer, isNegative } = bigIntUtils.toBuffer(value);
        data = buffer; 
        type = isNegative ? constants.VAL_TYPE.BIGINT_NEG : constants.VAL_TYPE.BIGINT_POS;
    }
    else if (typeof value === 'symbol') {
        type = constants.VAL_TYPE.SYMBOL;
        const key = Symbol.keyFor(value) || value.description || "Symbol";
        data = Buffer.from(key, 'utf8');
    }
    else if (typeof value === 'number') {
        if (isNaN(value)) {
            type = constants.VAL_TYPE.NAN;
        } else if (value === Infinity) {
            type = constants.VAL_TYPE.INFINITY;
        } else if (value === -Infinity) {
            type = constants.VAL_TYPE.NEG_INFINITY;
        } else {
            const isNeg = value < 0; const absValue = Math.abs(value);
            if (absValue <= Number.MAX_SAFE_INTEGER && absValue % 1 === 0) {
                if (absValue <= 0xFF) { data = Buffer.allocUnsafe(1); data.writeUInt8(absValue, 0); type = isNeg ? constants.VAL_TYPE.INT8_NEG : constants.VAL_TYPE.UINT8; }
                else if (absValue <= 0xFFFF) { data = Buffer.allocUnsafe(2); data.writeUInt16BE(absValue, 0); type = isNeg ? constants.VAL_TYPE.INT16_NEG : constants.VAL_TYPE.UINT16; }
                else if (absValue <= 0xFFFFFFFF) { data = Buffer.allocUnsafe(4); data.writeUInt32BE(absValue, 0); type = isNeg ? constants.VAL_TYPE.INT32_NEG : constants.VAL_TYPE.UINT32; }
                else { data = Buffer.allocUnsafe(8); data.writeBigUInt64BE(BigInt(absValue), 0); type = isNeg ? constants.VAL_TYPE.INT64_NEG : constants.VAL_TYPE.UINT64; }
            } else {
                const encoded = floatHandler.writeDynamicFloat(value);
                if (encoded !== null) {
                    const size = (encoded <= 0xFF) ? 1 : (encoded <= 0xFFFF) ? 2 : 4;
                    data = Buffer.allocUnsafe(size);
                    if (size === 1) data.writeUInt8(encoded, 0); else if (size === 2) data.writeUInt16BE(encoded, 0); else data.writeUInt32BE(encoded, 0);
                    if (!isNeg) {
                        if (size === 1) type = constants.VAL_TYPE.FLOAT_1; else if (size === 2) type = constants.VAL_TYPE.FLOAT_2; else type = constants.VAL_TYPE.FLOAT_4;
                    } else {
                        if (size === 1) type = constants.VAL_TYPE.FLOAT_NEG_1; else if (size === 2) type = constants.VAL_TYPE.FLOAT_NEG_2; else type = constants.VAL_TYPE.FLOAT_NEG_4;
                    }
                } else {
                    type = isNeg ? constants.VAL_TYPE.DOUBLE_NEG : constants.VAL_TYPE.DOUBLE_POS;
                    data = Buffer.allocUnsafe(8); data.writeDoubleBE(absValue);
                }
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
        const { localWriteVarInt } = require("./obj.js");
        data = Buffer.concat([localWriteVarInt(sourceBuf.length), sourceBuf, flagsBuf]);
    }
    else if (value instanceof Map) {
        type = constants.VAL_TYPE.MAP; data = serializeArray_fn(Array.from(value.entries()));
    }
    else if (value instanceof Set) {
        type = constants.VAL_TYPE.SET; data = serializeArray_fn(Array.from(value.values()));
    }
    else if (value instanceof Error || (value && typeof value.message === 'string' && value.stack)) {
        type = constants.VAL_TYPE.OBJECT; 
        
        const isAgg = (typeof AggregateError !== 'undefined' && value instanceof AggregateError) || 
                      (value.name === 'AggregateError') || 
                      (Array.isArray(value.errors));

        const rawName = value.name || (value.constructor ? value.constructor.name : "Error");
        const finalName = isAgg ? "AggregateError" : rawName;

        const info = {
            name: String(finalName || "Error"),
            message: String(value.message || ""),
            stack: String(value.stack || ""),
            __awtsmoosError__: true, 
            __errorType__: String(finalName || "Error")
        };
        
        if (value.cause) info.cause = value.cause;
        if (isAgg) {
            info.isAggregate = true;
            info.errors = Array.isArray(value.errors) ? value.errors : Array.from(value.errors || []);
        }

        data = serializeJSON_fn(info);
    }
    else if (ArrayBuffer.isView(value) && !Buffer.isBuffer(value)) {
        type = constants.VAL_TYPE.TYPED_ARRAY;
        const getTypedArrayType = (v) => {
            if (v instanceof Int8Array) return 1; if (v instanceof Uint8Array) return 2;
            if (v instanceof Uint8ClampedArray) return 3; if (v instanceof Int16Array) return 4;
            if (v instanceof Uint16Array) return 5; if (v instanceof Int32Array) return 6;
            if (v instanceof Uint32Array) return 7; if (v instanceof Float32Array) return 8;
            if (v instanceof Float64Array) return 9; if (v instanceof BigInt64Array) return 10;
            if (v instanceof BigUint64Array) return 11; return 0;
        };
        const viewType = getTypedArrayType(value);
        const raw = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
        data = Buffer.concat([Buffer.from([viewType]), raw]);
    }
    else if (typeof value === 'function') {
        type = constants.VAL_TYPE.FUNCTION; data = Buffer.from(value.toString());
    }
    else if (Buffer.isBuffer(value) || value instanceof ArrayBuffer) {
        type = constants.VAL_TYPE.BUFFER; data = Buffer.isBuffer(value) ? value : Buffer.from(value);
    }
    else if (Array.isArray(value)) {
        type = constants.VAL_TYPE.ARRAY; 
        data = serializeArray_fn(value);
    } 
    else if (typeof value === 'object') {
        type = constants.VAL_TYPE.OBJECT; 
        data = serializeJSON_fn(value);
    }
    else if (typeof value === 'string') {
        type = constants.VAL_TYPE.STRING;
        data = Buffer.from(value, 'utf8');
    }

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