// B"H
// Object Delete dispatcher. Handles top-level or delegates to nested logic.

const fileBuffer = require("../../../fileBuffer.js"); // Adjust path
const getObj = require("../../deserialize/get.js"); // Adjust path
const overwriteTail = require("./overwriteTail.js"); // Adjust path
const freeSpaceManager = require("./freeSpaceManager.js"); // Adjust path
const { magicJSON, magicArray } = require("../../constants.js"); // Adjust path
const { getMetadata: getArrayMeta, deserializeArray } = require('../../deserialize/getArray.js'); // Adjust path
const { AwtsmoosParentRelativeProxy } = require('../../deserialize/get.js'); // Import proxy
// Import helpers needed for nested rewrite logic
const serializeMetadataEntry = require('../../serialize/serializeMetadataEntry.js'); // Adjust path
const makeHashTableFromMetadata = require('../../serialize/makeHashTableFromMetadata.js'); // Adjust path
const getSerializedMetadata = require('../../serialize/getSerializedMetadata.js'); // Adjust path
const writeConditional = require('../../helpers/writeConditional.js'); // Adjust path
const { packedLength } = require('../../packing/packedLength.js'); // Adjust path

// Object Header Byte 1 Layout (ensure consistency)
const OBJ_HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const OBJ_HDR_KEY_LENGTH_SIZE_SHIFT = 3;
const OBJ_HDR_META_ARR_LEN_SIZE_SHIFT = 1;
const OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT = 0;

/**
 * Main entry point for deleting a key from an object.
 * Dispatches to top-level or nested logic.
 *
 * @param {string | BufferWrapper | AwtsmoosParentRelativeProxy} target - Filename, buffer, or proxy object.
 * @param {string} keyToDelete - The key to remove.
 * @param {object} [options]
 * @param {function} [options.updateParentCallback=null] - ASYNC Function(oldOffset, newOffset, newLength) needed IF target is proxy and blob shrinks.
 * @returns {Promise<boolean>} True on success/key not found, false on error.
 */
async function deleteKeyFromJSON(target, keyToDelete, { updateParentCallback = null } = {}) {
     if (target instanceof AwtsmoosParentRelativeProxy) {
          // --- Nested Object Delete Logic ---
          if (target._isArray) {
               console.error("B\"H: Cannot use deleteKeyFromJSON (object delete) on an array proxy.");
               return false;
          }
           if (!updateParentCallback || typeof updateParentCallback !== 'function') {
                // Required because deletion might shrink the blob, needing reallocation and parent update.
                console.error("B\"H: updateParentCallback function is required when deleting from a nested object proxy.");
                return false;
           }
          return await deleteFromNestedObject(target, keyToDelete, updateParentCallback);
     } else {
          // --- Top-Level Object Delete Logic ---
          // No callback needed for top-level
          return await deleteFromTopLevelObject(target, keyToDelete);
     }
}


