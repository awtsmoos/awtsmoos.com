//B"H


var writeConditional = require("../helpers/writeConditional.js")
var writeToBuffer = require("../helpers/writeToBuffer.js")

var {
    
    magicArray

} = require("./../constants.js");

var serializeJSON = require("./obj.js")
var serializeValue = require("./serializeValue.js")



var packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js")


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
    console.log("ARRAY",arr)
    for (let item of arr) {
        let itemBuffer;
        
       

        let {
            type, data
        } = serializeValue(item, false)

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