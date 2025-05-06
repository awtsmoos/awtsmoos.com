// B"H
// Revealing the structure, discerning the unified reality from the parent's expanse.

const { magicJSON, magicArray } = require("./../constants.js");
const fileBuffer = require("../../fileBuffer.js"); // Adjust path
const OffsetBuffer = require("../offsetBuffer.js"); // Used for non-parent-relative recursion
const { hashKey } = require("../helpers/hashing/misc.js");
const readConditional = require("../helpers/readConditional.js");
const unpackTypeAndLengthSize = require("../packing/unpackTypeAndLengthSize.js");
const { packedLength, unpackLength } = require("../packing/packedLength.js");
const freeSpaceManager = require("../modify/freeList.js"); // Needed for header size

var temp = {};
var parseValueFromType = null;
Object.defineProperty(temp, "parseValueFromType", {
    get() {
        if (!parseValueFromType) parseValueFromType = require("../parsing/fromType.js");
        return parseValueFromType;
    }
});
var deserializeBinary = null; // This will change how it's used
Object.defineProperty(temp, "deserializeBinary", {
    get() {
        if (!deserializeBinary) deserializeBinary = require("./obj.js");
        return deserializeBinary;
    }
});
var deserializeArray = null; // This will change how it's used
Object.defineProperty(temp, "deserializeArray", {
    get() {
        if (!deserializeArray) deserializeArray = require("./array.js");
        return deserializeArray;
    }
});

// Header Byte 1 Layout (from serialize/obj.js)
const HDR_IS_PARENT_RELATIVE_SHIFT = 7;
const HDR_INTERNAL_OFFSET_SIZE_SHIFT = 5;
const HDR_KEY_LENGTH_SIZE_SHIFT = 3;
const HDR_META_ARR_LEN_SIZE_SHIFT = 1;
const HDR_HASH_TBL_LEN_SIZE_SHIFT = 0;

/**
 * Represents a proxy for a parent-relative nested structure.
 */
class AwtsmoosParentRelativeProxy {
    constructor(parentBuffer, parentOffset, structureMetadata, isArray) {
        this._parentBuffer = parentBuffer;
        this._parentOffset = parentOffset; // Offset where this *metadata blob* starts in parent
        this._metadata = structureMetadata; // Parsed metadata of the nested struct
        this._isArray = isArray;
        this._cache = {}; // Simple cache for resolved values

        // Dynamically add properties or index accessors if needed,
        // but direct method calls (like getValue) are often cleaner.
    }

    /**
     * Retrieves a value by key (for objects).
     * @param {string} key
     * @returns {any}
     */
    getValue(key) {
        if (this._isArray) throw new Error("B\"H: Use getValueByIndex for arrays.");
        if (this._cache[key]) return this._cache[key];

        // Find key in *nested* metadata
        const entry = getMetadataByKey(
            this._parentBuffer, // Search within parent
            key,
            this._metadata.lengthSizes, // Use *nested* structure's sizes
            this._metadata, // Pass *nested* metadata reference
            true // Indicate this is a proxy lookup
        );

        if (!entry || entry.notFound) return undefined;

        // entry.offsetOfValueInMain now refers to offset *within the parent*
        const valueBuffer = this._parentBuffer.subarray(
            entry.offsetOfValueInMain,
            entry.offsetOfValueInMain + entry.valueLength
        );

        // Parse the actual value data
        const parsed = parseValueFromType({
            type: entry.valueType,
            value: valueBuffer
        });

        // Handle potential further nesting
        let result = parsed.value;
        if (result instanceof AwtsmoosParentRelativeProxy) {
             // If the parsed value is another proxy, return it directly
        } else if (
             (entry.valueType === 1 || entry.valueType === 3) &&
              typeof result === 'object' && result !== null && !Buffer.isBuffer(result)
             ) {
              // If it was deserialized into a plain object/array but *should* be a proxy
              // (this indicates the nested structure was *not* parent-relative itself)
              // We might need to wrap it or handle based on context.
              // For now, assume parseValueFromType handles creating proxies correctly.
         }

        this._cache[key] = result;
        return result;
    }

