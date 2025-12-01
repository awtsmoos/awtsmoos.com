// B"H
// Logic to compress floats into 1, 2, or 4 bytes based on decimal precision.
class AwtsmoosFloatHandler {
    
    /**
     * Tries to compress a float. Returns null if it needs full double precision.
     * @param {number} float 
     * @returns {number | null} Encoded integer representation or null
     */
    static writeDynamicFloat(float) {
        // We only handle the magnitude here. Sign is handled by Type selection in serializeValue.
        float = Math.abs(float);
        
        const str = float.toString();
        const dot = str.indexOf(".");
        if (dot < 0) return null; // Should assume it's an integer then?

        const digitLength = str.length - 1;
        const tenthPlaces = digitLength - dot;
        
        // Limits of coefficients for sizes
        // 1 Byte: 1 bit for decimal (1 or 2 places), 7 bits for coef (128)
        // 2 Byte: 2 bits for decimal (1-4), 14 bits for coef (16384)
        // 4 Byte: 4 bits for decimal (1-8), 28 bits for coef (268M)

        if (tenthPlaces > 8) return null; // Too precise, use Double

        const coef = Math.round(float * Math.pow(10, tenthPlaces));
        const decimalVal = tenthPlaces - 1;

        // Try 1 Byte (7 bit coef)
        if (tenthPlaces <= 2 && coef < 128) {
            return ((0b00000001 & decimalVal) << 7) | coef;
        }

        // Try 2 Bytes (14 bit coef)
        if (tenthPlaces <= 4 && coef < 16384) {
            return ((0b00000011 & decimalVal) << 14) | coef;
        }

        // Try 4 Bytes (28 bit coef)
        if (tenthPlaces <= 8 && coef < 268435456) {
            return ((0b00001111 & decimalVal) << 28) | coef;
        }

        return null; // Fallback to Double
    }

    /**
     * Decodes a compressed float buffer.
     * @param {number} encoded - The integer read from buffer
     * @param {number} byteLength - 1, 2, or 4
     */
    static decodeEncodedFloat(encoded, byteLength) {
        let decimals = 0;
        let coef = 0;

        if (byteLength === 1) {
            // 1 bit decimal (val+1), 7 bit coef
            decimals = ((encoded >> 7) & 0b1) + 1;
            coef = encoded & 0b01111111;
        } else if (byteLength === 2) {
            // 2 bit decimal (val+1), 14 bit coef
            decimals = ((encoded >> 14) & 0b11) + 1;
            coef = encoded & 0x3FFF;
        } else if (byteLength === 4) {
            // 4 bit decimal (val+1), 28 bit coef
            decimals = ((encoded >> 28) & 0b1111) + 1;
            coef = encoded & 0x0FFFFFFF;
        }

        return coef / Math.pow(10, decimals);
    }
}

module.exports = AwtsmoosFloatHandler;