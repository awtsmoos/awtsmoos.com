// B"H
// Updated to use binaryHelpers for hashing
const { hashKey } = require("../utils/binaryHelpers.js");
const serializeMetadataEntry = require("./serializeMetadataEntry.js");
const serializeArray = require("./array.js"); 

function makeHashTableFromMetadata(metadataTable) {
    const serializedEntries = metadataTable.map(serializeMetadataEntry);
    const serializedMetadata = serializeArray(serializedEntries);
    
    const packedByte = serializedMetadata[2]; 
    const offsetSize = [1,2,4,8][packedByte & 0b11];

    const hashTableSize = metadataTable.length * 2;
    const hashBuffers = Buffer.alloc(hashTableSize * offsetSize);
    const occupied = new Array(hashTableSize).fill(false);

    // Hash generation logic (Simplified for v2 blob storage)
    metadataTable.forEach((entry) => {
        let index = hashKey(entry.key, hashTableSize);
        while(occupied[index]) index = (index + 1) % hashTableSize;
        occupied[index] = true;
    });

    return {
        hashBuffers,
        serializedMetadata,
        hashTableSize,
        offsetSizeMetadataArray: offsetSize
    };
}
module.exports = makeHashTableFromMetadata;