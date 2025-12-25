// B"H
/**
 * @file parser.js
 * @description
 *  The Sefirah of Binah - The Great Understanding.
 *  Translates the coarse binary sparks into the structured light of JavaScript values.
 *  PURGED OF JSON ABOMINATION.
 */

const constants = require("../constants.js");
const { unpackTypeAndLengthSize, readConditional } = require("../utils/binaryHelpers.js");
const serializer = require("../utils/serializer.js");
const readVarInt = serializer.readVarInt.bind(serializer);
const readString = serializer.readString.bind(serializer);
const floatHandler = require("../utils/floatHandler.js");
const stringPacker = require("../utils/stringPacker.js");
const bigIntUtils = require("../utils/bigIntUtils.js");

const MAX_DEPTH = 512;

/**
 * @description
 *  Main entry point for parsing a binary vessel.
 */
function parse(buffer) {
    if (!buffer || buffer.length === 0) return undefined;
    const magicJsonLen = constants.MAGIC_JSON.length;
    if (buffer.length >= magicJsonLen && buffer.subarray(0, magicJsonLen).toString() === constants.MAGIC_JSON) return parseObject(buffer, 0);
    const magicArrLen = constants.MAGIC_ARRAY.length;
    if (buffer.length >= magicArrLen && buffer.subarray(0, magicArrLen).toString() === constants.MAGIC_ARRAY) return parseArray(buffer, 0);
    return parseValue(buffer, 0, 0).value;
}

/**
 * @description
 *  Parses a recursive binary object structure (Dictionary fallback).
 */
function parseObject(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    let offset = constants.MAGIC_JSON.length; 
    const countInfo = readVarInt(buffer, offset); offset += countInfo.bytesRead;
    const result = {};
    for(let i=0; i<countInfo.value; i++) {
        const keyInfo = readString(buffer, offset);
        const { value, bytesRead } = parseValue(buffer, offset + keyInfo.bytesRead, depth + 1);
        result[keyInfo.value] = value; offset += keyInfo.bytesRead + bytesRead;
    }
    return result;
}

/**
 * @description
 *  Parses a recursive binary array structure (Sequence fallback).
 */
