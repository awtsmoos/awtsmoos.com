//B"H

var {
    unpackLength
 } = require("./packedLength.js")
/**
 * @method unpackTypeAndLengthSize
 * @description Unpacks type and length size from one byte, revealing the Awtsmoos’ design.
 * @param {number} byte - Packed byte in format:
 * 2 MSBs are length of values:
 * 0 0 
 * 1 2
 * 2 4
 * 3 8
 * @returns {{type: number, lengthSize: number}} - Type and length size
 */
function unpackTypeAndLengthSize(byte) {
    var lengthType = byte >> 6;
    var realLength = unpackLength(lengthType);
    var type = (
        0b00111111 & 
        byte //get 6 LSBs for type (0-64)
    )
    
    return { type, lengthSize: realLength};
}


module.exports = 
    unpackTypeAndLengthSize
