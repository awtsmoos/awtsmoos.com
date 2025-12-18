
// B"H
// Full-Featured Serializer: Handles Infinity, NaN, Negatives, TypedArrays, Date, RegExp, Map, Set, BigInt.

const { packTypeAndLengthSize, writeConditionalTo } = require("../utils/binaryHelpers.js");
const constants = require("../constants.js");
const floatHandler = require("../utils/floatHandler.js");
const stringPacker = require("../utils/stringPacker.js");
const bigIntUtils = require("../utils/bigIntUtils.js");

let serializeArray_fn = null;
let serializeJSON_fn = null;

// B"H: Optimization - Global Scratch Buffer to avoid allocations for small primitives
const SCRATCH_BUFFER = Buffer.allocUnsafe(65536);

function hasDecimal(num) {
    return num % 1 !== 0;
}

function serializeValue(value, fullBuffer = true) {
    if (!serializeArray_fn) serializeArray_fn = require("./array.js");
    if (!serializeJSON_fn) serializeJSON_fn = require("./obj.js");
    
    if (Array.isArray(value) && typeof serializeArray_fn !== 'function') {
        serializeArray_fn = require("./array.js");
    }

    let type = 0;
    let data; 
    let usingScratch = false;
    let scratchLen = 0;

    // --- Special Values ---
    if (value === null) type = constants.VAL_TYPE.NULL;
    else if (value === undefined) type = constants.VAL_TYPE.UNDEFINED;
    else if (value === true) type = constants.VAL_TYPE.BOOLEAN_TRUE;
    else if (value === false) type = constants.VAL_TYPE.BOOLEAN_FALSE;
    
    // --- Primitives ---
    else if (typeof value === 'bigint') {
        // B"H: New Optimized Binary BigInt
        const { buffer, isNegative } = bigIntUtils.toBuffer(value);
        data = buffer;
        type = isNegative ? constants.VAL_TYPE.BIGINT_NEG : constants.VAL_TYPE.BIGINT_POS;
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
                // Optimize: Write to Scratch
                usingScratch = true;
                const size = writeConditionalTo(SCRATCH_BUFFER, 0, absValue);
                scratchLen = size;
                
                if (!isNeg) {
                    if (size === 1) type = constants.VAL_TYPE.UINT8;
                    else if (size === 2) type = constants.VAL_TYPE.UINT16;
                    else if (size === 4) type = constants.VAL_TYPE.UINT32;
                    else type = constants.VAL_TYPE.UINT64;
                } else {
                    if (size === 1) type = constants.VAL_TYPE.INT8_NEG;
                    else if (size === 2) type = constants.VAL_TYPE.INT16_NEG;
                    else if (size === 4) type = constants.VAL_TYPE.INT32_NEG;
                    else type = constants.VAL_TYPE.INT64_NEG;
                }
            } else {
                const encoded = floatHandler.writeDynamicFloat(value);
                if (encoded !== null) {
                    usingScratch = true;
                    const size = writeConditionalTo(SCRATCH_BUFFER, 0, encoded);
                    scratchLen = size;
                    
                    if (!isNeg) {
                        if (size === 1) type = constants.VAL_TYPE.FLOAT_1;
                        else if (size === 2) type = constants.VAL_TYPE.FLOAT_2;
                        else if (size === 4) type = constants.VAL_TYPE.FLOAT_4;
                    } else {
                        if (size === 1) type = constants.VAL_TYPE.FLOAT_NEG_1;
                        else if (size === 2) type = constants.VAL_TYPE.FLOAT_NEG_2;
                        else if (size === 4) type = constants.VAL_TYPE.FLOAT_NEG_4;
                    }
                } else {
                    type = isNeg ? constants.VAL_TYPE.DOUBLE_NEG : constants.VAL_TYPE.DOUBLE_POS;
                    data = Buffer.allocUnsafe(8);
                    data.writeDoubleBE(absValue);
                }
            }
        }
    } 
    
    // --- Universal JS Objects ---
    else if (value instanceof Date) {
        type = constants.VAL_TYPE.DATE;
        data = Buffer.allocUnsafe(8);
        data.writeDoubleBE(value.getTime());
    }
    else if (value instanceof RegExp) {
        type = constants.VAL_TYPE.REGEXP;
        const sourceBuf = Buffer.from(value.source, 'utf8');
        const flagsBuf = Buffer.from(value.flags, 'utf8');
        const { writeVarInt } = require("../utils/serializer.js");
        data = Buffer.concat([writeVarInt(sourceBuf.length), sourceBuf, flagsBuf]);
    }
    else if (value instanceof Map) {
        type = constants.VAL_TYPE.MAP;
        data = serializeArray_fn(Array.from(value.entries()));
    }
    else if (value instanceof Set) {
        type = constants.VAL_TYPE.SET;
        data = serializeArray_fn(Array.from(value.values()));
    }
    else if (value instanceof Error) {
        type = constants.VAL_TYPE.ERROR;
        const msg = value.message || "";
        const name = value.name || "Error";
        const stack = value.stack || "";
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
	    // 1. Try RLE
	    const rleBuf = stringPacker.packRLE(value);
	    if (rleBuf) {
	        type = constants.VAL_TYPE.STRING_RLE;
	        data = rleBuf;
	    } 
	    else {
	        // 2. Try Hebrew Packing
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

    // Final Assembly
    if (usingScratch) {
        const lenInfoSize = writeConditionalTo(SCRATCH_BUFFER, scratchLen, scratchLen);
        const typeLengthByte = packTypeAndLengthSize(type, lenInfoSize);
        
        if (!fullBuffer) {
            const realData = Buffer.allocUnsafe(scratchLen);
            SCRATCH_BUFFER.copy(realData, 0, 0, scratchLen);
            const lenBuf = Buffer.allocUnsafe(lenInfoSize);
            SCRATCH_BUFFER.copy(lenBuf, 0, scratchLen, scratchLen + lenInfoSize);
            
            return { type, data: realData, valueLengthInfo: { buffer: lenBuf, size: lenInfoSize }, typeLengthByte };
        }
        
        const totalSize = 1 + lenInfoSize + scratchLen;
        const result = Buffer.allocUnsafe(totalSize);
        
        result[0] = typeLengthByte;
        SCRATCH_BUFFER.copy(result, 1, scratchLen, scratchLen + lenInfoSize); // Copy Len
        SCRATCH_BUFFER.copy(result, 1 + lenInfoSize, 0, scratchLen); // Copy Data
        
        return result;
    } 
    
    // Normal Path (Buffers/Strings/Objects)
    if (!data) data = Buffer.alloc(0);
    
    const lenInfoSize = writeConditionalTo(SCRATCH_BUFFER, 0, data.length);
    const typeLengthByte = packTypeAndLengthSize(type, lenInfoSize);

    if (!fullBuffer) {
        const lenBuf = Buffer.allocUnsafe(lenInfoSize);
        SCRATCH_BUFFER.copy(lenBuf, 0, 0, lenInfoSize);
        return { type, data, valueLengthInfo: { buffer: lenBuf, size: lenInfoSize }, typeLengthByte };
    }

    const wrapper = Buffer.allocUnsafe(1 + lenInfoSize + data.length);
    wrapper[0] = typeLengthByte;
    SCRATCH_BUFFER.copy(wrapper, 1, 0, lenInfoSize);
    data.copy(wrapper, 1 + lenInfoSize);
    
    return wrapper;
}

module.exports = serializeValue;