     /**
      * Retrieves a value by index (for arrays).
      * @param {number} index
      * @returns {any}
      */
     getValueByIndex(index) {
          if (!this._isArray) throw new Error("B\"H: Use getValue for objects.");
          const cacheKey = `_${index}`;
          if (this._cache[cacheKey]) return this._cache[cacheKey];

          // Use getArray functions, passing parent buffer and nested metadata
          // Requires getArray.getValueByIndex modification
          const { getArray } = require('./../deserialize/getArray.js'); // Lazy get
          const result = getArray.getValueByIndex(this._parentBuffer, index, this._metadata, true);

          this._cache[cacheKey] = result;
          return result;
     }

     // Could add getKeys(), map(), etc. that operate on the nested metadata
     getKeys() {
         if(this._isArray) return undefined; // Or throw?
         return this._metadata.rawMetadata.map(m => m.key); // Assuming rawMetadata is stored
     }

     get length() {
          if(!this._isArray) return undefined;
          return this._metadata.arrayLength; // Assuming stored from getArray.getMetadata
     }

     // Make iterable?
     *[Symbol.iterator]() {
         if (this._isArray) {
             for (let i = 0; i < this.length; i++) {
                 yield this.getValueByIndex(i);
             }
         } else {
             const keys = this.getKeys();
             for (const key of keys) {
                 yield [key, this.getValue(key)];
             }
         }
     }

     // Allow direct property access for objects (syntactic sugar)
     // This requires careful setup with Proxy if desired, or specific getter logic.
     // Example using a simple getter approach:
     getProperty(key) {
         return this.getValue(key);
     }
}


/**
 * Parses the main header byte after magic (and optional free list head).
 * @param {BufferWrapper} buffer
 * @param {number} offset Byte offset of the header byte itself.
 * @returns {{isParentRelative: boolean, internalOffsetSize: number, keyLengthSize: number, metadataArrayLengthSize: number, hashTableLengthSize: number}}
 */
function parseHeaderByte1Obj(buffer, offset) {
    const headerByte = buffer.readUInt8(offset);
    const isParentRelative = !!(headerByte & (1 << HDR_IS_PARENT_RELATIVE_SHIFT));
    const internalOffsetSizePacked = (headerByte >> HDR_INTERNAL_OFFSET_SIZE_SHIFT) & 0b11;
    const keyLengthSizePacked = (headerByte >> HDR_KEY_LENGTH_SIZE_SHIFT) & 0b11;
    const metadataArrayLengthSizePacked = (headerByte >> HDR_META_ARR_LEN_SIZE_SHIFT) & 0b11;
    const hashTableLengthSizePacked = (headerByte >> HDR_HASH_TBL_LEN_SIZE_SHIFT) & 0b01; // Only 1 bit

    return {
        isParentRelative,
        internalOffsetSize: unpackLength(internalOffsetSizePacked),
        lengthSizeOfKeys: unpackLength(keyLengthSizePacked), // Renamed for consistency
        sizeOfEmbeddedMetadataArrayLength: unpackLength(metadataArrayLengthSizePacked), // Renamed
        sizeOfHashTableLength: unpackLength(hashTableLengthSizePacked) // Renamed
    };
}

// Renamed from getLengthSizes to reflect header parsing
function getHeaderInfo(buffer, startOffset = 0, isTopLevel = true) {
    if (typeof buffer === "string") {
        buffer = new fileBuffer(buffer);
    }
    if (buffer.length < startOffset + magicJSON.length + 1) { // Magic + HeaderByte1
        return null;
    }
    const magic = buffer.subarray(startOffset, startOffset + magicJSON.length);
    if (!magic.equals(Buffer.from(magicJSON))) {
        // Could check for magicArray here too
        return null;
    }

    let headerByteOffset = startOffset + magicJSON.length;
    if (isTopLevel) {
         // Assume freelist head is present at top level
         headerByteOffset += freeSpaceManager.HEAD_POINTER_SIZE;
         if(buffer.length < headerByteOffset + 1) return null; // Check length again
    }

    const headerInfo = parseHeaderByte1Obj(buffer, headerByteOffset);

    return {
        ...headerInfo,
        headerByteOffset: headerByteOffset, // Where the parsed byte lives
        headerEndOffset: headerByteOffset + 1 // Where data potentially starts
    };
}


// getOffsetSizesAndLengths - Reads the *footer* lengths/sizes
// Needs the header info first to know the *sizes* of the length fields in the footer.
function getOffsetSizesAndLengths(buffer, headerInfo, bufferEndOffset) {
    try {
        if (typeof buffer === "string") buffer = new fileBuffer(buffer);
        if (!headerInfo) return null;

        const {
            lengthSizeOfKeys, // Size of the 'total keys' field in footer
            sizeOfEmbeddedMetadataArrayLength, // Size of 'metadata array byte length' field in footer
            sizeOfHashTableLength // Size of 'hash table slot count' field in footer
        } = headerInfo;

        // Footer Layout:
        // [Packed Footer Sizes Byte (1 byte)]
        // [Total Keys Count (dynamic size based on lengthSizeOfKeys)]
        // [Metadata Array Byte Length (dynamic size based on sizeOfEmbeddedMetadataArrayLength)]
        // [Hash Table Slot Count (dynamic size based on sizeOfHashTableLength)]

        // Calculate total size needed to read the footer lengths section
        const footerLengthsTotalStaticSize = 1; // Packed footer sizes byte
        const footerLengthsTotalDynamicSize = lengthSizeOfKeys + sizeOfEmbeddedMetadataArrayLength + sizeOfHashTableLength;
        const totalFooterLengthsSize = footerLengthsTotalStaticSize + footerLengthsTotalDynamicSize;

        if (bufferEndOffset < totalFooterLengthsSize) return null; // Not enough buffer

        // Read the footer lengths section from the end
        const footerLengthsOffset = bufferEndOffset - totalFooterLengthsSize;
        const footerLengthsBuffer = buffer.readBuffer(footerLengthsOffset, totalFooterLengthsSize);

        let offset = 0;
        const packedFooterSizesByte = footerLengthsBuffer.readUInt8(offset++);

        // Parse the packed footer sizes byte (assuming layout from getSerializedMetadata)
        // Layout: | 4 bits: Reserved? | 2 bits: offsetSizeInDataRegion | 2 bits: sizeOfMetadataArrayOffsetSize |
        const offsetSizeInDataRegionPacked = (packedFooterSizesByte >> 2) & 0b11;
        const sizeOfMetadataArrayOffsetSizePacked = packedFooterSizesByte & 0b11;

        const offsetSizeInDataRegion = unpackLength(offsetSizeInDataRegionPacked);
        const sizeOfMetadataArrayOffsetSize = unpackLength(sizeOfMetadataArrayOffsetSizePacked);

        // Read dynamic lengths from the footer buffer
        const lengthOfTotalEntries = footerLengthsBuffer.readUIntBE(offset, lengthSizeOfKeys);
        offset += lengthSizeOfKeys;

        const lengthMetadataArray = footerLengthsBuffer.readUIntBE(offset, sizeOfEmbeddedMetadataArrayLength); // Byte length
        offset += sizeOfEmbeddedMetadataArrayLength;

        const lengthHashTable = footerLengthsBuffer.readUIntBE(offset, sizeOfHashTableLength); // Slot count

        return {
            headerInfo, // Carry this forward
            lengthOfTotalEntries,
            lengthMetadataArray, // Byte length
            lengthHashTable,     // Slot count
            offsetSizeInDataRegion, // Offset size used for pointers *into* the data region
            sizeOfMetadataArrayOffsetSize, // Offset size used *within* the metadata array (and hash table entries)
            footerLengthsOffset // Start offset of this footer section we just read
        };
    } catch (e) {
        console.error("B\"H: Error reading offset sizes and lengths:", e);
        return null;
    }
}

// --- Functions to get specific table offsets/info using header and footer info ---

function getMetadataTableInfo(buffer, footerInfo, bufferEndOffset) {
    if (!footerInfo) return null;
    const { footerLengthsOffset, lengthMetadataArray } = footerInfo;
    // Metadata array is located *just before* the footer lengths section
    const metadataTableEnd = footerLengthsOffset;
    const metadataTableStart = metadataTableEnd - lengthMetadataArray;
    if (metadataTableStart < 0) return null; // Invalid offset
    return {
        startOffset: metadataTableStart,
        endOffset: metadataTableEnd,
        byteLength: lengthMetadataArray
    };
}

function getHashTableInfo(buffer, footerInfo, metadataTableInfo, bufferEndOffset) {
    if (!footerInfo || !metadataTableInfo) return null;
    const { lengthHashTable, sizeOfMetadataArrayOffsetSize } = footerInfo; // Hash entry size = metadata array offset size
    const hashTableEntrySize = sizeOfMetadataArrayOffsetSize;
    const hashTableByteLength = lengthHashTable * hashTableEntrySize;

    // Hash table is located *just before* the metadata array
    const hashTableEnd = metadataTableInfo.startOffset;
    const hashTableStart = hashTableEnd - hashTableByteLength;
    if (hashTableStart < 0) return null; // Invalid offset

    return {
        startOffset: hashTableStart,
        endOffset: hashTableEnd,
        byteLength: hashTableByteLength,
        entrySize: hashTableEntrySize,
        slotCount: lengthHashTable
    };
}


// getMetadataByKey - Needs refinement for proxy handling
// Added isProxyLookup flag
// StructureRef provides context (header info, table offsets) for the buffer being searched
function getMetadataByKey(buffer, key, lengthSizesIgnored, structureRef, isProxyLookup = false) {
    if (typeof buffer === "string") buffer = new fileBuffer(buffer);

    // Use structureRef for context instead of recalculating everything
    const {
        headerInfo,
        footerInfo,
        metadataTableInfo,
        hashTableInfo,
        bufferEndOffset // The logical end of this structure's data in the parent
    } = structureRef;

     if (!headerInfo || !footerInfo || !metadataTableInfo || !hashTableInfo) {
         console.warn("B\"H: Missing structure reference info in getMetadataByKey");
         // Attempt to recalculate if needed? Risky.
         return { key: null, notFound: true };
     }

    if (typeof key !== "string") key += '';


    const { startOffset: hashTableStart, slotCount: lengthHashTable, entrySize: hashTableEntrySize } = hashTableInfo;
    const { startOffset: metadataTableStart } = metadataTableInfo;
    const { sizeOfMetadataArrayOffsetSize } = footerInfo; // Offset size for metadata array

    let index = hashKey(key, lengthHashTable);
    let timesProbed = 0;

    while (timesProbed <= lengthHashTable) { // Prevent infinite loops
        const hashTableEntryOffset = hashTableStart + index * hashTableEntrySize;
        const offsetInMetadataArray = buffer.readUIntBE(hashTableEntryOffset, hashTableEntrySize);

        if (offsetInMetadataArray === 0) {
            // Empty slot or deleted entry (assuming 0 marks empty)
             index = (index + 1) % lengthHashTable;
             timesProbed++;
             continue; // Check next slot
        }

        // Now read the metadata entry *from the metadata array*
        // This requires deserializing the Awtsmoos Array entry format
        try {
            // Read the metadata entry buffer from the metadata array using the offset
            // We need to know the *format* of the metadata array elements (it's an Awtsmoos Array)
            // Let's assume getRawMetadataTable provides a way to get an entry by offset

            // --- Fetching entry from serialized metadata array ---
            // This needs a function like getArray.getValueByOffset within the metadata array buffer
            const metadataArrayBuffer = buffer.subarray(metadataTableInfo.startOffset, metadataTableInfo.endOffset);

             // Need metadata *of the metadata array itself*
             const { getArray } = require('./../deserialize/getArray.js'); // Lazy get
             const metaOfMetaArray = getArray.getMetadata(metadataArrayBuffer, 0, false); // Assume it's not top-level itself

             if(!metaOfMetaArray) {
                  console.error("B\"H: Could not get metadata for the metadata array itself.");
                  return { key: null, notFound: true };
             }
             // The offsetInMetadataArray is the offset *within the data section* of the metadata array buffer
             const metadataEntryData = getArray.getValueByDataOffset(metadataArrayBuffer, offsetInMetadataArray, metaOfMetaArray);

             if(!metadataEntryData || !metadataEntryData.value) {
                  console.error("B\"H: Could not retrieve metadata entry from array at offset:", offsetInMetadataArray);
                   index = (index + 1) % lengthHashTable;
                   timesProbed++;
                   continue;
             }

             // metadataEntryData.value should be the buffer for a single serialized metadata entry
            const parsedMetaEntry = parseMetadataEntry(metadataEntryData.value); // Use existing parser

            if (parsedMetaEntry && parsedMetaEntry.key === key) {
                 // Found the correct key!
                 // Add structure reference for context
                 parsedMetaEntry.structureRef = structureRef;
                 return parsedMetaEntry;
            } else if (parsedMetaEntry) {
                // Hash collision, check next slot
                index = (index + 1) % lengthHashTable;
                timesProbed++;
            } else {
                 // Error parsing entry or empty slot reached unexpectedly
                 console.warn("B\"H: Error parsing metadata entry or unexpected empty slot during probe for key:", key);
                 return { key: null, notFound: true }; // Treat as not found
            }
        } catch (e) {
            console.error(`B"H: Error processing hash table / metadata array for key "${key}":`, e);
            return { key: null, notFound: true }; // Error case
        }
    }

    // Looped through entire table without finding the key
    return { key: null, notFound: true };
}

/**
 * Parses a single metadata entry buffer back into an object.
 * Reads the extended format including type/value length size info.
 * @param {Buffer} metadataEntryBuffer - The raw buffer for one metadata entry.
 * @returns {object | null} Parsed entry object or null on error. Expected properties:
 *  key, valueType, valueLength, offsetOfValueInMain, typeLengthByte, valueLengthSize
 */
function parseMetadataEntry(metadataEntryBuffer) {
	try {
		var offset = 0;
        if (!metadataEntryBuffer || metadataEntryBuffer.length < 2) {
            console.warn("B\"H: Provided metadata entry buffer is too short or null.");
            return null;
        }

		// Read the packed sizes byte and type byte
		const packedLengthSizes = metadataEntryBuffer.readUInt8(offset++); // Byte 1: KeyLengthSize | OffsetSize
		const typeLengthByteVal = metadataEntryBuffer.readUInt8(offset++); // Byte 2: Type | ValueLengthSize

		// Unpack sizes from Byte 1
		const keyLengthByteSize = unpackLength((packedLengthSizes >> 2) & 0b11);
		const offsetValueByteSize = unpackLength(packedLengthSizes & 0b11); // Size for offsetOfValueInMain

        // Unpack from Byte 2
        const { type: valueType, lengthSize: valueLengthSize } = unpackTypeAndLengthSize(typeLengthByteVal);

        // Check buffer length before reading dynamic parts
        const minDynamicLength = keyLengthByteSize + valueLengthSize + offsetValueByteSize;
        if (metadataEntryBuffer.length < offset + minDynamicLength) {
             console.warn(`B"H: Metadata entry buffer too short for dynamic lengths. Needed ${minDynamicLength}, remaining ${metadataEntryBuffer.length - offset}`);
             return null;
        }

        // Read dynamic lengths
        const keyLength = metadataEntryBuffer.readUIntBE(offset, keyLengthByteSize);
		offset += keyLengthByteSize;
		const valueLength = metadataEntryBuffer.readUIntBE(offset, valueLengthSize);
        offset += valueLengthSize;
        const offsetOfValueInMain = metadataEntryBuffer.readUIntBE(offset, offsetValueByteSize);
        offset += offsetValueByteSize;

        // Check buffer length before reading key
        if (metadataEntryBuffer.length < offset + keyLength) {
             console.warn(`B"H: Metadata entry buffer too short for key data. Needed ${keyLength}, remaining ${metadataEntryBuffer.length - offset}`);
             return null;
        }

        // Read key buffer
		const keyBuffer = metadataEntryBuffer.subarray(offset, offset + keyLength);
		// offset += keyLength; // Offset advancement is implicitly handled by end of function

		return {
			key: keyBuffer.toString('utf8'),
			valueLength,
			valueType,
			offsetOfValueInMain,
            // Also return info needed for potential reserialization during rewrites
            typeLengthByte: typeLengthByteVal, // The raw second byte
            valueLengthSize: valueLengthSize   // The unpacked size of the valueLength field
		};
	} catch(e) {
        console.error("B\"H: Error in parseMetadataEntry:", e, metadataEntryBuffer ? metadataEntryBuffer.toString('hex') : 'null');
		return null;
	}
}

// getValueFromMetadata - Now uses parent context if needed
// Takes the parsed metadata entry *and* the buffer it belongs to
function getValueFromMetadata(parentBuffer, metadataEntry) {
    try {
        if (!metadataEntry || metadataEntry.notFound) {
            return undefined; // Use undefined for not found
        }

        const { valueType, valueLength, offsetOfValueInMain, structureRef } = metadataEntry;

        if (!structureRef) {
             console.warn("B\"H: Missing structureRef in getValueFromMetadata call for key:", metadataEntry.key);
             // Cannot determine parent-relative context without structureRef
             return undefined; // Or throw?
        }
        const { isParentRelative } = structureRef.headerInfo;

        // Get the buffer containing the value data or nested metadata blob
        const valueBuffer = parentBuffer.subarray(
            offsetOfValueInMain,
            offsetOfValueInMain + valueLength
        );

        // --- Handle Nested Structures ---
        if (valueType === 1 || valueType === 3) { // Object or Array
             // Check if the *nested* structure itself is parent-relative
             // We need to parse the header of the *nested* structure's blob
             const isArray = valueType === 3;
             const nestedHeaderInfo = isArray
                 ? require('./../deserialize/getArray.js').getHeaderInfo(valueBuffer, 0, false) // Pass buffer directly
                 : getHeaderInfo(valueBuffer, 0, false); // Pass buffer directly, isTopLevel=false

             if (!nestedHeaderInfo) {
                 console.error("B\"H: Failed to parse header of nested structure blob for key:", metadataEntry.key);
                 return undefined;
             }

             // If the *outer* structure is parent-relative, the nested structure *must* also be (by current design)
             // If the nested structure *itself* claims to be parent relative...
             if (nestedHeaderInfo.isParentRelative) {
                  // This means its *data* is in *its* parent (which is the 'parentBuffer' we have)
                  // We need to parse its full metadata to create the proxy

                  const nestedBufferEndOffset = offsetOfValueInMain + valueLength; // End of this blob in parent
                  const nestedFooterInfo = getOffsetSizesAndLengths(valueBuffer, nestedHeaderInfo, valueLength); // Use blob length as end offset
                  if(!nestedFooterInfo) { /* Handle error */ return undefined; }

                  const nestedMetaTableInfo = getMetadataTableInfo(valueBuffer, nestedFooterInfo, valueLength);
                   if(!nestedMetaTableInfo) { /* Handle error */ return undefined; }

                  const nestedHashTableInfo = isArray ? null : getHashTableInfo(valueBuffer, nestedFooterInfo, nestedMetaTableInfo, valueLength);
                   if(!isArray && !nestedHashTableInfo) { /* Handle error */ return undefined; }

                  // --- Get Metadata for the Nested Structure's Metadata Array ---
                  const nestedMetaArrayBuffer = valueBuffer.subarray(nestedMetaTableInfo.startOffset, nestedMetaTableInfo.endOffset);
                  const { getArray } = require('./../deserialize/getArray.js'); // Lazy get
                  const metaOfNestedMetaArray = getArray.getMetadata(nestedMetaArrayBuffer, 0, false);
                  if(!metaOfNestedMetaArray) { /* Handle error */ return undefined; }

                  // Store all parsed info needed by the proxy
                  const nestedStructureMetadata = {
                      headerInfo: nestedHeaderInfo,
                      footerInfo: nestedFooterInfo,
                      metadataTableInfo: nestedMetaTableInfo,
                      hashTableInfo: nestedHashTableInfo, // Null for arrays
                      metaOfMetaArray: metaOfNestedMetaArray, // Metadata of the metadata array
                      bufferEndOffset: nestedBufferEndOffset, // End offset of blob in parent
                       // Add rawMetadata array parsed from metaOfNestedMetaArray? Might be useful.
                       rawMetadata: getArray.deserializeArray(nestedMetaArrayBuffer, metaOfNestedMetaArray) // Deserialize the entries
                  };

                   // Return the proxy object
                   return new AwtsmoosParentRelativeProxy(
                       parentBuffer,          // Pass the parent buffer
                       offsetOfValueInMain,   // Pass offset where metadata blob starts
                       nestedStructureMetadata, // Pass parsed metadata
                       isArray
                   );

             } else {
                  // Nested structure is NOT parent-relative (self-contained blob)
                  // Deserialize it recursively using the original buffer segment
                  const nestedDeserializer = isArray ? temp.deserializeArray : temp.deserializeBinary;
                  // Need to pass the valueBuffer (the blob) to the deserializer
                   return nestedDeserializer(valueBuffer); // Standard recursive deserialization
             }
        } else {
            // --- Handle Simple Types ---
            const parsed = parseValueFromType({ type: valueType, value: valueBuffer });
            return parsed.value;
        }
    } catch (e) {
        console.error(`B"H: Error in getValueFromMetadata for key "${metadataEntry?.key}":`, e);
        return undefined;
    }
}


// getValueByKey - Top-level function to get a value
// Needs to build the initial structureRef
function getValueByKey(buffer, key) {
    if (typeof buffer === "string") buffer = new fileBuffer(buffer);

    // 1. Get Header Info
    const headerInfo = getHeaderInfo(buffer, 0, true); // Assume top-level object
    if (!headerInfo) return undefined;

    // 2. Get Footer Info (Lengths and Footer Sizes)
    const bufferEndOffset = buffer.length;
    const footerInfo = getOffsetSizesAndLengths(buffer, headerInfo, bufferEndOffset);
    if (!footerInfo) return undefined;

    // 3. Get Table Info (Offsets and Lengths of Hash Table & Metadata Array)
    const metadataTableInfo = getMetadataTableInfo(buffer, footerInfo, bufferEndOffset);
    if (!metadataTableInfo) return undefined;

    const hashTableInfo = getHashTableInfo(buffer, footerInfo, metadataTableInfo, bufferEndOffset);
    if (!hashTableInfo) return undefined;

     // --- Get Metadata for the Main Metadata Array ---
     const metadataArrayBuffer = buffer.subarray(metadataTableInfo.startOffset, metadataTableInfo.endOffset);
     const { getArray } = require('./../deserialize/getArray.js'); // Lazy get
     const metaOfMetaArray = getArray.getMetadata(metadataArrayBuffer, 0, false); // Assume not top-level itself
     if(!metaOfMetaArray) return undefined;


    // 4. Build Structure Reference
    const structureRef = {
        headerInfo,
        footerInfo,
        metadataTableInfo,
        hashTableInfo,
        metaOfMetaArray, // Include metadata of the metadata array
        bufferEndOffset,
        isTopLevel: true
    };

    // 5. Get Metadata Entry for the Key
    const metadataEntry = getMetadataByKey(buffer, key, null, structureRef);

    // 6. Get Value from Metadata Entry
    return getValueFromMetadata(buffer, metadataEntry);
}

// --- Map Object --- Needs updates to handle proxies
function mapObject(buffer, mapping, structureRef = null, parentBuffer = null) {
	if (typeof buffer === "string") buffer = new fileBuffer(buffer);

    let topLevelBuffer = parentBuffer || buffer; // The ultimate buffer
    let currentBuffer = buffer; // The buffer segment for the current structure (might be parent or a blob)

    // Build structureRef if not provided (top-level call)
     if (!structureRef) {
         const headerInfo = getHeaderInfo(currentBuffer, 0, !parentBuffer); // isTopLevel = true if no parentBuffer
         if (!headerInfo) return {};
         const bufferEndOffset = currentBuffer.length;
         const footerInfo = getOffsetSizesAndLengths(currentBuffer, headerInfo, bufferEndOffset);
         if (!footerInfo) return {};
         const metadataTableInfo = getMetadataTableInfo(currentBuffer, footerInfo, bufferEndOffset);
         if (!metadataTableInfo) return {};
         const isArray = false; // Assuming object mapping
         const hashTableInfo = getHashTableInfo(currentBuffer, footerInfo, metadataTableInfo, bufferEndOffset);
         if (!hashTableInfo) return {};

          // --- Get Metadata for the Metadata Array ---
          const metadataArrayBuffer = currentBuffer.subarray(metadataTableInfo.startOffset, metadataTableInfo.endOffset);
          const { getArray } = require('./../deserialize/getArray_v2.js'); // Lazy get
          const metaOfMetaArray = getArray.getMetadata(metadataArrayBuffer, 0, false);
          if(!metaOfMetaArray) return {};


         structureRef = { headerInfo, footerInfo, metadataTableInfo, hashTableInfo, metaOfMetaArray, bufferEndOffset, isTopLevel: !parentBuffer };
     }

	const keys = Object.keys(mapping);
	const result = {};

	for(const key of keys) {
		const conditionsOrSubMap = mapping[key];
		const metadataEntry = getMetadataByKey(topLevelBuffer, key, null, structureRef); // Always search top-level with current structure context

        if (!metadataEntry || metadataEntry.notFound) continue;

        // Logic for handling value based on type and conditionsOrSubMap
        const valueType = metadataEntry.valueType;
        const valueLength = metadataEntry.valueLength;
        const offsetInParent = metadataEntry.offsetOfValueInMain; // Offset is always relative to topLevelBuffer now

        if (valueType === 1 || valueType === 3) { // Nested Object or Array
             const isArray = valueType === 3;
              // Get the nested value representation (could be proxy or actual object/array)
             const nestedValue = getValueFromMetadata(topLevelBuffer, metadataEntry);

             if (nestedValue instanceof AwtsmoosParentRelativeProxy) {
                  if (typeof conditionsOrSubMap === 'object' && conditionsOrSubMap !== null) {
                       // Recursive map call, passing the proxy's metadata as the new structureRef
                       result[key] = isArray
                           ? mapArray(topLevelBuffer, conditionsOrSubMap, nestedValue._metadata, topLevelBuffer) // Need mapArray equivalent
                           : mapObject(topLevelBuffer, conditionsOrSubMap, nestedValue._metadata, topLevelBuffer);
                  } else if (conditionsOrSubMap) { // If condition is truthy (e.g., true), return the proxy itself
                       result[key] = nestedValue;
                  }
             } else if (typeof nestedValue === 'object' && nestedValue !== null) { // Non-parent-relative (already deserialized)
                   if (typeof conditionsOrSubMap === 'object' && conditionsOrSubMap !== null) {
                        // Need to map the already deserialized object/array
                        // This requires a different kind of mapping function or adapting mapObject/mapArray
                        console.warn("B\"H: Mapping already-deserialized nested structures not fully implemented yet.");
                        result[key] = nestedValue; // For now, just include if submap exists
                   } else if (conditionsOrSubMap) {
                        result[key] = nestedValue;
                   }
             }
             // Handle cases where nestedValue is null/undefined if necessary

        } else { // Simple Type
             const valueBuffer = topLevelBuffer.subarray(offsetInParent, offsetInParent + valueLength);
             const parsed = parseValueFromType({ type: valueType, value: valueBuffer });
             const value = parsed.value;

             if (typeof conditionsOrSubMap === 'object' && conditionsOrSubMap !== null) {
                 if (checkConditions(conditionsOrSubMap, value)) { // Assume checkConditions exists
                     result[key] = value;
                 }
             } else if (conditionsOrSubMap) { // Simple true condition
                 result[key] = value;
             }
        }
	}
	return result;
}


// --- Need mapArray equivalent for recursive mapping ---
// function mapArray(parentBuffer, mapping, structureRef, topLevelBuffer) { ... }


// Export necessary functions
module.exports = {
    getValueByKey,
	mapObject,
	// getEntryFromMetadata, // Less useful now? Value comes from proxy or direct parse.
	getMetadataByKey,
    // getKeys, // Use proxy.getKeys()
    // getMetadata, // Less useful top-level, use structureRef
    // getValueByHashingKey, // Alias for getValueByKey
	getHeaderInfo, // Renamed from getLengthSizes
	getOffsetSizesAndLengths,
	getHashTableInfo,
	getMetadataTableInfo,
    // getRawMetadataTable, // Internal detail, use structureRef + buffer access
    getValueFromMetadata, // Exported for potential direct use
    AwtsmoosParentRelativeProxy // Export the proxy class
};