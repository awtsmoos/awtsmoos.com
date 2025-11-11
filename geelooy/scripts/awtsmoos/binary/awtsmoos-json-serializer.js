// B"H
// FILE: /scripts/awtsmoos/binary/awtsmoos-json-serializer.js
/**
 * FULLY IMPLEMENTED CLIENT-SIDE SERIALIZER for the .awtsmoosJSON binary format.
 * This version accurately mirrors the logic of the basic (non-v2) server-side serializer.
 */

const MAGIC_JSON = "Aj";
const MAGIC_ARRAY = "Aa";
const textEncoder = new TextEncoder();

// ---[ HELPER FUNCTIONS FOR SERIALIZATION ]---

// Joseph Myers's md5() algorithm in JavaScript
function md5(str) { let I = (x, y, z) => (x & y) | (~x & z); let J = (x, y, z) => (x & z) | (y & ~z); let K = (x, y, z) => x ^ y ^ z; let L = (x, y, z) => y ^ (x | ~z); let M = (a, b, c, d, x, s, ac) => { a = (a + x + ac) & 0xffffffff; a = (a << s | a >>> (32 - s)) & 0xffffffff; a = (a + b) & 0xffffffff; return a; }; let str_len = str.length; let word_array = []; for (let i = 0; i < str_len - 3; i += 4) { word_array.push(str.charCodeAt(i) | str.charCodeAt(i + 1) << 8 | str.charCodeAt(i + 2) << 16 | str.charCodeAt(i + 3) << 24); } let i = str_len % 4; if (i > 0) { let t = 0; for (let j = 0; j < i; j++) { t |= str.charCodeAt(str_len - i + j) << j * 8; } word_array.push(t); } word_array.push(0x80); while ((word_array.length % 16) != 14) { word_array.push(0); } word_array.push(str_len * 8); word_array.push(0); let a = 0x67452301, b = 0xefcdab89, c = 0x98badcfe, d = 0x10325476; let S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21]; let T = [0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501, 0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821, 0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8, 0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a, 0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70, 0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665, 0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1, 0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391]; for (let i = 0; i < word_array.length; i += 16) { let AA = a, BB = b, CC = c, DD = d; for (let j = 0; j < 64; j++) { let F, g; if (j < 16) { F = (b & c) | ((~b) & d); g = j; } else if (j < 32) { F = (d & b) | ((~d) & c); g = (1 + 5 * j) % 16; } else if (j < 48) { F = b ^ c ^ d; g = (5 + 3 * j) % 16; } else { F = c ^ (b | (~d)); g = (7 * j) % 16; } let t = d; d = c; c = b; b = (b + ((a + F + word_array[i + g] + T[j]) << S[j % 4 + (j >> 2 & 3) * 4] | (a + F + word_array[i + g] + T[j]) >>> (32 - S[j % 4 + (j >> 2 & 3) * 4]))) & 0xffffffff; a = t; } a = (a + AA) & 0xffffffff; b = (b + BB) & 0xffffffff; c = (c + CC) & 0xffffffff; d = (d + DD) & 0xffffffff; } let view = new DataView(new ArrayBuffer(4)); view.setUint32(0, a, true); let a_bytes = new Uint8Array(view.buffer); view.setUint32(0, b, true); let b_bytes = new Uint8Array(view.buffer); view.setUint32(0, c, true); let c_bytes = new Uint8Array(view.buffer); view.setUint32(0, d, true); let d_bytes = new Uint8Array(view.buffer); return new Uint8Array([...a_bytes, ...b_bytes, ...c_bytes, ...d_bytes]); }
function concat(arrays) { let len = 0; for(const a of arrays) len += a.length; const r = new Uint8Array(len); let offset = 0; for(const a of arrays) { r.set(a, offset); offset += a.length; } return r; }
function packedLength(lengthSize) { return { 1: 0, 2: 1, 4: 2, 8: 3 }[lengthSize] ?? null; }
function unpackLength(lengthType) { return [1, 2, 4, 8][lengthType] || 0; }
function packTypeAndLengthSize(type, lengthSize) { const modLen = packedLength(lengthSize); return modLen === null ? null : type | (modLen << 6); }
function writeConditional(amount) { let size, buf, view; if (amount < 256) { size=1; buf=new Uint8Array(1); view=new DataView(buf.buffer); view.setUint8(0, Number(amount)); } else if (amount < 65536) { size=2; buf=new Uint8Array(2); view=new DataView(buf.buffer); view.setUint16(0, Number(amount), false); } else if (amount < 4294967296) { size=4; buf=new Uint8Array(4); view=new DataView(buf.buffer); view.setUint32(0, Number(amount), false); } else { size=8; buf=new Uint8Array(8); view=new DataView(buf.buffer); view.setBigUint64(0, BigInt(amount), false); } return { buffer: buf, size }; }
function writeToBuffer(target, value, byteSize, offset) { const view = new DataView(target.buffer, target.byteOffset); switch(byteSize) { case 1: view.setUint8(offset, value); break; case 2: view.setUint16(offset, value, false); break; case 4: view.setUint32(offset, value, false); break; case 8: view.setBigUint64(offset, BigInt(value), false); break; } }

