// B"H
// FILE serialize/array.js
// Serializing the Array, placing items within the parent or self, managing the sequence.

const { magicArray } = require("./../constants.js");
const writeConditional = require("../helpers/writeConditional.js");
const writeToBuffer = require("../helpers/writeToBuffer.js"); // Assuming this helper exists
const { typesWith0Length } = require("../parsing/typeInfo.js");
const serializeValue = require("./serializeValue.js");
const packTypeAndLengthSize = require("../packing/packTypeAndLengthSize.js");
const { packedLength } = require("../packing/packedLength.js");
const freeSpaceManager = require("../modify/freeSpaceManager.js");
const fileBuffer = require("../../../fileBuffer.js"); // Adjust path if needed

// Array Header Byte 1 Layout (Consistent with deserialize)
const HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const HDR_ARRAY_LENGTH_SIZE_SHIFT = 3;
// Bits 2-0 are Reserved/Unused for arrays

/**
 * @method serializeArray
 * @description Serializes an array, potentially placing nested data parent-relatively. Handles modification and new buffer creation.
 * @param {Array} arr - The array to serialize.
 * @param {object} [options] - Serialization options.
 * @param {boolean} [options.parentRelative=true] - Store nested data parent-relatively.
 * @param {boolean} [options.isTopLevel=true] - Is this the root structure being serialized?
 * @param {BufferWrapper} [options.bufferWrapper=null] - Existing buffer for modification.
 * @param {number} [options.freeSpaceHeadOffsetInParent=-1] - Parent's free space head offset.
 * @returns {Buffer | {finalSize: number}} - New buffer or final size if modifying.
 */
