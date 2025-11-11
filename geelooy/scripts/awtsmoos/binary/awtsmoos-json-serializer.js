/**
 * B"H
 *
 * Client-side JavaScript module to serialize a JavaScript object or array
 * into the .awtsmoosJSON binary format.
 *
 * This implementation is based on the logic of the provided server-side code,
 * adapted for the browser environment.
 */

const MAGIC_JSON = "Aj";
const MAGIC_ARRAY = "Aa";

const textEncoder = new TextEncoder();

/** A simple, browser-compatible MD5 implementation is required for object hashing. */
/*
 * Joseph Myers's md5() algorithm in JavaScript, derived from Greg Holt's md5.js,
 * which was derived from L. Peter Deutsch's original C implementation.
 */
function md5(str) {
    let I = (x, y, z) => (x & y) | (~x & z); let J = (x, y, z) => (x & z) | (y & ~z);
    let K = (x, y, z) => x ^ y ^ z; let L = (x, y, z) => y ^ (x | ~z);
    let M = (a, b, c, d, x, s, ac) => { a = (a + x + ac) & 0xffffffff; a = (a << s | a >>> (32 - s)) & 0xffffffff; a = (a + b) & 0xffffffff; return a; };
    let N = (a, b, c, d, x, s, ac) => M(I(b, c, d), a, b, c, x, s, ac); let O = (a, b, c, d, x, s, ac) => M(J(b, c, d), a, b, c, x, s, ac);
    let P = (a, b, c, d, x, s, ac) => M(K(b, c, d), a, b, c, x, s, ac); let Q = (a, b, c, d, x, s, ac) => M(L(b, c, d), a, b, c, x, s, ac);
    let str_len = str.length; let word_array = [];
    for (let i = 0; i < str_len - 3; i += 4) { word_array.push(str.charCodeAt(i) | str.charCodeAt(i + 1) << 8 | str.charCodeAt(i + 2) << 16 | str.charCodeAt(i + 3) << 24); }
    let i = str_len % 4;
    if (i > 0) { let t = 0; for (let j = 0; j < i; j++) { t |= str.charCodeAt(str_len - i + j) << j * 8; } word_array.push(t); }
    word_array.push(0x80);
    while ((word_array.length % 16) != 14) { word_array.push(0); }
    word_array.push(str_len * 8); word_array.push(0);
    let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476;
    let S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];
    let T = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391];
    for (let i = 0; i < word_array.length; i += 16) {
        let AA = a, BB = b, CC = c, DD = d;
        for (let j = 0; j < 64; j++) { let F, g; if (j < 16) { F = (b & c) | ((~b) & d); g = j; } else if (j < 32) { F = (d & b) | ((~d) & c); g = (1 + 5 * j) % 16; } else if (j < 48) { F = b ^ c ^ d; g = (5 + 3 * j) % 16; } else { F = c ^ (b | (~d)); g = (7 * j) % 16; } let t = d; d = c; c = b; b = (b + ((a + F + word_array[i + g] + T[j]) << S[j % 4 + (j >> 2 & 3) * 4] | (a + F + word_array[i + g] + T[j]) >>> (32 - S[j % 4 + (j >> 2 & 3) * 4]))) & 0xffffffff; a = t; }
        a = (a + AA) & 0xffffffff; b = (b + BB) & 0xffffffff; c = (c + CC) & 0xffffffff; d = (d + DD) & 0xffffffff;
    }
    let view = new DataView(new ArrayBuffer(4));
    view.setUint32(0, a, true); let a_bytes = new Uint8Array(view.buffer);
    view.setUint32(0, b, true); let b_bytes = new Uint8Array(view.buffer);
    view.setUint32(0, c, true); let c_bytes = new Uint8Array(view.buffer);
    view.setUint32(0, d, true); let d_bytes = new Uint8Array(view.buffer);
    return new Uint8Array([...a_bytes, ...b_bytes, ...c_bytes, ...d_bytes]);
}


/**
 * Concatenates an array of Uint8Arrays.
 * @param {Uint8Array[]} arrays - The arrays to concatenate.
 * @returns {Uint8Array}
 */
