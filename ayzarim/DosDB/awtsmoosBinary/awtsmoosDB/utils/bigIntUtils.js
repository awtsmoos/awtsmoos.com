
// B"H
/**
 * @file bigIntUtils.js
 * @description
 *  The Archangel of Massive Scales. 
 *  Translates the JS BigInt into a unified, hex-based binary format.
 */

module.exports = {
    /**
     * @method toBuffer
     * @description Condenses a BigInt into a hex-encoded physical buffer.
     */
    toBuffer(bi) {
        const isNegative = bi < 0n;
        const abs = isNegative ? -bi : bi;
        
        // Special shielding for zero
        if (abs === 0n) return { buffer: Buffer.alloc(0), isNegative: false };
        
        let hex = abs.toString(16);
        if (hex.length % 2) hex = '0' + hex; 
        
        return { buffer: Buffer.from(hex, 'hex'), isNegative };
    },

    /**
     * @method fromBuffer
     * @description Resurrects a BigInt from the raw binary elements.
     */
    fromBuffer(buf, isNegative) {
        if (!buf || buf.length === 0) return 0n;
        
        const hex = buf.toString('hex');
        if (hex === '') return 0n; 
        
        const bi = BigInt('0x' + hex);
        return isNegative ? -bi : bi;
    }
};
