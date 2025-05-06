// B"H
// Object Append dispatcher. Handles top-level or delegates to nested logic.

const { magicJSON, magicArray } = require("../../constants.js");
const fileBuffer = require("../../../fileBuffer.js"); // Adjust path if necessary
const getObj = require("../../deserialize/get.js"); // Adjust path if necessary
const serializeValue = require("../../serialize/serializeValue.js"); // Adjust path if necessary
const overwriteTail = require("./overwriteTail.js"); // Assumes path is correct
const freeSpaceManager = require("./freeSpaceManager.js"); // Assumes path is correct
const { AwtsmoosParentRelativeProxy } = require('../../deserialize/get.js'); // Assumes path is correct
const { getMetadata: getArrayMeta, deserializeArray } = require('../../deserialize/getArray.js'); // Assumes path is correct
// Import the rewrite helper
const { rewriteNestedStructure } = require("./helpers.js"); // Assumes path is correct
// Import serialization helpers needed for nested rewrite
const serializeMetadataEntry = require('../../serialize/serializeMetadataEntry.js'); // Assumes path is correct
const makeHashTableFromMetadata = require('../../serialize/makeHashTableFromMetadata.js'); // Assumes path is correct
const getSerializedMetadata = require('../../serialize/getSerializedMetadata.js'); // Assumes path is correct
const writeConditional = require('../../helpers/writeConditional.js'); // Assumes path is correct
const { packedLength } = require('../../packing/packedLength.js'); // Assumes path is correct

// Object Header Byte 1 Layout (ensure consistency)
const OBJ_HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const OBJ_HDR_KEY_LENGTH_SIZE_SHIFT = 3;
const OBJ_HDR_META_ARR_LEN_SIZE_SHIFT = 1;
const OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT = 0;


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
 * Main entry point for appending/updating key-value pair in an object.
 * Dispatches to top-level or nested logic based on target.
 * Requires the caller to manage parent updates if a nested rewrite occurs.
 *
 * @param {string | BufferWrapper | AwtsmoosParentRelativeProxy} target - Filename, buffer, or proxy object.
 * @param {object} options
 * @param {string} options.key - The key to add/update.
 * @param {any} options.value - The value to add/update.
 * @param {boolean} [options.parentRelative=true] - Serialize nested structures parent-relatively.
 * @param {function} [options.updateParentCallback=null] - ASYNC Function(oldOffset, newOffset, newLength) needed IF target is proxy.
 * @returns {Promise<Array<object> | object | boolean>} Metadata list (top-level), result object (nested), or null/false on error.
 *          Nested result object: { success: boolean, newBlobInfo?: { oldOffset: number, newOffset: number, newLength: number }}
 *          The `newBlobInfo` is provided if the nested object's metadata blob was moved/resized, requiring the caller to update the parent.
 */
async function appendToJSON(target, { key, value, parentRelative = true, updateParentCallback = null } = {}) {
    if (target instanceof AwtsmoosParentRelativeProxy) {
        // --- Nested Object Append Logic ---
        if (target._isArray) {
             console.error("B\"H: Cannot use appendToJSON (object append) on an array proxy.");
             return { success: false };
        }
         if (!updateParentCallback || typeof updateParentCallback !== 'function') {
              console.error("B\"H: updateParentCallback function is required when appending to a nested object proxy.");
              return { success: false }; // Fail early if callback missing
         }
        return await appendToNestedObject(target, key, value, parentRelative, updateParentCallback);
    } else {
        // --- Top-Level Object Append Logic ---
        return await appendToTopLevelObject(target, key, value, parentRelative);
    }
}

/**
 * Handles appending to a TOP-LEVEL object buffer.
*/
async function appendToTopLevelObject(filenameOrBuffer, key, value, parentRelative) {
    let bufferWrapper;
    try {
        if (typeof filenameOrBuffer === 'string') {
            bufferWrapper = new fileBuffer(filenameOrBuffer);
        } else if (filenameOrBuffer && typeof filenameOrBuffer.readBuffer === 'function') {
            bufferWrapper = filenameOrBuffer;
        } else { throw new Error("Invalid buffer/filename provided (top-level)."); }
    } catch (e) { console.error("B\"H: Error opening/accessing buffer:", e); return null; }

    // --- Check Buffer Type and Initialize if Empty ---
    let currentMetadata = [];
    let structureRef = null;
    let isNewBuffer = false;
    const effectiveFreeSpaceHeadOffset = magicJSON.length;
    const minRequiredLength = magicJSON.length + freeSpaceManager.HEAD_POINTER_SIZE + 1;

    try {
        if (bufferWrapper.length < magicJSON.length) { // Needs init
             isNewBuffer = true;
             console.log("B\"H: Buffer is empty or too small. Initializing new Awtsmoos object.");
             const emptyObj = {};
             const initialBuffer = require('../../serialize/obj.js')(emptyObj, { isTopLevel: true, parentRelative });
             if (!initialBuffer) throw new Error("Failed to serialize initial empty object.");
             bufferWrapper.writeBuffer(0, initialBuffer); bufferWrapper.truncate(initialBuffer.length);
             console.log(`B"H: Initialized empty buffer. Size: ${initialBuffer.length}`);
        } else { // Check existing buffer
             const magic = bufferWrapper.readBuffer(0, magicJSON.length);
             if (!magic.equals(Buffer.from(magicJSON))) {
                  if (magic.equals(Buffer.from(magicArray))) {
                       console.warn("B\"H: Attempting object append on an array buffer.");
                       throw new Error("Cannot append object key to array buffer.");
                  } else { throw new Error("Buffer is not a valid Awtsmoos JSON."); }
             }
             if (bufferWrapper.length < minRequiredLength) {
                  throw new Error(`Buffer has magic bytes but is too short (${bufferWrapper.length} bytes, min ${minRequiredLength}). Likely corrupt.`);
             }
        }
    } catch (e) { console.error("B\"H: Error initializing/validating buffer:", e); return null; }


    // --- Get Current State (Top-Level) ---
    let headerInfo, footerInfo, metadataTableInfo, hashTableInfo, metaOfMetaArray; // Define vars outside try
    try {
        headerInfo = getObj.getHeaderInfo(bufferWrapper, 0, true);
        if (!headerInfo) throw new Error("Failed to read header info.");
        const bufferEndOffset = bufferWrapper.length;
        footerInfo = getObj.getOffsetSizesAndLengths(bufferWrapper, headerInfo, bufferEndOffset);

        if (!footerInfo) {
             if (isNewBuffer || bufferWrapper.length === minRequiredLength) { // Initialized but empty
                 currentMetadata = [];
                 footerInfo = { headerInfo, lengthOfTotalEntries: 0, lengthMetadataArray: 0, lengthHashTable: 0, offsetSizeInDataRegion: 1, sizeOfMetadataArrayOffsetSize: 1, footerLengthsOffset: bufferEndOffset };
                 metadataTableInfo = { startOffset: bufferEndOffset, endOffset: bufferEndOffset, byteLength: 0 };
                 hashTableInfo = { startOffset: bufferEndOffset, endOffset: bufferEndOffset, byteLength: 0, entrySize: 1, slotCount: 0 };
                 metaOfMetaArray = null;
             } else { throw new Error("Failed to read footer info from non-empty buffer."); }
        } else {
             metadataTableInfo = getObj.getMetadataTableInfo(bufferWrapper, footerInfo, bufferEndOffset);
             if (!metadataTableInfo || metadataTableInfo.startOffset < headerInfo.headerEndOffset || metadataTableInfo.endOffset > footerInfo.footerLengthsOffset) throw new Error("Invalid metadata table info.");
             hashTableInfo = getObj.getHashTableInfo(bufferWrapper, footerInfo, metadataTableInfo, bufferEndOffset);
             if (!hashTableInfo || hashTableInfo.startOffset < headerInfo.headerEndOffset || hashTableInfo.endOffset !== metadataTableInfo.startOffset) throw new Error("Invalid hash table info.");

             if (metadataTableInfo.byteLength > 0) {
                  const metadataArrayBuffer = bufferWrapper.readBuffer(metadataTableInfo.startOffset, metadataTableInfo.byteLength);
                  metaOfMetaArray = getArrayMeta(metadataArrayBuffer, 0, false);
                  if (!metaOfMetaArray) throw new Error("Failed to get metadata of metadata array.");
                  if (metaOfMetaArray.arrayLength > 0) {
                       const rawMetaEntries = deserializeArray(metadataArrayBuffer, metaOfMetaArray);
                       if (!rawMetaEntries) throw new Error("Failed to deserialize metadata array.");
                       currentMetadata = rawMetaEntries.map(entryBuffer => getObj.parseMetadataEntry(entryBuffer)).filter(Boolean);
                       if(currentMetadata.length !== rawMetaEntries.length) console.warn("B\"H: Some top-level metadata entries failed to parse.");
                  } else { currentMetadata = []; }
             } else { currentMetadata = []; metaOfMetaArray = null; }
        }
        structureRef = { headerInfo, footerInfo, metadataTableInfo, hashTableInfo, metaOfMetaArray, bufferEndOffset, isTopLevel: true };

    } catch (error) { console.error("B\"H: Failed to read top-level object state:", error); return null; }

    // --- Prepare New/Updated Entry ---
    let valueInfo, valueLength, dataToWrite;
    try {
        valueInfo = serializeValue(value, { parentRelative, isTopLevel: false });
        if (!valueInfo) throw new Error(`Failed to serialize value for key "${key}".`);
        valueLength = valueInfo.metadataBuffer ? valueInfo.metadataBuffer.length : valueInfo.data.length;
        dataToWrite = valueInfo.metadataBuffer || valueInfo.data;
        if (!valueInfo.valueLengthInfo || typeof valueInfo.typeLengthByte !== 'number') throw new Error("serializeValue missing required info.");
    } catch (e) { console.error("B\"H: Error preparing value:", e); return null; }

    // --- Handle Existing Key (Update/Delete) ---
    let existingEntryIndex = currentMetadata.findIndex(entry => entry && entry.key === key);
    if (existingEntryIndex > -1) {
        const oldEntry = currentMetadata[existingEntryIndex];
        console.log(`B"H: Updating key "${key}". Releasing old space at ${oldEntry.offsetOfValueInMain}, length ${oldEntry.valueLength}.`);
        if (oldEntry.valueLength > 0 && oldEntry.offsetOfValueInMain > 0) {
             if (oldEntry.offsetOfValueInMain + oldEntry.valueLength <= bufferWrapper.length) {
                  try { freeSpaceManager.releaseSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, oldEntry.offsetOfValueInMain, oldEntry.valueLength); }
                  catch (releaseError) { console.error("B\"H: Error releasing old space:", releaseError); }
             } else { console.warn("B\"H: Old entry data bounds invalid, skipping release."); }
        }
        currentMetadata.splice(existingEntryIndex, 1);
    }

    // --- Allocate Space ---
    let newOffset = 0;
    let needsAppend = false;
    if (valueLength > 0) {
        try {
            const foundSpace = freeSpaceManager.findFreeSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, valueLength);
            if (!foundSpace) {
                needsAppend = true;
                newOffset = 0; // Placeholder for append handled by overwriteTail
                console.warn(`B"H: No suitable free space found for key "${key}" (size ${valueLength}). Marking for append.`);
            } else {
                newOffset = freeSpaceManager.allocateSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, foundSpace, valueLength);
                bufferWrapper.writeBuffer(newOffset, dataToWrite); // Write data immediately
            }
        } catch (e) { console.error(`B"H: Error allocating space for key "${key}":`, e); return null; }
    } else { newOffset = 0; }

    // --- Create New Metadata Entry Object ---
    const newEntryObject = {
        key, valueType: valueInfo.type, valueLength,
        offsetOfValueInMain: newOffset, // Store allocated offset or 0 for append
        typeLengthByte: valueInfo.typeLengthByte,
        valueLengthInfo: valueInfo.valueLengthInfo,
        _dataToAppend: needsAppend ? dataToWrite : null // Attach data only if append needed
    };
    currentMetadata.push(newEntryObject);

    // --- Rewrite Footer ---
    try {
        overwriteTail(bufferWrapper, currentMetadata, effectiveFreeSpaceHeadOffset);
    } catch (e) { console.error(`B"H: Error overwriting tail for key "${key}":`, e); return null; }

    // Return final metadata list (cleaned)
    return currentMetadata.map(entry => {
         const cleanEntry = {...entry};
         delete cleanEntry._dataToAppend;
         return cleanEntry;
     });
}


