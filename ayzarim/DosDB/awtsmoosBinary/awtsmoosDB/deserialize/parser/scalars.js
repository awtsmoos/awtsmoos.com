// B"H
/**
 * @file scalars.js
 * @description 
 *  The manifestation of Atomic Light (Atziluth). 
 *  Handles the conversion of raw bytes into primitive JS values.
 */

const constants = require("../../constants.js");
const omni = require("../../utils/omniCompressor.js");
const bigIntUtils = require("../../utils/bigIntUtils.js");
const floatHandler = require("../../utils/floatHandler.js");
const serializer = require("../../utils/serializer.js");

function readEncodedValue(buf) {
    if (buf.length === 1) return buf.readUInt8(0);
    if (buf.length === 2) return buf.readUInt16BE(0);
    if (buf.length === 4) return buf.readUInt32BE(0);
    return 0;
}

module.exports = {
    /**
     * @description Translates a specific type tag and raw buffer into a JS primitive.
     */
    parseScalar(type, rawData, buffer, dataStart) {
        const T = constants.VAL_TYPE;
        let val;

        switch (type) {
            case T.NULL: val = null; break; 
            case T.UNDEFINED: val = undefined; break;
            
            case T.BOOLEAN: 
            case T.BOOLEAN_TRUE: val = true; break;
            case T.BOOLEAN_FALSE: val = false; break;
            
            case T.SMALL_INT: val = buffer[dataStart]; break;
            
            case T.UINT8: val = buffer.readUInt8(dataStart); break;
            case T.UINT16: val = buffer.readUInt16BE(dataStart); break;
            case T.UINT32: val = buffer.readUInt32BE(dataStart); break;
            case T.UINT64: val = Number(buffer.readBigUInt64BE(dataStart)); break;
            
            case T.INT8_NEG: val = -buffer.readUInt8(dataStart); break;
            case T.INT16_NEG: val = -buffer.readUInt16BE(dataStart); break;
            case T.INT32_NEG: val = -buffer.readUInt32BE(dataStart); break;
            case T.INT64_NEG: val = -Number(buffer.readBigUInt64BE(dataStart)); break;

            case T.FLOAT_1:
            case T.FLOAT_2:
            case T.FLOAT_4:
                val = floatHandler.decodeEncodedFloat(readEncodedValue(rawData)); break;
            case T.FLOAT_NEG_1:
            case T.FLOAT_NEG_2:
            case T.FLOAT_NEG_4:
                val = -floatHandler.decodeEncodedFloat(readEncodedValue(rawData)); break;
                
            case T.NUMBER:
            case T.DOUBLE_POS: val = buffer.readDoubleBE(dataStart); break;
            case T.DOUBLE_NEG: val = -buffer.readDoubleBE(dataStart); break;
            
            case T.NAN: val = NaN; break;
            case T.INFINITY: val = Infinity; break;
            case T.NEG_INFINITY: val = -Infinity; break;

            case T.STRING: val = rawData.toString('utf8'); break;
            case T.STRING_OMNI: val = omni.unpack(rawData); break;
            
            case T.SYMBOL: val = Symbol.for(rawData.toString('utf8')); break;
            case T.DATE: val = new Date(buffer.readDoubleBE(dataStart)); break;
            
            case T.BIGINT:
            case T.BIGINT_POS: val = bigIntUtils.fromBuffer(rawData, false); break;
            case T.BIGINT_NEG: val = bigIntUtils.fromBuffer(rawData, true); break;
            
            case T.BUFFER: val = Buffer.from(rawData); break;
            
            case T.FUNCTION: 
                const source = rawData.toString('utf8');
                try {
                    val = new Function('return ' + source)();
                } catch(e) {
                    val = source; // Return source string if it cannot be breathed into a function
                }
                break;

            case T.REGEXP:
                try {
                    const sRes = serializer.readVarInt(rawData, 0);
                    const rSource = rawData.subarray(sRes.bytesRead, sRes.bytesRead + sRes.value).toString('utf8');
                    const rFlags = rawData.subarray(sRes.bytesRead + sRes.value).toString('utf8');
                    val = new RegExp(rSource, rFlags);
                } catch(e) { val = /ErrorDecodingRegExp/; }
                break;

            default: val = rawData;
        }
        return val;
    }
};