function concat(arrays) {
    let totalLength = arrays.reduce((acc, value) => acc + value.length, 0);
    if (!arrays.length) return new Uint8Array(0);
    let result = new Uint8Array(totalLength);
    let length = 0;
    for (let array of arrays) {
        result.set(array, length);
        length += array.length;
    }
    return result;
}

/**
 * Packs a byte size (1, 2, 4, 8) into a 2-bit integer.
 * @param {number} lengthSize - The byte size.
 * @returns {number | null} The packed 2-bit integer or null on error.
 */
function packedLength(lengthSize) {
    const map = { 1: 0, 2: 1, 4: 2, 8: 3 };
    return map[lengthSize] !== undefined ? map[lengthSize] : null;
}

/**
 * Packs a type and length size into a single byte.
 * @param {number} type - The 6-bit type identifier.
 * @param {number} lengthSize - The byte size of the length field (1, 2, 4, 8).
 * @returns {number | null} The packed byte or null on error.
 */
function packTypeAndLengthSize(type, lengthSize) {
    const modifiedLength = packedLength(lengthSize);
    if (modifiedLength === null) return null;
    return type | (modifiedLength << 6);
}

/**
 * Writes a number to a Uint8Array of a dynamic size (1, 2, 4, or 8).
 * @param {number | bigint} amount - The number to write.
 * @returns {{buffer: Uint8Array, size: number}}
 */
function writeConditional(amount) {
    let size, buffer, view;
    if (amount < 256) {
        size = 1;
        buffer = new Uint8Array(size); view = new DataView(buffer.buffer);
        view.setUint8(0, Number(amount));
    } else if (amount < 65536) {
        size = 2;
        buffer = new Uint8Array(size); view = new DataView(buffer.buffer);
        view.setUint16(0, Number(amount), false);
    } else if (amount < 4294967296) {
        size = 4;
        buffer = new Uint8Array(size); view = new DataView(buffer.buffer);
        view.setUint32(0, Number(amount), false);
    } else {
        size = 8;
        buffer = new Uint8Array(size); view = new DataView(buffer.buffer);
        view.setBigUint64(0, BigInt(amount), false);
    }
    return { buffer, size };
}


/**
 * Serializes a single JavaScript value into its binary representation.
 * @param {any} value - The value to serialize.
 * @returns {{type: number, data: Uint8Array, valueLengthInfo: object, typeLengthByte: number}}
 */
function serializeValue(value) {
    let type, data;
    const typesWith0Length = [0, 5, 6, 7, 24, 25, 26];

    if (value === true) { type = 5; }
    else if (value === false) { type = 0; }
    else if (value === null) { type = 7; }
    else if (value === undefined) { type = 6; }
    else if (typeof value === 'string') { type = 2; data = textEncoder.encode(value); }
    else if (typeof value === 'number') {
        let info;
        if (value >= 0) {
            info = writeConditional(value);
            type = { 1: 4, 2: 9, 4: 10, 8: 22 }[info.size];
        } else {
            info = writeConditional(Math.abs(value));
            type = { 1: 11, 2: 12, 4: 13, 8: 23 }[info.size];
        }
        data = info.buffer;
    }
    else if (Array.isArray(value)) { type = 3; data = serializeArray(value); }
    else if (value instanceof Uint8Array) { type = 8; data = value; }
    else if (typeof value === 'object' && value !== null) { type = 1; data = serializeObject(value); }
    else { type = 7; /* Default to null for unsupported types */ }
    
    if (typesWith0Length.includes(type)) {
        data = new Uint8Array(0);
    }
    
    const valueLengthInfo = writeConditional(data.length);
    const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);

    return { type, data, valueLengthInfo, typeLengthByte };
}

/**
 * Serializes a JavaScript array.
 * @param {Array} arr - The array to serialize.
 * @returns {Uint8Array} The serialized binary data.
 */
