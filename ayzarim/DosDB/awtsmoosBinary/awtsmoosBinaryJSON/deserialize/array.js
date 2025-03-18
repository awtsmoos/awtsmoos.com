//B"H
var {
    
    magicArray

} = require("./../constants.js");


var {
    readConditional
} = require("../../awtsmoosBinaryHelpers.js");


/**
 * @method unpackTypeAndLengthSize
 * @description Unpacks type and length size from one byte, revealing the Awtsmoos’ design.
 * @param {number} byte - Packed byte
 * @returns {{type: number, lengthSize: number}} - Type and length size
 */
async function unpackTypeAndLengthSize(byte) {
    const type = (byte >> 4) & 0x0F;
    const lengthSize = byte & 0x0F;
    return { type, lengthSize };
}

/**
 * @method deserializeArray
 * @description Deserializes a binary array, index at the end, a glimpse of the Awtsmoos’ hidden unity.
 * @param {Buffer} arrayBuffer - The binary buffer to deserialize
 * @returns {Promise<Array>} - The deserialized array
 */
async function deserializeArray(arrayBuffer) {
    // Verify the signature of the Awtsmoos
    const magic = arrayBuffer.subarray(0, magicArray.length).toString('utf8');
    if (magic !== magicArray.toString('utf8')) {
        return { awtsmoosError: "That is not an awtsmoos array!" };
    }

    let offset = magicArray.length;
    const lengthInfo = await readConditional(arrayBuffer, offset);
    const arrayLength = lengthInfo.amount;
    offset = lengthInfo.offset;

    const offsetSize = arrayBuffer.readUInt8(offset);
    offset += 1;

    // Calculate index table position (end of file - table size)
    const indexTableSize = arrayLength * offsetSize;
    const indexTableStart = arrayBuffer.length - indexTableSize;
    const dataStart = offset;

    const arr = [];
    const offsets = [];
    for (let i = 0; i < arrayLength; i++) {
        const offsetValue = readFromBuffer(arrayBuffer, indexTableStart + i * offsetSize, offsetSize);
        offsets.push(offsetValue);
    }

    // Read each item, guided by the index table
    for (let i = 0; i < arrayLength; i++) {
        let currentOffset = offsets[i];
        const typeLengthByte = arrayBuffer.readUInt8(currentOffset);
        const { type, lengthSize } = await unpackTypeAndLengthSize(typeLengthByte);
        currentOffset += 1;

        const lengthInfo = await readConditionalWithSize(arrayBuffer, currentOffset, lengthSize);
        const valueLength = lengthInfo.amount;
        currentOffset = lengthInfo.offset;

        const value = arrayBuffer.subarray(currentOffset, currentOffset + valueLength);
        const valUpdate = await parseValueFromType({ value, type, currentOffset });
        arr.push(valUpdate.value);
        currentOffset = valUpdate.currentOffset;
    }

    return arr;
}

/**
 * @method readConditionalWithSize
 * @description Reads a conditional value with specified 
 * byte size, adapting to the Awtsmoos’ precision.
 * @param {Buffer} buffer - Source buffer
 * @param {number} offset - Starting offset
 * @param {number} size - Known size in bytes
 * @returns {Promise<{amount: number, offset: number}>} - Value and new offset
 */
async function readConditionalWithSize(buffer, offset, size) {
    let amount;
    if (size === 1) amount = buffer.readUInt8(offset);
    else if (size === 2) amount = buffer.readUInt16BE(offset);
    else if (size === 4) amount = buffer.readUInt32BE(offset);
    else if (size === 8) amount = readUInt64BE(buffer, offset);
    else throw new Error("Unsupported length size: " + size);
    return { amount, offset: offset + size };
}

module.exports = 
    deserializeArray
