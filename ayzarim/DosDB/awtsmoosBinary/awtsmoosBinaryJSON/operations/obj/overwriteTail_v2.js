// B"H
// Rewriting the conclusion, placing appended data, finalizing pointers, sealing the structure, and truncating carefully.

const fileBuffer = require("../../../fileBuffer.js"); // Adjust path if necessary
const makeHashTableFromMetadata = require("../../serialize/makeHashTableFromMetadata.js");
const getSerializedMetadata = require("../../serialize/getSerializedMetadata.js");
const serializeMetadataEntry = require("../../serialize/serializeMetadataEntry.js");
const { magicJSON } = require("../../constants.js");
const freeSpaceManager = require("./freeSpaceManager.js");
const { packedLength } = require('../packing/packedLength.js'); // Assuming path is correct
const writeConditional = require('../helpers/writeConditional.js'); // Assuming path is correct

// Header Byte 1 Layout (Consistent)
const HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const HDR_KEY_LENGTH_SIZE_SHIFT = 3;
const HDR_META_ARR_LEN_SIZE_SHIFT = 1;
const HDR_HASH_TBL_LEN_SIZE_SHIFT = 0;

/**
 * Calculates the end offset of the *allocated* data region based on metadata entries.
 * Considers only entries with valid allocated offsets (> 0).
 * @param {Array<object>} metadata - Array of parsed metadata entry objects.
 * @param {number} headerLength - Length of the header section.
 * @returns {number} The offset marking the highest point reached by allocated data.
 */
function getEndOfAllocatedDataRegion(metadata, headerLength) {
    let maxOffsetReached = headerLength;
    if (!metadata) return headerLength;
    metadata.forEach(entry => {
        // Ensure entry is valid and has relevant properties
        if (entry && entry.valueLength > 0 && entry.offsetOfValueInMain > 0) {
            const end = entry.offsetOfValueInMain + entry.valueLength;
            if (end > maxOffsetReached) {
                maxOffsetReached = end;
            }
        }
    });
    return maxOffsetReached;
}


/**
 * Rewrites the tail (hash table, metadata array, footer lengths) of an Awtsmoos object buffer.
 * Handles appending marked data blobs. Truncates safely.
 *
 * @param {BufferWrapper} bufferWrapper - The buffer to modify.
 * @param {Array<object>} tentativeMetadataEntries - The list of metadata entries. Entries needing append
 *                                                  should have offsetOfValueInMain = 0 and include a
 *                                                  `_dataToAppend` property holding the Buffer.
 * @param {number} freeSpaceHeadOffset - The offset where the free space list head pointer value is stored.
 */
function overwriteTail(
    bufferWrapper,
    tentativeMetadataEntries,
    freeSpaceHeadOffset // Offset where the free list head *value* is stored
) {
    if (!bufferWrapper || typeof bufferWrapper.readBuffer !== 'function') {
        throw new Error("B\"H: Invalid bufferWrapper provided to overwriteTail.");
    }
    if (!Array.isArray(tentativeMetadataEntries)) {
         throw new Error("B\"H: Invalid metadataEntries provided to overwriteTail.");
    }

    const finalizedMetadataEntries = []; // Build the list of entries actually being kept/written
    const headerPackedSizeByteOffset = magicJSON.length + freeSpaceManager.HEAD_POINTER_SIZE;
    const headerLength = headerPackedSizeByteOffset + 1; // Magic + HeadPtr + FlagsByte

    // --- Determine Data Region End and Handle Appends ---
    let currentAllocatedDataEnd = getEndOfAllocatedDataRegion(tentativeMetadataEntries, headerLength);
    let actualDataEndAfterAppends = currentAllocatedDataEnd; // Track final end including appends

    for (const entry of tentativeMetadataEntries) {
        if (!entry) continue; // Skip null/undefined entries if any sneak in

        let entryToFinalize = { ...entry }; // Clone entry

        // Check if entry needs appending
        if (entryToFinalize.offsetOfValueInMain === 0 && entryToFinalize.valueLength > 0 && entryToFinalize._dataToAppend instanceof Buffer) {
            const dataBlob = entryToFinalize._dataToAppend;

            // Validate length consistency
            if (dataBlob.length !== entryToFinalize.valueLength) {
                console.warn(`B"H: Correcting valueLength for key "${entryToFinalize.key}" from ${entryToFinalize.valueLength} to ${dataBlob.length} based on _dataToAppend buffer.`);
                entryToFinalize.valueLength = dataBlob.length;
                // Note: valueLengthInfo might become stale if length changes. Assume initial packing was based on intended length.
            }

            const appendOffset = actualDataEndAfterAppends; // Append right after last known end
            console.log(`B"H: Appending data for key "${entryToFinalize.key}" (size ${entryToFinalize.valueLength}) at offset ${appendOffset}.`);

            try {
                bufferWrapper.writeBuffer(appendOffset, dataBlob); // Write the data
            } catch (e) {
                 console.error(`B"H: Error writing appended data for key "${entryToFinalize.key}":`, e);
                 // Skip this entry if write fails?
                 continue; // Don't add to finalized list
            }

            entryToFinalize.offsetOfValueInMain = appendOffset; // Update entry's offset
            actualDataEndAfterAppends += entryToFinalize.valueLength; // Extend final data end

        } else if (entryToFinalize.offsetOfValueInMain === 0 && entryToFinalize.valueLength > 0) {
             // Entry marked for append but data missing
             console.error(`B"H: Metadata entry for key "${entryToFinalize.key}" has offset 0 but no _dataToAppend buffer. Skipping entry.`);
             continue; // Don't add to finalized list
        }

        // Clean up temp prop and add to finalized list
        delete entryToFinalize._dataToAppend;
        finalizedMetadataEntries.push(entryToFinalize);
    }


    // --- Serialize Metadata and Create Hash Table (using FINALIZED metadata) ---
    const serializedEntryBuffers = finalizedMetadataEntries.map(entry => {
         // Basic validation before serialization
         if (!entry.valueLengthInfo || typeof entry.typeLengthByte !== 'number') {
              console.error(`B"H: Missing valueLengthInfo or typeLengthByte for key "${entry.key}" before final serialization.`);
              return null; // Mark for filtering
         }
         // Ensure offset is valid if length > 0
         if(entry.valueLength > 0 && entry.offsetOfValueInMain <= 0) {
              // Allow offset 0 only if length is also 0 (e.g., null, bool)
              if (entry.valueLength !== 0) {
                   console.error(`B"H: Invalid offset (${entry.offsetOfValueInMain}) for key "${entry.key}" with length ${entry.valueLength} before final serialization.`);
                   return null;
              }
         }
         try {
             return serializeMetadataEntry(entry);
         } catch (serializeError) {
             console.error(`B"H: Error serializing metadata entry for key "${entry.key}":`, serializeError);
             return null;
         }
     }).filter(Boolean); // Remove nulls resulting from errors


    const finalEntryCount = serializedEntryBuffers.length;
    if (finalEntryCount !== finalizedMetadataEntries.length) {
         console.warn(`B"H: ${finalizedMetadataEntries.length - finalEntryCount} metadata entries could not be serialized. Tail will be based on ${finalEntryCount} entries.`);
    }

    // Handle case where there are no valid entries left
    if (finalEntryCount === 0) {
         console.log("B\"H: No valid entries remaining. Writing empty tail.");
         // Need default sizes for getSerializedMetadata
         const defaultSizeInfo = { size: 1, buffer: Buffer.from([0])}; // Default for 0 value
         const defaultPackedSize = packedLength(1);
         // Overwrite tail with empty structures
         const { footer: emptyFooter } = getSerializedMetadata({
             serializedMetadataLength: 0, offsetSizeMetadataArray: 1, dataLength: actualDataEndAfterAppends, totalKeys: 0, hashTableSize: 0
         });
          const emptyTailBuffer = emptyFooter; // No hash table, no metadata array
          const writeTailAt = actualDataEndAfterAppends;
          bufferWrapper.writeBuffer(writeTailAt, emptyTailBuffer);

           // Update Header Byte for empty state
           const existingHeaderByte = bufferWrapper.readUInt8(headerPackedSizeByteOffset);
           const existingIsParentRelative = !!(existingHeaderByte & (1 << HDR_IS_PARENT_RELATIVE_SHIFT));
           let finalHeaderByte1 = existingIsParentRelative ? (1 << HDR_IS_PARENT_RELATIVE_SHIFT) : 0;
           // Pack sizes assuming 0 lengths, size 1 offsets
           finalHeaderByte1 |= (defaultPackedSize << HDR_INTERNAL_OFFSET_SIZE_SHIFT); // internalOffsetSize = 1
           finalHeaderByte1 |= (defaultPackedSize << HDR_KEY_LENGTH_SIZE_SHIFT); // totalKeys length size = 1
           finalHeaderByte1 |= (defaultPackedSize << HDR_META_ARR_LEN_SIZE_SHIFT); // meta array length size = 1
           finalHeaderByte1 |= (defaultPackedSize << HDR_HASH_TBL_LEN_SIZE_SHIFT); // hash table length size = 1
           bufferWrapper.writeUInt8(headerPackedSizeByteOffset, finalHeaderByte1);

           // Truncate
           const finalSize = writeTailAt + emptyTailBuffer.length;
           bufferWrapper.truncate(finalSize);
           console.log(`B"H: Object emptied. Final buffer size: ${finalSize}`);
           return; // Exit early
    }


    // Proceed with non-empty tail generation
    const {
        hashBuffers,
        serializedMetadata,
        offsetSizeMetadataArray, // Final internal offset size
        hashTableSize
    } = makeHashTableFromMetadata(serializedEntryBuffers);


    // --- Calculate Footer Info (based on final state) ---
    const {
        footer: footerLengthsBuffer,
        // packedHeaderSizes not needed directly here
    } = getSerializedMetadata({
        serializedMetadataLength: serializedMetadata.length,
        offsetSizeMetadataArray: offsetSizeMetadataArray,
        dataLength: actualDataEndAfterAppends, // Use the final end after any appends
        totalKeys: finalEntryCount,
        hashTableSize
    });


    // --- Assemble and Write the Full Tail ---
    const tailBuffer = Buffer.concat([
        hashBuffers,
        serializedMetadata,
        footerLengthsBuffer
    ]);
    const writeTailAt = actualDataEndAfterAppends; // Tail starts immediately after last data block
    bufferWrapper.writeBuffer(writeTailAt, tailBuffer);


    // --- Update Header Byte ---
    const existingHeaderByte = bufferWrapper.readUInt8(headerPackedSizeByteOffset);
    const existingIsParentRelative = !!(existingHeaderByte & (1 << HDR_IS_PARENT_RELATIVE_SHIFT));
    const internalOffsetSizePacked = packedLength(offsetSizeMetadataArray);
    const totalKeysInfo = writeConditional(finalEntryCount);
    const metaArrayLengthInfo = writeConditional(serializedMetadata.length);
    const hashTableLengthInfo = writeConditional(hashTableSize);
    const keyLengthSizePacked = packedLength(totalKeysInfo.size);
    const metaArrayLengthSizePacked = packedLength(metaArrayLengthInfo.size);
    const hashTableLengthSizePacked = packedLength(hashTableLengthInfo.size);

    if (internalOffsetSizePacked === null || keyLengthSizePacked === null || metaArrayLengthSizePacked === null || hashTableLengthSizePacked === null) {
         throw new Error("B\"H: Failed to pack final header sizes in overwriteTail.");
    }

    let finalHeaderByte1 = 0;
    if (existingIsParentRelative) { finalHeaderByte1 |= (1 << HDR_IS_PARENT_RELATIVE_SHIFT); }
    finalHeaderByte1 |= (internalOffsetSizePacked << HDR_INTERNAL_OFFSET_SIZE_SHIFT);
    finalHeaderByte1 |= (keyLengthSizePacked << HDR_KEY_LENGTH_SIZE_SHIFT);
    finalHeaderByte1 |= (metaArrayLengthSizePacked << HDR_META_ARR_LEN_SIZE_SHIFT);
    finalHeaderByte1 |= (hashTableLengthSizePacked << HDR_HASH_TBL_LEN_SIZE_SHIFT);

    bufferWrapper.writeUInt8(headerPackedSizeByteOffset, finalHeaderByte1);

    // Free space head pointer is managed by freeSpaceManager calls.

    // --- *** Refined Truncate Buffer Logic *** ---
    const endOfNewTail = writeTailAt + tailBuffer.length;
    // Find the highest end point of any *remaining* data block
    const endOfLastRemainingData = getEndOfAllocatedDataRegion(finalizedMetadataEntries, headerLength);
    // Truncate to the furthest point reached by either remaining data or the new tail
    const finalSize = Math.max(endOfLastRemainingData, endOfNewTail);

    bufferWrapper.truncate(finalSize);
    console.log(`B"H: Tail overwritten. Final buffer size: ${finalSize}`);
}

module.exports = overwriteTail;