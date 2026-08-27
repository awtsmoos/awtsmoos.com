
// B"H
/**
 * @file getSerializedMetadata.js
 * @description
 * Serializes the hidden dimensions of the blocks so that the spiritual size
 * of the object may be read without traversing its entire infinity.
 */
const { writeConditional, packedLength } = require("../../../utils/binaryHelpers.js");

function getSerializedMetadata({ serializedMetadataLength, offsetSizeMetadataArray, dataLength, totalKeys, hashTableSize }) {
    const sizeMetaArr = writeConditional(serializedMetadataLength);
    const totalEntries = writeConditional(totalKeys);
    const lenHash = writeConditional(hashTableSize);
    
    const offsetSize = dataLength < 256 ? 1 : dataLength < 65536 ? 2 : dataLength < 4294967296 ? 4 : 8;
    
    const packAll = (packedLength(totalEntries.size) << 4) | (packedLength(sizeMetaArr.size) << 2) | packedLength(lenHash.size);
    const offsetSizesPacked = (packedLength(offsetSize) << 2) | packedLength(offsetSizeMetadataArray);

    const footer = Buffer.concat([
        Buffer.from([offsetSizesPacked]),
        totalEntries.buffer,
        sizeMetaArr.buffer,
        lenHash.buffer
    ]);

    return { footer, packedHeaderSizes: packAll };
}
module.exports = getSerializedMetadata;
