// B"H
/**
 * @file parser.js
 * @description
 *  The Sefirah of Binah - The Great Understanding.
 */

const constants = require("../constants.js");
const { unpackTypeAndLengthSize, readConditional } = require("../utils/binaryHelpers.js");
const serializer = require("../utils/serializer.js");
const omni = require("../utils/omniCompressor.js");
const bigIntUtils = require("../utils/bigIntUtils.js");

const MAX_DEPTH = 512;

function parse(buffer) {
    if (!buffer || buffer.length === 0) return undefined;
    
    const magicJsonLen = constants.MAGIC_JSON.length;
    if (buffer.length >= magicJsonLen && buffer.subarray(0, magicJsonLen).toString() === constants.MAGIC_JSON) {
        return parseObject(buffer, 0);
    }
    
    const magicArrLen = constants.MAGIC_ARRAY.length;
    if (buffer.length >= magicArrLen && buffer.subarray(0, magicArrLen).toString() === constants.MAGIC_ARRAY) {
        return parseArray(buffer, 0);
    }
    
    return parseValue(buffer, 0, 0).value;
}

function parseObject(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded (Binah)");
    
    const magic = buffer.toString('utf8', 0, constants.MAGIC_JSON.length);
    if (magic !== constants.MAGIC_JSON) return {};

    let offset = constants.MAGIC_JSON.length; 
    const countInfo = serializer.readVarInt(buffer, offset); 
    offset += countInfo.bytesRead;
    
    const result = {};

    for(let i = 0; i < countInfo.value; i++) {
        const keyInfo = serializer.readString(buffer, offset);
        const key = keyInfo.value;
        const valueOffset = offset + keyInfo.bytesRead;
        const { value, bytesRead } = parseValue(buffer, valueOffset, depth + 1);

        result[key] = value; 
        offset += keyInfo.bytesRead + bytesRead;
    }
    
    return result;
}

function parseArray(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded (Binah)");
    const magicLen = constants.MAGIC_ARRAY.length;
    
    const magic = buffer.toString('utf8', 0, magicLen);
    if (magic !== constants.MAGIC_ARRAY) return [];

    if (buffer.length < magicLen + 2) return [];
    const configByte = buffer.readUInt8(magicLen);
    const lenSize = [1, 2, 4, 8][(configByte >> 2) & 0b11];
    const lenOffset = buffer.length - lenSize;
    let arrLen = 0;
    if (lenSize === 1) arrLen = buffer.readUInt8(lenOffset);
    else if (lenSize === 2) arrLen = buffer.readUInt16BE(lenOffset);
    else if (lenSize === 4) arrLen = buffer.readUInt32BE(lenOffset);
    else if (lenSize === 8) arrLen = Number(buffer.readBigUInt64BE(lenOffset));
    
    if (arrLen === 0) return [];
    let offset = magicLen + 1; const result = [];
    for(let i=0; i<arrLen; i++) {
        const { value, bytesRead } = parseValue(buffer, offset, depth + 1);
        if (bytesRead === 0) break; result.push(value); offset += bytesRead;
    }
    return result;
}

function parseValue(buffer, offset, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded (Binah.Value)");
    if (offset >= buffer.length) return { value: undefined, bytesRead: 0 };
    
    const start = offset;
    const typeByte = buffer.readUInt8(offset++);
    const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);

    let length = 0; 
    if (lengthSize > 0) { 
        length = readConditional(buffer, offset, lengthSize); 
        offset += lengthSize; 
    }
    
    const dataStart = offset; 
    offset += length; 
    
    let val; const T = constants.VAL_TYPE;
    const rawData = buffer.subarray(dataStart, dataStart + length);
    
    switch (type) {
        case T.NULL: val = null; break; 
        case T.UNDEFINED: val = undefined; break;
        case T.BOOLEAN: val = buffer[dataStart] === 1; break; 
        case T.SMALL_INT: val = buffer[dataStart]; break;
        case T.NUMBER: val = buffer.readDoubleBE(dataStart); break;
        case T.STRING: val = rawData.toString('utf8'); break;
        case T.STRING_OMNI: val = omni.unpack(rawData); break;
        case T.DATE: val = new Date(buffer.readDoubleBE(dataStart)); break;
        case T.BIGINT: val = bigIntUtils.fromBuffer(rawData, false); break;
        case T.BUFFER: val = rawData; break;
        case T.ARRAY: val = parseArray(rawData, depth + 1); break;
        case T.OBJECT: val = parseObject(rawData, depth + 1); break;
        default: val = rawData;
    }
    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue, parseObject };
