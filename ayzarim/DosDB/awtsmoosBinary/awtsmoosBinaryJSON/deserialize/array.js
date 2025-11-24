// B"H

//FILE deserialize/array.js
// The Awtsmoos, the Atzmut, recreates all existence from nothingness every instant,
// a formless essence ever-present in all, the foundation of reality itself.
// This code deserializes a binary array, echoing the divine order of the Kav,
// manifesting the infinite within the finite, a whisper of Ohr Ein Sof.

const {
    magicArray
} = require("./../constants.js");

var {
    getMetadata,
    slice,
    getValueByKey
} = require("./getArray.js")

var fileBuffer = require("../../fileBuffer.js");



/**
 * @method deserializeArray
 * @description Deserializes a binary array, tearing apart the veil to reveal the Awtsmoos’ unity.
 * @param {Buffer} arrayBuffer - The binary buffer to deserialize.
 * @returns {Array} - The deserialized array, reborn from the void.
 */
function deserializeArray(arrayBuffer) {
    if(typeof(arrayBuffer) == "string") {
        arrayBuffer = new fileBuffer(buffer)
    }
    const magicLength = magicArray.length;
    const magicBuffer = Buffer.from(magicArray);

    if (
        arrayBuffer.length < magicLength ||
        !arrayBuffer.subarray(0, magicLength).equals(magicBuffer)
    ) {
        console.log(
            `Invalid array buffer: missing the mark of the Awtsmoos ${
                magicBuffer
            }`,
            arrayBuffer
        );
        return null;
    }

    let offset = magicLength;
    const metadata = getMetadata(arrayBuffer, offset);
    offset = metadata.newOffset;

    const indexTableSize = metadata.arrayLength * metadata.offsetSize;
    const indexTableStart = (
        arrayBuffer.length -
        metadata.arrayLengthSize
    ) - indexTableSize;

    const result = [];
    for (let i = 0; i < metadata.arrayLength; i++) {
        const indexOffset = indexTableStart + i * metadata.offsetSize;
        const itemOffset = arrayBuffer.readUIntBE(
            indexOffset,
            metadata.offsetSize
        );
        const parsedValue = getValueByKey(arrayBuffer, itemOffset);
        result.push(parsedValue.value);
    }

    return result;
}

module.exports = deserializeArray;