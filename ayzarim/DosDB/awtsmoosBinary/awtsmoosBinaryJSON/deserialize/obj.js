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

var {
    getValueByKey,
    getKeys,
    getMetadata
} = require("./get.js")
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


/**
 * @method deserializeJSON
 * @description Reconstructs the JSON object, tearing apart the binary veil to reveal the Awtsmoos’ essence.
 * @param {Buffer} buffer - The serialized binary buffer.
 * @returns {object} - The reconstructed JSON object.
 */
function deserializeJSON(buffer) {
    var magic = buffer.subarray(
        0,
        magicJSON.length
    ).toString();

    if (magic === magicArray) {
        return temp.deserializeArray(buffer);
    }
    if (magic !== magicJSON) {
        console.log(
            `Not an Awtsmoos JSON: ${
                magic
            }`,
            buffer
        );
        return null;
    }

    var offset = magicJSON.length;
    var metadata = getMetadata(buffer, offset);

    offset = metadata.newOffset;

    var keys = getKeys(
        buffer,
        offset,
        metadata.lengthSizeOfKeys,
        metadata.lengthSizeOfKeysArray
    );


    offset = buffer.length - metadata.lengthSizeOfKeysArray -
             buffer.readUIntBE(
                 buffer.length - metadata.lengthSizeOfKeysArray,
                 metadata.lengthSizeOfKeysArray
             ) - metadata.lengthSizeOfKeys - metadata.lengthSizeHashTable;

    var hashTableEntrySize = buffer.readUIntBE(
        offset,
        metadata.lengthSizeHashTable
    );
    var hashTableLength = metadata.offsetByteSize * hashTableEntrySize;
    var actualHashTable = buffer.subarray(
        offset - hashTableLength,
        offset
    );

    var entries = {};
    for (var offsetIdx = 0; offsetIdx < hashTableEntrySize; offsetIdx++) {
        var actualOffset = offsetIdx * metadata.offsetByteSize;
        var hashOffset = actualHashTable.readUIntBE(
            actualOffset,
            metadata.offsetByteSize
        );
        var entry = getValueByKey(buffer, hashOffset, metadata.offsetByteSize);
        if (entry) {
            entries[entry.key] = entry.value;
        }
    }

    var entriesInOrder = {};
    keys.forEach(q => {
        entriesInOrder[q] = entries[q];
    });

    return entriesInOrder;
}

module.exports = deserializeJSON;