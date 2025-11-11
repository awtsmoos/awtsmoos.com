/**
 * B"H
 *
 * Client-side JavaScript module to parse a .awtsmoosJSON binary file into a
 * standard JavaScript object or array.
 *
 * This implementation is based on the logic of the provided server-side code,
 * adapted for the browser environment (using Uint8Array and DataView instead of Buffer).
 */

const MAGIC_JSON = "Aj";
const MAGIC_ARRAY = "Aa";

const textDecoder = new TextDecoder();

/**
 * Unpacks a 2-bit packed length into its byte size.
 * @param {number} lengthType - A 2-bit integer (0-3).
 * @returns {number} The byte size (1, 2, 4, or 8).
 */
function unpackLength(lengthType) {
    return [1, 2, 4, 8][lengthType] || 0;
}

/**
 * Unpacks a byte containing type and length size information.
 * @param {number} byte - The byte to unpack.
 * @returns {{type: number, lengthSize: number}}
 */
function unpackTypeAndLengthSize(byte) {
    const lengthType = byte >> 6;
    const type = byte & 0b00111111;
    return {
        type,
        lengthSize: unpackLength(lengthType)
    };
}

/**
 * A wrapper around a DataView to provide a Buffer-like reading experience.
 */
class BufferReader {
    constructor(arrayBuffer, byteOffset = 0, length) {
        if (arrayBuffer instanceof BufferReader) {
            this.dataView = arrayBuffer.dataView;
            this.byteOffset = arrayBuffer.byteOffset + byteOffset;
            this.length = length === undefined ? arrayBuffer.length - byteOffset : length;
        } else {
            this.dataView = new DataView(arrayBuffer);
            this.byteOffset = byteOffset;
            this.length = length === undefined ? arrayBuffer.byteLength - byteOffset : length;
        }
         // Keep a reference to the root buffer for subarray creation
        this.buffer = this.dataView.buffer;
    }

    readUInt8(offset) {
        return this.dataView.getUint8(this.byteOffset + offset);
    }

    readUIntBE(offset, byteLength) {
        switch (byteLength) {
            case 1:
                return this.dataView.getUint8(this.byteOffset + offset);
            case 2:
                return this.dataView.getUint16(this.byteOffset + offset, false);
            case 4:
                return this.dataView.getUint32(this.byteOffset + offset, false);
            case 8:
                return Number(this.dataView.getBigUint64(this.byteOffset + offset, false));
            default:
                throw new Error(`Unsupported byteLength for readUIntBE: ${byteLength}`);
        }
    }

    subarray(start, end) {
        const begin = this.byteOffset + (start || 0);
        const finish = end === undefined ? this.byteOffset + this.length : this.byteOffset + end;
        // Return a new BufferReader that is a view into the same underlying ArrayBuffer
        return new BufferReader(this.buffer, begin, finish - begin);
    }

    toString(encoding = 'utf-8', start = 0, end = this.length) {
        const sub = new Uint8Array(this.dataView.buffer, this.byteOffset + start, end - start);
        return textDecoder.decode(sub);
    }
}


/**
 * Parses a serialized value based on its type from a BufferReader.
 * @param {number} type - The type identifier.
 * @param {BufferReader} valueBuffer - The buffer containing the raw value data.
 * @returns {any} The parsed JavaScript value.
 */
function parseValueFromType(type, valueBuffer) {
    switch (type) {
        case 1: // Object
            return deserializeObject(valueBuffer);
        case 3: // Array
            return deserializeArray(valueBuffer);
        case 2: // String
            return valueBuffer.toString();
        case 4: return valueBuffer.readUIntBE(0, 1); // uint8
        case 9: return valueBuffer.readUIntBE(0, 2); // uint16
        case 10: return valueBuffer.readUIntBE(0, 4); // uint32
        case 22: return valueBuffer.readUIntBE(0, 8); // uint64
        case 5: return true;
        case 0: return false;
        case 6: return undefined;
        case 7: return null;
        case 8: // Buffer
             return new Uint8Array(valueBuffer.buffer, valueBuffer.byteOffset, valueBuffer.length);
        default:
            console.warn(`Unsupported type ${type} encountered during parsing.`);
            return new Uint8Array(valueBuffer.buffer, valueBuffer.byteOffset, valueBuffer.length);
    }
}

/**
 * Deserializes an entire Awtsmoos Array buffer.
 * @param {BufferReader} buffer - The buffer containing the array data.
 * @returns {Array} The deserialized JavaScript array.
 */
