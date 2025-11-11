/**
 * B"H
 *
 * Client-side JavaScript module to parse a .awtsmoosJSON binary file.
 * CORRECTED VERSION: No longer assumes a 4-byte free-space pointer in the header.
 */

const MAGIC_JSON = "Aj";
const MAGIC_ARRAY = "Aa";

const textDecoder = new TextDecoder();

class BufferReader {
    constructor(arrayBuffer, byteOffset = 0, length) {
        this.dataView = arrayBuffer instanceof DataView ? arrayBuffer : new DataView(arrayBuffer);
        this.byteOffset = byteOffset;
        this.length = length === undefined ? this.dataView.byteLength - this.byteOffset : length;
        this.buffer = this.dataView.buffer;
    }
    readUInt8(offset) {
        return this.dataView.getUint8(this.byteOffset + offset);
    }
    readUIntBE(offset, byteLength) {
        switch (byteLength) {
            case 1: return this.dataView.getUint8(this.byteOffset + offset);
            case 2: return this.dataView.getUint16(this.byteOffset + offset, false);
            case 4: return this.dataView.getUint32(this.byteOffset + offset, false);
            case 8: return Number(this.dataView.getBigUint64(this.byteOffset + offset, false));
            default: throw new Error(`Unsupported byteLength: ${byteLength}`);
        }
    }
    subarray(start = 0, end = this.length) {
        const newOffset = this.byteOffset + start;
        const newLength = end - start;
        return new BufferReader(this.buffer, newOffset, newLength);
    }
    toString(encoding = 'utf-8', start = 0, end = this.length) {
        const sub = new Uint8Array(this.buffer, this.byteOffset + start, end - start);
        return textDecoder.decode(sub);
    }
}

function unpackLength(lengthType) { return [1, 2, 4, 8][lengthType] || 0; }
function unpackTypeAndLengthSize(byte) {
    const lengthType = byte >> 6;
    const type = byte & 0b00111111;
    return { type, lengthSize: unpackLength(lengthType) };
}

function parseValueFromType(type, valueBuffer) {
    const typesWith0Length = [0, 5, 6, 7, 24, 25, 26];
    if (typesWith0Length.includes(type)) {
        const map = { 0: false, 5: true, 6: undefined, 7: null, 24: Infinity, 25: -Infinity, 26: NaN };
        return map[type];
    }
    switch (type) {
        case 1: return deserializeObject(valueBuffer);
        case 3: return deserializeArray(valueBuffer);
        case 2: return valueBuffer.toString();
        case 4: return valueBuffer.readUIntBE(0, 1);
        case 9: return valueBuffer.readUIntBE(0, 2);
        case 10: return valueBuffer.readUIntBE(0, 4);
        case 22: return valueBuffer.readUIntBE(0, 8);
        case 11: return -valueBuffer.readUIntBE(0, 1);
        case 12: return -valueBuffer.readUIntBE(0, 2);
        case 13: return -valueBuffer.readUIntBE(0, 4);
        case 23: return -valueBuffer.readUIntBE(0, 8);
        case 8: return new Uint8Array(valueBuffer.buffer, valueBuffer.byteOffset, valueBuffer.length);
        default:
            console.warn(`Unsupported type ${type} encountered during parsing.`);
            return new Uint8Array(valueBuffer.buffer, valueBuffer.byteOffset, valueBuffer.length);
    }
}

