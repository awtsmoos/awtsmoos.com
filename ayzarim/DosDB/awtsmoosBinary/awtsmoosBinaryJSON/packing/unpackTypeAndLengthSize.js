//B"H
/**
 * @method unpackTypeAndLengthSize
 * @description Unpacks type and length size from one byte, revealing the Awtsmoos’ design.
 * @param {number} byte - Packed byte
 * @returns {{type: number, lengthSize: number}} - Type and length size
 */
function unpackTypeAndLengthSize(byte) {
    const type = (byte >> 4) & 0x0F;
    const lengthSize = byte & 0x0F;
    return { type, lengthSize };
}


module.exports = 
    unpackTypeAndLengthSize