/**
 * Handles deleting from a TOP-LEVEL object buffer.
*/
async function deleteFromTopLevelObject(filenameOrBuffer, keyToDelete) {
    let bufferWrapper;
    try {
        if (typeof filenameOrBuffer === 'string') {
            bufferWrapper = new fileBuffer(filenameOrBuffer);
        } else if (filenameOrBuffer && typeof filenameOrBuffer.readBuffer === 'function') {
            bufferWrapper = filenameOrBuffer;
        } else { throw new Error("Invalid buffer/filename provided (top-level)."); }
    } catch (e) { console.error("B\"H: Error opening/accessing buffer:", e); return false; }

    // --- Basic Buffer Checks ---
    const minRequiredLength = magicJSON.length + freeSpaceManager.HEAD_POINTER_SIZE + 1;
    if (bufferWrapper.length < minRequiredLength) {
         console.error(`B"H: Buffer too small (${bufferWrapper.length} bytes) for delete (min ${minRequiredLength}).`);
         // Allow continuing if exactly min length (initialized empty)
         if (bufferWrapper.length !== minRequiredLength) return false;
    }
    try {
        if (!bufferWrapper.readBuffer(0, magicJSON.length).equals(Buffer.from(magicJSON))) {
             if(bufferWrapper.readBuffer(0, magicArray.length).equals(Buffer.from(magicArray))) { console.error("..."); }
             else { console.error("..."); }
            return false;
        }
    } catch(e) { console.error("B\"H: Error reading magic bytes:", e); return false; }


    let currentMetadata = [];
    let structureRef = null;
    const effectiveFreeSpaceHeadOffset = magicJSON.length;

    // --- Get Current State (Top-Level) ---
    try {
        const headerInfo = getObj.getHeaderInfo(bufferWrapper, 0, true);
        if (!headerInfo) throw new Error("Failed to read header info.");
        const bufferEndOffset = bufferWrapper.length;
        const footerInfo = getObj.getOffsetSizesAndLengths(bufferWrapper, headerInfo, bufferEndOffset);

        if (!footerInfo) {
             if (bufferWrapper.length === minRequiredLength) {
                  console.log("B\"H: Top-level object is initialized but empty. Key not found.");
                  return true; // Key not found in empty object is success for delete
             } else { throw new Error("Failed to read footer info from seemingly non-empty buffer."); }
        } else {
             // Read metadata table info
             const metadataTableInfo = getObj.getMetadataTableInfo(bufferWrapper, footerInfo, bufferEndOffset);
              if (!metadataTableInfo || metadataTableInfo.startOffset < headerInfo.headerEndOffset || metadataTableInfo.endOffset > footerInfo.footerLengthsOffset) throw new Error("Invalid metadata table info.");
              // Read hash table info
              const hashTableInfo = getObj.getHashTableInfo(bufferWrapper, footerInfo, metadataTableInfo, bufferEndOffset);
              if (!hashTableInfo || hashTableInfo.startOffset < headerInfo.headerEndOffset || hashTableInfo.endOffset !== metadataTableInfo.startOffset) throw new Error("Invalid hash table info.");
             // Read metadata entries if they exist
             let metaOfMetaArray = null;
             if (metadataTableInfo.byteLength > 0) {
                  const metadataArrayBuffer = bufferWrapper.readBuffer(metadataTableInfo.startOffset, metadataTableInfo.byteLength);
                  metaOfMetaArray = getArrayMeta(metadataArrayBuffer, 0, false);
                  if (!metaOfMetaArray) throw new Error("Failed to get metadata of metadata array.");
                  if (metaOfMetaArray.arrayLength > 0) {
                       const rawMetaEntries = deserializeArray(metadataArrayBuffer, metaOfMetaArray);
                       if (!rawMetaEntries) throw new Error("Failed to deserialize metadata array.");
                       currentMetadata = rawMetaEntries.map(entryBuffer => getObj.parseMetadataEntry(entryBuffer)).filter(Boolean);
                       if(currentMetadata.length !== rawMetaEntries.length) console.warn("B\"H: Some top-level metadata entries failed to parse during state read.");
                  } else { currentMetadata = []; }
             } else { currentMetadata = []; }
             // Assign structureRef
             structureRef = { headerInfo, footerInfo, metadataTableInfo, hashTableInfo, metaOfMetaArray, bufferEndOffset, isTopLevel: true };
        }
    } catch (error) { console.error("B\"H: Failed to read top-level object state for deletion:", error); return false; }

    // --- Find and Remove Entry ---
    let entryFound = false;
    let releasedOffset = 0;
    let releasedLength = 0;

    const remainingMetadata = currentMetadata.filter(entry => {
        if (entry && entry.key === keyToDelete) { // Check entry validity
            entryFound = true;
            releasedOffset = entry.offsetOfValueInMain;
            releasedLength = entry.valueLength;
            return false;
        }
        return true;
    });

    if (!entryFound) {
        console.warn(`B"H: Key "${keyToDelete}" not found for deletion (top-level).`);
        return true; // Key not found is success for delete
    }

    // --- Release Data Space ---
    if (releasedLength > 0 && releasedOffset > 0) {
         if (releasedOffset + releasedLength <= bufferWrapper.length) { // Bounds check
              try {
                   console.log(`B"H: Releasing space at offset ${releasedOffset}, length ${releasedLength} (top-level)`);
                   freeSpaceManager.releaseSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, releasedOffset, releasedLength);
              } catch (e) { console.error("B\"H: Error releasing old space:", e); }
         } else { console.warn(`B\"H: Top-level entry data bounds invalid [${releasedOffset}..${releasedOffset+releasedLength}] vs buffer ${bufferWrapper.length}, skipping release.`); }
    } else {
         console.log(`B"H: Key "${keyToDelete}" has zero length or invalid offset. No space released.`);
    }

    // --- Rewrite Footer with Remaining Metadata ---
    try {
        overwriteTail(bufferWrapper, remainingMetadata, effectiveFreeSpaceHeadOffset);
    } catch (e) { console.error(`B"H: Error overwriting tail after deleting key "${keyToDelete}":`, e); return false; }

    console.log(`B"H: Successfully deleted key "${keyToDelete}" from top-level object.`);
    return true; // Indicate success
}


/**
 * Handles deleting from a NESTED parent-relative object.
 * Reallocates metadata blob if it shrinks. Requires parent update callback.
 *
 * @param {AwtsmoosParentRelativeProxy} proxy - The proxy representing the nested object.
 * @param {string} keyToDelete - Key to remove.
 * @param {function} updateParentCallback - ASYNC Function(oldOffset, newOffset, newLength) REQUIRED.
 * @returns {Promise<boolean>} True on success/key not found, false on error.
 */
