// B"H
// Deserializing the Array, revealing items scattered in the parent's expanse or contained within.

const { magicArray, magicJSON } = require("./../constants.js");
const fileBuffer = require("../../fileBuffer.js"); // Adjust path
const { unpackLength, packedLength } = require("../packing/packedLength.js");
const unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");
const { typesWith0Length } = require("../parsing/typeInfo.js");
const freeSpaceManager = require("../modify/freeSpaceManager.js"); // For header size
const { AwtsmoosParentRelativeProxy } = require('./get.js'); // Import Proxy class

var temp = {};
var parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
        return parseValueFromType;
    }
});
// Avoid circular dependency for direct deserialize calls within get.js/getArray.js
// Rely on proxy mechanism or parseValueFromType which handles recursion.


// Array Header Byte 1 Layout (after magic, optional free list head)
const HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const HDR_ARRAY_LENGTH_SIZE_SHIFT = 3;
// Bits 2-0 are Reserved/Unused in current layout for arrays

/**
 * Parses the main header byte for an Array buffer.
 * @param {BufferWrapper} buffer
 * @param {number} offset Byte offset of the header byte itself.
 * @returns {{isParentRelative: boolean, internalOffsetSize: number, arrayLengthSize: number}}
 */
function parseHeaderByte1Array(buffer, offset) {
    const headerByte = buffer.readUInt8(offset);
    const isParentRelative = !!(headerByte & (1 << HDR_IS_PARENT_RELATIVE_SHIFT));
    const internalOffsetSizePacked = (headerByte >> HDR_INTERNAL_OFFSET_SIZE_SHIFT) & 0b11;
    const arrayLengthSizePacked = (headerByte >> HDR_ARRAY_LENGTH_SIZE_SHIFT) & 0b11;

    return {
        isParentRelative,
        internalOffsetSize: unpackLength(internalOffsetSizePacked),
        arrayLengthSize: unpackLength(arrayLengthSizePacked)
    };
}

/**
 * Gets header info for an array buffer.
 * @param {BufferWrapper} buffer The buffer containing the array structure.
 * @param {number} [startOffset=0] Offset where the array structure begins.
 * @param {boolean} [isTopLevel=true] Whether this is the root structure.
 */
function getHeaderInfo(buffer, startOffset = 0, isTopLevel = true) {
    if (typeof buffer === "string") buffer = new fileBuffer(buffer);

    const magicHeaderSize = magicArray.length + (isTopLevel ? freeSpaceManager.HEAD_POINTER_SIZE : 0) + 1; // Magic + Opt Free Head + HeaderByte1
    if (buffer.length < startOffset + magicHeaderSize) return null;

    const magic = buffer.subarray(startOffset, startOffset + magicArray.length);
    if (!magic.equals(Buffer.from(magicArray))) return null;

    let headerByteOffset = startOffset + magicArray.length + (isTopLevel ? freeSpaceManager.HEAD_POINTER_SIZE : 0);
    const headerInfo = parseHeaderByte1Array(buffer, headerByteOffset);

    return {
        ...headerInfo,
        headerByteOffset: headerByteOffset,
        headerEndOffset: headerByteOffset + 1,
        isTopLevel: isTopLevel
    };
}


/**
 * Extracts array metadata (sizes, lengths, offsets).
 * @param {BufferWrapper} buffer The buffer containing the array structure.
 * @param {number} [startOffset=0] Offset where the array structure begins.
 * @param {boolean} [isTopLevel=true] Whether this is the root structure.
 */
