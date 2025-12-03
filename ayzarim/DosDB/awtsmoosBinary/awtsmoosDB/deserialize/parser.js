// B"H
// Strict Parser for all V1 Types + New Universal V2 Types.
const constants = require("../constants.js");
const { unpackTypeAndLengthSize, readConditional } = require("../utils/binaryHelpers.js");

// B"H
// We import the entire object and bind methods to preserve 'this' context,
// as readString relies on this.readVarInt internally.
const serializer = require("../utils/serializer.js");
const readVarInt = serializer.readVarInt.bind(serializer);
const readString = serializer.readString.bind(serializer);
const floatHandler = require("../utils/floatHandler.js");
const stringPacker = require("../utils/stringPacker.js");

const MAX_DEPTH = 512;

function parse(buffer) {
    if (!buffer || buffer.length === 0) return undefined;
    const magic = buffer.subarray(0, 2).toString();
    if (magic === constants.MAGIC_JSON) return parseObject(buffer, 0);
    if (magic === constants.MAGIC_ARRAY) return parseArray(buffer, 0);
    return parseValue(buffer, 0, 0).value;
}

// Helpers for recursion
function parseObject(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    let offset = 2; 
    const countInfo = readVarInt(buffer, offset);
    const count = countInfo.value;
    offset += countInfo.bytesRead;
    const result = {};
    for(let i=0; i<count; i++) {
        const keyInfo = readString(buffer, offset);
        const { value, bytesRead } = parseValue(buffer, offset + keyInfo.bytesRead, depth + 1);
        result[keyInfo.value] = value;
        offset += keyInfo.bytesRead + bytesRead;
    }
    return result;
}

function parseArray(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    if (buffer.length <= 2) return [];

    let offset = 2; 
    const packed = buffer.readUInt8(offset); offset++;
    const lenSize = [1,2,4,8][(packed >> 2) & 0b11];
    
    // B"H: Safety check for buffer length before reading array length
    if (buffer.length < offset + lenSize) return [];
    
    const arrLen = readConditional(buffer, buffer.length - lenSize, lenSize);
    const result = [];
    let current = offset;
    for(let i=0; i<arrLen; i++) {
        if (current >= buffer.length) break; 
        const { value, bytesRead } = parseValue(buffer, current, depth + 1);
        if (bytesRead === 0) break; 
        result.push(value);
        current += bytesRead;
    }
    return result;
}

function parseValue(buffer, offset, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    
    if (offset >= buffer.length) return { value: undefined, bytesRead: 0 };
    const start = offset;
    const typeByte = buffer.readUInt8(offset); offset++;
    const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);
    
    let length = 0;
    if (lengthSize > 0) {
        if (offset + lengthSize > buffer.length) {
             return { value: undefined, bytesRead: 0 }; // Truncated
        }
        length = readConditional(buffer, offset, lengthSize);
        offset += lengthSize;
    }
    
    const dataStart = offset;
    offset += length; 
    
    if (offset > buffer.length) {
         return { value: undefined, bytesRead: 0 }; // Truncated
    }

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
        case T.FUNCTION: val = buffer.toString('utf8', dataStart, dataStart + length); break;
        
        // --- New Universal Types ---
        case T.DATE: 
            val = new Date(buffer.readDoubleBE(dataStart)); 
            break;
        case T.JS_BIGINT:
            val = BigInt(buffer.toString('utf8', dataStart, dataStart + length));
            break;
        case T.REGEXP: {
            const { value: sourceLen, bytesRead } = readVarInt(buffer, dataStart);
            const source = buffer.toString('utf8', dataStart + bytesRead, dataStart + bytesRead + sourceLen);
            const flags = buffer.toString('utf8', dataStart + bytesRead + sourceLen, dataStart + length);
            val = new RegExp(source, flags);
            break;
        }
        case T.MAP: {
            // Data is stored as an Array of [k,v] entries
            const entries = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1);
            val = new Map(entries);
            break;
        }
        case T.SET: {
            // Data is stored as an Array of values
            const values = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1);
            val = new Set(values);
            break;
        }
        case T.ERROR: {
             const rawObj = parseObject(buffer.subarray(dataStart, dataStart + length), depth + 1);
             val = new Error(rawObj.message);
             val.name = rawObj.name;
             val.stack = rawObj.stack;
             break;
        }

        // --- Integers ---
        case T.UINT8: val = buffer.readUInt8(dataStart); break;
        case T.UINT16: val = buffer.readUInt16BE(dataStart); break;
        case T.UINT32: val = buffer.readUInt32BE(dataStart); break;
        // Note: UINT64 casts to Number. Use JS_BIGINT for real bigints.
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

        // --- Containers ---
        case 6: // B"H:
        // Explicitly handle Type 6 (Object)
        case T.OBJECT: 
            val = parseObject(buffer.subarray(dataStart, dataStart + length), depth + 1); 
            break;
        case T.ARRAY: 
            val = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1); 
            break;
        case T.BUFFER: val = buffer.subarray(dataStart, dataStart + length); break;
        case T.STRING_HEBREW:
		val = stringPacker.unpackHebrew(buffer.subarray(dataStart, dataStart + length));
	break;
	
	case T.STRING_RLE:
		val = stringPacker.unpackRLE(buffer.subarray(dataStart, dataStart + length));
	break;
        default: 
            console.warn("B\"H Unknown Type:", type);
            val = buffer.subarray(dataStart, dataStart + length);
    }

    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue };