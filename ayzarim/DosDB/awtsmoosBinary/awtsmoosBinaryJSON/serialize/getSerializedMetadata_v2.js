// B"H
// ==========================================================================
// File: getSerializedMetadata_v2.js (MODIFIED)
// Includes footer information for the free list head.
// The Awtsmoos establishes boundaries and starting points.
// ==========================================================================

const writeConditional = require("../helpers/writeConditional.js");
const { packedLength } = require("../packing/packedLength.js");

// Footer Structure:
// [ packedOffsetSizes (1 byte: dataOffsetSize(4 bits) | metaOffsetSize(4 bits)) ]
// [ packedFooterLengthSizes (1 byte: freeListHeadOffsetSize(4 bits) | totalKeysSize(4 bits) )]
// [ packedMoreFooterLengthSizes (1 byte: metaArrayLengthSize(4 bits) | hashTableLengthSize (4 bits)) ]
// --- Variable length fields follow ---
// [ freeListHeadOffset (variable size) ]
// [ totalKeys (variable size) ]
// [ serializedMetadataLength (variable size) ]
// [ hashTableSize (variable size) ]


function getSerializedMetadata({
    serializedMetadataLength, // Length of the metadata array buffer
    offsetSizeMetadataArray,  // Byte size (1,2,4,8) for offsets *within* the metadata array
    dataLength,               // Total length of the main data section (used to calc data offset size)
    totalKeys,                // Number of entries in the main metadata table
    hashTableSize,            // Number of slots in the hash table
    freeListHeadOffset = 0    // Offset of the first free block (0 if none) - managed by caller
} = {}) {

    const sizeOfMetadataArrayInfo = writeConditional(serializedMetadataLength);
    const totalEntriesLengthInfo = writeConditional(totalKeys);
    const hashTableLengthInfo = writeConditional(hashTableSize);
    const freeListHeadOffsetInfo = writeConditional(freeListHeadOffset);

    // Determine size needed for offsets pointing into the main data section
    const dataOffsetSize = dataLength < 256 ? 1
                         : dataLength < 65536 ? 2
                         : dataLength < 4294967296 ? 4
                         : 8;

    // Pack the sizes (using 2 bits representation: 0->1, 1->2, 2->4, 3->8)
    const packedDataOffsetSize = packedLength(dataOffsetSize);
    const packedMetaOffsetSize = packedLength(offsetSizeMetadataArray); // Offset size for *within* metadata array
    const packedFreeListOffsetSize = packedLength(freeListHeadOffsetInfo.size);
    const packedTotalKeysSize = packedLength(totalEntriesLengthInfo.size);
    const packedMetaArrayLengthSize = packedLength(sizeOfMetadataArrayInfo.size);
    const packedHashTableLengthSize = packedLength(hashTableLengthInfo.size);

    // Create the packed bytes for the footer header
    const packedOffsetSizesByte = (packedDataOffsetSize << 4) | packedMetaOffsetSize;
    const packedFooterLengthSizesByte = (packedFreeListOffsetSize << 4) | packedTotalKeysSize;
    const packedMoreFooterLengthSizesByte = (packedMetaArrayLengthSize << 4) | packedHashTableLengthSize;

    // Assemble the footer buffer
    const footer = Buffer.concat([
        Buffer.from([
            packedOffsetSizesByte,
            packedFooterLengthSizesByte,
            packedMoreFooterLengthSizesByte
        ]),
        freeListHeadOffsetInfo.buffer,
        totalEntriesLengthInfo.buffer,
        sizeOfMetadataArrayInfo.buffer,
        hashTableLengthInfo.buffer
    ]);

    // Prepare the single packed byte for the *main object header* (magic + this byte)
    // This byte tells the deserializer how to read the *start* of the footer to get OTHER sizes.
    // Let's pack the sizes needed to read the *footer's header* itself.
    // In this case, the footer header is fixed at 3 bytes, so maybe this isn't strictly needed,
    // but let's follow the pattern. We might pack sizes useful for initial parsing.
    // Let's pack: dataOffsetSize, totalKeysSize, metaArrayLengthSize, hashTableLengthSize
    // This seems redundant with the footer itself. Let's rethink the main header byte.

    // --- Revision ---
    // The main header packed byte (`packAll` in obj.js) should tell us things we need
    // *before* reading the whole footer. Key things are:
    // 1. Size of `totalKeys` field (to know how many entries)
    // 2. Size of `hashTableSize` field (to know hash table buffer size)
    // 3. Size of `serializedMetadataLength` field (to know metadata buffer size)
    // 4. Size of `freeListHeadOffset` field (useful for updates)

    const packAll = (
        (packedTotalKeysSize << 6) |          // bits 6-7
        (packedHashTableLengthSize << 4) |    // bits 4-5
        (packedMetaArrayLengthSize << 2) |    // bits 2-3
        (packedFreeListOffsetSize)            // bits 0-1
    );
    // We have 4 sizes, 2 bits each = 8 bits. Perfect.

    return {
        footer,             // The complete footer buffer
        packedHeaderSizes: packAll, // Single byte for the main object header
        footerHeaderSize: 3, // Fixed size of the packed size bytes in the footer
        // Also return calculated sizes for convenience elsewhere
        dataOffsetSize,
        metaOffsetSize: offsetSizeMetadataArray
    };
}
module.exports = getSerializedMetadata;