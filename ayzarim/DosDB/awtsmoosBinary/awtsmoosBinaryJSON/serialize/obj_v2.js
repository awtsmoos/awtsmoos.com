// B"H
//FILE serialize/obj.js
// Weaving the JSON tapestry, now with threads extending into the parent reality.

const { magicJSON } = require("./../constants.js");
const serializeValue = require("./serializeValue.js");
const makeHashTableFromMetadata = require("./makeHashTableFromMetadata.js");
const getSerializedMetadata = require("./getSerializedMetadata.js");
const freeSpaceManager = require("../modify/freeSpaceManager.js");
const { packedLength, unpackLength } = require("../packing/packedLength.js");
const fileBuffer = require("../../../fileBuffer.js"); // Adjust path if needed

var temp = {};
var serializeArray = null;
Object.defineProperty(temp, "serializeArray", {
    get() {
        if (!serializeArray) serializeArray = require("./array.js");
        return serializeArray;
    }
});

// Configuration
const PARENT_RELATIVE_DEFAULT = true;

// Header Byte 1 Layout (after magic, optional free list head)
const HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const HDR_KEY_LENGTH_SIZE_SHIFT = 3;
const HDR_META_ARR_LEN_SIZE_SHIFT = 1;
const HDR_HASH_TBL_LEN_SIZE_SHIFT = 0;

/**
 * @method serializeJSON
 * @description Serializes a JSON object, potentially placing nested structures parent-relatively.
 * @param {object} json - The JSON object to serialize.
 * @param {object} [options] - Serialization options.
 * @param {boolean} [options.parentRelative=PARENT_RELATIVE_DEFAULT] - Store nested *data* parent-relatively.
 * @param {boolean} [options.isTopLevel=true] - Is this the root object being serialized?
 * @param {BufferWrapper} [options.bufferWrapper=null] - Existing buffer for modification.
 * @param {number} [options.freeSpaceHeadOffsetInParent=-1] - Parent's free space head offset.
 * @returns {Buffer | {finalSize: number}} - New buffer or final size if modifying.
 */
