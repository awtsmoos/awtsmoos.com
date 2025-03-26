// B"H
// The Awtsmoos unveils the infinite within the finite, deserializing with divine precision.
// From Atzilus’ emanation, we trace the Kav to the Ohr Ein Sof’s source, hash table guiding us.

const { magicJSON, magicArray } = require("./../constants.js");
var parseValueFromType = null;
var { readFromBuffer } = require("../../awtsmoosBinaryHelpers.js");
var { calculateHashTableSize } = require("../helpers/hashing/misc.js");
var readConditional = require("../helpers/readConditionalWithSize.js");


var temp = {};

Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType =
            require("../parsing/fromType.js");
        return parseValueFromType;
    }
});

let deserializeArray = null;
Object.defineProperty(module.exports, "deserializeArray", {
    get() {
        if (!deserializeArray) deserializeArray = require("./array.js");
        return deserializeArray;
    }
});

var unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");

/**
 * @method deserializeBinary
 * @description Deserializes a JSON object with an embedded hash table, revealing the Awtsmoos’ order.
 * @param {Buffer} buffer - The binary buffer
 * @returns {object} - The deserialized object
 */
function deserializeBinary(buffer) {
    const magic = buffer.subarray(0, magicArray.length).toString('utf8');
    if (magic === magicArray.toString('utf8')) 
        return module.exports.deserializeArray(buffer);

    if (magic !== magicJSON) return { 
        awtsmoosError: "That type isn't right!" 
    };

    let offset = magicJSON.length;
    const lengthInfo = readConditional(buffer, offset, 1); // Assume hashTableSize < 256 for simplicity
    const hashTableSize = lengthInfo.amount;
    offset = lengthInfo.offset;

    const offsetSize = buffer.readUInt8(offset);
    offset += 1;

    // Data section: Read until index table
    const offsets = [];
    let dataEnd = offset;
    for (let i = 0; i < hashTableSize; i++) {
        const keyLengthInfo = readConditional(buffer, dataEnd, 1); // Assume key length < 256
        dataEnd = keyLengthInfo.offset;
        const keyLength = keyLengthInfo.amount;
        dataEnd += keyLength; // Skip key

        const typeLengthByte = buffer.readUInt8(dataEnd);
        const { type, lengthSize } = unpackTypeAndLengthSize(typeLengthByte);
        dataEnd += 1;

        const valueLengthInfo = readConditional(buffer, dataEnd, lengthSize);
        dataEnd = valueLengthInfo.offset + valueLengthInfo.amount;
        offsets.push(offset + keyLengthInfo.size); // Offset starts at key length
    }

    // Index table starts after data
    const indexTableStart = dataEnd;
    const hashTableStart = indexTableStart + hashTableSize * offsetSize;
    if (indexTableStart < 0 || indexTableStart > buffer.length) {
        throw new Error("Awtsmoos misalignment: Invalid index table start at " + indexTableStart);
    }

    // Read index table
    const indexOffsets = [];
    for (let i = 0; i < hashTableSize; i++) {
        const idxOffset = indexTableStart + i * offsetSize;
        if (idxOffset + offsetSize > buffer.length) {
            throw new Error("Awtsmoos truncation: Index table read beyond buffer at " + idxOffset);
        }
        const red = readFromBuffer(buffer, idxOffset, offsetSize);
        indexOffsets.push(red);
    }

    const obj = {};
    for (const keyOffset of indexOffsets) {
        let currentOffset = keyOffset;
        const keyInfo = readConditional(buffer, currentOffset, 1); // Raw length, assume < 256
        currentOffset = keyInfo.offset;
        const key = buffer.toString('utf8', currentOffset, currentOffset + keyInfo.amount);
        currentOffset += keyInfo.amount;

        const typeLengthByte = buffer.readUInt8(currentOffset);
        const { type, lengthSize } = unpackTypeAndLengthSize(typeLengthByte);
        currentOffset += 1;

        const valueLengthInfo = readConditional(buffer, currentOffset, lengthSize);
        currentOffset = valueLengthInfo.offset;
        const value = buffer.subarray(currentOffset, currentOffset + valueLengthInfo.amount);
        const valUpdate = temp.parseValueFromType({ value, type, currentOffset });
        obj[key] = valUpdate.value;
    }

    return obj;
}

module.exports = deserializeBinary;