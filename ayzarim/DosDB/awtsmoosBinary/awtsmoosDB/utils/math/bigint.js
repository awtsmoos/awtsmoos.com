
// B"H
/**
 * @file bigint.js
 * @description
 *  CHAPTER 23: THE CHAIN OF GENERATIONS (BIGINT)
 */

module.exports = {
    /**
     * @method toBuffer
     * @description Decomposes a BigInt into physical limbs.
     */
    toBuffer(bi, fixedSize = null) {
        if (fixedSize === 8) {
            const b = Buffer.allocUnsafe(8);
            b.writeBigInt64BE(bi, 0);
            return { buffer: b, isNegative: bi < 0n };
        }
        const isNegative = bi < 0n;
        let val = isNegative ? -bi : bi;
        const limbs = [];
        if (val === 0n) limbs.push(0);
        while (val > 0n) { limbs.push(Number(val & 0xFFFFFFFFn)); val >>= 32n; }
        const actualByteLen = limbs.length * 4;
        const finalSize = fixedSize || actualByteLen;
        const buf = Buffer.alloc(finalSize).fill(0);
        for (let i = 0; i < limbs.length; i++) { if (i * 4 + 4 <= finalSize) buf.writeUInt32BE(limbs[i], i * 4); }
        return { buffer: buf, isNegative };
    },

    /**
     * @method fromBuffer
     * @description Reconstitutes the unified BigInt soul.
     */
    fromBuffer(buf, isNegative) {
        if (!buf || buf.length === 0) return 0n;
        if (buf.length === 8) return buf.readBigInt64BE(0);
        let bi = 0n;
        const limbCount = Math.floor(buf.length / 4);
        for (let i = 0; i < limbCount; i++) {
            const limb = BigInt(buf.readUInt32BE(i * 4));
            bi |= (limb << (BigInt(i) * 32n));
        }
        return isNegative ? -bi : bi;
    }
};
