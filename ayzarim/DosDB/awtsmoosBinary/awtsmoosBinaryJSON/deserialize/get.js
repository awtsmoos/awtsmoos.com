//B"H

// B"H
// The Awtsmoos, Essence of Atzmut, pulses through this code, recreating all from nothing every instant.
// From the Ohr Ein Sof’s boundless light, threading through the Kav into Atzilus, this script unveils
// the binary structure, a map of divine order, restoring the JSON essence as the Awtsmoos restores all reality.

const { 
    magicJSON,
    magicArray
} = require("./../constants.js");
const readConditional = require("../helpers/readConditionalWithSize.js");
const unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");

var temp = {};

// Lazy-loaded modules, reflections of the Ohr Ein Sof, summoned only when the Awtsmoos wills it.
var parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
        return parseValueFromType;
    }
});

var deserializeArray = null;
Object.defineProperty(temp, "deserializeArray", {
    get() {
        if (!deserializeArray) deserializeArray = require("./array.js");
        return deserializeArray;
    }
});

var {
    packedLength,
    unpackLength
} = require("../packing/packedLength.js");

/**
 * @method getMetadata
 * @description Extracts metadata sizes from the buffer, reflecting the divine order of the Awtsmoos.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Starting offset after magic bytes.
 * @returns {object} - Metadata containing size definitions.
 */
function getMetadata(buffer, offset) {
    var allSizesOfLengths = buffer.readUInt8(offset++);
    return {
        offsetByteSize: unpackLength(0b11000000 & allSizesOfLengths),
        lengthSizeOfKeys: unpackLength(0b00110000 & allSizesOfLengths),
        lengthSizeOfKeysArray: unpackLength(0b00001100 & allSizesOfLengths),
        lengthSizeHashTable: unpackLength(0b00000011 & allSizesOfLengths),
        newOffset: offset
    };
}

/**
 * @method getKeys
 * @description Retrieves and deserializes the keys array, a reflection of Atzilus’ structure.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Starting offset for keys data.
 * @param {number} lengthSizeOfKeys - Size of key length field.
 * @param {number} lengthSizeOfKeysArray - Size of keys array length field.
 * @returns {Array} - Array of keys in order.
 */
function getKeys(buffer, offset, lengthSizeOfKeys, lengthSizeOfKeysArray) {
    offset = buffer.length - lengthSizeOfKeysArray;
    var lengthOfKeyArray = buffer.readUIntBE(
        offset,
        lengthSizeOfKeysArray
    );
    offset -= lengthOfKeyArray;
    var keysArray = buffer.subarray(
        offset,
        offset + lengthOfKeyArray
    );
    offset -= lengthSizeOfKeys;
    return temp.deserializeArray(keysArray);
}

/**
 * @method getValueByKey
 * @description Extracts a single key-value pair from the hash table, illuminated by the Ohr Ein Sof.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {number} offset - Offset to the value data.
 * @param {number} offsetByteSize - Size of offset field.
 * @returns {object} - Key-value pair or null if offset is zero.
 */
function getValueByKey(buffer, offset, offsetByteSize) {
    if (offset === 0) return null;

    var keyLengthSize = buffer.readUInt8(offset);
    offset += offsetByteSize;

    var keyLength = buffer.readUIntBE(
        offset,
        keyLengthSize
    );
    offset += keyLengthSize;

    var keyBuffer = buffer.subarray(
        offset,
        offset + keyLength
    );
    offset += keyLength;

    var valueTypeAndSizeByte = buffer.readUInt8(offset);
    var {
        type,
        lengthSize
    } = unpackTypeAndLengthSize(valueTypeAndSizeByte);
    offset++;

    var valueLength = buffer.readUIntBE(
        offset,
        lengthSize
    );
    offset += lengthSize;

    var valueBuffer = buffer.subarray(
        offset,
        offset + valueLength
    );
    var parsed = temp.parseValueFromType({
        type,
        value: valueBuffer
    });

    return {
        key: keyBuffer.toString(),
        value: parsed.value
    };
}

/**
 * @method getValueByHashingKey
 * @description Searches the hash table for a key using its string, a divine echo of the Awtsmoos’ order.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @param {string} key - The key to search for.
 * @param {number} offsetByteSize - Size of offset field.
 * @param {Buffer} hashTableBuffer - The hash table buffer.
 * @param {number} hashTableEntrySize - Number of entries in the hash table.
 * @returns {object|null} - The key-value pair if found, null otherwise.
 */
function getValueByHashingKey(buffer, key, offsetByteSize, hashTableBuffer, hashTableEntrySize) {
    const hashTableSize = hashTableEntrySize * 2; // Reflects serialization doubling for collision avoidance
    const hashIndex = hashKey(key, hashTableSize);
    let index = hashIndex;

    while (true) {
        const actualOffset = index * offsetByteSize;
        const offset = hashTableBuffer.readUIntBE(
            actualOffset,
            offsetByteSize
        );

        if (offset === 0) {
            return null; // Empty slot, key not found
        }

        const entry = getValueByKey(buffer, offset, offsetByteSize);
        if (entry && entry.key === key) {
            return entry; // Key found
        }

        index = (index + 1) % hashTableSize; // Linear probing
        if (index === hashIndex) {
            return null; // Full cycle, key not found
        }
    }
}

module.exports = {
    getValueByKey,
    getKeys,
    getMetadata,
    getValueByHashingKey
};