//B"H
// Creates the hash table and serialized metadata array, now respecting a target offset size.

const { hashKey } = require("../helpers/hashing/misc.js");
const serializeMetadataEntry = require("./serializeMetadataEntry_v2"); // Already imported conceptually
const getArray = require("../deserialize/getArray.js"); // Need getMetadata, getOffsetFromIndex
const serializeArray = require("./array_v2.js"); // Use the actual module now

/**
 * Creates hash table and serialized metadata array from metadata entries.
 * @param {Array<Buffer>} serializedEntryBuffers - Array of buffers, each representing a serialized metadata entry.
 * @param {number} [targetInternalOffsetSize=null] - If provided (1,2,4,8), forces the hash table entries
 *                                                   and the metadata array's internal offset size to use this value.
 *                                                   If null, size is determined automatically.
 * @returns {{hashBuffers: Buffer, serializedMetadata: Buffer, offsetSizeMetadataArray: number, hashTableSize: number}}
 * @throws If target size is invalid or incompatible with data.
 */
function makeHashTableFromMetadata(serializedEntryBuffers, targetInternalOffsetSize = null) {

    // Create the Awtsmoos Array containing the serialized metadata entries first.
    // The serialization process itself doesn't depend on the targetInternalOffsetSize yet.
    const serializedMetadata = serializeArray(serializedEntryBuffers, { isTopLevel: false }); // Treat as non-top-level data blob

    // Get the metadata *of this newly created metadata array*.
    const metadataOfMetadataArray = getArray.getMetadata(serializedMetadata, 0, false);
    if (!metadataOfMetadataArray) {
         throw new Error("B\"H: Could not get metadata for the newly serialized metadata array.");
    }

    // Determine the *actual* offset size used internally by the metadata array we just created.
    let actualInternalOffsetSize = metadataOfMetadataArray.offsetSize;
    const maxOffsetInMetaArray = metadataOfMetadataArray.arrayLength > 0
         ? getArray.getOffsetFromIndexTable(serializedMetadata, metadataOfMetadataArray.arrayLength - 1, metadataOfMetadataArray)
         : 0; // Get offset of last item to check required size

    // Validate or determine the final internal offset size.
    if (targetInternalOffsetSize !== null) {
        if (![1, 2, 4, 8].includes(targetInternalOffsetSize)) {
            throw new Error(`B"H: Invalid targetInternalOffsetSize (${targetInternalOffsetSize}) provided.`);
        }
        // Check if the target size is sufficient for the actual offsets within the metadata array.
        const requiredSizeForMetaArray = getRequiredOffsetSize(maxOffsetInMetaArray); // Re-use helper
        if (requiredSizeForMetaArray > targetInternalOffsetSize) {
             throw new Error(`B"H: Target internal offset size ${targetInternalOffsetSize} is too small for offsets within the metadata array (max offset ${maxOffsetInMetaArray} requires ${requiredSizeForMetaArray} bytes).`);
        }
        // Use the target size if valid and sufficient.
        actualInternalOffsetSize = targetInternalOffsetSize;
        console.log(`B"H: Using target internal offset size: ${actualInternalOffsetSize}`);
    }
    // If targetInternalOffsetSize was null, actualInternalOffsetSize already holds the auto-determined size.


    // Create the Hash Table using the final `actualInternalOffsetSize` for its entries.
    const hashTableSize = serializedEntryBuffers.length * 2; // Standard sizing
    const hashTableEntrySize = actualInternalOffsetSize; // Hash entries store offsets into metadata array
    const hashBuffers = Buffer.alloc(hashTableSize * hashTableEntrySize); // Allocate hash table buffer

    // Need to parse the serialized entries *back* to get keys for hashing (inefficient but necessary here)
    // TODO: Optimization - pass parsed entries + buffers instead of just buffers?
    const parsedEntriesTemp = serializedEntryBuffers.map(buf => require('../deserialize/get.js').parseMetadataEntry(buf)); // Use full path/require

    parsedEntriesTemp.forEach((entryData, originalIndex) => {
        if (!entryData) {
             console.warn(`B"H: Skipping hash table entry for null/invalid parsed entry at original index ${originalIndex}`);
             return;
        }
        const key = entryData.key;

        // Find the offset of this entry's *buffer* within the serializedMetadata Awtsmoos Array
        let offsetOfValueInMetadataArray;
        try {
             // Use the metadata we got earlier for the serializedMetadata buffer
             offsetOfValueInMetadataArray = getArray.getOffsetFromIndexTable(
                  serializedMetadata,
                  originalIndex, // Use the original index before any filtering
                  metadataOfMetadataArray // Use the correct metadata object
             );
        } catch (e) {
             console.error(`B"H: Error getting offset from metadata array index table for key "${key}":`, e);
             // Cannot create hash entry without the correct offset. Skip this entry? Or throw?
             console.warn(`B"H: Skipping hash table entry for key "${key}" due to offset read error.`);
             return;
        }


        // Calculate hash index
        const hashIndex = hashKey(key, hashTableSize);
        let index = hashIndex;

        // Linear probing to find empty slot
        let safetyCounter = 0;
        while (safetyCounter <= hashTableSize) {
             const currentSlotOffset = index * hashTableEntrySize;
             // Check if slot is empty (read entrySize bytes, check if all zero)
             let isEmpty = true;
             for (let k = 0; k < hashTableEntrySize; k++) {
                  if (hashBuffers.readUInt8(currentSlotOffset + k) !== 0) {
                       isEmpty = false;
                       break;
                  }
             }

             if (isEmpty) {
                  // Write the offset (offsetOfValueInMetadataArray) into the hash table slot
                  hashBuffers.writeUIntBE(offsetOfValueInMetadataArray, currentSlotOffset, hashTableEntrySize);
                  break; // Found slot, break inner loop
             }

             // Slot not empty, probe next
             index = (index + 1) % hashTableSize;
             safetyCounter++;
             if (safetyCounter > hashTableSize) {
                   console.error(`B"H: Hash table full or infinite loop detected for key "${key}" during generation!`);
                   // This shouldn't happen if hashTableSize >= entries.length * 2
                   // Throw an error as this indicates a major problem.
                   throw new Error(`B"H: Hash table generation failed for key "${key}". Table likely full.`);
             }
        }
    });

    return {
        hashBuffers,
        serializedMetadata, // The Awtsmoos Array buffer
        offsetSizeMetadataArray: actualInternalOffsetSize, // The final determined/validated size
        hashTableSize
    };
}

// Helper (ensure defined/imported)
function getRequiredOffsetSize(offset) {
     if (offset === 0) return 1; if (offset < 256) return 1; if (offset < 65536) return 2;
     if (offset < 4294967296) return 4; return 8;
}


module.exports = makeHashTableFromMetadata;