function getMetadata(buffer, startOffset = 0, isTopLevel = true) {
    if (typeof buffer === "string") buffer = new fileBuffer(buffer);

    const headerInfo = getHeaderInfo(buffer, startOffset, isTopLevel);
    if (!headerInfo) return null;

    const bufferToCheck = isTopLevel ? buffer : buffer.subarray(startOffset); // Use relevant buffer part
    const bufferEndOffset = bufferToCheck.length;

    // Read array length from the very end
    const arrayLengthSize = headerInfo.arrayLengthSize;
    if (bufferEndOffset < arrayLengthSize) return null;
    const arrayLengthOffset = bufferEndOffset - arrayLengthSize;
    const arrayLength = bufferToCheck.readUIntBE(arrayLengthOffset, arrayLengthSize);

    // Calculate Index Table info
    const offsetSize = headerInfo.internalOffsetSize; // This is the size used *within this array's* index table
    const indexTableByteLength = arrayLength * offsetSize;
    const indexTableEnd = arrayLengthOffset;
    const indexTableStart = indexTableEnd - indexTableByteLength;

    if (indexTableStart < headerInfo.headerEndOffset) { // Ensure index doesn't overlap header
        console.error("B\"H: Calculated index table start overlaps header.");
        return null;
    }

    return {
        ...headerInfo, // Include parsed header flags/sizes
        arrayLength,
        arrayLengthSize,
        offsetSize,         // Renamed from internalOffsetSize for clarity in array context
        indexTableStart,
        indexTableEnd,
        indexTableByteLength,
        structureBufferOffset: startOffset, // Original start offset of this array blob
        bufferEndOffset: bufferEndOffset // Logical end of this array blob
    };
}

/**
 * Reads the offset for a specific index from the index table.
 * @param {BufferWrapper} buffer The buffer containing the array structure.
 * @param {number} index The array index.
 * @param {object} arrayMetadata The result from getMetadata().
 * @returns {number} The offset read from the table.
 */
function getOffsetFromIndexTable(buffer, index, arrayMetadata) {
    const { indexTableStart, offsetSize, structureBufferOffset } = arrayMetadata;
    const readOffsetWithinTable = index * offsetSize;
    const absoluteReadOffset = structureBufferOffset + indexTableStart + readOffsetWithinTable;

    // Use the top-level buffer if accessing parent-relatively
    const bufferToReadFrom = buffer; // Assume buffer is the top-level one if needed

    return bufferToReadFrom.readUIntBE(absoluteReadOffset, offsetSize);
}


/**
 * Retrieves the value (or proxy) at a specific index.
 * Now accepts parent context for parent-relative lookups.
 *
 * @param {BufferWrapper} parentBuffer The top-level buffer.
 * @param {number} index The index to retrieve.
 * @param {object} arrayMetadata Metadata of the array structure (from getMetadata).
 * @param {boolean} [isProxyLookup=false] Internal flag indicating a call from a proxy.
 * @returns {any} The value, or a proxy, or undefined.
 */
function getValueByIndex(parentBuffer, index, arrayMetadata, isProxyLookup = false) {
    if (typeof parentBuffer === "string") parentBuffer = new fileBuffer(parentBuffer); // Should be wrapper already

    if (!arrayMetadata || index < 0 || index >= arrayMetadata.arrayLength) {
        console.warn(`B"H: Index ${index} out of bounds (0-${arrayMetadata?.arrayLength - 1}).`);
        return undefined;
    }

    // Get the offset stored in *this array's* index table.
    // This offset points to the item's block (header + data/metadata) in the *parentBuffer*.
    const itemBlockOffset = getOffsetFromIndexTable(parentBuffer, index, arrayMetadata);

    if (itemBlockOffset === 0 && arrayMetadata.offsetSize > 0) {
        // Assuming 0 offset signifies null/empty for non-zero offset sizes
        // This convention needs confirmation based on serialization logic.
        // If zero-length items use offset 0, we need to read the type first.
        // Let's read the type byte first to be sure.
    }

    try {
        // Read item header (TypeByte + LengthBytes) directly from parentBuffer at the stored offset
        const typeByte = parentBuffer.readUInt8(itemBlockOffset);
        const { type: itemType, lengthSize: itemLengthSize } = unpackTypeAndLengthSize(typeByte);

        let itemDataOffset = itemBlockOffset + 1; // Offset after type byte
        let itemDataLength = 0;

        if (!typesWith0Length.includes(itemType)) {
            if (parentBuffer.length < itemDataOffset + itemLengthSize) {
                 console.error("B\"H: Buffer too short to read item length."); return undefined;
            }
            itemDataLength = parentBuffer.readUIntBE(itemDataOffset, itemLengthSize);
            itemDataOffset += itemLengthSize;
        }

        // Buffer segment containing the item's actual data or nested metadata blob
        const itemValueBuffer = parentBuffer.subarray(itemDataOffset, itemDataOffset + itemDataLength);

        // --- Handle Nested Structures ---
        if (itemType === 1 || itemType === 3) { // Object or Array Blob
             const isNestedArray = itemType === 3;
             const { getHeaderInfo: getObjHeader } = require('./get.js'); // Avoid circular require at top level
             const { getMetadata: getObjMeta } = require('./get.js');

             // Parse the header of the *nested* structure's blob
             const nestedHeaderInfo = isNestedArray
                 ? getHeaderInfo(itemValueBuffer, 0, false) // isTopLevel=false
                 : getObjHeader(itemValueBuffer, 0, false); // isTopLevel=false

             if (!nestedHeaderInfo) {
                 console.error("B\"H: Failed to parse header of nested structure blob at index:", index);
                 return undefined;
             }

             // If the nested structure *itself* is parent-relative
             if (nestedHeaderInfo.isParentRelative) {
                 // Create and return a proxy
                 // Need to parse the full metadata of the nested blob first
                 const nestedMetadata = isNestedArray
                      ? getMetadata(itemValueBuffer, 0, false)
                      : getObjMeta(itemValueBuffer, 0, false); // Need obj getMetadata

                  if(!nestedMetadata) {
                       console.error("B\"H: Failed to get metadata for parent-relative nested structure at index:", index);
                       return undefined;
                  }

                   // --- Re-parse nested object metadata for proxy ---
                   // This requires the full parsing logic from get.js
                   let nestedStructureMetadataForProxy = null;
                   if(!isNestedArray) {
                        const { getOffsetSizesAndLengths, getMetadataTableInfo, getHashTableInfo } = require('./get.js');
                        const nestedFooterInfo = getOffsetSizesAndLengths(itemValueBuffer, nestedHeaderInfo, itemDataLength);
                        if(!nestedFooterInfo) { /* Err */ return undefined; }
                        const nestedMetaTableInfo = getMetadataTableInfo(itemValueBuffer, nestedFooterInfo, itemDataLength);
                         if(!nestedMetaTableInfo) { /* Err */ return undefined; }
                        const nestedHashTableInfo = getHashTableInfo(itemValueBuffer, nestedFooterInfo, nestedMetaTableInfo, itemDataLength);
                         if(!nestedHashTableInfo) { /* Err */ return undefined; }
                         // Get metadata of metadata array
                         const nestedMetaArrayBuffer = itemValueBuffer.subarray(nestedMetaTableInfo.startOffset, nestedMetaTableInfo.endOffset);
                         const metaOfNestedMetaArray = getMetadata(nestedMetaArrayBuffer, 0, false); // Use array getMetadata
                         if(!metaOfNestedMetaArray) { /* Err */ return undefined; }

                         nestedStructureMetadataForProxy = {
                              headerInfo: nestedHeaderInfo,
                              footerInfo: nestedFooterInfo,
                              metadataTableInfo: nestedMetaTableInfo,
                              hashTableInfo: nestedHashTableInfo,
                              metaOfMetaArray: metaOfNestedMetaArray,
                              bufferEndOffset: itemDataLength, // End offset within the blob
                              rawMetadata: deserializeArray(nestedMetaArrayBuffer, metaOfNestedMetaArray) // Use array deserializeArray
                         };
                   } else {
                        // Array metadata is simpler
                        nestedStructureMetadataForProxy = nestedMetadata; // Already parsed by array getMetadata
                   }
                   // --- End Re-parse ---


                 return new AwtsmoosParentRelativeProxy(
                     parentBuffer,
                     itemDataOffset, // Offset where the nested metadata blob starts
                     nestedStructureMetadataForProxy, // Pass the fully parsed nested metadata
                     isNestedArray
                 );

             } else {
                 // Nested structure is NOT parent-relative (self-contained blob)
                 // Deserialize it recursively using the itemValueBuffer (the blob)
                 const deserializer = isNestedArray ? deserializeArray : require('./get.js').deserializeBinary; // Get obj deserializer
                 return deserializer(itemValueBuffer); // Pass the blob buffer
             }
        } else {
            // --- Handle Simple Types ---
            const parsed = parseValueFromType({ type: itemType, value: itemValueBuffer });
            return parsed.value;
        }

    } catch (e) {
        console.error(`B"H: Error getting value at index ${index}:`, e);
        return undefined;
    }
}


/**
 * Helper function to get value by the raw data offset within an array buffer.
 * Used internally, e.g., by getMetadataByKey when processing the metadata array.
 * Assumes the offset points directly to the item's header.
 * @param {BufferWrapper} arrayBuffer The specific buffer for the Awtsmoos Array.
 * @param {number} itemBlockDataOffset Offset within the arrayBuffer's data region where the item block starts.
 * @param {object} arrayMetadata Metadata for *this specific* Awtsmoos Array.
 * @returns {{value: any, type: number, length: number } | null}
 */
function getValueByDataOffset(arrayBuffer, itemBlockDataOffset, arrayMetadata) {
     // This function needs access to the *data section* start offset if itemBlockDataOffset
     // is relative to the data section, not the start of the arrayBuffer.
     // Let's assume itemBlockDataOffset is relative to arrayBuffer start for simplicity here.
     // If it's relative to data section start, adjustments are needed.
     const itemBlockOffset = itemBlockDataOffset; // Assuming offset relative to buffer start

    try {
        const typeByte = arrayBuffer.readUInt8(itemBlockOffset);
        const { type: itemType, lengthSize: itemLengthSize } = unpackTypeAndLengthSize(typeByte);

        let itemDataOffset = itemBlockOffset + 1;
        let itemDataLength = 0;

        if (!typesWith0Length.includes(itemType)) {
             if (arrayBuffer.length < itemDataOffset + itemLengthSize) return null;
            itemDataLength = arrayBuffer.readUIntBE(itemDataOffset, itemLengthSize);
            itemDataOffset += itemLengthSize;
        }

        const itemValueBuffer = arrayBuffer.subarray(itemDataOffset, itemDataOffset + itemDataLength);

        // --- Important: Cannot create parent-relative proxies here ---
        // This function is for reading raw entries (like metadata buffers).
        // It should return the raw buffer for nested types.
        if(itemType === 1 || itemType === 3) {
             // Return the raw blob buffer
             return { value: itemValueBuffer, type: itemType, length: itemDataLength };
        } else {
            // Parse simple types
            const parsed = parseValueFromType({ type: itemType, value: itemValueBuffer });
            return { value: parsed.value, type: itemType, length: itemDataLength };
        }

    } catch (e) {
        console.error("B\"H: Error in getValueByDataOffset:", e);
        return null;
    }
}


/**
 * Deserializes an entire array buffer into a standard JavaScript array.
 * Handles parent-relative proxies correctly.
 *
 * @param {BufferWrapper} buffer The buffer containing the array structure.
 * @param {object} [precomputedMetadata=null] Optional precomputed metadata.
 * @returns {Array | null} The deserialized array or null on error.
 */
function deserializeArray(buffer, precomputedMetadata = null) {
    if (typeof buffer === "string") buffer = new fileBuffer(buffer);

    const metadata = precomputedMetadata || getMetadata(buffer, 0, true); // Assume top-level if no metadata passed
    if (!metadata) {
        console.error("B\"H: Invalid array buffer or failed to get metadata.");
        return null;
    }

    const result = [];
    for (let i = 0; i < metadata.arrayLength; i++) {
        // Pass the main buffer (could be parent or the array buffer itself if not nested)
        const value = getValueByIndex(buffer, i, metadata);
        result.push(value); // value might be a primitive, object, array, or proxy
    }

    return result;
}

module.exports = {
    getMetadata,
    getValueByIndex,
    deserializeArray, // Main entry point for full deserialization
    getHeaderInfo, // Export for use by others
    getValueByDataOffset // Export for internal use (e.g., get.js)
};