/**
 * Handles appending to a NESTED parent-relative object.
 * Automatically attempts rewrite if offset size increases.
 * Returns object indicating success and if parent update is needed.
 *
 * @param {AwtsmoosParentRelativeProxy} proxy - The proxy representing the nested object.
 * @param {string} key - Key to add/update.
 * @param {any} value - Value to add/update.
 * @param {boolean} parentRelative - Option for serializing the value itself.
 * @param {function} updateParentCallback - ASYNC Function(oldOffset, newOffset, newLength) REQUIRED.
 * @returns {Promise<object>} { success: boolean, newBlobInfo?: { oldOffset: number, newOffset: number, newLength: number } }
 */
async function appendToNestedObject(proxy, key, value, parentRelative, updateParentCallback) {
    let newBlobInfo = null; // To inform caller if parent pointer needs update
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

        if (!parentBufferWrapper || !nestedMetadata || !nestedMetadata.headerInfo || !nestedMetadata.footerInfo || !nestedMetadata.isParentRelative) {
             throw new Error("Invalid proxy or metadata for nested append.");
        }
        if (!updateParentCallback || typeof updateParentCallback !== 'function') {
              throw new Error("updateParentCallback function is required for nested object append."); // Make explicit
         }
        nestedBlobLength = nestedMetadata.bufferEndOffset - nestedBlobOffset; // Calculate length

        const parentMagic = parentBufferWrapper.readBuffer(0, 2);
        if (parentMagic.equals(Buffer.from(magicArray)) || parentMagic.equals(Buffer.from(magicJSON))) {
            parentFreeSpaceHeadOffset = parentMagic.length;
        } else { throw new Error("Parent buffer invalid."); }

        // --- Get Current State of Nested Object ---
        let currentNestedMetadataEntries = [];
        if (nestedMetadata.metadataTableInfo && nestedMetadata.metaOfMetaArray && nestedMetadata.metadataTableInfo.byteLength > 0) {
             const objectMetaArrayBuffer = parentBufferWrapper.readBuffer(
                  nestedMetadata.metadataTableInfo.startOffset, // Absolute offset in parent
                  nestedMetadata.metadataTableInfo.byteLength
             );
             const rawMetaEntries = deserializeArray(objectMetaArrayBuffer, nestedMetadata.metaOfMetaArray);
             if (!rawMetaEntries) throw new Error("Failed to deserialize nested object's metadata array.");
             currentNestedMetadataEntries = rawMetaEntries.map(buf => getObj.parseMetadataEntry(buf)).filter(Boolean);
             currentNestedMetadataEntries.forEach(entry => { // Ensure valueLengthInfo exists
                  if (entry && !entry.valueLengthInfo) entry.valueLengthInfo = writeConditional(entry.valueLength);
                  if (entry && typeof entry.typeLengthByte !== 'number') { // Ensure typeLengthByte exists
                       const tlByte = require('../packing/packTypeAndLengthSize.js')(entry.valueType, entry.valueLengthInfo.size);
                       if (tlByte === null) throw new Error(`Failed reconstructing typeLengthByte for key ${entry.key}`);
                       entry.typeLengthByte = tlByte;
                  }
             });
        }


        // --- Prepare New/Updated Entry ---
        const valueInfo = serializeValue(value, { parentRelative, isTopLevel: false });
        if(!valueInfo || !valueInfo.valueLengthInfo || typeof valueInfo.typeLengthByte !== 'number') {
             throw new Error("Failed to serialize value or missing info.");
        }
        let valueLength = valueInfo.metadataBuffer ? valueInfo.metadataBuffer.length : valueInfo.data.length;
        let dataToWrite = valueInfo.metadataBuffer || valueInfo.data;


        // --- Handle Existing Key ---
        let existingEntryIndex = currentNestedMetadataEntries.findIndex(entry => entry && entry.key === key);
        if (existingEntryIndex > -1) {
             const oldEntry = currentNestedMetadataEntries[existingEntryIndex];
             if (oldEntry.valueLength > 0 && oldEntry.offsetOfValueInMain > 0) {
                  if(oldEntry.offsetOfValueInMain + oldEntry.valueLength <= parentBufferWrapper.length) {
                       try { freeSpaceManager.releaseSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, oldEntry.offsetOfValueInMain, oldEntry.valueLength); }
                       catch (e) { console.error("B\"H: Error releasing old nested space:", e); }
                  } else { console.warn("B\"H: Old nested entry data bounds invalid, skipping release.");}
             }
             currentNestedMetadataEntries.splice(existingEntryIndex, 1);
        }


        // --- Allocate Space in PARENT Buffer & Write Data ---
        let newOffsetInParent = 0;
        if (valueLength > 0) {
            const foundSpace = freeSpaceManager.findFreeSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, valueLength);
            if (!foundSpace) {
                 newOffsetInParent = parentBufferWrapper.length; // Append
                 parentBufferWrapper.writeBuffer(newOffsetInParent, dataToWrite);
                 console.log(`B"H: Appended nested data to parent at ${newOffsetInParent}`);
            } else {
                 newOffsetInParent = freeSpaceManager.allocateSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, foundSpace, valueLength);
                 parentBufferWrapper.writeBuffer(newOffsetInParent, dataToWrite); // Write allocated data
            }
        } else { newOffsetInParent = 0; }


        // --- Check Offset Size Compatibility & Trigger Rewrite ---
        const requiredSizeForNewOffset = getRequiredOffsetSize(newOffsetInParent);
        const currentInternalOffsetSize = nestedMetadata.footerInfo.sizeOfMetadataArrayOffsetSize;
        let finalNestedMetadata = nestedMetadata; // Use current unless rewrite happens
        let finalNestedBlobOffset = nestedBlobOffset;
        let finalNestedBlobLength = nestedBlobLength;

        if (requiredSizeForNewOffset > currentInternalOffsetSize) {
            console.warn(`B"H: Nested Object Offset size mismatch! Required: ${requiredSizeForNewOffset}, Current: ${currentInternalOffsetSize}. Triggering rewrite...`);
            const rewriteResult = await rewriteNestedStructure(
                parentBufferWrapper, nestedBlobOffset, nestedBlobLength,
                nestedMetadata, requiredSizeForNewOffset, parentFreeSpaceHeadOffset
            );
            newBlobInfo = { oldOffset: nestedBlobOffset, newOffset: rewriteResult.newOffset, newLength: rewriteResult.newLength };
            await updateParentCallback(nestedBlobOffset, newBlobInfo.newOffset, newBlobInfo.newLength);

            finalNestedBlobOffset = newBlobInfo.newOffset;
            finalNestedBlobLength = newBlobInfo.newLength;
            // Re-read metadata and entries after rewrite
            const newBlobData = parentBufferWrapper.readBuffer(finalNestedBlobOffset, finalNestedBlobLength);
            // Need getObj.getMetadata - Assume it parses header/footer/tables correctly
             const getMetadataResult = getObj.getMetadata(newBlobData, 0, false); // Adjust if getMetadata signature differs
             if (!getMetadataResult || !getMetadataResult.metadata) throw new Error("Failed to re-read nested metadata after rewrite.");
             finalNestedMetadata = getMetadataResult.metadata; // Assuming getMetadata returns structure like { metadata: {...parsed meta...}, ...}
             // Re-deserialize entries
             if (finalNestedMetadata.metadataTableInfo && finalNestedMetadata.metaOfMetaArray && finalNestedMetadata.metadataTableInfo.byteLength > 0) {
                  const newMetaArrayBuffer = newBlobData.subarray(finalNestedMetadata.metadataTableInfo.startOffset, finalNestedMetadata.metadataTableInfo.startOffset + finalNestedMetadata.metadataTableInfo.byteLength);
                  const newRawMetaEntries = deserializeArray(newMetaArrayBuffer, finalNestedMetadata.metaOfMetaArray);
                  if(!newRawMetaEntries) throw new Error("Failed deserializing entries after rewrite.");
                  currentNestedMetadataEntries = newRawMetaEntries.map(buf => getObj.parseMetadataEntry(buf)).filter(Boolean);
                  currentNestedMetadataEntries.forEach(entry => { if (entry && !entry.valueLengthInfo) entry.valueLengthInfo = writeConditional(entry.valueLength); /* Add typeLengthByte if needed */});
             } else { currentNestedMetadataEntries = []; }

        }
        // --- End Check / Rewrite ---


        // --- Create New Metadata Entry ---
        const newEntryObject = {
            key, valueType: valueInfo.type, valueLength,
            offsetOfValueInMain: newOffsetInParent, // Final offset in PARENT buffer
            typeLengthByte: valueInfo.typeLengthByte,
            valueLengthInfo: valueInfo.valueLengthInfo
        };
        currentNestedMetadataEntries.push(newEntryObject);


        // --- Rewrite the NESTED Object's Tail (in the parent buffer) ---
        const finalNestedEntriesForTail = currentNestedMetadataEntries;
        const finalNestedEntryCount = finalNestedEntriesForTail.length;
        // Use the potentially updated internal size from finalNestedMetadata
        const nestedInternalOffsetSize = finalNestedMetadata.footerInfo.sizeOfMetadataArrayOffsetSize;

        const serializedFinalEntries = finalNestedEntriesForTail.map(entry => {
             if (!entry.valueLengthInfo || typeof entry.typeLengthByte !== 'number') return null;
             if(entry.valueLength > 0 && entry.offsetOfValueInMain <= 0 && finalNestedEntryCount > 0) return null;
             try { return serializeMetadataEntry(entry); } catch(e){ return null; }
        }).filter(Boolean);
        if(serializedFinalEntries.length !== finalNestedEntryCount) console.warn("...");
        const successfulEntryCount = serializedFinalEntries.length;

        // Handle empty object state after potential filtering/deletion
        let newNestedBlobContent;
        if (successfulEntryCount === 0) {
             const { footer: emptyFooter } = getSerializedMetadata({ serializedMetadataLength: 0, offsetSizeMetadataArray: 1, dataLength: 0, totalKeys: 0, hashTableSize: 0 });
             let finalNestedHeaderByte1 = 0;
             if (finalNestedMetadata.headerInfo.isParentRelative) finalNestedHeaderByte1 |= (1 << OBJ_HDR_IS_PARENT_RELATIVE_SHIFT);
             finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT);
             finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_KEY_LENGTH_SIZE_SHIFT);
             finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_META_ARR_LEN_SIZE_SHIFT);
             finalNestedHeaderByte1 |= (packedLength(1) << OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT);
             newNestedBlobContent = Buffer.concat([ Buffer.from([finalNestedHeaderByte1]), emptyFooter ]);
        } else {
             const { hashBuffers, serializedMetadata, hashTableSize } = makeHashTableFromMetadata( serializedFinalEntries, nestedInternalOffsetSize );
             let maxDataEndNested = 0; finalNestedEntriesForTail.forEach(e => { if(e.offsetOfValueInMain + e.valueLength > maxDataEndNested) maxDataEndNested = e.offsetOfValueInMain + e.valueLength; });
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
             if (finalNestedMetadata.headerInfo.isParentRelative) newNestedHeaderByte1 |= (1 << OBJ_HDR_IS_PARENT_RELATIVE_SHIFT);
             newNestedHeaderByte1 |= (packedNestedInternalOffsetSize << OBJ_HDR_INTERNAL_OFFSET_SIZE_SHIFT);
             newNestedHeaderByte1 |= (keyLengthSizePacked << OBJ_HDR_KEY_LENGTH_SIZE_SHIFT);
             newNestedHeaderByte1 |= (metaArrayLengthSizePacked << OBJ_HDR_META_ARR_LEN_SIZE_SHIFT);
             newNestedHeaderByte1 |= (hashTableLengthSizePacked << OBJ_HDR_HASH_TBL_LEN_SIZE_SHIFT);
             newNestedBlobContent = Buffer.concat([ Buffer.from([newNestedHeaderByte1]), hashBuffers, serializedMetadata, newFooterLengthsBuffer ]);
        }

        // --- Check if blob needs re-allocation due to tail changes ---
        if (newNestedBlobContent.length > finalNestedBlobLength) {
             console.warn("B\"H: Nested object metadata blob grew during tail rewrite. Re-allocating...");
             freeSpaceManager.releaseSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, finalNestedBlobOffset, finalNestedBlobLength);
             const foundMetaSpace = freeSpaceManager.findFreeSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, newNestedBlobContent.length);
             if (!foundMetaSpace) { finalNestedBlobOffset = parentBufferWrapper.length; }
             else { finalNestedBlobOffset = freeSpaceManager.allocateSpace(parentBufferWrapper, parentFreeSpaceHeadOffset, foundMetaSpace, newNestedBlobContent.length); }
             finalNestedBlobLength = newNestedBlobContent.length;
             newBlobInfo = { oldOffset: proxy._parentOffset, newOffset: finalNestedBlobOffset, newLength: finalNestedBlobLength };
             await updateParentCallback(proxy._parentOffset, newBlobInfo.newOffset, newBlobInfo.newLength);
        } else if (newNestedBlobContent.length < finalNestedBlobLength) {
             console.log("B\"H: Nested metadata blob shrank during tail rewrite. Overwriting in place.");
              finalNestedBlobLength = newNestedBlobContent.length;
              if(newBlobInfo) newBlobInfo.newLength = finalNestedBlobLength; // Update if already changed
              else newBlobInfo = { oldOffset: proxy._parentOffset, newOffset: finalNestedBlobOffset, newLength: finalNestedBlobLength };
              // Callback needed even for shrink if offset is same but length changed
              await updateParentCallback(proxy._parentOffset, finalNestedBlobOffset, finalNestedBlobLength);
        }

        // Write the final nested blob content
        parentBufferWrapper.writeBuffer(finalNestedBlobOffset, newNestedBlobContent);
        console.log(`B"H: Nested object metadata updated at offset ${finalNestedBlobOffset}, length ${finalNestedBlobLength}.`);

        return { success: true, newBlobInfo: newBlobInfo }; // Indicate success and any blob move/resize

    } catch (e) {
        console.error(`B"H: Error during nested object append for key "${key}":`, e);
        return { success: false }; // Indicate failure
    }
}


module.exports = appendToJSON;