function serializeJSON(json, options = {}) {
    const {
        parentRelative = PARENT_RELATIVE_DEFAULT,
        isTopLevel = true, // Assume top-level unless specified
        bufferWrapper = null,
        freeSpaceHeadOffsetInParent = -1
    } = options;

    if (Array.isArray(json)) {
         // Pass isTopLevel=false when recursing
        return temp.serializeArray(json, { ...options, isTopLevel: false });
    }

    const isModification = !!bufferWrapper;
    const headerBuffers = [Buffer.from(magicJSON)];
    let currentHeaderOffset = magicJSON.length;
    let effectiveFreeSpaceHeadOffset = -1;

    // Add/find free list head only if top-level
    if (isTopLevel) {
        if (isModification) {
            // Read existing head offset (assuming it's right after magic)
            effectiveFreeSpaceHeadOffset = magicJSON.length;
        } else {
            // Create new head placeholder
            const freeListHeadPlaceholder = Buffer.alloc(freeSpaceManager.HEAD_POINTER_SIZE);
            freeListHeadPlaceholder.writeUIntBE(0, 0, freeSpaceManager.HEAD_POINTER_SIZE);
            headerBuffers.push(freeListHeadPlaceholder);
            effectiveFreeSpaceHeadOffset = magicJSON.length; // Points to the placeholder start
            currentHeaderOffset += freeSpaceManager.HEAD_POINTER_SIZE;
        }
    } else {
        // Nested structures don't have their *own* top-level free list head pointer
        effectiveFreeSpaceHeadOffset = freeSpaceHeadOffsetInParent; // Use parent's
    }

    const headerFlagsAndSizesPlaceholder = Buffer.alloc(1);
    headerBuffers.push(headerFlagsAndSizesPlaceholder);
    const headerLength = headerBuffers.reduce((sum, buf) => sum + buf.length, 0);

    // --- Data Serialization ---
    const keys = Object.keys(json);
    const metadataEntries = []; // Holds { key, valueType, valueLength, offsetOfValueInMain, typeLengthByte, valueLengthInfo }
    let maxDataOffsetReached = headerLength; // Track highest offset used

    // Ensure bufferWrapper exists if modifying
    if (isModification && !bufferWrapper) {
        throw new Error("B\"H: bufferWrapper is required for modification.");
    }
     if (!isModification && effectiveFreeSpaceHeadOffset === -1 && isTopLevel) {
         throw new Error("B\"H: effectiveFreeSpaceHeadOffset wasn't set for new top-level buffer.");
     }

    for (let key of keys) {
        const value = json[key];
        const childOptions = {
            parentRelative, // Propagate choice
            isTopLevel: false, // Children are not top-level
            bufferWrapper, // Pass wrapper for modifications
            freeSpaceHeadOffsetInParent: effectiveFreeSpaceHeadOffset // Pass down the *correct* head offset
        };

        // serializeValue decides structure based on parentRelative
        const valueInfo = serializeValue(value, childOptions);

        let valueLength = 0;
        let offsetOfValueInMain = 0;
        let dataToWrite = null; // Either simple data or nested metadata blob

        if (valueInfo.metadataBuffer) { // Nested structure, store its metadata blob
            valueLength = valueInfo.metadataBuffer.length;
            dataToWrite = valueInfo.metadataBuffer;
        } else { // Simple value
            valueLength = valueInfo.data.length;
            dataToWrite = valueInfo.data;
        }

        if (valueLength > 0) { // Don't allocate space for zero-length types
             if (!isModification) throw new Error("B\"H: Cannot allocate space without bufferWrapper."); // Should not happen if logic correct

            // Allocate space using the correct free space head offset
            const foundSpace = freeSpaceManager.findFreeSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, valueLength);
            if (!foundSpace) {
                 // If no space found, we need to append (requires buffer growth)
                 // Simplification: Assume for now findFreeSpace handles "end of buffer" as a potential space.
                 // A real implementation might need explicit append logic if findFreeSpace only finds existing gaps.
                 // Let's assume findFreeSpace can return an offset at bufferWrapper.length if no gap fits.
                 // **This needs clarification in freeSpaceManager implementation.**
                 // Assuming findFreeSpace fails, we fall back to appending conceptually.
                 // The actual writing happens via overwriteTail which appends the *tail*.
                 // How do we place data now? This model breaks slightly without append capability in freeSpaceManager.

                 // ***Temporary Fix Assumption: Allocate will append if no gap fits***
                 // Replace with robust logic if freeSpaceManager doesn't support append-allocation.
                 console.warn(`B"H: No suitable free space found for key "${key}" (size ${valueLength}). Attempting append allocation.`);
                 // Calculate append offset based on current known max offset? Risky.
                 // Let's pause allocation here and rely on a later stage? No, need offset *now*.
                 // Revisit freeSpaceManager or append logic in overwriteTail.

                 // --- Let's assume freeSpaceManager needs explicit append logic ---
                 // We can't reliably place data *during* this loop if allocation fails mid-way.
                 // Alternative: Collect all data/metadata blobs, calculate total size,
                 // allocate ONE large block (or append), then place items within that? Less efficient fragmentation use.

                 // --- Sticking to item-by-item allocation with fallback needed ---
                 throw new Error(`B"H: Out of space or append logic needed for key "${key}" (size ${valueLength}).`);
             }

            offsetOfValueInMain = freeSpaceManager.allocateSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, foundSpace, valueLength);
            bufferWrapper.writeBuffer(offsetOfValueInMain, dataToWrite);

        } else {
            // For zero-length types (null, bool, etc.), offset doesn't matter (or set to 0?)
             offsetOfValueInMain = 0; // Or keep track of previous offset? Let's use 0.
        }


        // Update max offset tracker
        const currentEnd = offsetOfValueInMain + valueLength;
        if (currentEnd > maxDataOffsetReached) {
            maxDataOffsetReached = currentEnd;
        }

        metadataEntries.push({
            key,
            valueType: valueInfo.type,
            valueLength,
            offsetOfValueInMain,
            // Pass through needed info for serializeMetadataEntry
            typeLengthByte: valueInfo.typeLengthByte,
            valueLengthInfo: valueInfo.valueLengthInfo
        });
    }

    // --- Metadata and Footer Serialization ---
    var {
        hashBuffers,            // Hash table buffer
        serializedMetadata,     // Awtsmoos Array buffer of metadata entries
        offsetSizeMetadataArray,// Offset size *within* metadata array
        hashTableSize           // Number of slots in hash table
    } = makeHashTableFromMetadata(metadataEntries); // Pass collected entries

    // Calculate sizes for header byte packing
    const keyLengthInfo = writeConditional(keys.length); // Length of keys array *if* we stored it (we use metadata now)
                                                        // Use length of metadataEntries for totalKeys calculation
    const totalKeysInfo = writeConditional(metadataEntries.length);
    const metaArrayLengthInfo = writeConditional(serializedMetadata.length); // Actual byte length
    const hashTableLengthInfo = writeConditional(hashTableSize); // Number of slots

    const internalOffsetSize = offsetSizeMetadataArray; // Use the size determined for metadata array offsets
    const internalOffsetSizePacked = packedLength(internalOffsetSize);
    const keyLengthSizePacked = packedLength(totalKeysInfo.size); // Size of total keys count
    const metaArrayLengthSizePacked = packedLength(metaArrayLengthInfo.size);
    const hashTableLengthSizePacked = packedLength(hashTableLengthInfo.size);

     if (internalOffsetSizePacked === null || keyLengthSizePacked === null || metaArrayLengthSizePacked === null || hashTableLengthSizePacked === null) {
         throw new Error("B\"H: Failed to pack header sizes.");
     }

    // Pack HeaderFlagsAndSizes byte
    let headerByte1 = 0;
    if (parentRelative) { // Store if *this* structure's elements point relatively
        headerByte1 |= (1 << HDR_IS_PARENT_RELATIVE_SHIFT);
    }
    headerByte1 |= (internalOffsetSizePacked << HDR_INTERNAL_OFFSET_SIZE_SHIFT);
    headerByte1 |= (keyLengthSizePacked << HDR_KEY_LENGTH_SIZE_SHIFT);
    headerByte1 |= (metaArrayLengthSizePacked << HDR_META_ARR_LEN_SIZE_SHIFT);
    headerByte1 |= (hashTableLengthSizePacked << HDR_HASH_TBL_LEN_SIZE_SHIFT);

    headerFlagsAndSizesPlaceholder.writeUInt8(headerByte1);

    // --- Get Footer Information (packed offset sizes, lengths) ---
    var {
        footer, // Contains packed footer offset sizes + dynamic length fields
        // packedHeaderSizes is redundant now, we calculated it directly
    } = getSerializedMetadata({
        serializedMetadataLength: serializedMetadata.length,
        offsetSizeMetadataArray: internalOffsetSize, // Pass the internal offset size
        // dataLength should reflect the furthest point data reaches for sizing *external* pointers
        dataLength: maxDataOffsetReached,
        totalKeys: metadataEntries.length,
        hashTableSize
    });


    // --- Final Buffer Assembly / Modification ---
    const tailBuffer = Buffer.concat([hashBuffers, serializedMetadata, footer]);

    if (isModification) {
        // Data was written in the loop. Now write the tail.
        // Determine where to write tail: append after maxDataOffsetReached
        const writeTailAt = maxDataOffsetReached;
        bufferWrapper.writeBuffer(writeTailAt, tailBuffer);

        // Update header bytes (magic, free list head?, packed sizes)
        // We only need to write the packed size byte we modified.
        const headerPackedSizeByteOffset = magicJSON.length + (isTopLevel ? freeSpaceManager.HEAD_POINTER_SIZE : 0);
        bufferWrapper.writeUInt8(headerPackedSizeByteOffset, headerByte1);
        // Ensure magic and freelist head are correct (usually shouldn't change during modify)

        // Truncate to the new end
        const finalSize = writeTailAt + tailBuffer.length;
        bufferWrapper.truncate(finalSize);

        return { finalSize }; // Return info about modification

    } else {
        // Assemble new buffer (This path is less likely with the modification-focused design)
        // Need temporary buffers if we didn't have bufferWrapper
         throw new Error("B\"H: New buffer creation path needs rework with allocation logic.");
        // const finalBuffer = Buffer.concat([
        //     Buffer.concat(headerBuffers),
        //     Buffer.concat(tempDataBuffers), // Requires collecting data if no wrapper
        //     tailBuffer
        // ]);
        // return finalBuffer;
    }
}

module.exports = serializeJSON;