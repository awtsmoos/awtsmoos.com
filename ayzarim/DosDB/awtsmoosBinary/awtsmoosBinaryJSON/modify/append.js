// B"H
// Appending to the Object, finding space in the void or extending the expanse.

const { magicJSON, magicArray } = require("../../constants.js");
const fileBuffer = require("../../../fileBuffer.js"); // Adjust path
const getObj = require("../../deserialize/get.js");
const serializeValue = require("../../serialize/serializeValue.js");
const overwriteTail = require("./overwriteTail.js");
const freeSpaceManager = require("./freeSpaceManager.js");
const { AwtsmoosParentRelativeProxy } = require('../../deserialize/get.js');


/**
 * @method appendToJSON
 * @description Appends/updates a key-value pair in an Awtsmoos JSON object buffer.
 *              Uses free space manager for placing data.
 * @param {string | BufferWrapper} filenameOrBuffer - Path to file or buffer wrapper instance.
 * @param {object} options
 * @param {string} options.key - The key to add/update.
 * @param {any} options.value - The value to add/update.
 * @param {boolean} [options.parentRelative=true] - Serialize nested structures parent-relatively.
 * @returns {object | null} Updated metadata representation or null on error.
 */
function appendToJSON(filenameOrBuffer, { key, value, parentRelative = true } = {}) {
    let bufferWrapper;
    if (typeof filenameOrBuffer === 'string') {
        bufferWrapper = new fileBuffer(filenameOrBuffer);
    } else if (filenameOrBuffer && typeof filenameOrBuffer.readBuffer === 'function') {
        bufferWrapper = filenameOrBuffer;
    } else {
        console.error("B\"H: Invalid buffer/filename provided to appendToJSON.");
        return null;
    }

    if (key === undefined || key === null) {
        console.error("B\"H: Key cannot be undefined or null.");
        return null;
    }
    if (typeof key !== 'string') key = String(key);


    // --- Check Buffer Type and Initialize if Empty ---
    let currentMetadata = null;
    let structureRef = null;
    let isNewBuffer = false;
    if (bufferWrapper.length < magicJSON.length) {
        isNewBuffer = true;
        // Initialize empty object structure
        const emptyObj = {};
        const initialBuffer = require('../../serialize/obj.js')(emptyObj, { isTopLevel: true, parentRelative }); // Serialize empty
        bufferWrapper.writeBuffer(0, initialBuffer); // Write initial structure
        bufferWrapper.truncate(initialBuffer.length);
        console.log("B\"H: Initialized empty Awtsmoos object buffer.");
    } else {
        const magic = bufferWrapper.readBuffer(0, magicJSON.length);
        if (!magic.equals(Buffer.from(magicJSON))) {
            if (magic.equals(Buffer.from(magicArray))) {
                console.warn("B\"H: Attempting object append on an array buffer. Use array append.");
                // Delegate to array append if implemented
                const appendToArray = require('../array/append.js'); // Assumes it exists
                return appendToArray(bufferWrapper, { value: value, parentRelative }); // Key ignored for array append
            } else {
                console.error("B\"H: Buffer is not a valid Awtsmoos JSON or Array.");
                return null;
            }
        }
    }

    // --- Get Current State ---
    try {
        // Read existing structure reference (includes header, footer, table info)
        const headerInfo = getObj.getHeaderInfo(bufferWrapper, 0, true);
        if (!headerInfo) throw new Error("Failed to read header info.");
        const bufferEndOffset = bufferWrapper.length;
        const footerInfo = getObj.getOffsetSizesAndLengths(bufferWrapper, headerInfo, bufferEndOffset);
        if (!footerInfo) throw new Error("Failed to read footer info.");
        const metadataTableInfo = getObj.getMetadataTableInfo(bufferWrapper, footerInfo, bufferEndOffset);
        if (!metadataTableInfo) throw new Error("Failed to read metadata table info.");
        const hashTableInfo = getObj.getHashTableInfo(bufferWrapper, footerInfo, metadataTableInfo, bufferEndOffset);
        if (!hashTableInfo) throw new Error("Failed to read hash table info.");

         const metadataArrayBuffer = bufferWrapper.subarray(metadataTableInfo.startOffset, metadataTableInfo.endOffset);
         const { getMetadata: getArrayMeta, deserializeArray } = require('../../deserialize/getArray.js');
         const metaOfMetaArray = getArrayMeta(metadataArrayBuffer, 0, false);
         if(!metaOfMetaArray) throw new Error("Failed to get metadata of metadata array.");

        structureRef = { headerInfo, footerInfo, metadataTableInfo, hashTableInfo, metaOfMetaArray, bufferEndOffset, isTopLevel: true };

        // Deserialize current metadata entries
        currentMetadata = deserializeArray(metadataArrayBuffer, metaOfMetaArray); // Get array of buffer entries
        if(!currentMetadata) throw new Error("Failed to deserialize metadata array.");

         // Parse the buffer entries into usable objects
         currentMetadata = currentMetadata.map(entryBuffer => getObj.parseMetadataEntry(entryBuffer)).filter(Boolean); // Filter out null parse results

    } catch (error) {
        console.error("B\"H: Failed to read current object state:", error);
        return null;
    }

    // --- Prepare New/Updated Entry ---
    const effectiveFreeSpaceHeadOffset = magicJSON.length; // Assuming head is right after magic

    // Serialize the value (could be simple data or nested metadata blob)
    const valueInfo = serializeValue(value, {
        parentRelative,
        isTopLevel: false // Value itself isn't top-level
    });

    let valueLength = 0;
    let dataToWrite = null;

    if (valueInfo.metadataBuffer) { // Nested structure
        valueLength = valueInfo.metadataBuffer.length;
        dataToWrite = valueInfo.metadataBuffer;
    } else { // Simple value
        valueLength = valueInfo.data.length;
        dataToWrite = valueInfo.data;
    }

    // --- Handle Existing Key (Update/Delete) ---
    let existingEntryIndex = -1;
    let oldOffset = 0;
    let oldLength = 0;
    currentMetadata.forEach((entry, index) => {
        if (entry.key === key) {
            existingEntryIndex = index;
            oldOffset = entry.offsetOfValueInMain;
            oldLength = entry.valueLength;
        }
    });

    if (existingEntryIndex > -1) {
        console.log(`B"H: Updating key "${key}". Releasing old space.`);
        // Release old data space *before* allocating new space
        if (oldLength > 0) {
            freeSpaceManager.releaseSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, oldOffset, oldLength);
        }
        // Remove the old entry from our in-memory list
        currentMetadata.splice(existingEntryIndex, 1);
    }

    // --- Allocate Space for New Data/Metadata Blob ---
    let newOffset = 0;
    if (valueLength > 0) {
        // Use free space manager to find and allocate space
        try {
             const foundSpace = freeSpaceManager.findFreeSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, valueLength);
             if (!foundSpace) {
                 // Need to handle buffer extension / append logic here or in overwriteTail
                 console.warn(`B"H: No suitable free space found for key "${key}" (size ${valueLength}). Append needed.`);
                 // For now, assume overwriteTail will handle appending the tail,
                 // and we place the data conceptually *before* the appended tail.
                 // Calculate potential append offset based on current *logical* end derived from structureRef
                 newOffset = structureRef.bufferEndOffset; // Append right after current logical end? Risky.
                 // A safer approach: Let overwriteTail calculate final data region end *after* potential deletions
                 // and place the new data *before* writing the new tail. This requires passing dataToWrite to overwriteTail.
                  // Let's adopt passing dataToWrite to overwriteTail. Set offset=0 for now as placeholder.
                  newOffset = 0; // Placeholder, indicates append needed in overwriteTail

             } else {
                 newOffset = freeSpaceManager.allocateSpace(bufferWrapper, effectiveFreeSpaceHeadOffset, foundSpace, valueLength);
                 // Write the data immediately to the allocated space
                 bufferWrapper.writeBuffer(newOffset, dataToWrite);
             }
        } catch (e) {
            console.error(`B"H: Error allocating space for key "${key}":`, e);
            return null;
        }

    } else {
        newOffset = 0; // Offset is irrelevant for zero-length data
    }


     // --- Create New Metadata Entry ---
     // If newOffset is the placeholder 0, overwriteTail needs dataToWrite.
     // Otherwise, data is already written.
     const newEntry = {
         key,
         valueType: valueInfo.type,
         valueLength,
         offsetOfValueInMain: (newOffset !== 0) ? newOffset : 0, // Store actual offset or placeholder
         // Pass through needed info for serializeMetadataEntry
         typeLengthByte: valueInfo.typeLengthByte,
         valueLengthInfo: valueInfo.valueLengthInfo
     };

     // Add to in-memory metadata list
     currentMetadata.push(newEntry);


    // --- Rewrite Footer ---
    try {
        overwriteTail(
            bufferWrapper,
            currentMetadata,
            effectiveFreeSpaceHeadOffset,
            (newOffset === 0 && valueLength > 0) ? dataToWrite : null // Pass data only if append is needed
        );
    } catch (e) {
        console.error(`B"H: Error overwriting tail for key "${key}":`, e);
        // Attempt to rollback? Difficult. Maybe mark buffer as potentially corrupt.
        return null;
    }

    // Return the updated metadata list (in-memory representation)
    return currentMetadata;
}

module.exports = appendToJSON;