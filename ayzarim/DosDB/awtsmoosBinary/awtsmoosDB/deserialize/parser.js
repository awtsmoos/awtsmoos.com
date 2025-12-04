// B"H
// Strict Parser for all V1 Types + New Universal V2 Types.
const constants = require("../constants.js");
const { unpackTypeAndLengthSize, readConditional } = require("../utils/binaryHelpers.js");
const serializer = require("../utils/serializer.js");
const readVarInt = serializer.readVarInt.bind(serializer);
const readString = serializer.readString.bind(serializer);
const floatHandler = require("../utils/floatHandler.js");
const stringPacker = require("../utils/stringPacker.js");

const MAX_DEPTH = 512;

function parse(buffer) {
    if (!buffer || buffer.length === 0) return undefined;
    
    // Check for JSON Magic
    const magicJsonLen = constants.MAGIC_JSON.length;
    if (buffer.length >= magicJsonLen && buffer.subarray(0, magicJsonLen).toString() === constants.MAGIC_JSON) {
        return parseObject(buffer, 0);
    }

    // Check for ARRAY Magic
    const magicArrLen = constants.MAGIC_ARRAY.length;
    if (buffer.length >= magicArrLen && buffer.subarray(0, magicArrLen).toString() === constants.MAGIC_ARRAY) {
        return parseArray(buffer, 0);
    }

    return parseValue(buffer, 0, 0).value;
}

function parseObject(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    let offset = constants.MAGIC_JSON.length; 
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
    
    const magicLen = constants.MAGIC_ARRAY.length;
    // B"H: Strict Magic Check
    if (buffer.length < magicLen || buffer.subarray(0, magicLen).toString() !== constants.MAGIC_ARRAY) {
         return undefined;
    }

    // Min size: Magic + Config(1) + Len(1)
    if (buffer.length < magicLen + 2) return [];

    // Format: [MAGIC][Config][Items...][IndexTable][ArrayLen]
    
    // 1. Read Config Byte
    const configByte = buffer.readUInt8(magicLen);
    
    // Extract sizes
    const lenSizeIndex = (configByte >> 2) & 0b11;
    const lenSize = [1, 2, 4, 8][lenSizeIndex];
    
    const offsetSizeIndex = configByte & 0b11;
    const offsetSize = [1, 2, 4, 8][offsetSizeIndex];
    
    // 2. Read Array Length MANUALLY from END of buffer
    if (buffer.length < lenSize) {
        return []; 
    }
    const lenOffset = buffer.length - lenSize;
    let arrLen = 0;
    
    // B"H: Read Array Length
    if (lenSize === 1) arrLen = buffer.readUInt8(lenOffset);
    else if (lenSize === 2) arrLen = buffer.readUInt16BE(lenOffset);
    else if (lenSize === 4) arrLen = buffer.readUInt32BE(lenOffset);
    else if (lenSize === 8) arrLen = Number(buffer.readBigUInt64BE(lenOffset));

    if (arrLen === 0) return [];

    // 3. Calculate Boundaries
    const indexTableSize = arrLen * offsetSize;
    // itemsEndOffset is where the Index Table starts.
    const itemsEndOffset = lenOffset - indexTableSize;

    // Safety: Items cannot start before Header+Config
    if (itemsEndOffset < magicLen + 1) {
        // This implies the buffer is too small or corrupted
        return [];
    }

    // 4. Parse Items Sequentially
    let offset = magicLen + 1; // Start after Config
    const result = [];
    
    for(let i=0; i<arrLen; i++) {
        // Strict boundary check: If we've reached the Index Table, stop.
        if (offset >= itemsEndOffset) break; 
        
        const { value, bytesRead } = parseValue(buffer, offset, depth + 1);
        
        if (bytesRead === 0) break; 
        
        result.push(value);
        offset += bytesRead;
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
             return { value: undefined, bytesRead: 0 }; 
        }
        length = readConditional(buffer, offset, lengthSize);
        offset += lengthSize;
    }
    
    const dataStart = offset;
    offset += length; 
    
    if (offset > buffer.length) {
         return { value: undefined, bytesRead: 0 }; 
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
            const entries = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1);
            val = new Map(entries);
            break;
        }
        case T.SET: {
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
        case 6: 
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
            val = buffer.subarray(dataStart, dataStart + length);
    }

    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue };