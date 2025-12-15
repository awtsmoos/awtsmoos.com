// B"H
const constants = require("../constants.js");
const serializeValue = require("./serializeValue.js");
const { writeConditional } = require("../utils/binaryHelpers.js");

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
    // If currentOffset (End of Data) fits in 255, we use 1 byte.
    // B"H: Logic Match with Parser: Parser calculates indexTableSize based on arrLen * offsetSize.
    const offsetSize = currentOffset < 256 ? 1 : currentOffset < 65536 ? 2 : 4;
    
    // Array Length VarInt
    const lenInfo = writeConditional(arr.length);
    
    // Pack Config Byte MANUALLY
    // Parser expects:
    // Bits 2-3: Len Size Index (0=1, 1=2, 2=4, 3=8)
    // Bits 0-1: Offset Size Index (0=1, 1=2, 2=4, 3=8)
    
    // Map size to index: 1->0, 2->1, 4->2, 8->3
    const getIndex = (sz) => {
        if (sz === 1) return 0;
        if (sz === 2) return 1;
        if (sz === 4) return 2;
        if (sz === 8) return 3;
        return 3; // Fallback
    };

    const lenSizeIndex = getIndex(lenInfo.size);
    const offsetSizeIndex = getIndex(offsetSize);
    
    const packed = (lenSizeIndex << 2) | offsetSizeIndex;
    configByteBuf.writeUInt8(packed, 0);

    // 4. Build Index Table
    const indexTable = Buffer.alloc(arr.length * offsetSize);
    for (let i = 0; i < offsets.length; i++) {
        const off = offsets[i];
        const writePos = i * offsetSize;
        
        // Strict Big-Endian Writing
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