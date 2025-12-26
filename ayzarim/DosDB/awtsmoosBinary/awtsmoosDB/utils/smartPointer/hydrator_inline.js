
// B"H
const constants = require('../../constants.js');
const bigIntUtils = require('../bigIntUtils.js');
const floatHandler = require('../floatHandler.js');

module.exports = async function decodeInline(type, payload, allocator, context, SmartPointer) {
    const T = constants.VAL_TYPE;
    
    // --- Variable Length Types ---
    const variableLengthTypes = [
        T.STRING, T.BUFFER, T.TYPED_ARRAY, T.SYMBOL, 
        T.BIGINT_POS, T.BIGINT_NEG
    ];

    let data = payload;
    if (variableLengthTypes.includes(type)) {
        const len = payload[0];
        data = payload.subarray(1, 1 + len);
    }

    if (type === T.SYMBOL) return Symbol.for(data.toString('utf8'));
    if (type === T.BIGINT_POS) return bigIntUtils.fromBuffer(data, false);
    if (type === T.BIGINT_NEG) return bigIntUtils.fromBuffer(data, true);
    if (type === T.BUFFER) return data;
    if (type === T.STRING) return data.toString('utf8');

    // Typed Array Inline
    if (type === T.TYPED_ARRAY) {
         if (data.length < 1) return new Uint8Array(0);
         const viewType = data[0];
         const rawContent = data.subarray(1);
         const ab = rawContent.buffer.slice(rawContent.byteOffset, rawContent.byteOffset + rawContent.byteLength);
         
         switch(viewType) {
            case 1: return new Int8Array(ab); case 2: return new Uint8Array(ab); case 4: return new Int16Array(ab);
            case 5: return new Uint16Array(ab); case 6: return new Int32Array(ab); case 7: return new Uint32Array(ab);
            case 8: return new Float32Array(ab); case 9: return new Float64Array(ab); case 10: return new BigInt64Array(ab);
            case 11: return new BigUint64Array(ab); default: return new Uint8Array(ab);
         }
    }
    
    // --- Fixed Length & Self-Describing Types ---
    if (type === T.NULL) return null;
    if (type === T.UNDEFINED) return undefined;
    if (type === T.BOOLEAN_TRUE || type === T.BOOLEAN) return payload[0] === 1;
    if (type === T.NAN) return NaN;
    if (type === T.INFINITY) return Infinity;
    if (type === T.NEG_INFINITY) return -Infinity;
    if (type === T.NUMBER) return payload.readDoubleBE(0);
    if (type === T.DATE) return new Date(payload.readDoubleBE(0));
    
    // Numerics
    if (type === T.UINT8) return payload.readUInt8(0);
    if (type === T.UINT16) return payload.readUInt16BE(0);
    if (type === T.UINT32) return payload.readUInt32BE(0);
    if (type === T.UINT64) return Number(payload.readBigUInt64BE(0));
    if (type === T.INT8_NEG) return -1 * payload.readUInt8(0);
    if (type === T.INT16_NEG) return -1 * payload.readUInt16BE(0);
    if (type === T.INT32_NEG) return -1 * payload.readUInt32BE(0);
    if (type === T.INT64_NEG) return -1 * Number(payload.readBigUInt64BE(0));
    
    if (type === T.FLOAT_1) return floatHandler.decodeEncodedFloat(payload.readUInt8(0), 1);
    if (type === T.FLOAT_2) return floatHandler.decodeEncodedFloat(payload.readUInt16BE(0), 2);
    if (type === T.FLOAT_4) return floatHandler.decodeEncodedFloat(payload.readUInt32BE(0), 4);
    if (type === T.FLOAT_NEG_1) return -1 * floatHandler.decodeEncodedFloat(payload.readUInt8(0), 1);
    if (type === T.FLOAT_NEG_2) return -1 * floatHandler.decodeEncodedFloat(payload.readUInt16BE(0), 2);
    if (type === T.FLOAT_NEG_4) return -1 * floatHandler.decodeEncodedFloat(payload.readUInt32BE(0), 4);

    // Inline Structures (Smart Binary)
    if (type === constants.TYPE_SMART_OBJECT || type === constants.TYPE_SMART_ARRAY) {
         const SmartBinary = require('../smartBinary.js');
         if (type === constants.TYPE_SMART_OBJECT) {
            const keys = SmartBinary.getObjectKeys(payload);
            const obj = {};
            for(const k of keys) {
                const valBuf = SmartBinary.getObjectProperty(payload, k);
                obj[k] = await SmartPointer.resolve(valBuf, allocator, context);
            }
            return obj;
         } else {
            const count = payload.readUInt32BE(4);
            const arr = [];
            for(let i=0; i<count; i++) {
                const valBuf = SmartBinary.getArrayIndex(payload, i);
                arr.push(await SmartPointer.resolve(valBuf, allocator, context));
            }
            return arr;
         }
    }

    return null;
};
