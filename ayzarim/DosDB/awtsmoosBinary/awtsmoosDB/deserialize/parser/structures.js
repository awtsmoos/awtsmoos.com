
// B"H
/**
 * @file structures.js
 * @description 
 *  Handles the rehydration of complex vessels (Beriah and Yetzirah).
 */

const constants = require("../../constants.js");
const serializer = require("../../utils/serializer.js");

/**
 * @function parseArray
 * @description Hydrates a binary array sequence back into JS existence.
 */
function parseArray(buffer, depth, valueParser) {
    const magicLen = constants.MAGIC_ARRAY.length;
    
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
    
    let offset = magicLen + 1; 
    const result = [];
    
    for(let i=0; i<arrLen; i++) {
        const { value, bytesRead } = valueParser(buffer, offset, depth);
        if (bytesRead === 0) break; 
        result.push(value); 
        offset += bytesRead;
    }
    return result;
}

/**
 * @function parseObject
 * @description Manifests a binary JSON structure as a living object.
 */
function parseObject(buffer, depth, valueParser) {
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
        const { value, bytesRead } = valueParser(buffer, valueOffset, depth);

        result[key] = value; 
        offset += keyInfo.bytesRead + bytesRead;
    }
    
    return result;
}

module.exports = {
    isStructure(type) {
        const T = constants.VAL_TYPE;
        // B"H: Admitting JS_MAP and JS_SET alongside ERROR into the realm of structure.
        return type === T.ARRAY || type === T.OBJECT || type === T.JSON || 
               type === T.MAP || type === T.SET || type === T.TYPED_ARRAY || 
               type === T.ERROR || type === T.JS_MAP || type === T.JS_SET;
    },

    parseStructure(type, rawData, depth, valueParser) {
        const T = constants.VAL_TYPE;
        
        switch (type) {
            case T.ARRAY: return parseArray(rawData, depth, valueParser);
            case T.OBJECT: 
            case T.JSON: return parseObject(rawData, depth, valueParser);
            
            // B"H: Breathing life into the shattered vessels
            case T.ERROR: {
                const parsed = parseObject(rawData, depth, valueParser);
                let ErrClass = globalThis[parsed.name] || Error;
                let err;
                
                try {
                    // AggregateError requires its internal array first
                    if (parsed.name === 'AggregateError') {
                        err = new ErrClass(parsed.errors || [], parsed.message);
                    } else {
                        err = new ErrClass(parsed.message);
                    }
                } catch(e) {
                    err = new Error(parsed.message);
                }
                
                err.name = parsed.name;
                if (parsed.stack) err.stack = parsed.stack;
                if (parsed.cause) err.cause = parsed.cause;
                if (parsed.errors) err.errors = parsed.errors;
                
                return err;
            }
            
            case T.MAP: return new Map(parseArray(rawData, depth, valueParser));
            case T.SET: return new Set(parseArray(rawData, depth, valueParser));
            
            // B"H: Native JS formats encoded as Arrays
            case T.JS_MAP: return new Map(parseArray(rawData, depth, valueParser));
            case T.JS_SET: return new Set(parseArray(rawData, depth, valueParser));
            
            case T.TYPED_ARRAY:
                if (rawData.length === 0) return new Uint8Array(0);
                const viewType = rawData[0];
                const arrBuffer = rawData.subarray(1);
                const ab = new Uint8Array(arrBuffer).buffer.slice(
                    arrBuffer.byteOffset, 
                    arrBuffer.byteOffset + arrBuffer.byteLength
                );
                
                switch(viewType) {
                    case 1: return new Int8Array(ab);
                    case 2: return new Uint8Array(ab);
                    case 3: return new Uint8ClampedArray(ab);
                    case 4: return new Int16Array(ab);
                    case 5: return new Uint16Array(ab);
                    case 6: return new Int32Array(ab);
                    case 7: return new Uint32Array(ab);
                    case 8: return new Float32Array(ab);
                    case 9: return new Float64Array(ab);
                    case 10: return new BigInt64Array(ab);
                    case 11: return new BigUint64Array(ab);
                    default: return rawData;
                }
        }
        return rawData;
    },
    parseArray,
    parseObject
};