function deserializeArray(buffer) {
    let offset = MAGIC_ARRAY.length;
    // Skip FreeSpace pointer for client-side read-only parsing.
    offset += 4;
    const headerByte = buffer.readUInt8(offset);
    offset++;

    const arrayLengthSize = unpackLength((headerByte >> 3) & 0b11);
    const internalOffsetSize = unpackLength((headerByte >> 5) & 0b11);

    const arrayLength = buffer.readUIntBE(buffer.length - arrayLengthSize, arrayLengthSize);
    if (arrayLength === 0) return [];

    const indexTableByteLength = arrayLength * internalOffsetSize;
    const indexTableStart = buffer.length - arrayLengthSize - indexTableByteLength;

    const result = [];
    for (let i = 0; i < arrayLength; i++) {
        const indexOffset = indexTableStart + i * internalOffsetSize;
        const itemOffset = buffer.readUIntBE(indexOffset, internalOffsetSize);

        const typeByte = buffer.readUInt8(itemOffset);
        const { type, lengthSize } = unpackTypeAndLengthSize(typeByte);

        let itemDataOffset = itemOffset + 1;
        let itemDataLength = 0;
        
        const typesWith0Length = [0, 5, 6, 7, 24, 25, 26];
        if (!typesWith0Length.includes(type)) {
            itemDataLength = buffer.readUIntBE(itemDataOffset, lengthSize);
            itemDataOffset += lengthSize;
        }

        const valueBuffer = buffer.subarray(itemDataOffset, itemDataOffset + itemDataLength);
        result.push(parseValueFromType(type, valueBuffer));
    }

    return result;
}

/**
 * Deserializes an entire Awtsmoos Object buffer.
 * @param {BufferReader} buffer - The buffer containing the object data.
 * @returns {object} The deserialized JavaScript object.
 */
function deserializeObject(buffer) {
    let offset = MAGIC_JSON.length;
    offset += 4; // Skip FreeSpace pointer
    
    const headerByte1 = buffer.readUInt8(offset);

    const sizeOfEmbeddedMetadataArrayLength = unpackLength((headerByte1 >> 1) & 0b11);
    const sizeOfHashTableLength = unpackLength(headerByte1 & 0b01);
    const lengthSizeOfKeys = unpackLength((headerByte1 >> 3) & 0b11);
    
    const footerLengthsTotalDynamicSize = lengthSizeOfKeys + sizeOfEmbeddedMetadataArrayLength + sizeOfHashTableLength;
    const totalFooterLengthsSize = 1 + footerLengthsTotalDynamicSize;
    const footerLengthsOffset = buffer.length - totalFooterLengthsSize;

    let footerOffset = footerLengthsOffset + 1;
    const lengthOfTotalEntries = buffer.readUIntBE(footerOffset, lengthSizeOfKeys);
    footerOffset += lengthSizeOfKeys;
    const lengthMetadataArray = buffer.readUIntBE(footerOffset, sizeOfEmbeddedMetadataArrayLength);

    if (lengthOfTotalEntries === 0) return {};

    const metadataTableEnd = footerLengthsOffset;
    const metadataTableStart = metadataTableEnd - lengthMetadataArray;
    const metadataArrayBuffer = buffer.subarray(metadataTableStart, metadataTableEnd);
    const metadataEntriesRaw = deserializeArray(metadataArrayBuffer);

    const obj = {};
    for (const entryBuffer of metadataEntriesRaw) {
        if (!entryBuffer || entryBuffer.length < 2) continue;
        
        // --- THIS IS THE CRITICAL FIX ---
        // The original entryBuffer was a BufferReader that didn't have its length constrained.
        // By creating a new BufferReader and EXPLICITLY passing the length, we fix the bug.
        const entryReader = new BufferReader(entryBuffer.buffer, entryBuffer.byteOffset, entryBuffer.length);

        let entryOffset = 0;
        const packedLengthSizes = entryReader.readUInt8(entryOffset++);
        const typeLengthByteVal = entryReader.readUInt8(entryOffset++);

        const keyLengthByteSize = unpackLength((packedLengthSizes >> 2) & 0b11);
        const { type, lengthSize } = unpackTypeAndLengthSize(typeLengthByteVal);
        const offsetValueByteSize = unpackLength(packedLengthSizes & 0b11);
        
        const keyLength = entryReader.readUIntBE(entryOffset, keyLengthByteSize);
        entryOffset += keyLengthByteSize;
        const valueLength = entryReader.readUIntBE(entryOffset, lengthSize);
        entryOffset += lengthSize;
        const offsetOfValueInMain = entryReader.readUIntBE(entryOffset, offsetValueByteSize);
        entryOffset += offsetValueByteSize;

        const key = entryReader.toString('utf-8', entryOffset, entryOffset + keyLength);
        
        const valueBuffer = buffer.subarray(offsetOfValueInMain, offsetOfValueInMain + valueLength);
        
        obj[key] = parseValueFromType(type, valueBuffer);
    }

    return obj;
}

/**
 * Parses an ArrayBuffer containing .awtsmoosJSON data.
 * @param {ArrayBuffer} arrayBuffer - The binary data to parse.
 * @returns {object | Array | null} The parsed JavaScript object or array, or null on error.
 */
export function parse(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 2) {
        console.error("Invalid or empty ArrayBuffer provided.");
        return null;
    }

    const reader = new BufferReader(arrayBuffer);
    const magic = reader.toString('utf-8', 0, 2);

    if (magic === MAGIC_JSON) {
        return deserializeObject(reader);
    } else if (magic === MAGIC_ARRAY) {
        return deserializeArray(reader);
    } else {
        console.error("Invalid file format: Unrecognized magic number.");
        return null;
    }
}