function parseArray(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    const magicLen = constants.MAGIC_ARRAY.length;
    if (buffer.length < magicLen + 2) return [];
    const configByte = buffer.readUInt8(magicLen);
    const lenSize = [1, 2, 4, 8][(configByte >> 2) & 0b11];
    const offsetSize = [1, 2, 4, 8][configByte & 0b11];
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

/**
 * @description
 *  Parses a single binary spark [TypeLengthByte][LengthInfo][Data].
 */
function parseValue(buffer, offset, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded");
    if (offset >= buffer.length) return { value: undefined, bytesRead: 0 };
    const start = offset;
    const typeByte = buffer.readUInt8(offset++);
    const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);
    let length = 0; if (lengthSize > 0) { length = readConditional(buffer, offset, lengthSize); offset += lengthSize; }
    const dataStart = offset; offset += length; 
    let val; const T = constants.VAL_TYPE;
    switch (type) {
        case T.NULL: val = null; break; case T.UNDEFINED: val = undefined; break;
        case T.BOOLEAN_TRUE: val = true; break; case T.BOOLEAN_FALSE: val = false; break;
        case T.NAN: val = NaN; break; case T.INFINITY: val = Infinity; break; case T.NEG_INFINITY: val = -Infinity; break;
        case T.NUMBER: val = buffer.readDoubleBE(dataStart); break;
        case T.STRING: val = buffer.toString('utf8', dataStart, dataStart + length); break;
        case T.FUNCTION: val = buffer.toString('utf8', dataStart, dataStart + length); break;
        case T.DATE: val = new Date(buffer.readDoubleBE(dataStart)); break;
        case T.BIGINT_POS: val = bigIntUtils.fromBuffer(buffer.subarray(dataStart, dataStart + length), false); break;
        case T.BIGINT_NEG: val = bigIntUtils.fromBuffer(buffer.subarray(dataStart, dataStart + length), true); break;
        case T.SYMBOL: val = Symbol.for(buffer.toString('utf8', dataStart, dataStart + length)); break;
        case T.REGEXP: {
            const sRes = serializer.readString(buffer, dataStart);
            const fRes = serializer.readString(buffer, dataStart + sRes.bytesRead);
            val = new RegExp(sRes.value, fRes.value); break;
        }
        case T.MAP: val = new Map(parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1)); break;
        case T.SET: val = new Set(parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1)); break;
        
        // Binary Error rehydration
        case T.ERROR: {
            let off = dataStart;
            const isAgg = buffer[off++] === 1;
            const nameRes = serializer.readString(buffer, off); off += nameRes.bytesRead;
            const msgRes = serializer.readString(buffer, off); off += msgRes.bytesRead;
            const stackRes = serializer.readString(buffer, off); off += stackRes.bytesRead;
            
            const ErrorTypes = { RangeError, TypeError, ReferenceError, SyntaxError, EvalError, URIError };
            const Constructor = ErrorTypes[nameRes.value] || Error;

            if (isAgg) {
                const countRes = serializer.readVarInt(buffer, off); off += countRes.bytesRead;
                const errors = []; for(let i=0; i<countRes.value; i++) {
                    const sName = serializer.readString(buffer, off); off += sName.bytesRead;
                    const sMsg = serializer.readString(buffer, off); off += sMsg.bytesRead;
                    const SubCons = ErrorTypes[sName.value] || Error;
                    errors.push(Object.assign(new SubCons(sMsg.value), { name: sName.value }));
                }
                val = new AggregateError(errors, msgRes.value);
            } else { val = new Constructor(msgRes.value); }
            Object.assign(val, { name: nameRes.value, stack: stackRes.value }); break;
        }
        
        // Optimized Numerics
        case T.UINT8: val = buffer.readUInt8(dataStart); break; case T.UINT16: val = buffer.readUInt16BE(dataStart); break;
        case T.UINT32: val = buffer.readUInt32BE(dataStart); break; case T.UINT64: val = Number(buffer.readBigUInt64BE(dataStart)); break;
        case T.INT8_NEG: val = -1 * buffer.readUInt8(dataStart); break; case T.INT16_NEG: val = -1 * buffer.readUInt16BE(dataStart); break;
        case T.INT32_NEG: val = -1 * buffer.readUInt32BE(dataStart); break; case T.INT64_NEG: val = -1 * Number(buffer.readBigUInt64BE(dataStart)); break;
        case T.DOUBLE_POS: val = buffer.readDoubleBE(dataStart); break; case T.DOUBLE_NEG: val = -1 * buffer.readDoubleBE(dataStart); break;
        case T.FLOAT_1: val = floatHandler.decodeEncodedFloat(buffer.readUInt8(dataStart), 1); break;
        case T.FLOAT_2: val = floatHandler.decodeEncodedFloat(buffer.readUInt16BE(dataStart), 2); break;
        case T.FLOAT_4: val = floatHandler.decodeEncodedFloat(buffer.readUInt32BE(dataStart), 4); break;
        case T.FLOAT_NEG_1: val = -1 * floatHandler.decodeEncodedFloat(buffer.readUInt8(dataStart), 1); break;
        case T.FLOAT_NEG_2: val = -1 * floatHandler.decodeEncodedFloat(buffer.readUInt16BE(dataStart), 2); break;
        case T.FLOAT_NEG_4: val = -1 * floatHandler.decodeEncodedFloat(buffer.readUInt32BE(dataStart), 4); break;
        
        case 6: case T.OBJECT: val = parseObject(buffer.subarray(dataStart, dataStart + length), depth + 1); break;
        case T.ARRAY: val = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1); break;
        case T.BUFFER: val = buffer.subarray(dataStart, dataStart + length); break;
        case T.STRING_HEBREW: val = stringPacker.unpackHebrew(buffer.subarray(dataStart, dataStart + length)); break;
        case T.STRING_RLE: val = stringPacker.unpackRLE(buffer.subarray(dataStart, dataStart + length)); break;
        default: val = buffer.subarray(dataStart, dataStart + length);
    }
    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue };