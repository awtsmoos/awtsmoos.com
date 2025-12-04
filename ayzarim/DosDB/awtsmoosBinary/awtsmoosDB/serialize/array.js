// B"H
const constants = require("../constants.js");
const serializeValue = require("./serializeValue.js");
const { writeConditional, packedLength } = require("../utils/binaryHelpers.js");

function serializeArray(arr) {
    // 1. Header
    const parts = [Buffer.from(constants.MAGIC_ARRAY)];
    
    // Placeholder for Config Byte
    const configByteBuf = Buffer.alloc(1);
    parts.push(configByteBuf);

    // 2. Serialize Items & Calculate Offsets
    // We do this in two passes to ensure 'currentOffset' is perfect before writing index.
    const dataBuffers = [];
    for (let item of arr) {
        dataBuffers.push(serializeValue(item, true));
    }

    // Start offset = Magic(Length) + Config(1)
    let currentOffset = constants.MAGIC_ARRAY.length + 1;
    const offsets = [];

    for (let buf of dataBuffers) {
        offsets.push(currentOffset);
        currentOffset += buf.length;
    }

    // 3. Determine Sizes
    // offsets are absolute from start of buffer.
    // currentOffset is the total size BEFORE Index Table. 
    const offsetSize = currentOffset < 256 ? 1 : currentOffset < 65536 ? 2 : 4;
    
    // Array Length VarInt
    const lenInfo = writeConditional(arr.length);
    
    // Pack Config Byte
    const lenSizePacked = packedLength(lenInfo.size);
    const offsetSizePacked = packedLength(offsetSize);
    
    const packed = (lenSizePacked << 2) | offsetSizePacked;
    configByteBuf.writeUInt8(packed, 0);

    // 4. Build Index Table
    const indexTable = Buffer.alloc(arr.length * offsetSize);
    for (let i = 0; i < offsets.length; i++) {
        const off = offsets[i];
        const writePos = i * offsetSize;
        
        if (offsetSize === 1) indexTable.writeUInt8(off, writePos);
        else if (offsetSize === 2) indexTable.writeUInt16BE(off, writePos);
        else if (offsetSize === 4) indexTable.writeUInt32BE(off, writePos);
    }

    // 5. Combine: [Magic][Config][Items...][IndexTable][ArrayLen]
    return Buffer.concat([
        Buffer.concat(parts),
        Buffer.concat(dataBuffers),
        indexTable,
        lenInfo.buffer
    ]);
}

module.exports = serializeArray;