async function deleteFromNestedObject(proxy, keyToDelete, updateParentCallback) {
     let newBlobInfo = null; // Track if parent update is needed
     let parentBufferWrapper;
     let nestedMetadata;
     let nestedBlobOffset;
     let nestedBlobLength;
     let parentFreeSpaceHeadOffset;

     try {
          // --- Validate and Extract Context ---
          parentBufferWrapper = proxy._parentBuffer;
          nestedMetadata = proxy._metadata;
          nestedBlobOffset = proxy._parentOffset;
          if (!parentBufferWrapper || !nestedMetadata || !nestedMetadata.isParentRelative || !nestedMetadata.footerInfo) throw new Error("Invalid proxy or metadata for nested delete.");
          if (!updateParentCallback || typeof updateParentCallback !== 'function') throw new Error("updateParentCallback is required for nested object delete.");
          nestedBlobLength = nestedMetadata.bufferEndOffset - nestedBlobOffset;

          const parentMagic = parentBufferWrapper.readBuffer(0, 2);
          if (parentMagic.equals(Buffer.from(magicArray)) || parentMagic.equals(Buffer.from(magicJSON))) { parentFreeSpaceHeadOffset = parentMagic.length; }
          else { throw new Error("Parent buffer invalid."); }

          // --- Get Current State of Nested Object ---
          let currentNestedMetadataEntries = [];
          if (nestedMetadata.metadataTableInfo && nestedMetadata.metaOfMetaArray && nestedMetadata.metadataTableInfo.byteLength > 0) {
               const objectMetaArrayBuffer = parentBufferWrapper.readBuffer( nestedMetadata.metadataTableInfo.startOffset, nestedMetadata.metadataTableInfo.byteLength );
               const rawMetaEntries = deserializeArray(objectMetaArrayBuffer, nestedMetadata.metaOfMetaArray);
               if (!rawMetaEntries) throw new Error("Failed to deserialize nested object's metadata array.");
               currentNestedMetadataEntries = rawMetaEntries.map(buf => getObj.parseMetadataEntry(buf)).filter(Boolean);
               currentNestedMetadataEntries.forEach(entry => { if (entry && !entry.valueLengthInfo) entry.valueLengthInfo = writeConditional(entry.valueLength); /* Add typeLengthByte if needed */});
          }

          // --- Find and Remove Entry ---
          let entryFound = false; let releasedOffset = 0; let releasedLength = 0;
          const remainingMetadata = currentNestedMetadataEntries.filter(entry => {
               if (entry && entry.key === keyToDelete) {
                    entryFound = true; releasedOffset = entry.offsetOfValueInMain; releasedLength = entry.valueLength; return false;
               } return true;
          });

          if (!entryFound) {
               console.warn(`B"H: Key "${keyToDelete}" not found for deletion within nested object.`);
               return true; // Key not found is success
          }

          // --- Release Data Space (in Parent) ---
           if (releasedLength > 0 && releasedOffset > 0) {
                if (releasedOffset + releasedLength <= parentBufferWrapper.length) {
                     try { freeSpaceManager.releaseSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, releasedOffset, releasedLength); } catch (e) { console.error("B\"H: Error releasing nested data space:", e); }
                } else { console.warn("B\"H: Nested entry data bounds invalid, skipping release."); }
           }

          // --- Rewrite the NESTED Object's Tail ---
          const finalizedNestedEntries = remainingMetadata;
          const finalNestedEntryCount = finalizedNestedEntries.length;
          const nestedInternalOffsetSize = nestedMetadata.footerInfo.sizeOfMetadataArrayOffsetSize; // Use existing size

          const serializedFinalEntries = finalizedNestedEntries.map(entry => {
               if (!entry.valueLengthInfo || typeof entry.typeLengthByte !== 'number') return null;
               if(entry.valueLength > 0 && entry.offsetOfValueInMain <= 0 && finalNestedEntryCount > 0) return null;
               try { return serializeMetadataEntry(entry); } catch(e){ return null; }
          }).filter(Boolean);
          if(serializedFinalEntries.length !== finalNestedEntryCount) console.warn("...");
          const successfulEntryCount = serializedFinalEntries.length;

          // Generate new blob content (handling empty case)
          let newNestedBlobContent;
          if (successfulEntryCount === 0) {
               // Generate empty object blob content
               const { footer: emptyFooter } = getSerializedMetadata({ serializedMetadataLength: 0, offsetSizeMetadataArray: 1, dataLength: 0, totalKeys: 0, hashTableSize: 0 });
               let finalNestedHeaderByte1 = 0;
               if (nestedMetadata.headerInfo.isParentRelative) finalNestedHeaderByte1 |= (1 << OBJ_HDR_IS_PARENT_RELATIVE_SHIFT);
               finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT);
               finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_KEY_LENGTH_SIZE_SHIFT);
               finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_META_ARR_LEN_SIZE_SHIFT);
               finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT);
               newNestedBlobContent = Buffer.concat([ Buffer.from([finalNestedHeaderByte1]), emptyFooter ]);
          } else {
               // Generate hash, meta array, footer for non-empty
               const { hashBuffers, serializedMetadata, hashTableSize } = makeHashTableFromMetadata(serializedFinalEntries, nestedInternalOffsetSize);
               let maxDataEndNested = 0; finalizedNestedEntries.forEach(e => { if(e.offsetOfValueInMain + e.valueLength > maxDataEndNested) maxDataEndNested = e.offsetOfValueInMain + e.valueLength; });
               const { footer: newFooterLengthsBuffer } = getSerializedMetadata({ serializedMetadataLength: serializedMetadata.length, offsetSizeMetadataArray: nestedInternalOffsetSize, dataLength: maxDataEndNested, totalKeys: successfulEntryCount, hashTableSize });
               const packedNestedInternalOffsetSize = packedLength(nestedInternalOffsetSize);
               const totalKeysInfo = writeConditional(successfulEntryCount);
               const metaArrayLengthInfo = writeConditional(serializedMetadata.length);
               const hashTableLengthInfo = writeConditional(hashTableSize);
               const keyLengthSizePacked = packedLength(totalKeysInfo.size);
               const metaArrayLengthSizePacked = packedLength(metaArrayLengthInfo.size);
               const hashTableLengthSizePacked = packedLength(hashTableLengthInfo.size);
               if (packedNestedInternalOffsetSize === null || keyLengthSizePacked === null || metaArrayLengthSizePacked === null || hashTableLengthSizePacked === null) throw new Error("Failed packing nested header sizes.");
               let newNestedHeaderByte1 = 0;
               if (nestedMetadata.headerInfo.isParentRelative) newNestedHeaderByte1 |= (1 << OBJ_HDR_IS_PARENT_RELATIVE_SHIFT);
               newNestedHeaderByte1 |= (packedNestedInternalOffsetSize << OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT);
               newNestedHeaderByte1 |= (keyLengthSizePacked << OBJ_HDR_KEY_LENGTH_SIZE_SHIFT);
               newNestedHeaderByte1 |= (metaArrayLengthSizePacked << OBJ_HDR_META_ARR_LEN_SIZE_SHIFT);
               newNestedHeaderByte1 |= (hashTableLengthSizePacked << OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT);
               newNestedBlobContent = Buffer.concat([ Buffer.from([newNestedHeaderByte1]), hashBuffers, serializedMetadata, newFooterLengthsBuffer ]);
          }
          let finalNestedBlobLength = newNestedBlobContent.length;


          // --- Check if blob needs re-allocation due to shrinking ---
          let finalNestedBlobOffset = nestedBlobOffset;
          if (finalNestedBlobLength < nestedBlobLength) {
               console.log("B\"H: Nested object metadata blob shrank. Re-allocating potentially smaller space.");
               freeSpaceManager.releaseSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, nestedBlobOffset, nestedBlobLength);
               const foundMetaSpace = freeSpaceManager.findFreeSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, finalNestedBlobLength);
               if (!foundMetaSpace) { finalNestedBlobOffset = parentBufferWrapper.length; } // Append if no fit
               else { finalNestedBlobOffset = freeSpaceManager.allocateSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, foundMetaSpace, finalNestedBlobLength); }
               // Inform caller that blob moved/resized
               newBlobInfo = { oldOffset: nestedBlobOffset, newOffset: finalNestedBlobOffset, newLength: finalNestedBlobLength };
               await updateParentCallback(nestedBlobOffset, finalNestedBlobOffset, finalNestedBlobLength);
          }
          // Note: Growth on delete is highly unlikely but handled defensively by previous check

          // Write the final nested blob content to its final determined location
          parentBufferWrapper.writeBuffer(finalNestedBlobOffset, newNestedBlobContent);
          console.log(`B"H: Nested object metadata updated after delete at offset ${finalNestedBlobOffset}, length ${finalNestedBlobLength}.`);

     } catch (e) {
          console.error(`B"H: Error during nested object delete for key "${keyToDelete}":`, e);
          return false; // Indicate failure
     }

     // Parent truncation happens later when parent is finalized
     console.log(`B"H: Successfully deleted key "${keyToDelete}" from nested object.`);
     return true; // Indicate success
}


module.exports = deleteKeyFromJSON;