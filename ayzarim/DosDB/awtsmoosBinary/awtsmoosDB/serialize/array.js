// B"H
const constants = require("../constants.js");
const { writeConditional, writeToBuffer, packTypeAndLengthSize, packedLength } = require("../utils/binaryHelpers.js");
const serializeValue = require("./serializeValue.js");

function serializeArray(arr) {
    let header = [Buffer.from(constants.MAGIC_ARRAY)];
    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);

    const dataBuffers = [];
    const offsets = [];
    let currentOffset = constants.MAGIC_ARRAY.length + 1;

    for (let item of arr) {
        const { type, data } = serializeValue(item, false);
        const lengthInfo = writeConditional(data.length);
        const typeLengthByte = packTypeAndLengthSize(type, lengthInfo.size);
        
        const itemBuffer = Buffer.concat([
            Buffer.from([typeLengthByte]),
            lengthInfo.buffer,
            data
        ]);

        offsets.push(currentOffset);
        dataBuffers.push(itemBuffer);
        currentOffset += itemBuffer.length;
    }

    // Determine offset size
    const offsetSize = currentOffset < 256 ? 1 : currentOffset < 65536 ? 2 : 4;
    const arrayLenInfo = writeConditional(arr.length);
    
    // Pack 2 bits for ArrayLenSize, 2 bits for OffsetSize
    const packed = (packedLength(arrayLenInfo.size) << 2) | packedLength(offsetSize);
    offsetSizePlaceholder.writeUInt8(packed);

    // B"H: Construct Index Table
    const indexTable = Buffer.alloc(arr.length * offsetSize);
    offsets.forEach((off, i) => writeToBuffer(indexTable, off, offsetSize, i * offsetSize));

    return Buffer.concat([
        Buffer.concat(header),
        Buffer.concat(dataBuffers),
        indexTable,
        arrayLenInfo.buffer
    ]);
}
module.exports = serializeArray;