function serializeValue(value) {
    let type, data;
    if (value === true) { type = 5; } else if (value === false) { type = 0; } else if (value === null) { type = 7; } else if (value === undefined) { type = 6; } else if (typeof value === 'string') { type = 2; data = textEncoder.encode(value); } else if (typeof value === 'number') { let info; if (value >= 0) { info = writeConditional(value); type = {1:4,2:9,4:10,8:22}[info.size]; } else { info = writeConditional(Math.abs(value)); type = {1:11,2:12,4:13,8:23}[info.size]; } data = info.buffer; } else if (Array.isArray(value)) { type = 3; data = serializeArray(value); } else if (value instanceof Uint8Array) { type = 8; data = value; } else if (typeof value === 'object' && value !== null) { type = 1; data = serializeObject(value); } else { type = 7; } if ([0,5,6,7,24,25,26].includes(type)) { data = new Uint8Array(0); }
    const valueLengthInfo = writeConditional(data.length);
    const typeLengthByte = packTypeAndLengthSize(type, valueLengthInfo.size);
    return { data, type, valueLengthInfo, typeLengthByte };
}

function serializeMetadataEntry(entry) {
    const { key, typeLengthByte, valueLengthInfo, offsetOfValueInMain } = entry;
    const keyBuffer = textEncoder.encode(key);
    const keyLengthInfo = writeConditional(keyBuffer.length);
    const bufferOffset = writeConditional(offsetOfValueInMain);
    const packedLengthSizes = (packedLength(keyLengthInfo.size) << 2) | packedLength(bufferOffset.size);
    return concat([ new Uint8Array([packedLengthSizes, typeLengthByte]), keyLengthInfo.buffer, valueLengthInfo.buffer, keyBuffer, bufferOffset.buffer ]);
}

function serializeArray(arr) {
    const header = [textEncoder.encode(MAGIC_ARRAY)];
    const offsetSizePlaceholder = new Uint8Array(1);
    header.push(offsetSizePlaceholder);
    const dataBuffers = [], offsets = [];
    let currentOffset = concat(header).length;
    for (const item of arr) {
        const { data, valueLengthInfo, typeLengthByte } = serializeValue(item);
        const itemBuffer = concat([new Uint8Array([typeLengthByte]), valueLengthInfo.buffer, data]);
        offsets.push(currentOffset);
        dataBuffers.push(itemBuffer);
        currentOffset += itemBuffer.length;
    }
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const offsetSize = dataLength < 256 ? 1 : dataLength < 65536 ? 2 : dataLength < 4294967296 ? 4 : 8;
    const lengthInfo = writeConditional(arr.length);
    const arrayLengthSize = lengthInfo.size;
    const packedByte = ((packedLength(arrayLengthSize) << 2) | packedLength(offsetSize));
    offsetSizePlaceholder[0] = packedByte;
    const indexTable = new Uint8Array(arr.length * offsetSize);
    offsets.forEach((offset, i) => writeToBuffer(indexTable, offset, offsetSize, i * offsetSize));
    return concat([concat(header), concat(dataBuffers), indexTable, lengthInfo.buffer]);
}

