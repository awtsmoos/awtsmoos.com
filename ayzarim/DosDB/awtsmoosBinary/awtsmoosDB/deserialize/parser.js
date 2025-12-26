// B"H
/**
 * @file parser.js
 * @description
 *  The Sefirah of Binah - The Great Understanding.
 *  Decodes binary data into JS objects.
 */

console.error("B\"H [MODULE_LOAD] Parser module loaded.");

const constants = require("../constants.js");
const { unpackTypeAndLengthSize, readConditional } = require("../utils/binaryHelpers.js");
const serializer = require("../utils/serializer.js");
const readVarInt = serializer.readVarInt.bind(serializer);
const readString = serializer.readString.bind(serializer);
const floatHandler = require("../utils/floatHandler.js");
const stringPacker = require("../utils/stringPacker.js");
const bigIntUtils = require("../utils/bigIntUtils.js");

const MAX_DEPTH = 512;

function log(msg) {
    console.error(`B"H [PARSER] ${msg}`);
}

function parse(buffer) {
    if (!buffer) {
        log("parse() called with NULL buffer");
        return undefined;
    }
    // log(`parse() called. Buffer len: ${buffer.length}`);
    
    if (buffer.length === 0) return undefined;
    
    const magicJsonLen = constants.MAGIC_JSON.length;
    if (buffer.length >= magicJsonLen && buffer.subarray(0, magicJsonLen).toString() === constants.MAGIC_JSON) {
        log("Detected MAGIC_JSON header at root");
        return parseObject(buffer, 0);
    }
    
    const magicArrLen = constants.MAGIC_ARRAY.length;
    if (buffer.length >= magicArrLen && buffer.subarray(0, magicArrLen).toString() === constants.MAGIC_ARRAY) {
        log("Detected MAGIC_ARRAY header at root");
        return parseArray(buffer, 0);
    }
    
    return parseValue(buffer, 0, 0).value;
}

function parseObject(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded (Binah)");
    
    // Safety check for MAGIC_JSON before parsing
    const magic = buffer.toString('utf8', 0, constants.MAGIC_JSON.length);
    if (magic !== constants.MAGIC_JSON) {
        log(`[parseObject] CORRUPTION DETECTED. Expected '${constants.MAGIC_JSON}', got '${magic.replace(/\0/g,'\\0')}' (Hex: ${buffer.subarray(0,10).toString('hex')})`);
        return {}; // Return empty object on corruption
    }

    let offset = constants.MAGIC_JSON.length; 
    const countInfo = readVarInt(buffer, offset); 
    offset += countInfo.bytesRead;
    
    const result = {};
    
    // log(`[parseObject] Parsing Object with ${countInfo.value} keys at depth ${depth}`);

    for(let i = 0; i < countInfo.value; i++) {
        const keyInfo = readString(buffer, offset);
        const key = keyInfo.value;
        const valueOffset = offset + keyInfo.bytesRead;
        
        // if (key === 'errors') log(`[parseObject] Found 'errors' key. Offset: ${valueOffset}`);
        
        const { value, bytesRead } = parseValue(buffer, valueOffset, depth + 1);
        
        // if (key === 'errors') log(`[parseObject] 'errors' parsed as: ${Array.isArray(value) ? `Array(${value.length})` : typeof value}`);

        result[key] = value; 
        offset += keyInfo.bytesRead + bytesRead;
    }
    
    return result;
}

