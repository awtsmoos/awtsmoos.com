// B"H
/**
 * @file hydrator_value_sync.js
 * @description Synchronous Resurrection of the Omni-Compressed Essence.
 * REWRITTEN: Ensures robust hydration of all types, including Custom Instances and Strings.
 */

const constants = require('../../constants.js');
const omni = require('../omniCompressor.js');
const parser = require('../../deserialize/parser.js');
const bigIntUtils = require('../bigIntUtils.js');
const floatHandler = require('../floatHandler.js');
const serializer = require('../serializer.js');
const registry = require('./registry.js');
const fs = require('fs');

function log(msg) {
    try { fs.writeSync(2, `\x1b[32mB"H [HYDRATOR_LOG] ${msg}\x1b[0m\n`); } catch(e) {}
}

module.exports = function hydrateValueSync(type, buffer, allocator) {
    if (!buffer) return undefined;
    const T = constants.VAL_TYPE;

    // --- 1. THE REVELATION OF SPECIES (CUSTOM_INSTANCE) ---
    if (type === T.CUSTOM_INSTANCE) {
        let offset = 0;
        
        const nameInfo = serializer.readString(buffer, offset); offset += nameInfo.bytesRead;
        const sourceInfo = serializer.readString(buffer, offset); offset += sourceInfo.bytesRead;
        const dictPtrBuf = buffer.subarray(offset, offset + 16);
        
        // Seek the Spirit in the Registry
        let Cls = registry.get(nameInfo.value);
        if (!Cls) {
            try { 
                Cls = (new Function(`return (${sourceInfo.value});`))(); 
                if (Cls) registry.set(nameInfo.value, Cls); 
            } catch(e) {
                log(`Failed to manifest species ${nameInfo.value} from source.`);
            }
        }
        
        // Manifest the Physical Body
        const instance = Cls ? Object.create(Cls.prototype) : { 
            __className__: nameInfo.value, 
            __source__: sourceInfo.value 
        };

        // Populate Properties from the physical Dictionary
        const Dictionary = require('../../structure/dictionary/index.js');
        const dict = new Dictionary(allocator, dictPtrBuf);
        
        // Synchronously harvest the fruit of the Dictionary
        for (const [k, val] of dict.entries()) {
            instance[k] = val;
        }
        
        return instance;
    }

    // --- 2. THE SPOKEN WORD (STRINGS) ---
    if (type === T.STRING) return buffer.toString('utf8');
    if (type === T.STRING_OMNI) return omni.unpack(buffer);

    // --- 3. THE CORE ESSENCES ---
    if (type === T.NULL) return null;
    if (type === T.UNDEFINED) return undefined;
    if (type === T.BOOLEAN || type === T.BOOLEAN_TRUE) return buffer.length > 0 && buffer[0] === 1;
    if (type === T.BOOLEAN_FALSE) return false;
    if (type === T.SMALL_INT) return buffer.length > 0 ? buffer[0] : 0;

    // --- 4. NUMERICS ---
    if (type === T.UINT8) return buffer.readUInt8(0);
    if (type === T.UINT16) return buffer.readUInt16BE(0);
    if (type === T.UINT32) return buffer.readUInt32BE(0);
    if (type === T.UINT64) return Number(buffer.readBigUInt64BE(0));
    if (type === T.INT8_NEG) return -buffer.readUInt8(0);
    if (type === T.INT16_NEG) return -buffer.readUInt16BE(0);
    if (type === T.INT32_NEG) return -buffer.readUInt32BE(0);
    if (type === T.INT64_NEG) return -Number(buffer.readBigUInt64BE(0));

    if (type === T.NUMBER || type === T.DOUBLE_POS) return buffer.readDoubleBE(0);
    if (type === T.DOUBLE_NEG) return -buffer.readDoubleBE(0);

    // --- 5. ADVANCED MATERIALIZATIONS ---
    if (type === T.NAN) return NaN;
    if (type === T.INFINITY) return Infinity;
    if (type === T.NEG_INFINITY) return -Infinity;
    if (type === T.SYMBOL) return Symbol.for(buffer.toString('utf8'));
    if (type === T.DATE) return new Date(buffer.readDoubleBE(0));
    if (type === T.BIGINT_POS) return bigIntUtils.fromBuffer(buffer, false);
    if (type === T.BIGINT_NEG) return bigIntUtils.fromBuffer(buffer, true);
    if (type === T.BUFFER) return Buffer.from(buffer);
    
    if (type === T.FUNCTION) {
        const source = buffer.toString('utf8');
        try { return (new Function('return ' + source))(); } catch(e) { return source; }
    }

    if (type === T.REGEXP) {
        try {
            const lenInfo = serializer.readVarInt(buffer, 0);
            const source = buffer.subarray(lenInfo.bytesRead, lenInfo.bytesRead + lenInfo.value).toString('utf8');
            const flags = buffer.subarray(lenInfo.bytesRead + lenInfo.value).toString('utf8');
            return new RegExp(source, flags);
        } catch(e) { return /ErrorDecodingRegExp/; }
    }

    // --- 6. TYPED ARRAYS ---
    if (type === T.TYPED_ARRAY) {
        if (buffer.length < 1) return new Uint8Array(0);
        const viewType = buffer[0];
        const rawContent = buffer.subarray(1);
        const ab = rawContent.buffer.slice(rawContent.byteOffset, rawContent.byteOffset + rawContent.byteLength);
        switch(viewType) {
            case 1: return new Int8Array(ab); case 2: return new Uint8Array(ab); case 3: return new Uint8ClampedArray(ab);
            case 4: return new Int16Array(ab); case 5: return new Uint16Array(ab); case 6: return new Int32Array(ab);
            case 7: return new Uint32Array(ab); case 8: return new Float32Array(ab); case 9: return new Float64Array(ab);
            case 10: return new BigInt64Array(ab); case 11: return new BigUint64Array(ab);
            default: return new Uint8Array(ab);
        }
    }

    // --- 7. LEGACY FRACTALS ---
    if (type === T.JSON || type === T.OBJECT || type === T.ARRAY) {
        return parser.parse(buffer);
    }

    return buffer;
};