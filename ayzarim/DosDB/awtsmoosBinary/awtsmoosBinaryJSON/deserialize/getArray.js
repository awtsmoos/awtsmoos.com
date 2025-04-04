//B"H

const {
    unpackLength
} = require("../packing/packedLength.js");

const {
    typesWith0Length
} = require("../parsing/typeInfo.js");

var temp = {};
var parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
        return parseValueFromType;
    }
});


const unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");
/**
 * @method getLength
 * @description Retrieves the array length from the buffer’s end, a swift echo of the Awtsmoos’ will.
 * @param {Buffer} arrayBuffer - The binary buffer.
 * @returns {number} - The length of the array.
 */
function getLength(arrayBuffer) {
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
        return -1; // Indicate error
    }

    var offset = magicLength;
    var arrayLengthSizeANDOffsetSizeInOneByte = 0b00001111 & arrayBuffer[offset];
    var arrayLengthSize = unpackLength(0b00001100 & arrayLengthSizeANDOffsetSizeInOneByte);

    return arrayBuffer.readUIntBE(
        arrayBuffer.length - arrayLengthSize,
        arrayLengthSize
    );
}

/**
 * @method getMetadata
 * @description Extracts metadata sizes from the buffer, a glimpse of the Awtsmoos’ structure.
 * @param {Buffer} arrayBuffer - The binary buffer.
 * @param {number} offset - Starting offset after magic bytes.
 * @returns {object} - Metadata with array length and offset sizes.
 */
function getMetadata(arrayBuffer, offset) {
    var arrayLengthSizeANDOffsetSizeInOneByte = 0b00001111 & arrayBuffer[offset];
    var arrayLengthSize = unpackLength(0b00001100 & arrayLengthSizeANDOffsetSizeInOneByte);
    var offsetSize = unpackLength(0b00000011 & arrayLengthSizeANDOffsetSizeInOneByte);
    offset++;

    var arrayLength = arrayBuffer.readUIntBE(
        arrayBuffer.length - arrayLengthSize,
        arrayLengthSize
    );

    return {
        arrayLengthSize,
        offsetSize,
        arrayLength,
        newOffset: offset
    };
}

/**
 * @method getValueByKey
 * @description Retrieves a value by its offset, a spark of Atzilus within the buffer.
 * @param {Buffer} arrayBuffer - The binary buffer.
 * @param {number} itemOffset - Offset to the item.
 * @returns {object} - Parsed value object.
 */
function getValueByKey(arrayBuffer, itemOffset) {
    var typeLengthByte = arrayBuffer.readUInt8(itemOffset);
    var {
        type,
        lengthSize
    } = unpackTypeAndLengthSize(typeLengthByte);
    itemOffset += 1;

    var has0Length = typesWith0Length.includes(type);
    if (has0Length) lengthSize = 0;

    var itemLength = has0Length ? 0 : arrayBuffer.readUIntBE(
        itemOffset,
        lengthSize
    );
    itemOffset += lengthSize;

    var itemData = arrayBuffer.subarray(
        itemOffset,
        itemOffset + itemLength
    );

    return temp.parseValueFromType({
        type,
        value: itemData
    });
}

/**
 * @method slice
 * @description Quickly extracts values within a range, a swift cut through the Ohr Ein Sof.
 * @param {Buffer} arrayBuffer - The binary buffer.
 * @param {number} start - Starting index.
 * @param {number} end - Ending index.
 * @param {number} offsetSize - Size of each offset.
 * @param {number} indexTableStart - Start of the index table.
 * @returns {Array} - Array of parsed values within the range.
 */
function slice(arrayBuffer, start, end, offsetSize, indexTableStart) {
    const result = [];
    for (let i = start; i < end && i < arrayBuffer.length; i++) {
        const indexOffset = indexTableStart + i * offsetSize;
        const itemOffset = arrayBuffer.readUIntBE(
            indexOffset,
            offsetSize
        );
        const parsedValue = getValueByKey(arrayBuffer, itemOffset);
        result.push(parsedValue.value);
    }
    return result;
}

/**
 * @method getValueByIndex
 * @description Retrieves a value by its index, a divine spark from the Awtsmoos’ array.
 * @param {Buffer} arrayBuffer - The binary buffer.
 * @param {number} index - The index of the value to retrieve.
 * @returns {any} - The parsed value at the index, or null if invalid.
 */
function getValueByIndex(arrayBuffer, index) {
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

    if (index < 0 || index >= metadata.arrayLength) {
        console.log(
            `Index out of bounds: ${
                index
            } not in range 0 to ${
                metadata.arrayLength - 1
            }`
        );
        return null;
    }

    const indexTableSize = metadata.arrayLength * metadata.offsetSize;
    const indexTableStart = (
        arrayBuffer.length -
        metadata.arrayLengthSize
    ) - indexTableSize;

    const indexOffset = indexTableStart + index * metadata.offsetSize;
    const itemOffset = arrayBuffer.readUIntBE(
        indexOffset,
        metadata.offsetSize
    );

    const parsedValue = getValueByKey(arrayBuffer, itemOffset);
    return parsedValue.value;
}

module.exports = {
    getMetadata,
    slice,
    getValueByKey,
    getLength,
    getValueByIndex
}