function parseArray(buffer, depth) {
    if (depth > MAX_DEPTH) throw new Error("B\"H: Maximum Recursion Depth Exceeded (Binah)");
    const magicLen = constants.MAGIC_ARRAY.length;
    
    // Safety check for MAGIC_ARRAY
    const magic = buffer.toString('utf8', 0, magicLen);
    if (magic !== constants.MAGIC_ARRAY) {
        log(`[parseArray] CORRUPTION DETECTED. Expected '${constants.MAGIC_ARRAY}', got '${magic}' (Hex: ${buffer.subarray(0,10).toString('hex')})`);
        return [];
    }

    if (buffer.length < magicLen + 2) return [];
    const configByte = buffer.readUInt8(magicLen);
    const lenSize = [1, 2, 4, 8][(configByte >> 2) & 0b11];
    const lenOffset = buffer.length - lenSize;
    let arrLen = 0;
    if (lenSize === 1) arrLen = buffer.readUInt8(lenOffset);
    else if (lenSize === 2) arrLen = buffer.readUInt16BE(lenOffset);
    else if (lenSize === 4) arrLen = buffer.readUInt32BE(lenOffset);
    else if (lenSize === 8) arrLen = Number(buffer.readBigUInt64BE(lenOffset));
    
    // log(`[parseArray] Parsing Array of length ${arrLen}`);
    
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
    if (offset >= buffer.length) {
        return { value: undefined, bytesRead: 0 };
    }
    
    const start = offset;
    const typeByte = buffer.readUInt8(offset++);
    const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);
    
    // log(`[parseValue] Offset: ${start} | Byte: ${typeByte} -> Type: ${type}`);

    let length = 0; 
    if (lengthSize > 0) { 
        length = readConditional(buffer, offset, lengthSize); 
        offset += lengthSize; 
    }
    
    const dataStart = offset; 
    offset += length; 
    
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
        
        // B"H: FIX - REMOVED HARDCODED 'case 6' WHICH CONFLICTED WITH T.ARRAY
        case T.OBJECT: 
            // log(`[parseValue] Dispatching to parseObject (Type: ${type})`);
            val = parseObject(buffer.subarray(dataStart, dataStart + length), depth + 1); 
            
            // Hydration Logic
            if (val && val.__awtsmoosError__) {
                // log(`[Hydration] Error Object Detected: ${val.name}`);
                let errObj;
                const msg = val.message || "";
                
                if (val.isAggregate) {
                    try {
                        // log(`[Hydration] Constructing AggregateError. Errors isArray? ${Array.isArray(val.errors)}`);
                        const errs = Array.isArray(val.errors) ? val.errors : [];
                        errObj = new AggregateError(errs, msg);
                    } catch(e) {
                        log(`[Hydration] Failed to construct AggregateError: ${e.message}`);
                        errObj = new Error(msg);
                    }
                } else {
                    switch(val.name) {
                        case 'RangeError': errObj = new RangeError(msg); break;
                        case 'TypeError': errObj = new TypeError(msg); break;
                        case 'SyntaxError': errObj = new SyntaxError(msg); break;
                        case 'ReferenceError': errObj = new ReferenceError(msg); break;
                        default: errObj = new Error(msg);
                    }
                }
                
                Object.defineProperty(errObj, 'name', { value: val.name, writable: true });
                if (val.stack) Object.defineProperty(errObj, 'stack', { value: val.stack, writable: true });
                if (val.cause) errObj.cause = val.cause;
                val = errObj;
            }
            break;
            
        case T.ARRAY: 
            // log(`[parseValue] Dispatching to parseArray (Type: ${type})`);
            val = parseArray(buffer.subarray(dataStart, dataStart + length), depth + 1); 
            break;
            
        case T.BUFFER: val = buffer.subarray(dataStart, dataStart + length); break;
        case T.STRING_HEBREW: val = stringPacker.unpackHebrew(buffer.subarray(dataStart, dataStart + length)); break;
        case T.STRING_RLE: val = stringPacker.unpackRLE(buffer.subarray(dataStart, dataStart + length)); break;
        
        case T.ERROR: {
            log("Encountered T.ERROR (Legacy Type)");
            const inner = parse(buffer.subarray(dataStart, dataStart + length));
            val = new Error(inner.message || "Unknown");
            val.name = inner.name || "Error";
            break;
        }
        
        default: 
            if (type >= 10 && type <= 30) { 
                // Numeric types handled elsewhere
            } else {
                log(`[parseValue] Unknown Type: ${type}. Returning Buffer.`);
                val = buffer.subarray(dataStart, dataStart + length);
            }
    }
    return { value: val, bytesRead: offset - start };
}

module.exports = { parse, parseValue, parseObject };