function serializeArray(arr) {
    const header = [textEncoder.encode(MAGIC_ARRAY)];
    const freeListHeadPlaceholder = new Uint8Array(4); // 4-byte free space head, set to 0
    header.push(freeListHeadPlaceholder);
    
    const packedSizesPlaceholder = new Uint8Array(1);
    header.push(packedSizesPlaceholder);
    
    const headerBuffer = concat(header);
    let currentOffset = headerBuffer.length;
    const dataBuffers = [];
    const offsets = [];

    for (const item of arr) {
        const { data, valueLengthInfo, typeLengthByte } = serializeValue(item);
        const itemHeader = concat([
            new Uint8Array([typeLengthByte]),
            valueLengthInfo.buffer,
        ]);
        const itemBuffer = concat([itemHeader, data]);

        offsets.push(currentOffset);
        dataBuffers.push(itemBuffer);
        currentOffset += itemBuffer.length;
    }

    const dataBuffer = concat(dataBuffers);
    const lengthInfo = writeConditional(arr.length);
    const arrayLengthSize = lengthInfo.size;
    
    const dataLength = dataBuffer.length;
    const offsetSize = dataLength < 256 ? 1 : dataLength < 65536 ? 2 : dataLength < 4294967296 ? 4 : 8;

    // Pack header byte
    const packedArrayLengthSize = packedLength(arrayLengthSize);
    const packedInternalOffsetSize = packedLength(offsetSize);
    let headerByte1 = (1 << 7); // isParentRelative = true for simplicity
    headerByte1 |= (packedInternalOffsetSize << 5);
    headerByte1 |= (packedArrayLengthSize << 3);
    packedSizesPlaceholder[0] = headerByte1;

    // Build index table
    const indexTable = new Uint8Array(arr.length * offsetSize);
    const indexTableView = new DataView(indexTable.buffer);
    offsets.forEach((offset, i) => {
        const writeOffset = i * offsetSize;
        if (offsetSize === 1) indexTableView.setUint8(writeOffset, offset);
        else if (offsetSize === 2) indexTableView.setUint16(writeOffset, offset, false);
        else if (offsetSize === 4) indexTableView.setUint32(writeOffset, offset, false);
        else if (offsetSize === 8) indexTableView.setBigUint64(writeOffset, BigInt(offset), false);
    });

    return concat([headerBuffer, dataBuffer, indexTable, lengthInfo.buffer]);
}


/**
 * Serializes a single metadata entry object into a Uint8Array.
 * @param {object} entry - The metadata entry.
 * @returns {Uint8Array}
 */
function serializeMetadataEntry(entry) {
    const { key, valueLengthInfo, typeLengthByte, offsetOfValueInMain } = entry;
    
    const keyBuffer = textEncoder.encode(key);
    const keyLengthInfo = writeConditional(keyBuffer.length);
    const offsetInfo = writeConditional(offsetOfValueInMain);

    const packedKeyLengthSize = packedLength(keyLengthInfo.size);
    const packedOffsetSize = packedLength(offsetInfo.size);

    const packedLengthSizes = (packedKeyLengthSize << 2) | packedOffsetSize;

    return concat([
        new Uint8Array([packedLengthSizes, typeLengthByte]),
        keyLengthInfo.buffer,
        valueLengthInfo.buffer,
        offsetInfo.buffer,
        keyBuffer
    ]);
}

/**
 * Serializes a JavaScript object.
 * @param {object} obj - The object to serialize.
 * @returns {Uint8Array} The serialized binary data.
 */
