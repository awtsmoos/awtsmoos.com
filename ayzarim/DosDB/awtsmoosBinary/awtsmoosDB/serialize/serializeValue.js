// B"H
// Full-Featured Serializer: Handles Infinity, NaN, Negatives, TypedArrays, etc.

const { packTypeAndLengthSize, writeConditional } = require("../utils/binaryHelpers.js");
const constants = require("../constants.js");
const floatHandler = require("../utils/floatHandler.js");

let serializeArray_fn = null;
let serializeJSON_fn = null;

function hasDecimal(num) {
    return num % 1 !== 0;
}

function serializeValue(value, fullBuffer = true) {
    if (!serializeArray_fn) serializeArray_fn = require("./array.js");
    if (!serializeJSON_fn) serializeJSON_fn = require("./obj.js");

    let type = 0;
    let data = Buffer.alloc(0);

    // --- Special Values ---
    if (value === null) type = constants.VAL_TYPE.NULL;
    else if (value === undefined) type = constants.VAL_TYPE.UNDEFINED;
    else if (value === true) type = constants.VAL_TYPE.BOOLEAN_TRUE;
    else if (value === false) type = constants.VAL_TYPE.BOOLEAN_FALSE;
    else if (typeof value === 'number') {
        if (isNaN(value)) {
            type = constants.VAL_TYPE.NAN;
        } else if (value === Infinity) {
            type = constants.VAL_TYPE.INFINITY;
        } else if (value === -Infinity) {
            type = constants.VAL_TYPE.NEG_INFINITY;
        } else {
            // --- Numbers (Integers & Floats) ---
            const isNeg = value < 0;
            const absValue = Math.abs(value);
            
            if (!hasDecimal(value)) {
                // Integer Logic
                const info = writeConditional(absValue);
                if (!isNeg) {
                    // Positive Ints
                    if (info.size === 1) type = constants.VAL_TYPE.UINT8;
                    else if (info.size === 2) type = constants.VAL_TYPE.UINT16;
                    else if (info.size === 4) type = constants.VAL_TYPE.UINT32;
                    else type = constants.VAL_TYPE.UINT64;
                } else {
                    // Negative Ints
                    if (info.size === 1) type = constants.VAL_TYPE.INT8_NEG;
                    else if (info.size === 2) type = constants.VAL_TYPE.INT16_NEG;
                    else if (info.size === 4) type = constants.VAL_TYPE.INT32_NEG;
                    else type = constants.VAL_TYPE.INT64_NEG;
                }
                data = info.buffer;
            } else {
                // Float Logic
                const encoded = floatHandler.writeDynamicFloat(value); // Only passes magnitude
                
                if (encoded !== null) {
                    // It was compressible
                    const info = writeConditional(encoded);
                    if (!isNeg) {
                        if (info.size === 1) type = constants.VAL_TYPE.FLOAT_1;
                        else if (info.size === 2) type = constants.VAL_TYPE.FLOAT_2;
                        else if (info.size === 4) type = constants.VAL_TYPE.FLOAT_4;
                    } else {
                        if (info.size === 1) type = constants.VAL_TYPE.FLOAT_NEG_1;
                        else if (info.size === 2) type = constants.VAL_TYPE.FLOAT_NEG_2;
                        else if (info.size === 4) type = constants.VAL_TYPE.FLOAT_NEG_4;
                    }
                    data = info.buffer;
                } else {
                    // Fallback to Double
                    type = isNeg ? constants.VAL_TYPE.DOUBLE_NEG : constants.VAL_TYPE.DOUBLE_POS;
                    data = Buffer.alloc(8);
                    data.writeDoubleBE(absValue); // Write magnitude
                }
            }
        }
    } 
    // --- Complex Types ---
    else if (typeof value === 'function') {
        type = constants.VAL_TYPE.FUNCTION;
        data = Buffer.from(value.toString());
    }
    else if (Buffer.isBuffer(value) || ArrayBuffer.isView(value)) {
        type = constants.VAL_TYPE.BUFFER;
        data = Buffer.isBuffer(value) ? value : Buffer.from(value.buffer, value.byteOffset, value.byteLength);
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

    const valueLengthInfo = writeConditional(data.length);
    const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);

    if (!fullBuffer) {
        return { type, data, valueLengthInfo, typeLengthByte };
    }

    return Buffer.concat([
        Buffer.from([typeLengthByte]),
        valueLengthInfo.buffer,
        data
    ]);
}

module.exports = serializeValue;