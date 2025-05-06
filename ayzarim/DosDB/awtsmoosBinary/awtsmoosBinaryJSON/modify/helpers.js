// B"H
// Helper functions for modification operations, including nested structure rewrites.

const freeSpaceManager = require("./freeSpaceManager.js"); // Assuming path correct
const { getMetadata: getArrayMetadata, deserializeArray, getHeaderInfo: getArrayHeader } = require("../deserialize/getArray_v2.js"); // Assuming path correct
const { getMetadata: getObjectMetadata, getHeaderInfo: getObjectHeader, parseMetadataEntry: parseObjectMetadataEntry } = require("../deserialize/get_v2.js"); // Assuming path correct
const serializeArray = require("../serialize/array_v2.js"); // Assuming path correct
const serializeObject = require("../serialize/ob_v2j.js"); // Assuming path correct
const writeToBuffer = require('../helpers/writeToBuffer.js'); // Assuming path correct
const writeConditional = require('../helpers/writeConditional.js'); // Assuming path correct
const { packedLength } = require('../packing/packedLength.js'); // Assuming path correct
const makeHashTableFromMetadata = require('../serialize/makeHashTableFromMetadata_v2.js'); // Assuming path correct
const getSerializedMetadata = require('../serialize/getSerializedMetadata_v2.js'); // Assuming path correct
const serializeMetadataEntry = require('../serialize/serializeMetadataEntry_v2.js'); // Assuming path correct

// Array Header Byte 1 Layout
const ARR_HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const ARR_HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const ARR_HDR_ARRAY_LENGTH_SIZE_SHIFT = 3;
// Object Header Byte 1 Layout
const OBJ_HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5; // Size for hash table entries / metadata array internal offsets
const OBJ_HDR_KEY_LENGTH_SIZE_SHIFT = 3;    // Size for total keys count field
const OBJ_HDR_META_ARR_LEN_SIZE_SHIFT = 1;  // Size for metadata array byte length field
const OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT = 0;  // Size for hash table slot count field


/**
 * Rewrites a nested Awtsmoos structure (Array or Object) when its internal offset size
 * needs to increase to accommodate larger pointers into the parent buffer.
 * Assumes the nested structure IS parent-relative. Handles release/alloc/write.
 *
 * @param {BufferWrapper} parentBufferWrapper - The top-level buffer.
 * @param {number} nestedBlobOffset - The current absolute offset where the nested structure's blob starts.
 * @param {number} nestedBlobLength - The current byte length of the nested structure's blob.
 * @param {object} nestedMetadata - The *current* metadata object for the nested structure (result of getMetadata).
 * @param {number} newInternalOffsetSize - The required new offset size (1, 2, 4, or 8).
 * @param {number} effectiveFreeSpaceHeadOffset - Parent's free space head offset.
 * @returns {Promise<{newOffset: number, newLength: number}>} The new offset and length of the rewritten blob.
 * @throws If rewrite fails.
 */
