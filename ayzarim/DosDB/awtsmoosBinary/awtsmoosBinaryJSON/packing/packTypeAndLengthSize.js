//B"H
/**
 * @method packTypeAndLengthSize
 * @description Packs type and length size into one byte, a spark of the Awtsmoos’ unity.
 * @param {number} type - Data type (0-15)
 * @param {number} lengthSize - Bytes for length (0-15)
 * @returns {Buffer} - Single-byte buffer
 */
function packTypeAndLengthSize(type, lengthSize) {
    const packed = (type << 4) | (lengthSize & 0x0F);
    return Buffer.from([packed]);
}


module.exports = packTypeAndLengthSize;