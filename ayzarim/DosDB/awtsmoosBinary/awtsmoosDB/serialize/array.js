// B"H
const constants = require("../constants.js");
const serializeValue = require("./serializeValue.js");
const { writeConditional, writeToBuffer, packedLength } = require("../utils/binaryHelpers.js");

function serializeArray(arr) {
    // 1. Header
    const parts = [Buffer.from(constants.MAGIC_ARRAY)];
    
    // Placeholder for Config Byte
    const configByteBuf = Buffer.alloc(1);
    parts.push(configByteBuf);

    // 2. Serialize Items
    const dataBuffers = [];
    const offsets = [];
    // Start offset = Magic(2) + Config(1)
    let currentOffset = constants.MAGIC_ARRAY.length + 1;

    for (let item of arr) {
        // serializeValue(..., true) returns [Type][Len][Data]
        const itemBuf = serializeValue(item, true);
        
        offsets.push(currentOffset);
        dataBuffers.push(itemBuf);
        currentOffset += itemBuf.length;
    }

    // 3. Determine Sizes
    // Offset Size: 1, 2, 4, or 8 bytes
    const offsetSize = currentOffset < 256 ? 1 : currentOffset < 65536 ? 2 : 4;
    
    // Array Length VarInt
    const lenInfo = writeConditional(arr.length);
    
    // Pack Config Byte:
    // Bits 2-3: Array Length Size (0=1, 1=2, 2=4, 3=8)
    // Bits 0-1: Offset Size (0=1, 1=2, 2=4, 3=8)
    // packedLength returns 0 for size 1, 1 for size 2, etc.
    const packed = (packedLength(lenInfo.size) << 2) | packedLength(offsetSize);
    configByteBuf.writeUInt8(packed, 0);

    // 4. Build Index Table
    const indexTable = Buffer.alloc(arr.length * offsetSize);
    offsets.forEach((off, i) => writeToBuffer(indexTable, off, offsetSize, i * offsetSize));

    // 5. Combine: [Magic][Config][Items...][IndexTable][ArrayLen]
    return Buffer.concat([
        Buffer.concat(parts), // Header + Config
        Buffer.concat(dataBuffers), // Items
        indexTable,
        lenInfo.buffer
    ]);
}

module.exports = serializeArray;