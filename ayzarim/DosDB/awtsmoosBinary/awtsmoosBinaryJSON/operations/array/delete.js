// B"H
// Deleting from the Array, removing a point, reclaiming space, and truncating carefully.

const { magicArray, magicJSON } = require("../../constants.js");
const fileBuffer = require("../../../../fileBuffer.js"); // Adjust path if necessary
const { getMetadata, getHeaderInfo } = require("../../deserialize/getArray_v2.js");
const freeSpaceManager = require("../../modify/freeList.js");
const writeToBuffer = require('../../helpers/writeToBuffer.js'); // Assuming path is correct
const writeConditional = require('../../helpers/writeConditional.js'); // Assuming path is correct
const packTypeAndLengthSize = require('../../packing/packTypeAndLengthSize.js'); // Assuming path is correct
const { packedLength } = require('../../packing/packedLength.js'); // Assuming path is correct
const unpackTypeAndLengthSize = require('../../packing/unpackTypeAndLengthSize.js'); // Assuming path is correct
const { typesWith0Length } = require('../../parsing/typeInfo.js'); // Assuming path is correct

// Array Header Byte 1 Layout
const HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const HDR_ARRAY_LENGTH_SIZE_SHIFT = 3;

/**
 * Helper function to determine the minimum byte size required to store an offset.
 * @param {number} offset
 * @returns {1 | 2 | 4 | 8}
 */
function getRequiredOffsetSize(offset) {
     if (offset === 0) return 1;
     if (offset < 256) return 1;
     if (offset < 65536) return 2;
     if (offset < 4294967296) return 4;
     return 8;
}

/**
 * Calculates the end offset of the *allocated* data region for an array based on remaining offsets.
 * Included directly here.
 * @param {BufferWrapper} bufferWrapper The main buffer.
 * @param {Array<number>} remainingOffsets Absolute offsets of remaining items.
 * @param {number} headerLength Length of the array's header (or blob header if nested).
 * @returns {number} The offset marking the highest point reached by allocated data.
 */
function getEndOfArrayDataRegion(bufferWrapper, remainingOffsets, headerLength) {
    let maxEndOffset = headerLength; // Initialize with header end
    if (!bufferWrapper || !remainingOffsets) return headerLength;

    remainingOffsets.forEach(offset => {
        if (offset <= 0) return; // Skip zero or invalid offsets
        try {
            // Read item header at offset to find its length
            if (offset >= bufferWrapper.length) { // Check if offset is valid
                 console.warn(`B"H: Offset ${offset} out of bounds during data end calculation.`);
                 return;
            }
            const typeByte = bufferWrapper.readUInt8(offset);
            const { type: itemType, lengthSize: itemLengthSize } = unpackTypeAndLengthSize(typeByte);
            let itemHeaderSize = 1;
            let itemDataLength = 0;

            if (!typesWith0Length.includes(itemType)) {
                 const lengthOffset = offset + 1;
                 if (bufferWrapper.length < lengthOffset + itemLengthSize) {
                      console.warn(`B"H: Short buffer read for length at offset ${offset}.`);
                      return; // Cannot determine length
                 }
                 itemDataLength = bufferWrapper.readUIntBE(lengthOffset, itemLengthSize);
                 itemHeaderSize += itemLengthSize;
            }

            const blockEnd = offset + itemHeaderSize + itemDataLength;
            if (blockEnd > maxEndOffset) {
                maxEndOffset = blockEnd;
            }
        } catch (e) {
            // Ignore errors reading potentially corrupted/stale data during calculation
            console.warn(`B"H: Error reading item header at offset ${offset} during data end calculation: ${e.message}`);
        }
    });
    return maxEndOffset;
}


