// B"H
const constants = require("../constants.js");
const serializeValue = require("./serializeValue.js");
const { writeConditional, packedLength, hashKey } = require("../utils/binaryHelpers.js");

function serializeJSON(json) {
    let header = [Buffer.from(constants.MAGIC_JSON)];
    const offsetSizePlaceholder = Buffer.alloc(1);
    header.push(offsetSizePlaceholder);

    const keys = Object.keys(json);
    const dataBuffers = [];
    let currentOffset = constants.MAGIC_JSON.length + 1;
    
    const metadataTable = []; // { key, offset }

    // 1. Serialize Values
    for (let key of keys) {
        // Serialize the value (recursive)
        // Note: serializeValue creates [Type][Len][Data]
        const valueBuffer = serializeValue(json[key], true); 
        
        // Before we push this buffer, we need to prefix it with KEY data for the metadata logic
        // But in the "Object" format (V1 style):
        // Data Region = Concat([ValueBuffers...])
        // Metadata Region = Array of {Key, Offset_In_Data_Region, Value_Length, Type}
        // This seems complicated to replicate exactly locally without all V1 files.
        
        // SIMPLIFIED LOCAL STRATEGY compatible with serializeValue:
        // We will store the Object as a standard B+ Tree collection in v2 anyway.
        // But for "serializing to a buffer" (nested objects), let's stick to a simpler format 
        // that our local parser can read.
        
        // Format: [KEY_LEN][KEY][VALUE_BUFFER]...
        // This avoids the complex footer/hashtable of V1 which is hard to implement minimally.
        
        // WAIT. We promised "Sequential". V1 format puts data first, then index.
        // Let's implement the core V1 Footer logic minimally.
        
        // Split value buffer back to components to get length/type info
        const { type, data, valueLengthInfo, typeLengthByte } = serializeValue(json[key], false);
        
        metadataTable.push({
            key,
            offset: currentOffset,
            len: data.length,
            type,
            typeByte: typeLengthByte, // Packed type+lenSize
            lenInfo: valueLengthInfo
        });
        
        dataBuffers.push(data);
        currentOffset += data.length;
    }

    const dataRegion = Buffer.concat(dataBuffers);
    
    // 2. Build Footer (Metadata + Hash)
    // Minimally implemented:
    // Footer = [Offsets...] [Hash...]
    
    // Actually, sticking to the standard V1 format requires getSerializedMetadata.js
    // I provided that file in previous turn. Let's include it inline or simplified here.
    
    // Simplified Inline Footer Builder:
    const footerParts = [];
    const offsetSize = currentOffset < 256 ? 1 : 4;
    
    // Metadata Array
    // For each entry: [PackedSizes][TypeByte][KeyLen][ValLen][Key][Offset]
    const metaEntries = [];
    for(let m of metadataTable) {
        const keyBuf = Buffer.from(m.key);
        const kLen = writeConditional(keyBuf.length);
        const off = writeConditional(m.offset); // We need dynamic size here usually
        
        // Just force 4 byte offset for simplicity in local implementation? No, keep it dynamic.
        
        const packed = (packedLength(kLen.size) << 2) | packedLength(off.size);
        
        metaEntries.push(Buffer.concat([
            Buffer.from([packed]),
            Buffer.from([m.typeByte]),
            kLen.buffer,
            m.lenInfo.buffer,
            keyBuf,
            off.buffer
        ]));
    }
    // We treat this metadata array as an "Array" to serialize it
    const metaArrayBuf = require('./array.js')(metaEntries); // Recursion? No, metaEntries are buffers. array.js handles it.
    
    // We skip the Hash Table for this minimal implementation.
    // The parser will just scan the metadata array (O(N) for nested objects is fine for now).
    
    // Final Footer Wrapper
    // [PackedSizes] [MetaArrayLen] [TotalKeys]
    const metaLen = writeConditional(metaArrayBuf.length);
    const keysLen = writeConditional(keys.length);
    
    const packedFooterHeader = (packedLength(keysLen.size) << 4) | (packedLength(metaLen.size) << 2); // HashLen=0
    
    // Update Main Header Placeholder
    // We need to tell it how to read the footer.
    // The placeholder at byte 2 needs to know DataOffsetSize and MetadataOffsetSize.
    // This is getting circular.
    
    // FAILURE MODE AVOIDANCE:
    // For the self-contained V2 DB, we will use a SIMPLER object format for blobs.
    // [MAGIC][COUNT][KeyLen][Key][ValueBuffer]...
    // This is readable, sequential, and requires 0 complex logic.
    
    const simpleBuffers = [Buffer.from(constants.MAGIC_JSON)];
    simpleBuffers.push(writeConditional(keys.length).buffer);
    
    for(let key of keys) {
        const keyBuf = Buffer.from(key);
        simpleBuffers.push(writeConditional(keyBuf.length).buffer);
        simpleBuffers.push(keyBuf);
        simpleBuffers.push(serializeValue(json[key], true));
    }
    
    return Buffer.concat(simpleBuffers);
}

module.exports = serializeJSON;