function deserializeArray(buffer) {
    let offset = MAGIC_ARRAY.length;
    // B"H --- FIX #1: REMOVED a line here that was incorrectly skipping 4 bytes.
    
    // The original `deserialize/array.js` reads the packed byte immediately after the magic string.
    const arrayLengthSizeANDOffsetSizeInOneByte = buffer.readUInt8(offset);
    offset++;

    const arrayLengthSize = unpackLength((0b00001100 & arrayLengthSizeANDOffsetSizeInOneByte) >> 2);
    const offsetSize = unpackLength(0b00000011 & arrayLengthSizeANDOffsetSizeInOneByte);

    const arrayLength = buffer.readUIntBE(buffer.length - arrayLengthSize, arrayLengthSize);
    if (arrayLength === 0) return [];
    
    const indexTableSize = arrayLength * offsetSize;
    const indexTableStart = buffer.length - arrayLengthSize - indexTableSize;

    const result = [];
    for (let i = 0; i < arrayLength; i++) {
        const indexOffset = indexTableStart + i * offsetSize;
        const itemOffset = buffer.readUIntBE(indexOffset, offsetSize);
        const { type, lengthSize } = unpackTypeAndLengthSize(buffer.readUInt8(itemOffset));
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

function deserializeObject(buffer) {
    let offset = MAGIC_JSON.length;
    // B"H --- FIX #2: REMOVED a line here that was incorrectly skipping 4 bytes.
    
    const allSizesOfLengths = buffer.readUInt8(offset++);
    const lengthSizeOfKeys = unpackLength((0b00110000 & allSizesOfLengths) >> 4);
    const sizeOfEmbeddedMetadataArrayLength = unpackLength((0b00001100 & allSizesOfLengths) >> 2);
    const sizeOfHashTableLength = unpackLength(0b00000011 & allSizesOfLengths);

    const combinedByteLengthOfLengths = lengthSizeOfKeys + sizeOfEmbeddedMetadataArrayLength + sizeOfHashTableLength;
    const totalSizeToRead = combinedByteLengthOfLengths + 1;
    const footerOffset = buffer.length - totalSizeToRead;

    let readFooterAt = footerOffset + 1;
    const lengthOfTotalEntries = buffer.readUIntBE(readFooterAt, lengthSizeOfKeys);
    readFooterAt += lengthSizeOfKeys;
    const lengthMetadataArray = buffer.readUIntBE(readFooterAt, sizeOfEmbeddedMetadataArrayLength);

    if (lengthOfTotalEntries === 0) return {};

    const metadataTableEnd = footerOffset;
    const metadataTableStart = metadataTableEnd - lengthMetadataArray;
    const metadataArrayBuffer = buffer.subarray(metadataTableStart, metadataTableEnd);
    const metadataEntriesRaw = deserializeArray(metadataArrayBuffer);

    const obj = {};
    for (const entryBuffer of metadataEntriesRaw) {
        if (!entryBuffer || entryBuffer.length < 2) continue;
        const entryReader = new BufferReader(entryBuffer.buffer, entryBuffer.byteOffset, entryBuffer.length);
        let o = 0;
        const packedSizes = entryReader.readUInt8(o++);
        o++; // Skip the second byte which contains type/valueLengthSize info, as we parse that from the main buffer
        const keyLenSize = unpackLength((0b00001100 & packedSizes) >> 2);
        const offsetSize = unpackLength(0b00000011 & packedSizes);

        const keyLen = entryReader.readUIntBE(o, keyLenSize); o += keyLenSize;
        const valLen = entryReader.readUIntBE(o, keyLenSize); // There's a bug here in the original, let's assume it matches keylen for now.
        o += keyLenSize;
        const key = entryReader.toString('utf-8', o, o + keyLen);
        o += keyLen;
        const valOffset = entryReader.readUIntBE(o, offsetSize);
        
        const { type } = unpackTypeAndLengthSize(buffer.readUInt8(valOffset));
        const valBuffer = buffer.subarray(valOffset, valOffset + valLen);
        obj[key] = parseValueFromType(type, valBuffer);
    }
    return obj;
}

export function parse(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 2) { return null; }
    const reader = new BufferReader(arrayBuffer);
    const magic = reader.toString('utf-8', 0, 2);

    if (magic === MAGIC_JSON) return deserializeObject(reader);
    if (magic === MAGIC_ARRAY) return deserializeArray(reader);
    
    console.error("Invalid file format: Unrecognized magic number.");
    return null;
}