async function rewriteNestedStructure(parentBufferWrapper, nestedBlobOffset, nestedBlobLength, nestedMetadata, newInternalOffsetSize, effectiveFreeSpaceHeadOffset) {
    console.log(`B"H: Rewriting nested structure at offset ${nestedBlobOffset} (length ${nestedBlobLength}) to use internal offset size ${newInternalOffsetSize}`);

    if (!nestedMetadata || !nestedMetadata.headerInfo || !nestedMetadata.headerInfo.isParentRelative) {
        throw new Error("B\"H: rewriteNestedStructure called on non-parent-relative or invalid metadata.");
    }
    if (![1, 2, 4, 8].includes(newInternalOffsetSize)) {
         throw new Error(`B\"H: Invalid newInternalOffsetSize specified: ${newInternalOffsetSize}`);
    }

    const isArray = nestedMetadata.headerInfo.arrayLengthSize !== undefined; // Check if array specific field exists
    const oldInternalOffsetSize = isArray ? nestedMetadata.offsetSize : nestedMetadata.footerInfo.sizeOfMetadataArrayOffsetSize; // Get old size

    if (newInternalOffsetSize <= oldInternalOffsetSize) {
         console.warn(`B"H: rewriteNestedStructure called but new size ${newInternalOffsetSize} is not larger than old size ${oldInternalOffsetSize}. Skipping rewrite.`);
         return { newOffset: nestedBlobOffset, newLength: nestedBlobLength }; // No change needed
    }

    // --- 1. Read existing data pointers/entries from the OLD structure ---
    let entries; // Array[offsets] or Array[parsed metadata objects]
    try {
        if (isArray) {
            entries = []; // Will store absolute offsets
            const indexTableBuffer = parentBufferWrapper.readBuffer(
                nestedMetadata.structureBufferOffset + nestedMetadata.indexTableStart,
                nestedMetadata.indexTableByteLength
            );
            for (let i = 0; i < nestedMetadata.arrayLength; i++) {
                const offset = indexTableBuffer.readUIntBE(i * nestedMetadata.offsetSize, nestedMetadata.offsetSize);
                entries.push(offset);
            }
        } else { // Is Object
            if (!nestedMetadata.metadataTableInfo || !nestedMetadata.metaOfMetaArray) throw new Error("B\"H: Object metadata incomplete for rewrite.");
            const objectMetaArrayBuffer = parentBufferWrapper.readBuffer(
                 nestedMetadata.metadataTableInfo.startOffset, // Absolute offset in parent
                 nestedMetadata.metadataTableInfo.byteLength
            );
            const rawMetaEntries = deserializeArray(objectMetaArrayBuffer, nestedMetadata.metaOfMetaArray);
            if (!rawMetaEntries) throw new Error("B\"H: Failed to deserialize object's metadata array during rewrite.");
            entries = rawMetaEntries.map(buf => parseObjectMetadataEntry(buf)).filter(Boolean); // Use aliased parse
            if (entries.length !== rawMetaEntries.length) console.warn("B\"H: Some object metadata entries failed to parse during rewrite.");
             // Add valueLengthInfo needed for serialization
             entries.forEach(entry => {
                  if (entry && !entry.valueLengthInfo) {
                       entry.valueLengthInfo = writeConditional(entry.valueLength);
                  }
                   // Also ensure typeLengthByte exists if possible (parseObjectMetadataEntry should add it)
                   if(entry && typeof entry.typeLengthByte !== 'number') {
                       // Attempt to reconstruct, though parse should handle this
                        console.warn(`B"H: Reconstructing typeLengthByte for key ${entry.key} during rewrite.`);
                        const valueLengthSize = entry.valueLengthInfo ? entry.valueLengthInfo.size : writeConditional(entry.valueLength).size;
                        const tlByte = require('../packing/packTypeAndLengthSize.js')(entry.valueType, valueLengthSize); // Assuming path correct
                        if (tlByte === null) throw new Error(`Failed to pack type/length for key ${entry.key}`);
                        entry.typeLengthByte = tlByte;
                   }
             });
        }
    } catch (e) {
         throw new Error(`B"H: Failed to read existing entries during rewrite: ${e.message}`);
    }


    // --- 2. Prepare NEW Header & Metadata Blob ---
    let newMetadataBlob;
    let finalNewInternalOffsetSize = newInternalOffsetSize; // May be adjusted if no entries

    try {
        if (isArray) {
            const newArrayLength = entries.length;
            // Handle empty array case for sizes
            if (newArrayLength === 0) finalNewInternalOffsetSize = 1;

            const newArrayLengthInfo = writeConditional(newArrayLength);
            const newArrayLengthSize = newArrayLengthInfo.size;
            const packedNewArrayLengthSize = packedLength(newArrayLengthSize);
            const packedNewInternalOffsetSize = packedLength(finalNewInternalOffsetSize);

            if (packedNewArrayLengthSize === null || packedNewInternalOffsetSize === null) throw new Error("B\"H: Failed packing new array header sizes.");

            // Build new header byte
            let newHeaderByte1 = 0;
            if (nestedMetadata.headerInfo.isParentRelative) newHeaderByte1 |= (1 << ARR_HDR_IS_PARENT_RELATIVE_SHIFT);
            newHeaderByte1 |= (packedNewInternalOffsetSize << ARR_HDR_INTERNAL_OFFSET_SIZE_SHIFT);
            newHeaderByte1 |= (packedNewArrayLengthSize << ARR_HDR_ARRAY_LENGTH_SIZE_SHIFT);
            const newHeaderBuffer = Buffer.from([newHeaderByte1]);

            // Build new index table
            const newIndexTable = Buffer.alloc(newArrayLength * finalNewInternalOffsetSize);
            entries.forEach((offset, i) => {
                writeToBuffer(newIndexTable, offset, finalNewInternalOffsetSize, i * finalNewInternalOffsetSize);
            });

            // Assemble the minimal array structure (header + index table + length)
            newMetadataBlob = Buffer.concat([ newHeaderBuffer, newIndexTable, newArrayLengthInfo.buffer ]);

        } else { // Is Object - *** Implement Rewrite Logic ***
            const finalEntryObjects = entries.filter(e => e && e.valueLengthInfo && typeof e.typeLengthByte === 'number'); // Filter invalid/incomplete entries
            const finalEntryCount = finalEntryObjects.length;

             // Handle empty object case for sizes
             if (finalEntryCount === 0) finalNewInternalOffsetSize = 1;

             // Serialize entry objects back to buffers
             const serializedEntryBuffers = finalEntryObjects.map(entry => {
                  try { return serializeMetadataEntry(entry); } catch(e) { console.error("Error re-serializing entry", entry.key, e); return null; }
             }).filter(Boolean);

             if(serializedEntryBuffers.length !== finalEntryCount) {
                  console.warn("B\"H: Failed to re-serialize some object metadata entries during rewrite.");
             }
              const successfulEntryCount = serializedEntryBuffers.length;

             // Create hash table and metadata array using the NEW internal offset size
             const {
                 hashBuffers,
                 serializedMetadata, // This is the new Awtsmoos Array buffer
                 offsetSizeMetadataArray, // This SHOULD match finalNewInternalOffsetSize
                 hashTableSize
             } = makeHashTableFromMetadata(serializedEntryBuffers, finalNewInternalOffsetSize); // Pass target size

            if(successfulEntryCount > 0 && offsetSizeMetadataArray !== finalNewInternalOffsetSize) {
                 console.warn(`B"H: Calculated offsetSizeMetadataArray (${offsetSizeMetadataArray}) differs from target newInternalOffsetSize (${finalNewInternalOffsetSize}) during rewrite. Using ${offsetSizeMetadataArray}.`);
                 finalNewInternalOffsetSize = offsetSizeMetadataArray; // Trust the actual outcome
            } else if (successfulEntryCount === 0) {
                 finalNewInternalOffsetSize = 1; // Reset if empty
            }


            // Calculate new footer info
            let maxDataEndForFooter = 0;
             finalEntryObjects.forEach(e => { // Use the successfully parsed/prepared objects
                  if(e.offsetOfValueInMain + e.valueLength > maxDataEndForFooter) {
                       maxDataEndForFooter = e.offsetOfValueInMain + e.valueLength;
                  }
             });

            const {
                footer: newFooterLengthsBuffer,
                // packedHeaderSizes // Calculate below
            } = getSerializedMetadata({
                serializedMetadataLength: serializedMetadata.length,
                offsetSizeMetadataArray: finalNewInternalOffsetSize, // Use the final determined size
                dataLength: maxDataEndForFooter, // Use calculated max extent
                totalKeys: successfulEntryCount, // Use count of successfully serialized entries
                hashTableSize
            });

            // Pack final object header byte
            const packedNewInternalOffsetSize = packedLength(finalNewInternalOffsetSize);
            const totalKeysInfo = writeConditional(successfulEntryCount);
            const metaArrayLengthInfo = writeConditional(serializedMetadata.length);
            const hashTableLengthInfo = writeConditional(hashTableSize);
            const keyLengthSizePacked = packedLength(totalKeysInfo.size);
            const metaArrayLengthSizePacked = packedLength(metaArrayLengthInfo.size);
            const hashTableLengthSizePacked = packedLength(hashTableLengthInfo.size);

            if (packedNewInternalOffsetSize === null || keyLengthSizePacked === null || metaArrayLengthSizePacked === null || hashTableLengthSizePacked === null) {
                 throw new Error("B\"H: Failed packing new object header sizes.");
            }
            let newHeaderByte1 = 0;
            if (nestedMetadata.headerInfo.isParentRelative) newHeaderByte1 |= (1 << OBJ_HDR_IS_PARENT_RELATIVE_SHIFT);
            newHeaderByte1 |= (packedNewInternalOffsetSize << OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT);
            newHeaderByte1 |= (keyLengthSizePacked << OBJ_HDR_KEY_LENGTH_SIZE_SHIFT);
            newHeaderByte1 |= (metaArrayLengthSizePacked << OBJ_HDR_META_ARR_LEN_SIZE_SHIFT);
            newHeaderByte1 |= (hashTableLengthSizePacked << OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT);
            const newHeaderBuffer = Buffer.from([newHeaderByte1]);


            // Assemble the full object blob (Header + Hash Table + Metadata Array + Footer Lengths)
            newMetadataBlob = Buffer.concat([
                newHeaderBuffer, hashBuffers, serializedMetadata, newFooterLengthsBuffer
            ]);
        }
    } catch(e) {
        throw new Error(`B"H: Failed to prepare new metadata blob: ${e.message}`);
    }

    // --- 3. Release old blob space ---
    if (nestedBlobLength <= 0) {
        console.warn(`B"H: Original nested blob length is ${nestedBlobLength}. Skipping release.`);
    } else {
        console.log(`B"H: Releasing old blob space at ${nestedBlobOffset}, length ${nestedBlobLength}`);
        try {
            freeSpaceManager.releaseSpace(parentBufferWrapper, effectiveFreeSpaceHeadOffset, nestedBlobOffset, nestedBlobLength);
        } catch(releaseError) {
             console.error("B\"H: Failed to release old blob space:", releaseError);
             throw new Error(`B"H: Failed to release old blob space: ${releaseError.message}`);
        }
    }


    // --- 4. Allocate space for the new blob ---
    let newBlobOffset;
    try {
        const foundSpace = freeSpaceManager.findFreeSpace(parentBufferWrapper, effectiveFreeSpaceHeadOffset, newMetadataBlob.length);
        if (!foundSpace) {
            console.warn(`B"H: No free space for rewritten blob (size ${newMetadataBlob.length}). Appending.`);
            newBlobOffset = parentBufferWrapper.length; // Append position
        } else {
            newBlobOffset = freeSpaceManager.allocateSpace(parentBufferWrapper, effectiveFreeSpaceHeadOffset, foundSpace, newMetadataBlob.length);
        }
    } catch (allocError) {
         console.error("B\"H: Failed to allocate space for rewritten blob:", allocError);
         throw new Error(`B"H: Failed to allocate space for rewritten blob: ${allocError.message}`);
    }


    // --- 5. Write the new blob ---
    try {
        // Ensure buffer accommodates write (fileBuffer should handle this)
        parentBufferWrapper.writeBuffer(newBlobOffset, newMetadataBlob);
    } catch (writeError) {
         console.error(`B"H: Failed to write rewritten blob at offset ${newBlobOffset}:`, writeError);
         try { if(newMetadataBlob.length > 0) freeSpaceManager.releaseSpace(parentBufferWrapper, effectiveFreeSpaceHeadOffset, newBlobOffset, newMetadataBlob.length); } catch (e) { console.warn("B\"H: Error releasing space after failed write:", e);}
         throw new Error(`B"H: Failed to write rewritten blob: ${writeError.message}`);
    }

    console.log(`B"H: Nested structure rewritten successfully at offset ${newBlobOffset}, new length ${newMetadataBlob.length}`);

    // --- 6. Return info needed by parent ---
    return { newOffset: newBlobOffset, newLength: newMetadataBlob.length };
}


module.exports = {
    rewriteNestedStructure
};