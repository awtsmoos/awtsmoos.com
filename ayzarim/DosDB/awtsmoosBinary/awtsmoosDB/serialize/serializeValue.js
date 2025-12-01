// B"H
// Full-Featured Serializer: Handles Infinity, NaN, Negatives, TypedArrays, Date, RegExp, Map, Set, BigInt.

const { packTypeAndLengthSize, writeConditional } = require("../utils/binaryHelpers.js");
const constants = require("../constants.js");
const floatHandler = require("../utils/floatHandler.js");
const stringPacker = require("../utils/stringPacker.js");

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
    
    // --- Primitives ---
    else if (typeof value === 'bigint') {
        type = constants.VAL_TYPE.JS_BIGINT;
        data = Buffer.from(value.toString()); // Store as string to support arbitrary size
    }
    else if (typeof value === 'number') {
        if (isNaN(value)) {
            type = constants.VAL_TYPE.NAN;
        } else if (value === Infinity) {
            type = constants.VAL_TYPE.INFINITY;
        } else if (value === -Infinity) {
            type = constants.VAL_TYPE.NEG_INFINITY;
        } else {
            // Integers & Floats
            const isNeg = value < 0;
            const absValue = Math.abs(value);
            
            if (!hasDecimal(value) && absValue <= Number.MAX_SAFE_INTEGER) {
                const info = writeConditional(absValue);
                if (!isNeg) {
                    if (info.size === 1) type = constants.VAL_TYPE.UINT8;
                    else if (info.size === 2) type = constants.VAL_TYPE.UINT16;
                    else if (info.size === 4) type = constants.VAL_TYPE.UINT32;
                    else type = constants.VAL_TYPE.UINT64;
                } else {
                    if (info.size === 1) type = constants.VAL_TYPE.INT8_NEG;
                    else if (info.size === 2) type = constants.VAL_TYPE.INT16_NEG;
                    else if (info.size === 4) type = constants.VAL_TYPE.INT32_NEG;
                    else type = constants.VAL_TYPE.INT64_NEG;
                }
                data = info.buffer;
            } else {
                const encoded = floatHandler.writeDynamicFloat(value);
                if (encoded !== null) {
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
                    type = isNeg ? constants.VAL_TYPE.DOUBLE_NEG : constants.VAL_TYPE.DOUBLE_POS;
                    data = Buffer.alloc(8);
                    data.writeDoubleBE(absValue);
                }
            }
        }
    } 
    
    // --- Universal JS Objects ---
    else if (value instanceof Date) {
        type = constants.VAL_TYPE.DATE;
        data = Buffer.alloc(8);
        data.writeDoubleBE(value.getTime());
    }
    else if (value instanceof RegExp) {
        type = constants.VAL_TYPE.REGEXP;
        const sourceBuf = Buffer.from(value.source, 'utf8');
        const flagsBuf = Buffer.from(value.flags, 'utf8');
        // Format: [SourceLen (VarInt)] [Source] [Flags]
        const { writeVarInt } = require("../utils/serializer.js");
        data = Buffer.concat([writeVarInt(sourceBuf.length), sourceBuf, flagsBuf]);
    }
    else if (value instanceof Map) {
        type = constants.VAL_TYPE.MAP;
        // Serialize as Array of entries: [[k,v], [k,v]]
        data = serializeArray_fn(Array.from(value.entries()));
    }
    else if (value instanceof Set) {
        type = constants.VAL_TYPE.SET;
        // Serialize as Array of values: [v, v, v]
        data = serializeArray_fn(Array.from(value.values()));
    }
    else if (value instanceof Error) {
        type = constants.VAL_TYPE.ERROR;
        const msg = value.message || "";
        const name = value.name || "Error";
        const stack = value.stack || "";
        // Simple JSON serialization for Errors
        data = serializeJSON_fn({ name, message: msg, stack });
    }
    
    // --- Standard Complex Types ---
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
	    // 1. Try RLE (Best for repeating spaces/padding)
	    const rleBuf = stringPacker.packRLE(value);
	    if (rleBuf) {
	        type = constants.VAL_TYPE.STRING_RLE;
	        data = rleBuf;
	    } 
	    else {
	        // 2. Try Hebrew Packing (Best for Hebrew text)
	        const hebrewBuf = stringPacker.packHebrew(value);
	        if (hebrewBuf) {
	            type = constants.VAL_TYPE.STRING_HEBREW;
	            data = hebrewBuf;
	        } else {
	            // 3. Fallback to Standard UTF-8
	            type = constants.VAL_TYPE.STRING;
	            data = Buffer.from(value, 'utf8');
	        }
	    }
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