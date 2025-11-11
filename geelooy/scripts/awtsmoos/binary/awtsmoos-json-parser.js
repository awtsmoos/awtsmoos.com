// B"H
// FILE: /scripts/awtsmoos/binary/awtsmoos-json-parser.js
/**
 * FINAL, CORRECTED client-side parser for the .awtsmoosJSON binary format.
 * - Accurately mirrors the "basic" server-side deserializer.
 * - Includes a professional hex viewer utility for fallback.
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
        if (offset < 0 || offset >= this.length) throw new RangeError("Offset is outside the bounds of the DataView");
        return this.dataView.getUint8(this.byteOffset + offset);
    }
    readUIntBE(offset, byteLength) {
        if (offset < 0 || offset + byteLength > this.length) throw new RangeError("Offset is outside the bounds of the DataView");
        switch (byteLength) {
            case 1: return this.dataView.getUint8(this.byteOffset + offset);
            case 2: return this.dataView.getUint16(this.byteOffset + offset, false);
            case 4: return this.dataView.getUint32(this.byteOffset + offset, false);
            case 8: return Number(this.dataView.getBigUint64(this.byteOffset + offset, false));
            default: throw new Error(`Unsupported byteLength for readUIntBE: ${byteLength}`);
        }
    }
    subarray(start = 0, end = this.length) {
        return new BufferReader(this.buffer, this.byteOffset + start, end - start);
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
    const headerByte = buffer.readUInt8(offset++);
    const arrayLengthSize = unpackLength((headerByte >> 2) & 0b11);
    const offsetSize = unpackLength(headerByte & 0b11);
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
        if (![0, 5, 6, 7, 24, 25, 26].includes(type)) {
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
    const allSizesOfLengths = buffer.readUInt8(offset++);
    const lengthSizeOfKeys = unpackLength((0b00110000 & allSizesOfLengths) >> 4);
    const sizeOfMetaArrLen = unpackLength((0b00001100 & allSizesOfLengths) >> 2);
    const sizeOfHashTblLen = unpackLength(0b00000011 & allSizesOfLengths);
    const footerDynamicSize = lengthSizeOfKeys + sizeOfMetaArrLen + sizeOfHashTblLen;
    const footerStaticSize = 1;
    const footerTotalSize = footerStaticSize + footerDynamicSize;
    const footerOffset = buffer.length - footerTotalSize;
    let readFooterAt = footerOffset + 1;
    const totalEntries = buffer.readUIntBE(readFooterAt, lengthSizeOfKeys);
    readFooterAt += lengthSizeOfKeys;
    const metaArrByteLen = buffer.readUIntBE(readFooterAt, sizeOfMetaArrLen);
    if (totalEntries === 0) return {};
    const metaArrEnd = footerOffset;
    const metaArrStart = metaArrEnd - metaArrByteLen;
    const metadataArrayBuffer = buffer.subarray(metaArrStart, metaArrEnd);
    const metadataEntriesRaw = deserializeArray(metadataArrayBuffer);

    const obj = {};
    for (const rawEntry of metadataEntriesRaw) {
        if (!rawEntry || rawEntry.length < 2) continue;
        const entryReader = new BufferReader(rawEntry.buffer, rawEntry.byteOffset, rawEntry.length);

        let o = 0;
        const packedKeyAndValueByteLengths = entryReader.readUInt8(o++);
        const packedValueByte = entryReader.readUInt8(o++);
        
        const keyLengthByteSize = unpackLength((0b00001100 & packedKeyAndValueByteLengths) >> 2);
        const byteOffsetByteSize = unpackLength(0b00000011 & packedKeyAndValueByteLengths);
        const { type, lengthSize: valueByteLengthSize } = unpackTypeAndLengthSize(packedValueByte);

        const keyLength = entryReader.readUIntBE(o, keyLengthByteSize); o += keyLengthByteSize;
        const valueLength = entryReader.readUIntBE(o, valueByteLengthSize); o += valueByteLengthSize;
        const key = entryReader.toString('utf-8', o, o + keyLength); o += keyLength;
        const offsetOfValueInMain = entryReader.readUIntBE(o, byteOffsetByteSize);
        
        const valueBuffer = buffer.subarray(offsetOfValueInMain, offsetOfValueInMain + valueLength);
        obj[key] = parseValueFromType(type, valueBuffer);
    }
    return obj;
}

export function parse(arrayBuffer) {
    if (!arrayBuffer || arrayBuffer.byteLength < 2) return null;
    try {
        const reader = new BufferReader(arrayBuffer);
        const magic = reader.toString('utf-8', 0, 2);
        if (magic === MAGIC_JSON) return deserializeObject(reader);
        if (magic === MAGIC_ARRAY) return deserializeArray(reader);
    } catch (e) {
        console.error("Awtsmoos Parsing Error:", e);
        return null; // Return null on any internal parsing error
    }
    return null;
}

export function binaryToHexView(arrayBuffer) {
    const bytes = new Uint8Array(arrayBuffer);
    const lines = [];
    const bytesPerLine = 16;
    for (let i = 0; i < bytes.length; i += bytesPerLine) {
        const chunk = bytes.subarray(i, i + bytesPerLine);
        const offset = i.toString(16).padStart(8, '0').toUpperCase();
        const hex = Array.from(chunk).map(b => b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
        const ascii = Array.from(chunk).map(b => (b >= 32 && b <= 126) ? String.fromCharCode(b) : '.').join('');
        lines.push(`${offset}  ${hex.padEnd(bytesPerLine * 3 - 1)}  |${ascii}|`);
    }
    return lines.join('\n');
}
