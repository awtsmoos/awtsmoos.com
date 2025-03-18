//B"H
var {
    writeToBuffer,


    writeConditional,

} = require("../../awtsmoosBinaryHelpers.js");


var {
    
    magicArray

} = require("./../constants.js");
var serializeJSON = require("./obj.js")
/**
 * @method packTypeAndLengthSize
 * @description Packs type and length size into one byte, a spark of the Awtsmoos’ unity.
 * @param {number} type - Data type (0-15)
 * @param {number} lengthSize - Bytes for length (0-15)
 * @returns {Buffer} - Single-byte buffer
 */
function packTypeAndLengthSize(type, lengthSize) {
    const packed = (type << 4) | (lengthSize & 0x0F);
    return Buffer.from([packed]);
}

/**
 * @method serializeArray
 * @description Serializes an array into a binary form, index at the end, echoing the Awtsmoos’ hidden order.
 * @param {Array} arr - The array to serialize
 * @returns {Buffer} - The serialized binary buffer
 */
function serializeArray(arr) {
    // Begin with the signature of the Awtsmoos
    let header = [
        Buffer.from(magicArray)
    ];

    // Encode array length, a finite boundary within the infinite
    const lengthInfo = writeConditional(arr.length);
    const arrayLengthSize = lengthInfo.size; // Bytes for array length (1, 2, 4, 8)
    header.push(lengthInfo.buffer);

    // Placeholder for offset size (updated later)
    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);

    const dataBuffers = [];
    const offsets = []; // Store offsets for index table

    // Manifest each item, a Sefirah unfolding from the Ein Sof
    let currentOffset = header.reduce((sum, buf) => sum + buf.length, 0);
    for (let item of arr) {
        let itemBuffer;
        const isBuffer = item instanceof Buffer;
        let type, data;

        if (Array.isArray(item)) {
            type = 3;
            data = serializeArray(item);
        } else if (item && !isBuffer && typeof item === 'object') {
            type = 1;
            data = serializeJSON(item); // Assume this exists
        } else if (typeof item === 'number' && !isNaN(item)) {
            type = 4;
            data = writeConditional(item).buffer;
        } else if (typeof item === 'boolean') {
            type = 5;
            data = Buffer.from([item ? 1 : 0]);
        } else if (item === undefined) {
            type = 6;
            data = Buffer.alloc(0);
        } else if (item === null) {
            type = 7;
            data = Buffer.alloc(0);
        } else if (isBuffer) {
            type = 8;
            data = item;
        } else {
            type = 2;
            data = Buffer.from(String(item));
        }

        const lengthInfo = writeConditional(data.length);
        const lengthSize = lengthInfo.size;
        const typeLengthByte = packTypeAndLengthSize(type, lengthSize);

        itemBuffer = Buffer.concat([
            typeLengthByte,
            lengthInfo.buffer,
            data
        ]);

        offsets.push(currentOffset);
        dataBuffers.push(itemBuffer);
        currentOffset += itemBuffer.length;
    }

    // Determine offset size based on total data length
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const offsetSize = dataLength < 256 ? 1 : 
        dataLength < 65536 ? 2 : 
        dataLength < 4294967296 ? 4 : 8;
    offsetSizePlaceholder.writeUInt8(offsetSize);

    // Build index table at the end, a map of divine order
    const indexTable = Buffer.alloc(arr.length * offsetSize);
    offsets.forEach((offset, i) => {
        writeToBuffer(indexTable, offset, offsetSize, i * offsetSize);
    });

    // Unite all in the light of the Awtsmoos
    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        indexTable
    ]);
}

module.exports = serializeArray;