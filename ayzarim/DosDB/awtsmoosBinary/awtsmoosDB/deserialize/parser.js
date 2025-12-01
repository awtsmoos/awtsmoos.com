// B"H
// Strict Parser for all V1 Types.
const constants = require("../constants.js");
// CORRECTED IMPORT PATH: Use binaryHelpers.js
const { unpackTypeAndLengthSize, readConditional } = require("../utils/binaryHelpers.js");
const { readVarInt, readString } = require("../utils/serializer.js");
const floatHandler = require("../utils/floatHandler.js");
const MAX_DEPTH = 512; // Hard limit

function parse(buffer) {
    if (!buffer || buffer.length === 0) return undefined;
    const magic = buffer.subarray(0, 2).toString();
    if (magic === constants.MAGIC_JSON) return parseObject(buffer, 0);
    if (magic === constants.MAGIC_ARRAY) return parseArray(buffer, 0);
    return parseValue(buffer, 0, 0).value;
}


function parseObject(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    
    let offset = 2; //skip "Aj"
    const countInfo = readVarInt(buffer, offset);
    const count = countInfo.value;
    offset += countInfo.bytesRead;
    
    const result = {};
    for(let i=0; i<count; i++) {
        const keyInfo = readString(buffer, offset);
        const key = keyInfo.value;
        offset += keyInfo.bytesRead;
        
        // Pass depth + 1
        const { value, bytesRead } = parseValue(buffer, offset, depth + 1);
        result[key] = value;
        offset += bytesRead;
    }
    return result;
}

function parseArray(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");

    let offset = 2; 
    const packed = buffer.readUInt8(offset); offset++;
    const lenSizeIdx = (packed >> 2) & 0b11;
    const lenSize = [1,2,4,8][lenSizeIdx];
    const arrLen = readConditional(buffer, buffer.length - lenSize, lenSize);
    
    const result = [];
    let current = offset;
    for(let i=0; i<arrLen; i++) {
	     // Safety: If we hit EOF before reading all items, stop.
        if (current >= buffer.length) break; 
        // Pass depth + 1
        const { value, bytesRead } = parseValue(buffer, current, depth + 1);
        // Safety: Prevent infinite loop if 0 bytes read
        if (bytesRead === 0) break; 
        result.push(value);
        current += bytesRead;
    }
    return result;
}

function parseValue(buffer, offset, depth) {
    if (depth > 512) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    
    if (offset >= buffer.length) return { value: undefined, bytesRead: 0 };
    const start = offset;
    const typeByte = buffer.readUInt8(offset); offset++;
    const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);
    
    let length = 0;
    if (lengthSize > 0) {
        length = readConditional(buffer, offset, lengthSize);
        offset += lengthSize;
    }
    
    const dataStart = offset;
    offset += length; // Move past data
    
    let val;
    const T = constants.VAL_TYPE;

    switch (type) {
        // --- Special ---
        case T.NULL: val = null; break;
        case T.UNDEFINED: val = undefined; break;
        case T.BOOLEAN_TRUE: val = true; break;
        case T.BOOLEAN_FALSE: val = false; break;
        case T.NAN: val = NaN; break;
        case T.INFINITY: val = Infinity; break;
        case T.NEG_INFINITY: val = -Infinity; break;
        case T.STRING: val = buffer.toString('utf8', dataStart, dataStart + length); break;
        case T.FUNCTION: 
            val = buffer.toString('utf8', dataStart, dataStart + length);
            break;
        
        // --- Integers ---
        case T.UINT8: val = buffer.readUInt8(dataStart); break;
        case T.UINT16: val = buffer.readUInt16BE(dataStart); break;
        case T.UINT32: val = buffer.readUInt32BE(dataStart); break;
        case T.UINT64: val = Number(buffer.readBigUInt64BE(dataStart)); break;
        
        case T.INT8_NEG: val = -1 * buffer.readUInt8(dataStart); break;
        case T.INT16_NEG: val = -1 * buffer.readUInt16BE(dataStart); break;
        case T.INT32_NEG: val = -1 * buffer.readUInt32BE(dataStart); break;
        case T.INT64_NEG: val = -1 * Number(buffer.readBigUInt64BE(dataStart)); break;

        // --- Floats ---
        case T.DOUBLE_POS: val = buffer.readDoubleBE(dataStart); break;
        case T.DOUBLE_NEG: val = -1 * buffer.readDoubleBE(dataStart); break;
        
        case T.FLOAT_1: val = floatHandler.decodeEncodedFloat(buffer.readUInt8(dataStart), 1); break;
        case T.FLOAT_2: val = floatHandler.decodeEncodedFloat(buffer.readUInt16BE(dataStart), 2); break;
        case T.FLOAT_4: val = floatHandler.decodeEncodedFloat(buffer.readUInt32BE(dataStart), 4); break;
        
        case T.FLOAT_NEG_1: val = -1 * floatHandler.decodeEncodedFloat(buffer.readUInt8(dataStart), 1); break;
        case T.FLOAT_NEG_2: val = -1 * floatHandler.decodeEncodedFloat(buffer.readUInt16BE(dataStart), 2); break;
        case T.FLOAT_NEG_4: val = -1 * floatHandler.decodeEncodedFloat(buffer.readUInt32BE(dataStart), 4); break;

        // --- Containers (Recursion) ---
        case T.OBJECT: 
            val = parseObject(buffer.subarray(dataStart, dataStart + length), depth + 1); 
            break;
        case T.ARRAY: 
            val = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1); 
            break;
        case T.BUFFER: val = buffer.subarray(dataStart, dataStart + length); break;
        
        default: 
            console.warn("B\"H Unknown Type:", type);
            val = buffer.subarray(dataStart, dataStart + length);
    }

    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue };