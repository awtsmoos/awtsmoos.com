
// B"H
/**
 * @file number_serializer.js
 * @description
 *  The Tzimtzum of Mathematics.
 *  
 *  In the beginning, when the En Sof willed to create the worlds, He had to 
 *  measure and limit the infinite light so the vessels would not shatter. 
 *  This is the concept of Tzimtzum (Contraction). 
 *  
 *  This module acts as the Tzimtzum for numerical values. It takes an abstract, 
 *  potentially infinite JavaScript number and determines the exact physical 
 *  constraint (UINT8, UINT16, FLOAT, DOUBLE) required to manifest it in the 
 *  void of the binary block, ensuring absolute efficiency and perfect preservation 
 *  of the Divine proportions.
 * 
 *  "He appointed a weight for the wind, and apportioned the waters by measure." (Job 28:25)
 */

const constants = require("../../../constants.js");

/**
 * @function serializeNumber
 * @description 
 *  Discerns the nature of a numerical spark and contracts it into a physical buffer.
 *  It tests for the boundaries of integers, floating points, and the infinite (Infinity, NaN).
 * 
 * @param {number} value The numerical essence to be manifested.
 * @returns {Object} An object containing the chosen {type, data: Buffer} to hold the light.
 */
function serializeNumber(value) {
    let type = 0;
    let data = null;

    if (isNaN(value)) { 
        type = constants.VAL_TYPE.NAN; 
    }
    else if (value === Infinity) { 
        type = constants.VAL_TYPE.INFINITY; 
    }
    else if (value === -Infinity) { 
        type = constants.VAL_TYPE.NEG_INFINITY; 
    }
    else {
        const isNeg = value < 0; 
        const absValue = Math.abs(value);
        
        // If it is a pure integer within the safe boundaries of manifestation
        if (absValue <= Number.MAX_SAFE_INTEGER && absValue % 1 === 0) {
            if (absValue <= 0xFF) { 
                data = Buffer.allocUnsafe(1); 
                data.writeUInt8(absValue, 0); 
                type = isNeg ? constants.VAL_TYPE.INT8_NEG : constants.VAL_TYPE.UINT8; 
            }
            else if (absValue <= 0xFFFF) { 
                data = Buffer.allocUnsafe(2); 
                data.writeUInt16BE(absValue, 0); 
                type = isNeg ? constants.VAL_TYPE.INT16_NEG : constants.VAL_TYPE.UINT16; 
            }
            else if (absValue <= 0xFFFFFFFF) { 
                data = Buffer.allocUnsafe(4); 
                data.writeUInt32BE(absValue, 0); 
                type = isNeg ? constants.VAL_TYPE.INT32_NEG : constants.VAL_TYPE.UINT32; 
            }
            else { 
                data = Buffer.allocUnsafe(8); 
                data.writeBigUInt64BE(BigInt(absValue), 0); 
                type = isNeg ? constants.VAL_TYPE.INT64_NEG : constants.VAL_TYPE.UINT64; 
            }
        } else {
            // It is a fraction, requiring the expanded vessel of a Double
            type = isNeg ? constants.VAL_TYPE.DOUBLE_NEG : constants.VAL_TYPE.DOUBLE_POS;
            data = Buffer.allocUnsafe(8); 
            data.writeDoubleBE(absValue);
        }
    }
    
    return { type, data: data || Buffer.alloc(0) };
}

module.exports = serializeNumber;