function serializeObject(obj) {
    const header = [textEncoder.encode(MAGIC_JSON)];
    const freeListHeadPlaceholder = new Uint8Array(4);
    header.push(freeListHeadPlaceholder);
    
    const headerFlagsAndSizesPlaceholder = new Uint8Array(1);
    header.push(headerFlagsAndSizesPlaceholder);
    
    const headerBuffer = concat(header);
    let currentDataOffset = headerBuffer.length;
    const dataBuffers = [];
    const metadataEntries = [];
    
    const keys = Object.keys(obj);
    for (const key of keys) {
        const value = obj[key];
        const valueInfo = serializeValue(value);
        
        dataBuffers.push(valueInfo.data);
        
        metadataEntries.push({
            key,
            typeLengthByte: valueInfo.typeLengthByte,
            valueLengthInfo: valueInfo.valueLengthInfo,
            offsetOfValueInMain: currentDataOffset,
        });
        currentDataOffset += valueInfo.data.length;
    }
    
    const dataBuffer = concat(dataBuffers);

    // Create metadata array
    const serializedEntryBuffers = metadataEntries.map(serializeMetadataEntry);
    const serializedMetadata = serializeArray(serializedEntryBuffers);
    const metadataOfMetadataArray = (buffer => { // IIFE to parse metadata of the array
        const offsetSize = unpackLength((buffer[5] >> 5) & 0b11);
        const arrayLengthSize = unpackLength((buffer[5] >> 3) & 0b11);
        const arrayLength = new DataView(buffer.buffer, buffer.byteOffset, buffer.length).getUint32(buffer.length - arrayLengthSize, false);
        return { offsetSize, arrayLength, arrayLengthSize };
    })(serializedMetadata);

    // Create hash table
    const hashTableSize = keys.length * 2;
    const hashTableEntrySize = metadataOfMetadataArray.offsetSize;
    const hashBuffer = new Uint8Array(hashTableSize * hashTableEntrySize);
    const hashView = new DataView(hashBuffer.buffer);

    metadataEntries.forEach((entry, i) => {
        const key = entry.key;
        const hash = new DataView(md5(key).buffer).getUint32(0, false);
        let index = hash % hashTableSize;

        // Linear probing
        while (true) {
            const slotOffset = index * hashTableEntrySize;
            let isEmpty = true;
            for (let k = 0; k < hashTableEntrySize; k++) {
                if (hashView.getUint8(slotOffset + k) !== 0) {
                    isEmpty = false; break;
                }
            }
            if (isEmpty) {
                 // The offset stored is the offset *within the metadata array's data section*
                 const metaArrayIndexTableStart = serializedMetadata.length - metadataOfMetadataArray.arrayLengthSize - (metadataOfMetadataArray.arrayLength * metadataOfMetadataArray.offsetSize);
                 const metaArrayItemOffset = new DataView(serializedMetadata.buffer, serializedMetadata.byteOffset, serializedMetadata.length).getUint32(metaArrayIndexTableStart + i * metadataOfMetadataArray.offsetSize, false);
                 
                 if (hashTableEntrySize === 1) hashView.setUint8(slotOffset, metaArrayItemOffset);
                 else if (hashTableEntrySize === 2) hashView.setUint16(slotOffset, metaArrayItemOffset, false);
                 else if (hashTableEntrySize === 4) hashView.setUint32(slotOffset, metaArrayItemOffset, false);
                 else if (hashTableEntrySize === 8) hashView.setBigUint64(slotOffset, BigInt(metaArrayItemOffset), false);
                 break;
            }
            index = (index + 1) % hashTableSize;
        }
    });

    // Create Footer
    const totalKeysInfo = writeConditional(keys.length);
    const metaArrayLengthInfo = writeConditional(serializedMetadata.length);
    const hashTableLengthInfo = writeConditional(hashTableSize);

    const footer = concat([
        new Uint8Array([0]), // packed offset sizes byte
        totalKeysInfo.buffer,
        metaArrayLengthInfo.buffer,
        hashTableLengthInfo.buffer
    ]);
    
    // Pack header byte
    let headerByte1 = (1 << 7); // isParentRelative
    headerByte1 |= (packedLength(metadataOfMetadataArray.offsetSize) << 5);
    headerByte1 |= (packedLength(totalKeysInfo.size) << 3);
    headerByte1 |= (packedLength(metaArrayLengthInfo.size) << 1);
    headerByte1 |= (packedLength(hashTableLengthInfo.size));
    headerFlagsAndSizesPlaceholder[0] = headerByte1;

    return concat([headerBuffer, dataBuffer, hashBuffer, serializedMetadata, footer]);
}


/**
 * Serializes a JavaScript object or array into an .awtsmoosJSON Uint8Array.
 * @param {object | Array} jsonObject - The data to serialize.
 * @returns {Uint8Array | null} The serialized binary data, or null on error.
 */
export function serialize(jsonObject) {
    if (typeof jsonObject !== 'object' || jsonObject === null) {
        console.error("Input must be an object or array.");
        return null;
    }

    if (Array.isArray(jsonObject)) {
        return serializeArray(jsonObject);
    } else {
        return serializeObject(jsonObject);
    }
}