/**
 * Deletes an item by index from an Awtsmoos Array buffer. Truncates safely.
 * @param {string | BufferWrapper} filenameOrBuffer - Path or buffer wrapper.
 * @param {number} indexToDelete - The index of the item to remove.
 * @param {object} [options]
 * @param {object} [options.targetArrayMetadata=null] - If deleting from nested array, pass its metadata.
 * @param {BufferWrapper} [options.parentBufferWrapper=null] - If deleting from nested, pass the top-level buffer.
 * @returns {boolean} True on success, false on error or index out of bounds.
 */
function deleteFromArray(filenameOrBuffer, indexToDelete, { targetArrayMetadata = null, parentBufferWrapper = null } = {}) {
     const isNestedDelete = !!targetArrayMetadata;
     let bufferWrapper = null;
     let effectiveFreeSpaceHeadOffset = -1;

     // --- Setup Buffer Wrapper and Head Offset ---
     try {
         if (!isNestedDelete) {
             // Top-level delete
             if (typeof filenameOrBuffer === 'string') {
                 bufferWrapper = new fileBuffer(filenameOrBuffer);
             } else if (filenameOrBuffer && typeof filenameOrBuffer.readBuffer === 'function') {
                 bufferWrapper = filenameOrBuffer;
             } else { throw new Error("Invalid buffer/filename provided (top-level)."); }
             effectiveFreeSpaceHeadOffset = magicArray.length; // Top-level head offset after magic
         } else {
             // Nested delete
             if (!parentBufferWrapper || typeof parentBufferWrapper.readBuffer !== 'function') {
                  throw new Error("Invalid parentBufferWrapper provided for nested delete.");
             }
             bufferWrapper = parentBufferWrapper; // Use the parent buffer directly
             // Nested structures use parent's free space list. Find parent's head offset.
             const parentMagic = bufferWrapper.readBuffer(0, 2);
             if (parentMagic.equals(Buffer.from(magicArray)) || parentMagic.equals(Buffer.from(magicJSON))) {
                  effectiveFreeSpaceHeadOffset = parentMagic.length;
             } else { throw new Error("Parent buffer for nested delete is not valid."); }
         }
     } catch (e) {
          console.error("B\"H: Error setting up buffer for deleteFromArray:", e);
          return false;
     }


    // --- Basic Buffer/Index Checks ---
    const minHeaderSize = isNestedDelete ? 1 : (magicArray.length + freeSpaceManager.HEAD_POINTER_SIZE + 1);
    if (bufferWrapper.length < minHeaderSize) {
         console.error("B\"H: Buffer too small for deleteFromArray."); return false;
    }
    if (!isNestedDelete && !bufferWrapper.readBuffer(0, magicArray.length).equals(Buffer.from(magicArray))) {
         console.error("B\"H: Buffer is not an Awtsmoos Array for deleteFromArray (top-level)."); return false;
    }
    if (typeof indexToDelete !== 'number' || indexToDelete < 0) {
        console.error("B\"H: Invalid index provided for deleteFromArray."); return false;
    }


    // --- Get Current State ---
    let currentMetadata = isNestedDelete ? targetArrayMetadata : null;
    let currentOffsets = []; // Absolute offsets in parentBuffer

    try {
         if (!isNestedDelete) {
              currentMetadata = getMetadata(bufferWrapper, 0, true); // Get metadata for top-level array
              if (!currentMetadata) throw new Error("Failed to read top-level array metadata.");
         } else if(!currentMetadata) {
              throw new Error("targetArrayMetadata is required for nested delete.");
         } else if(!currentMetadata.isParentRelative) {
              console.error("B\"H: Deletion target is a non-parent-relative nested array. Direct deletion not supported.");
              return false; // Explicitly disallow modification of non-parent-relative nested
         }

        if (indexToDelete >= currentMetadata.arrayLength) {
             console.error(`B"H: Index ${indexToDelete} out of bounds for deleteFromArray (Length: ${currentMetadata.arrayLength}).`);
             return false;
        }

        // Read the current index table offsets (absolute offsets in bufferWrapper)
        const absoluteIndexTableOffset = currentMetadata.structureBufferOffset + currentMetadata.indexTableStart;
        if (absoluteIndexTableOffset + currentMetadata.indexTableByteLength > bufferWrapper.length) {
             throw new Error(`Index table bounds [${absoluteIndexTableOffset} - ${absoluteIndexTableOffset + currentMetadata.indexTableByteLength}] exceed buffer length ${bufferWrapper.length}.`);
        }
        const indexTableBuffer = bufferWrapper.readBuffer(
            absoluteIndexTableOffset,
            currentMetadata.indexTableByteLength
        );
        for (let i = 0; i < currentMetadata.arrayLength; i++) {
            const offset = indexTableBuffer.readUIntBE(i * currentMetadata.offsetSize, currentMetadata.offsetSize);
            currentOffsets.push(offset);
        }

    } catch (error) {
        console.error("B\"H: Failed to read current array state for deletion:", error);
        return false;
    }

    // --- Identify Item and Release Space ---
    if (indexToDelete >= currentOffsets.length) { // Sanity check after reading offsets
         console.error(`B"H: Index ${indexToDelete} invalid after reading offsets.`);
         return false;
    }
    const offsetToDelete = currentOffsets[indexToDelete]; // Absolute offset in bufferWrapper
    let releasedLength = 0;

    try {
        // Read the header of the item being deleted to find its total size (at its absolute offset)
         if (offsetToDelete <= 0) { // Check if offset is valid before reading
             console.warn(`B"H: Item at index ${indexToDelete} has offset 0 or less. Assuming zero length, no space to release.`);
             releasedLength = 0;
         } else if (offsetToDelete >= bufferWrapper.length) {
             console.error(`B"H: Offset ${offsetToDelete} for index ${indexToDelete} is out of buffer bounds (${bufferWrapper.length}). Cannot release space.`);
             releasedLength = 0; // Cannot determine length or release
         } else {
             const typeByte = bufferWrapper.readUInt8(offsetToDelete);
             const { type: itemType, lengthSize: itemLengthSize } = unpackTypeAndLengthSize(typeByte);
             let itemHeaderSize = 1;
             let itemDataLength = 0;

             if (!typesWith0Length.includes(itemType)) {
                  const lengthOffset = offsetToDelete + 1;
                  if (bufferWrapper.length < lengthOffset + itemLengthSize) {
                       throw new Error(`Buffer too short (len ${bufferWrapper.length}) to read deleted item's length (needed ${itemLengthSize} bytes at ${lengthOffset}).`);
                  }
                  itemDataLength = bufferWrapper.readUIntBE(lengthOffset, itemLengthSize);
                  itemHeaderSize += itemLengthSize;
             }
             releasedLength = itemHeaderSize + itemDataLength;

             // Release the space occupied by the item block
             if (releasedLength > 0) {
                  console.log(`B"H: Releasing space for index ${indexToDelete} at offset ${offsetToDelete}, length ${releasedLength}`);
                  freeSpaceManager.releaseSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, offsetToDelete, releasedLength);
             } else {
                  console.log(`B"H: Item at index ${indexToDelete} calculated zero length after reading header. No space to release.`);
             }
         }
    } catch (e) {
        console.error(`B"H: Error reading item header or releasing space for index ${indexToDelete} at offset ${offsetToDelete}:`, e);
        // Proceed, but space might be leaked or state inconsistent.
    }


    // --- Update In-Memory State ---
    const remainingOffsets = currentOffsets.filter((_, idx) => idx !== indexToDelete); // Create list of remaining absolute offsets
    const newArrayLength = remainingOffsets.length;

    // --- Determine New Index Table and Footer ---
    let maxOffset = 0;
    remainingOffsets.forEach(off => { if (off > maxOffset) maxOffset = off; });
    const newOffsetSize = (newArrayLength === 0 || maxOffset === 0) ? 1 : getRequiredOffsetSize(maxOffset); // Use helper based on remaining max

    const newArrayLengthInfo = writeConditional(newArrayLength);
    const newArrayLengthSize = newArrayLengthInfo.size;

    // Build new index table with absolute offsets
    const newIndexTable = Buffer.alloc(newArrayLength * newOffsetSize);
    let writeFailed = false;
    remainingOffsets.forEach((offset, i) => {
        if (writeFailed) return; // Stop if previous write failed
        if (getRequiredOffsetSize(offset) > newOffsetSize) {
             console.error(`B"H: Internal error - remaining offset ${offset} requires more than calculated newOffsetSize ${newOffsetSize}.`);
             writeFailed = true;
             return;
        }
        try {
             writeToBuffer(newIndexTable, offset, newOffsetSize, i * newOffsetSize);
        } catch (writeErr) {
             console.error(`B"H: Error writing offset ${offset} to new index table:`, writeErr);
             writeFailed = true;
        }
    });

    if (writeFailed) return false; // Abort if index table creation failed


    // --- Re-pack Header Byte ---
    const packedNewArrayLengthSize = packedLength(newArrayLengthSize);
    const packedNewInternalOffsetSize = packedLength(newOffsetSize); // Use the potentially reduced size
    if (packedNewArrayLengthSize === null || packedNewInternalOffsetSize === null) {
        console.error("B\"H: Failed to pack new array header sizes after deletion."); return false;
    }
    let newHeaderByte1 = 0;
    if (currentMetadata.isParentRelative) { // Preserve existing flag
        newHeaderByte1 |= (1 << HDR_IS_PARENT_RELATIVE_SHIFT);
    }
    newHeaderByte1 |= (packedNewInternalOffsetSize << HDR_INTERNAL_OFFSET_SIZE_SHIFT);
    newHeaderByte1 |= (packedNewArrayLengthSize << HDR_ARRAY_LENGTH_SIZE_SHIFT);


    // --- Write Updates to Buffer ---
    try {
        // Calculate position to write new tail (absolute offset in bufferWrapper)
        const absoluteIndexTableStart = currentMetadata.structureBufferOffset + currentMetadata.indexTableStart;
        const footerBuffer = Buffer.concat([newIndexTable, newArrayLengthInfo.buffer]);
        bufferWrapper.writeBuffer(absoluteIndexTableStart, footerBuffer); // Overwrite old table/length

        // Update header byte (absolute offset in bufferWrapper)
        const absoluteHeaderByteOffset = currentMetadata.structureBufferOffset + currentMetadata.headerByteOffset;
        bufferWrapper.writeUInt8(absoluteHeaderByteOffset, newHeaderByte1);

        // --- Refined Truncate (Only if top-level) ---
        if (isTopLevel) {
             const endOfNewTail = absoluteIndexTableStart + footerBuffer.length;
             // Find the highest end point of any *remaining* data block
             const arrayHeaderLength = magicArray.length + freeSpaceManager.HEAD_POINTER_SIZE + 1;
             const endOfLastRemainingData = getEndOfArrayDataRegion(bufferWrapper, remainingOffsets, arrayHeaderLength);
             // Truncate to the furthest point reached by either remaining data or the new tail
             const finalSize = Math.max(endOfLastRemainingData, endOfNewTail);

             bufferWrapper.truncate(finalSize);
             console.log(`B"H: Deleted item at index ${indexToDelete}. New length: ${newArrayLength}. Final buffer size: ${finalSize}`);
        } else {
             console.log(`B"H: Deleted item at index ${indexToDelete} from nested array. New length: ${newArrayLength}.`);
             // Caller handles potential shrinking of metadata blob.
        }

    } catch (e) {
        console.error("B\"H: Error writing updated array tail/header after deletion:", e);
        return false; // Indicate failure
    }

    return true; // Indicate success
}

module.exports = deleteFromArray;