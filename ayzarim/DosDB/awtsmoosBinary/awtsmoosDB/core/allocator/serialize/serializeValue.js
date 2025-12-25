// B"H
// Full-Featured Serializer: Handles Infinity, NaN, Negatives, TypedArrays, Date, RegExp, Map, Set, BigInt.
// NO JSON.stringify ALLOWED.

const { packTypeAndLengthSize, writeConditionalTo } = require("../../../utils/binaryHelpers.js");
const constants = require("../../../constants.js");
const floatHandler = require("../../../utils/floatHandler.js");
const stringPacker = require("../../../utils/stringPacker.js");
const bigIntUtils = require("../../../utils/bigIntUtils.js");
const { writeVarInt, getVarIntSize, writeStringTo } = require("../../../utils/serializer.js");

let serializeArray_fn = null;
let serializeJSON_fn = null;

const SCRATCH_BUFFER = Buffer.allocUnsafe(65536);

function hasDecimal(num) {
    return num % 1 !== 0;
}

/**
 * @description
 *  The Scribe of the Essence. Translates JS values into binary sparks.
 *  Uses pure binary formats for all types. Purged of JSON abomination.
 */
function serializeValue(value, fullBuffer = true) {
    if (!serializeArray_fn) serializeArray_fn = require("./array.js");
    if (!serializeJSON_fn) serializeJSON_fn = require("./obj.js");
    
    let type = 0;
    let data; 
    let usingScratch = false;
    let scratchLen = 0;

    if (value === null) type = constants.VAL_TYPE.NULL;
    else if (value === undefined) type = constants.VAL_TYPE.UNDEFINED;
    else if (value === true) type = constants.VAL_TYPE.BOOLEAN_TRUE;
    else if (value === false) type = constants.VAL_TYPE.BOOLEAN_FALSE;
    
    else if (typeof value === 'bigint') {
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
            const isNeg = value < 0;
            const absValue = Math.abs(value);
            
            if (!hasDecimal(value) && absValue <= Number.MAX_SAFE_INTEGER) {
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
    
    else if (value instanceof Date) {
        type = constants.VAL_TYPE.DATE;
        data = Buffer.allocUnsafe(8);
        data.writeDoubleBE(value.getTime());
    }
    else if (value instanceof RegExp) {
        type = constants.VAL_TYPE.REGEXP;
        const sourceBuf = Buffer.from(value.source, 'utf8');
        const flagsBuf = Buffer.from(value.flags, 'utf8');
        data = Buffer.concat([writeVarInt(sourceBuf.length), sourceBuf, writeVarInt(flagsBuf.length), flagsBuf]);
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
        // B"H: PURE BINARY ERROR PACKING
        const name = value.name || "Error";
        const message = value.message || "";
        const stack = value.stack || "";
        const isAggregate = value instanceof AggregateError;
        
        const subErrors = isAggregate ? (value.errors || []).map(e => ({ name: e.name || "Error", message: e.message || String(e) })) : [];
        
        const buffers = [
            Buffer.from([isAggregate ? 1 : 0]),
            writeVarInt(Buffer.byteLength(name)), Buffer.from(name),
            writeVarInt(Buffer.byteLength(message)), Buffer.from(message),
            writeVarInt(Buffer.byteLength(stack)), Buffer.from(stack)
        ];
        
        if (isAggregate) {
            buffers.push(writeVarInt(subErrors.length));
            for (const sub of subErrors) {
                buffers.push(writeVarInt(Buffer.byteLength(sub.name)), Buffer.from(sub.name));
                buffers.push(writeVarInt(Buffer.byteLength(sub.message)), Buffer.from(sub.message));
            }
        }
        data = Buffer.concat(buffers);
    }
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
        const rleBuf = stringPacker.packRLE(value);
        if (rleBuf) { type = constants.VAL_TYPE.STRING_RLE || 4; data = rleBuf; } 
        else {
            const hebrewBuf = stringPacker.packHebrew(value);
            if (hebrewBuf) { type = constants.VAL_TYPE.STRING_HEBREW || 4; data = hebrewBuf; } 
            else { type = constants.VAL_TYPE.STRING; data = Buffer.from(value, 'utf8'); }
        }
    }

    if (usingScratch) {
        const lenInfoSize = writeConditionalTo(SCRATCH_BUFFER, scratchLen, scratchLen);
        const typeLengthByte = packTypeAndLengthSize(type, lenInfoSize);
        if (!fullBuffer) {
            const realData = Buffer.allocUnsafe(scratchLen); SCRATCH_BUFFER.copy(realData, 0, 0, scratchLen);
            const lenBuf = Buffer.allocUnsafe(lenInfoSize); SCRATCH_BUFFER.copy(lenBuf, 0, scratchLen, scratchLen + lenInfoSize);
            return { type, data: realData, valueLengthInfo: { buffer: lenBuf, size: lenInfoSize }, typeLengthByte };
        }
        const result = Buffer.allocUnsafe(1 + lenInfoSize + scratchLen);
        result[0] = typeLengthByte;
        SCRATCH_BUFFER.copy(result, 1, scratchLen, scratchLen + lenInfoSize);
        SCRATCH_BUFFER.copy(result, 1 + lenInfoSize, 0, scratchLen);
        return result;
    } 
    
    if (!data) data = Buffer.alloc(0);
    if (type === constants.VAL_TYPE.BOOLEAN_TRUE) data = Buffer.from([1]);
    else if (type === constants.VAL_TYPE.BOOLEAN_FALSE) data = Buffer.from([0]);
    
    const lenInfoSize = writeConditionalTo(SCRATCH_BUFFER, 0, data.length);
    const typeLengthByte = packTypeAndLengthSize(type, lenInfoSize);
    if (!fullBuffer) {
        const lenBuf = Buffer.allocUnsafe(lenInfoSize); SCRATCH_BUFFER.copy(lenBuf, 0, 0, lenInfoSize);
        return { type, data, valueLengthInfo: { buffer: lenBuf, size: lenInfoSize }, typeLengthByte };
    }
    const wrapper = Buffer.allocUnsafe(1 + lenInfoSize + data.length);
    wrapper[0] = typeLengthByte;
    SCRATCH_BUFFER.copy(wrapper, 1, 0, lenInfoSize);
    data.copy(wrapper, 1 + lenInfoSize);
    return wrapper;
}

module.exports = serializeValue;