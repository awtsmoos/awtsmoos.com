//B"H
/**
 * @method packTypeAndLengthSize
 * @description Packs type and length size into one byte, a spark of the Awtsmoos’ unity.
 * @param {number} type - 6 bits (LSB) Data type (0-64)
 * @param {number} lengthSize - first 2 MSB (bits), 1 - 8 potential
 * bytes
 *  for length (only 1 2 4 8, 4 values)
 * @returns {Buffer} - Single-byte buffer
 */

var {packedLength} = require("./packedLength.js")
function packTypeAndLengthSize(type, lengthSize) {
    var modifiedLength = packedLength(lengthSize)
    var pack = type | (
        modifiedLength << 6
    )

    //console.log(pack.toString(2).padStart(8, 0))
    return pack;
}



module.exports = packTypeAndLengthSize;