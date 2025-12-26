
// B"H
module.exports = {
    toBuffer(bi) {
        const isNegative = bi < 0n;
        const abs = isNegative ? -bi : bi;
        let hex = abs.toString(16);
        if (hex.length % 2) hex = '0' + hex;
        return { buffer: Buffer.from(hex, 'hex'), isNegative };
    },
    fromBuffer(buf, isNegative) {
        const hex = buf.toString('hex');
        const bi = BigInt('0x' + hex);
        return isNegative ? -bi : bi;
    }
};
