// B"H
// Appending to the Array, triggering rewrite if parent offset grows too large.

const { magicArray, magicJSON } = require("../../constants.js");
const fileBuffer = require("../../../../fileBuffer.js"); // Adjust path if necessary
const { getMetadata, getHeaderInfo, deserializeArray } = require("../../deserialize/getArray_v2.js");
const serializeValue = require("../../serialize/serializeValue_v2.js");
const freeSpaceManager = require("../../freeList.js");
const writeToBuffer = require('../../helpers/writeToBuffer.js'); // Assuming path is correct
const writeConditional = require('../../helpers/writeConditional.js'); // Assuming path is correct
const packTypeAndLengthSize = require('../../packing/packTypeAndLengthSize.js'); // Assuming path is correct
const { packedLength } = require('../../packing/packedLength.js'); // Assuming path is correct
const unpackTypeAndLengthSize = require('../../packing/unpackTypeAndLengthSize.js'); // Assuming path is correct
const { typesWith0Length } = require('../../parsing/typeInfo.js'); // Assuming path is correct
// Import the rewrite helper (assuming it's in helpers.js relative to this file)
const { rewriteNestedStructure } = require("../helpers.js"); // Adjust path as needed

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
 * Included directly here as it was defined in deleteFromArray.js previously.
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
 * Appends a value to an Awtsmoos Array buffer. Handles offset size increase automatically.
 * @param {string | BufferWrapper} filenameOrBuffer - Path or buffer wrapper.
 * @param {object} options
 * @param {any} options.value - The value to append.
 * @param {boolean} [options.parentRelative=true] - Serialize nested structures parent-relatively.
 * @param {object} [options.targetArrayMetadata=null] - If appending to nested array, pass its metadata.
 * @param {BufferWrapper} [options.parentBufferWrapper=null] - If appending to nested, pass the top-level buffer.
 * @param {function} [options.updateParentCallback=null] - ***REQUIRED if nested***: Function(oldBlobOffset, newBlobOffset, newBlobLength) to update parent's pointer.
 * @returns {boolean} True on success, false on error.
 */
