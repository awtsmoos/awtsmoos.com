
// B"H
/**
 * @module bigIntUtils
 * @description
 *  Converts BigInts to/from Raw Buffers efficiently.
 *  Uses Hex encoding as an intermediate for V8 speed, then packs to binary.
 */

module.exports = {
    toBuffer(val) {
        let isNegative = val < 0n;
        let absVal = isNegative ? -val : val;
        
        // Optimization: Hex string to Buffer is very fast in Node
        let hex = absVal.toString(16);
        if (hex.length % 2 !== 0) hex = '0' + hex;
        
        const buffer = Buffer.from(hex, 'hex');
        return { buffer, isNegative };
    },

    fromBuffer(buffer, isNegative) {
        if (!buffer || buffer.length === 0) return 0n;
        const hex = buffer.toString('hex');
        // Handle empty or invalid hex
        if (!hex) return 0n;
        // B"H: BigInt constructor handles '0x' prefix correctly
        try {
            let val = BigInt('0x' + hex);
            return isNegative ? -val : val;
        } catch (e) {
            return 0n;
        }
    }
};