function serializeArray(arr, options = {}) {
    const {
        parentRelative = true,
        isTopLevel = true,
        bufferWrapper = null,
        freeSpaceHeadOffsetInParent = -1
    } = options;

    const isModification = !!bufferWrapper;

    // --- Header Setup ---
    const headerBuffers = [Buffer.from(magicArray)];
    let currentHeaderOffset = magicArray.length;
    let effectiveFreeSpaceHeadOffset = -1; // Offset where the head pointer *value* lives

    if (isTopLevel) {
        effectiveFreeSpaceHeadOffset = magicArray.length; // Head pointer value starts right after magic
        if (isModification) {
            // Assume head pointer exists, just note its size for header length calculation
            currentHeaderOffset += freeSpaceManager.HEAD_POINTER_SIZE;
        } else {
            // Create new head placeholder for new buffer
            const freeListHeadPlaceholder = Buffer.alloc(freeSpaceManager.HEAD_POINTER_SIZE);
            freeListHeadPlaceholder.writeUIntBE(0, 0, freeSpaceManager.HEAD_POINTER_SIZE);
            headerBuffers.push(freeListHeadPlaceholder);
            currentHeaderOffset += freeSpaceManager.HEAD_POINTER_SIZE;
        }
    } else {
        // Nested structures use the parent's head offset for allocations
        effectiveFreeSpaceHeadOffset = freeSpaceHeadOffsetInParent;
    }

    const packedSizesPlaceholder = Buffer.alloc(1); // Placeholder for header byte 1
    headerBuffers.push(packedSizesPlaceholder);
    const headerLength = headerBuffers.reduce((sum, buf) => sum + buf.length, 0);

    // --- Data Serialization & Allocation ---
    const finalItemOffsets = []; // Stores the absolute offsets of the final item blocks
    let maxDataOffsetReached = headerLength; // Track furthest reach of data/metadata
    let entriesNeedingAppend = []; // Store { itemBlockBuffer, originalIndex } for items that couldn't be allocated

    // Need bufferWrapper if modifying
    if (isModification && !bufferWrapper) {
        throw new Error("B\"H: bufferWrapper is required for array modification serialization.");
    }
     if (isModification && effectiveFreeSpaceHeadOffset < 0) {
          console.warn("B\"H: Invalid freeSpaceHeadOffsetInParent passed for array modification.");
           // Cannot reliably allocate without head offset. Should this throw?
           // Let's assume modification implies a valid head offset exists.
     }

    let tempNewDataBuffer = isModification ? null : Buffer.alloc(0); // Collect data for new buffer

    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        const childOptions = {
            parentRelative,
            isTopLevel: false, // Items are not top-level
            bufferWrapper,
            freeSpaceHeadOffsetInParent: effectiveFreeSpaceHeadOffset
        };

        const valueInfo = serializeValue(item, childOptions);

        let dataToWrite = null; // The actual data or nested metadata blob
        let valueLength = 0;

        if (valueInfo.metadataBuffer) {
            dataToWrite = valueInfo.metadataBuffer;
            valueLength = valueInfo.metadataBuffer.length;
        } else {
            dataToWrite = valueInfo.data;
            valueLength = valueInfo.data.length;
        }

        // Create Item Block Header
        const itemHeaderLengthInfo = writeConditional(valueLength);
        const itemLengthSize = itemHeaderLengthInfo.size;
        const itemTypeLengthByte = packTypeAndLengthSize(valueInfo.type, itemLengthSize);
        if (itemTypeLengthByte === null) {
            throw new Error(`B"H: Failed to create type/length byte for array item at index ${i}.`);
        }
        const itemHeaderBuffer = Buffer.concat([
            Buffer.from([itemTypeLengthByte]),
            typesWith0Length.includes(valueInfo.type) ? Buffer.alloc(0) : itemHeaderLengthInfo.buffer
        ]);
        const totalItemBlockSize = itemHeaderBuffer.length + valueLength;

        // Allocate space for the full item block (header + data/metadata)
        let itemBlockOffset = 0;
        let allocated = false;

        if (isModification && totalItemBlockSize > 0) {
            try {
                const foundSpace = freeSpaceManager.findFreeSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, totalItemBlockSize);
                if (foundSpace) {
                    itemBlockOffset = freeSpaceManager.allocateSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, foundSpace, totalItemBlockSize);
                    allocated = true;
                } else {
                     // Mark for append
                     console.warn(`B"H: No free space for array item index ${i} (size ${totalItemBlockSize}). Marking for append.`);
                     itemBlockOffset = 0; // Placeholder for append
                     allocated = false;
                }
            } catch (e) {
                 console.error(`B"H: Error allocating space for array item index ${i}:`, e);
                 // Mark for append as fallback? Or throw? Let's mark for append.
                 itemBlockOffset = 0;
                 allocated = false;
            }
        } else if (!isModification) {
             // New buffer creation: append conceptually
             itemBlockOffset = headerLength + tempNewDataBuffer.length; // Append after header + previous temp data
             allocated = true; // Treat as placed for offset calculation
        } else {
             // Modifying, but zero size block
             itemBlockOffset = 0; // No space needed
             allocated = true;
        }

         // Prepare the full item block buffer
         const fullItemBlockBuffer = Buffer.concat([itemHeaderBuffer, dataToWrite]);

        if (allocated && itemBlockOffset > 0) {
             if (isModification) {
                  // Write immediately if space was allocated
                  bufferWrapper.writeBuffer(itemBlockOffset, fullItemBlockBuffer);
             } else {
                  // Add to temporary buffer for new file creation
                  tempNewDataBuffer = Buffer.concat([tempNewDataBuffer, fullItemBlockBuffer]);
             }
             finalItemOffsets.push(itemBlockOffset); // Store final offset
        } else if (!allocated && totalItemBlockSize > 0) {
             // Needs appending later
             finalItemOffsets.push(0); // Add placeholder offset
             entriesNeedingAppend.push({ itemBlockBuffer: fullItemBlockBuffer, originalIndex: i });
        } else {
             // Zero size item
             finalItemOffsets.push(0); // Store 0 offset
        }

        // Update max offset tracker only if allocated
        if (allocated && itemBlockOffset > 0) {
            const currentEnd = itemBlockOffset + totalItemBlockSize;
            if (currentEnd > maxDataOffsetReached) {
                maxDataOffsetReached = currentEnd;
            }
        }
    } // End loop through array items

    // --- Append Pending Items (if modifying) ---
    if (isModification && entriesNeedingAppend.length > 0) {
         console.log(`B"H: Appending ${entriesNeedingAppend.length} items to array data region.`);
         // Start appending after the last known allocated data block
         let appendOffset = maxDataOffsetReached;
         for (const entry of entriesNeedingAppend) {
              bufferWrapper.writeBuffer(appendOffset, entry.itemBlockBuffer);
              // Update the placeholder offset in finalItemOffsets
              finalItemOffsets[entry.originalIndex] = appendOffset;
              appendOffset += entry.itemBlockBuffer.length;
         }
         maxDataOffsetReached = appendOffset; // Update max offset after appends
    } else if (!isModification) {
         // For new buffers, max offset is simply end of temp data
         maxDataOffsetReached = headerLength + tempNewDataBuffer.length;
    }

    // --- Determine Final Index Table and Footer ---
    const newArrayLength = arr.length;
    const newArrayLengthInfo = writeConditional(newArrayLength);
    const newArrayLengthSize = newArrayLengthInfo.size;

    // Recalculate internal offsetSize based on the *final highest offset*
    let finalMaxOffset = 0;
    finalItemOffsets.forEach(off => { if (off > finalMaxOffset) finalMaxOffset = off; });

    const newInternalOffsetSize = (newArrayLength === 0 || finalMaxOffset === 0) ? 1
                               : finalMaxOffset < 256 ? 1
                               : finalMaxOffset < 65536 ? 2
                               : finalMaxOffset < 4294967296 ? 4 : 8;

    // Build final index table
    const newIndexTable = Buffer.alloc(newArrayLength * newInternalOffsetSize);
    finalItemOffsets.forEach((offset, i) => {
        writeToBuffer(newIndexTable, offset, newInternalOffsetSize, i * newInternalOffsetSize);
    });

    // --- Final Footer (Index Table + Array Length) ---
    const footerBuffer = Buffer.concat([newIndexTable, newArrayLengthInfo.buffer]);

    // --- Pack Final Header Byte ---
    const packedNewArrayLengthSize = packedLength(newArrayLengthSize);
    const packedNewInternalOffsetSize = packedLength(newInternalOffsetSize);
    if (packedNewArrayLengthSize === null || packedNewInternalOffsetSize === null) {
        throw new Error("B\"H: Cannot pack final array header sizes.");
    }
    let finalHeaderByte1 = 0;
    if (parentRelative) { // Use the option passed in
        finalHeaderByte1 |= (1 << HDR_IS_PARENT_RELATIVE_SHIFT);
    }
    finalHeaderByte1 |= (packedNewInternalOffsetSize << HDR_INTERNAL_OFFSET_SIZE_SHIFT);
    finalHeaderByte1 |= (packedNewArrayLengthSize << HDR_ARRAY_LENGTH_SIZE_SHIFT);

    // --- Final Assembly / Modification Writes ---
    if (isModification) {
        // Write the footer (index table + length) after the last data/metadata block
        const writeTailAt = maxDataOffsetReached;
        bufferWrapper.writeBuffer(writeTailAt, footerBuffer);

        // Update header byte
        const headerPackedSizeByteOffset = magicArray.length + (isTopLevel ? freeSpaceManager.HEAD_POINTER_SIZE : 0);
        bufferWrapper.writeUInt8(headerPackedSizeByteOffset, finalHeaderByte1);

        // Truncate
        const finalSize = writeTailAt + footerBuffer.length;
        bufferWrapper.truncate(finalSize);
        console.log(`B"H: Array serialization modified. Final size: ${finalSize}`);
        return { finalSize };

    } else {
        // Assemble new buffer
        packedSizesPlaceholder.writeUInt8(finalHeaderByte1); // Fill placeholder in header buffer list
        const finalBuffer = Buffer.concat([
            Buffer.concat(headerBuffers), // Header with magic, opt freelist head, final packed byte
            tempNewDataBuffer,            // Concatenated data blocks
            footerBuffer                  // Index table + length
        ]);
        return finalBuffer;
    }
}

module.exports = serializeArray;