async function appendToArray(filenameOrBuffer, { value, parentRelative = true, targetArrayMetadata = null, parentBufferWrapper = null, updateParentCallback = null } = {}) {
    const isNestedAppend = !!targetArrayMetadata;
    let bufferWrapper = null;
    let effectiveFreeSpaceHeadOffset = -1;
    let isTopLevel = !isNestedAppend;

    // --- Setup Buffer Wrapper & Head Offset ---
    try {
        if (!isNestedAppend) {
            if (typeof filenameOrBuffer === 'string') {
                bufferWrapper = new fileBuffer(filenameOrBuffer);
            } else if (filenameOrBuffer && typeof filenameOrBuffer.readBuffer === 'function') {
                bufferWrapper = filenameOrBuffer;
            } else { throw new Error("Invalid buffer/filename provided (top-level)."); }
            effectiveFreeSpaceHeadOffset = magicArray.length;
        } else {
            if (!parentBufferWrapper || typeof parentBufferWrapper.readBuffer !== 'function') {
                 throw new Error("Invalid parentBufferWrapper provided for nested append.");
            }
            bufferWrapper = parentBufferWrapper;
            const parentMagic = bufferWrapper.readBuffer(0, 2);
            if (parentMagic.equals(Buffer.from(magicArray)) || parentMagic.equals(Buffer.from(magicJSON))) {
                 effectiveFreeSpaceHeadOffset = parentMagic.length;
            } else { throw new Error("Parent buffer for nested append is not valid."); }
            if (!updateParentCallback || typeof updateParentCallback !== 'function') {
                 throw new Error("updateParentCallback is required for nested array appends.");
            }
        }
    } catch (e) {
         console.error("B\"H: Error setting up buffer for appendToArray:", e);
         return false;
    }

    // --- Check Buffer Type and Initialize if Empty (Only for top-level) ---
    if (isTopLevel) {
        try {
             if (bufferWrapper.length < magicArray.length) {
                 const emptyArr = [];
                 // Assuming relative path to serialize/array.js is correct
                 const initialBuffer = require('../../serialize/array.js')(emptyArr, { isTopLevel: true, parentRelative });
                 if(!initialBuffer) throw new Error("Failed to serialize initial empty array.");
                 bufferWrapper.writeBuffer(0, initialBuffer); bufferWrapper.truncate(initialBuffer.length);
                 console.log("B\"H: Initialized empty Awtsmoos array buffer.");
             } else {
                 if (!bufferWrapper.readBuffer(0, magicArray.length).equals(Buffer.from(magicArray))) {
                      throw new Error("Buffer is not an Awtsmoos Array (top-level).");
                 }
             }
        } catch (e) {
             console.error("B\"H: Error initializing/validating buffer:", e); return false;
        }
    }

    // --- Get Current State ---
    let currentMetadata = isNestedAppend ? targetArrayMetadata : null;
    let currentOffsets = []; // Absolute offsets in bufferWrapper

    try {
        if (!isNestedAppend) {
             currentMetadata = getMetadata(bufferWrapper, 0, true);
             if (!currentMetadata) throw new Error("Failed to read top-level array metadata.");
        } else if (!currentMetadata || !currentMetadata.isParentRelative) {
             // Check if metadata is valid if passed in
             if (!currentMetadata) throw new Error("targetArrayMetadata missing for nested append.");
             if (!currentMetadata.isParentRelative) {
                 console.error("B\"H: Append target is a non-parent-relative nested array. Direct append not supported.");
                 return false; // Explicitly disallow modification of non-parent-relative nested
             }
        }

        // Read the current index table offsets
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
        console.error("B\"H: Failed to read current array state for append:", error);
        return false;
    }

    // --- Prepare New Item ---
    let valueInfo, dataToWrite, valueLength, itemHeaderBuffer, totalBlockSizeNeeded;
     try {
          valueInfo = serializeValue(value, { parentRelative, isTopLevel: false, bufferWrapper, freeSpaceHeadOffsetInParent: effectiveFreeSpaceHeadOffset });
          if(!valueInfo) throw new Error("Failed to serialize value.");
          dataToWrite = valueInfo.metadataBuffer || valueInfo.data;
          valueLength = dataToWrite.length;
          const itemHeaderLengthInfo = writeConditional(valueLength);
          const itemLengthSize = itemHeaderLengthInfo.size;
          const itemTypeLengthByteVal = packTypeAndLengthSize(valueInfo.type, itemLengthSize);
          if (itemTypeLengthByteVal === null) throw new Error("Failed to create type/length byte.");
          itemHeaderBuffer = Buffer.concat([ Buffer.from([itemTypeLengthByteVal]), typesWith0Length.includes(valueInfo.type) ? Buffer.alloc(0) : itemHeaderLengthInfo.buffer ]);
          totalBlockSizeNeeded = itemHeaderBuffer.length + valueLength;
     } catch (e) {
          console.error("B\"H: Error preparing new item:", e); return false;
     }

    // --- Allocate Space for New Item Block ---
    let newItemBlockOffset = 0; // Absolute offset in bufferWrapper
    let needsAppend = false;
    try {
        if (totalBlockSizeNeeded > 0) {
            const foundSpace = freeSpaceManager.findFreeSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, totalBlockSizeNeeded);
            if (!foundSpace) {
                needsAppend = true;
                newItemBlockOffset = bufferWrapper.length; // Tentative append offset
                console.warn(`B"H: No suitable free space found for new array item (size ${totalBlockSizeNeeded}). Will append at ~${newItemBlockOffset}.`);
            } else {
                newItemBlockOffset = freeSpaceManager.allocateSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, foundSpace, totalBlockSizeNeeded);
            }
        } else { newItemBlockOffset = 0; }
    } catch (e) { console.error("B\"H: Error allocating space:", e); return false; }


    // --- *** Check Offset Size Compatibility & Trigger Rewrite *** ---
    const requiredSizeForNewOffset = getRequiredOffsetSize(newItemBlockOffset);
    if (requiredSizeForNewOffset > currentMetadata.offsetSize) {
        console.warn(`B"H: Offset size mismatch detected! New item offset ${newItemBlockOffset} requires ${requiredSizeForNewOffset} bytes, array uses ${currentMetadata.offsetSize}. Triggering rewrite...`);

         if (!isNestedAppend) {
              console.error("B\"H: Cannot automatically rewrite top-level array due to offset size increase. Manual intervention needed.");
               if (!needsAppend && totalBlockSizeNeeded > 0) { try { freeSpaceManager.releaseSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, newItemBlockOffset, totalBlockSizeNeeded); } catch(e){} }
              return false;
         }

         try {
             // Call the rewrite helper
             const { newOffset: newBlobOffset, newLength: newBlobLength } = await rewriteNestedStructure(
                 bufferWrapper, // Parent buffer
                 currentMetadata.structureBufferOffset, // Where the OLD blob started
                 currentMetadata, // The OLD metadata
                 requiredSizeForNewOffset, // The NEW required size
                 effectiveFreeSpaceHeadOffset // Parent's free space head offset
             );

             // --- IMPORTANT: Update Parent ---
             await updateParentCallback(currentMetadata.structureBufferOffset, newBlobOffset, newBlobLength);

             // --- Refresh currentMetadata and offsets based on the NEW blob ---
             console.log("B\"H: Refreshing metadata after rewrite...");
             // Re-read metadata from the NEW location - need the actual blob
             // Reading directly from parent at new location might be complex if it was appended/moved
             // Let's assume re-reading the header gives us the new internal size
             const newBlobHeaderInfo = getHeaderInfo(bufferWrapper, newBlobOffset, false); // Read header at new location
             if (!newBlobHeaderInfo || newBlobHeaderInfo.internalOffsetSize !== requiredSizeForNewOffset) {
                  throw new Error("Failed to read or validate header info after rewrite.");
             }
             // Re-fetch full metadata based on the new blob location/header
             currentMetadata = getMetadata(bufferWrapper, newBlobOffset, false);
             if (!currentMetadata) throw new Error("Failed to re-read metadata after rewrite.");

             // Re-read offsets from the NEW index table location
             currentOffsets = [];
             const newAbsoluteIndexTableOffset = currentMetadata.structureBufferOffset + currentMetadata.indexTableStart;
             const newIndexTableBuffer = bufferWrapper.readBuffer(
                 newAbsoluteIndexTableOffset,
                 currentMetadata.indexTableByteLength
             );
             for (let i = 0; i < currentMetadata.arrayLength; i++) {
                 const offset = newIndexTableBuffer.readUIntBE(i * currentMetadata.offsetSize, currentMetadata.offsetSize);
                 currentOffsets.push(offset);
             }
             console.log("B\"H: Metadata and offsets refreshed.");

         } catch (rewriteError) {
              console.error("B\"H: Failed to rewrite nested structure:", rewriteError);
               if (!needsAppend && totalBlockSizeNeeded > 0) { try { freeSpaceManager.releaseSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, newItemBlockOffset, totalBlockSizeNeeded); } catch(e){} }
              return false;
         }
    }
    // --- *** End Check / Rewrite *** ---


    // --- Write the new item block (might be writing again if rewrite happened) ---
    try {
         if (totalBlockSizeNeeded > 0) {
              // Ensure buffer is large enough if appending (fileBuffer handles this)
              bufferWrapper.writeBuffer(newItemBlockOffset, itemHeaderBuffer);
              bufferWrapper.writeBuffer(newItemBlockOffset + itemHeaderBuffer.length, dataToWrite);
              console.log(`B"H: Wrote new item block at offset ${newItemBlockOffset}`);
         }
    } catch (e) {
         console.error(`B"H: Error writing final item block at offset ${newItemBlockOffset}:`, e);
         return false;
    }


    // --- Update In-Memory State ---
    currentOffsets.push(newItemBlockOffset); // Add the final, correct offset
    const newArrayLength = currentOffsets.length;

    // --- Determine New Index Table and Footer ---
    const offsetSize = currentMetadata.offsetSize; // Use current (possibly updated) size
    const newArrayLengthInfo = writeConditional(newArrayLength);
    const newArrayLengthSize = newArrayLengthInfo.size;
    const newIndexTable = Buffer.alloc(newArrayLength * offsetSize);
    currentOffsets.forEach((offset, i) => {
        writeToBuffer(newIndexTable, offset, offsetSize, i * offsetSize);
    });

    // --- Re-pack Header Byte ---
    const packedArrayLengthSize = packedLength(newArrayLengthSize);
    const packedInternalOffsetSize = packedLength(offsetSize);
    if (packedArrayLengthSize === null || packedInternalOffsetSize === null) {
        console.error("B\"H: Failed to pack new array header sizes."); return false;
    }
    let newHeaderByte1 = 0;
    if (currentMetadata.isParentRelative) newHeaderByte1 |= (1 << HDR_IS_PARENT_RELATIVE_SHIFT);
    newHeaderByte1 |= (packedInternalOffsetSize << HDR_INTERNAL_OFFSET_SIZE_SHIFT);
    newHeaderByte1 |= (packedArrayLengthSize << HDR_ARRAY_LENGTH_SIZE_SHIFT);

    // --- Write Updates to Buffer ---
    try {
        // Tail starts *within the array's potentially new blob location*
        const absoluteIndexTableStart = currentMetadata.structureBufferOffset + currentMetadata.indexTableStart;
        const footerBuffer = Buffer.concat([newIndexTable, newArrayLengthInfo.buffer]);
        bufferWrapper.writeBuffer(absoluteIndexTableStart, footerBuffer);

        // Update header byte *within the potentially new blob location*
        const absoluteHeaderByteOffset = currentMetadata.structureBufferOffset + currentMetadata.headerByteOffset;
        bufferWrapper.writeUInt8(absoluteHeaderByteOffset, newHeaderByte1);

        // --- Truncate buffer (only if top-level) ---
        if (isTopLevel) {
            const endOfNewTail = absoluteIndexTableStart + footerBuffer.length;
            const headerLenForDataEnd = magicArray.length + freeSpaceManager.HEAD_POINTER_SIZE + 1;
            const endOfLastData = getEndOfArrayDataRegion(bufferWrapper, currentOffsets, headerLenForDataEnd);
            const finalSize = Math.max(endOfLastData, endOfNewTail);
            bufferWrapper.truncate(finalSize);
            console.log(`B"H: Appended to top-level array. New length: ${newArrayLength}. Final buffer size: ${finalSize}`);
        } else {
            console.log(`B"H: Appended to nested array. New length: ${newArrayLength}. Parent update handled by callback.`);
        }

    } catch (e) {
        console.error("B\"H: Error writing updated array tail/header:", e);
        return false;
    }

    return true; // Indicate success
}

module.exports = appendToArray;