function serializeObject(obj) {
    const header = [textEncoder.encode(MAGIC_JSON)];
    const offsetSizePlaceholder = new Uint8Array(1);
    header.push(offsetSizePlaceholder);
    const dataBuffers = [], metadataTable = [];
    let offset = concat(header).length;
    const keys = Object.keys(obj);
    for (const key of keys) {
        const value = obj[key];
        const valueBufferInfo = serializeValue(value);
        metadataTable.push({ key, type: valueBufferInfo.type, typeLengthByte: valueBufferInfo.typeLengthByte, valueLengthInfo: valueBufferInfo.valueLengthInfo, offsetOfValueInMain: offset });
        dataBuffers.push(valueBufferInfo.data);
        offset += valueBufferInfo.data.length;
    }
    const { hashBuffers, serializedMetadata, offsetSizeMetadataArray, hashTableSize } = (()=>{
        const serialized = metadataTable.map(serializeMetadataEntry);
        const serMeta = serializeArray(serialized);
        const metaOfMeta = (() => { const o = MAGIC_ARRAY.length, h=serMeta[o]; return {oS:unpackLength(h&3), aLS:unpackLength((h>>2)&3), arrLen: new DataView(serMeta.buffer).getUint32(serMeta.length - unpackLength((h>>2)&3), false) }; })();
        const hashTableSize = metadataTable.length * 2;
        const hashBuffer = new Uint8Array(hashTableSize * metaOfMeta.oS);
        metadataTable.forEach((q, i) => {
            const hash = new DataView(md5(q.key).buffer).getUint32(0, false);
            let index = hash % hashTableSize;
            while(true) { let empty = true; for(let k=0; k<metaOfMeta.oS; k++) if (hashBuffer[index * metaOfMeta.oS + k] !== 0) {empty=false; break;} if(empty) break; index = (index+1)%hashTableSize; }
            const iTS = serMeta.length - metaOfMeta.aLS - (metaOfMeta.arrLen * metaOfMeta.oS);
            const valOffset = new DataView(serMeta.buffer, serMeta.byteOffset).getUint32(iTS + i * metaOfMeta.oS, false);
            writeToBuffer(hashBuffer, valOffset, metaOfMeta.oS, index * metaOfMeta.oS);
        });
        return { hashBuffers: hashBuffer, serializedMetadata: serMeta, offsetSizeMetadataArray: metaOfMeta.oS, hashTableSize };
    })();
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const { footer, packedHeaderSizes } = ((opts) => {
        const smai=writeConditional(opts.sml), tli=writeConditional(opts.tk), hli=writeConditional(opts.hts);
        const os=opts.dl<256?1:opts.dl<65536?2:opts.dl<4294967296?4:8;
        const pas=(packedLength(os)<<2)|packedLength(opts.osma);
        const foot = concat([new Uint8Array([pas]), tli.buffer, smai.buffer, hli.buffer]);
        const packAll=(packedLength(tli.size)<<4)|(packedLength(smai.size)<<2)|packedLength(hli.size);
        return { footer: foot, packedHeaderSizes: packAll };
    })({ sml: serializedMetadata.length, osma: offsetSizeMetadataArray, dl: dataLength, tk: keys.length, hts: hashTableSize });
    offsetSizePlaceholder[0] = packedHeaderSizes;
    return concat([concat(header), concat(dataBuffers), hashBuffers, serializedMetadata, footer]);
}

export function serialize(jsonObject) {
    if (typeof jsonObject !== 'object' || jsonObject === null) return null;
    return Array.isArray(jsonObject) ? serializeArray(jsonObject) : serializeObject(jsonObject);
}
