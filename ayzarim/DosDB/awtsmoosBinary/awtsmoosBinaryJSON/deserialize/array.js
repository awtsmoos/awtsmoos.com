//B"H
var {
    
    magicArray

} = require("./../constants.js");


var readConditional = require("../helpers/readConditionalWithSize.js")
var parseValueFromType = require("../parsing/fromType.js")

var unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js")

/**
 * @method deserializeArray
 * @description Deserializes a binary array, index at the end, a glimpse of the Awtsmoos’ hidden unity.
 * @param {Buffer} arrayBuffer - The binary buffer to deserialize
 * @returns {Promise<Array>} - The deserialized array
 */
 function deserializeArray(arrayBuffer) {
    // Verify the signature of the Awtsmoos
    const magic = arrayBuffer.subarray(0, magicArray.length).toString('utf8');
    if (magic !== magicArray.toString('utf8')) {
        return { awtsmoosError: "That is not an awtsmoos array!" };
    }

    let offset = magicArray.length;
    const lengthInfo =  readConditional(arrayBuffer, offset);
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
        const { type, lengthSize } =  unpackTypeAndLengthSize(typeLengthByte);
        currentOffset += 1;

        const lengthInfo =  readConditional(arrayBuffer, currentOffset, lengthSize);
        const valueLength = lengthInfo.amount;
        currentOffset = lengthInfo.offset;

        const value = arrayBuffer.subarray(currentOffset, currentOffset + valueLength);
        const valUpdate =  parseValueFromType({ value, type, currentOffset });
        arr.push(valUpdate.value);
        currentOffset = valUpdate.currentOffset;
    }

    return arr;
}

module.exports = 
    deserializeArray
