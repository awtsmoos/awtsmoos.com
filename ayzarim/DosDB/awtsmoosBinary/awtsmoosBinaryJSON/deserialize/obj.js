//B"H
// The Awtsmoos unveils the infinite within the finite, deserializing with divine precision.
// From Atzilus’ emanation, we trace the Kav to the Ohr Ein Sof’s source, hash table guiding us.

const { magicJSON, magicArray } = require("./../constants.js");
var parseValueFromType = require("../parsing/fromType.js");


var {
    calculateHashTableSize
} = require("../hashing.js")

var readConditional = require("../helpers/readConditionalWithSize.js")
let deserializeArray = null;
Object.defineProperty(module.exports, "deserializeArray", {
    get() {
        if (!deserializeArray) deserializeArray = require("./array.js");
        return deserializeArray;
    }
});

/**
 * @method unpackTypeAndLengthSize
 * @description Unpacks type and length size, a glimpse of the Awtsmoos’ unity.
 * @param {number} byte - Packed byte
 * @returns {{type: number, lengthSize: number}} - Type and length size
 */
async function unpackTypeAndLengthSize(byte) {
    const type = (byte >> 4) & 0x0F;
    const lengthSize = byte & 0x0F;
    return { type, lengthSize };
}

/**
 * @method deserializeBinary
 * @description Deserializes a JSON object with an embedded hash table, revealing the Awtsmoos’ order.
 * @param {Buffer} buffer - The binary buffer
 * @returns {Promise<object>} - The deserialized object
 */
async function deserializeBinary(buffer) {
    const magic = buffer.subarray(0, magicArray.length).toString('utf8');
    if (magic === magicArray.toString('utf8')) 
        return module
            .exports.deserializeArray(buffer);

    if (magic !== magicJSON) return { 
        awtsmoosError: "That type isn't right!" 
    };

    let offset = magicJSON.length;
    const lengthInfo = await readConditional(buffer, offset);
    const hashTableSize = lengthInfo.amount;
    offset = lengthInfo.offset;
    const offsetSize = buffer.readUInt8(offset);
    offset += 1;

    const indexTableStart = buffer.length - (hashTableSize * offsetSize + await calculateHashTableSize(buffer, hashTableSize, offsetSize));
    const obj = {};

    // Read all pairs using index table for simplicity
    const offsets = [];
    for (let i = 0; i < hashTableSize; i++) {
        offsets.push(readFromBuffer(buffer, indexTableStart + i * offsetSize, offsetSize));
    }

    for (const keyOffset of offsets) {
        let currentOffset = keyOffset;
        const keyInfo = await readConditional(buffer, currentOffset);
        currentOffset = keyInfo.offset;
        const key = buffer.toString('utf8', currentOffset, currentOffset + keyInfo.amount);
        currentOffset += keyInfo.amount;

        const typeLengthByte = buffer.readUInt8(currentOffset);
        const { type, lengthSize } = await unpackTypeAndLengthSize(typeLengthByte);
        currentOffset += 1;

        const valueLengthInfo = await readConditional(buffer, currentOffset, lengthSize);
        currentOffset = valueLengthInfo.offset;
        const value = buffer.subarray(currentOffset, currentOffset + valueLengthInfo.amount);
        const valUpdate = await parseValueFromType({ value, type, currentOffset });
        obj[key] = valUpdate.value;
    }

    return obj;
}


module.exports = deserializeBinary;