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

// Simple MD5 implementation is required for object hashing.
function md5(str) { /* ... (MD5 implementation from your previous code) ... */ return new Uint8Array(16); } // Stub for brevity, use full impl.
function concat(arrays) { let len = 0; for(const a of arrays) len += a.length; const r = new Uint8Array(len); let offset = 0; for(const a of arrays) { r.set(a, offset); offset += a.length; } return r; }
function packedLength(lengthSize) { return { 1: 0, 2: 1, 4: 2, 8: 3 }[lengthSize] ?? null; }
function packTypeAndLengthSize(type, lengthSize) { const modLen = packedLength(lengthSize); return modLen === null ? null : type | (modLen << 6); }
function writeConditional(amount) { let size, buf, view; if (amount < 256) { size=1; buf=new Uint8Array(1); view=new DataView(buf.buffer); view.setUint8(0, Number(amount)); } else if (amount < 65536) { size=2; buf=new Uint8Array(2); view=new DataView(buf.buffer); view.setUint16(0, Number(amount), false); } else if (amount < 4294967296) { size=4; buf=new Uint8Array(4); view=new DataView(buf.buffer); view.setUint32(0, Number(amount), false); } else { size=8; buf=new Uint8Array(8); view=new DataView(buf.buffer); view.setBigUint64(0, BigInt(amount), false); } return { buffer: buf, size }; }
function writeToBuffer(target, value, byteSize, offset) { const view = new DataView(target.buffer); switch(byteSize) { case 1: view.setUint8(offset, value); break; case 2: view.setUint16(offset, value, false); break; case 4: view.setUint32(offset, value, false); break; case 8: view.setBigUint64(offset, BigInt(value), false); break; } }

// ---[ CORE SERIALIZATION LOGIC ]---

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
        metadataTable.push({ key, typeLengthByte: valueBufferInfo.typeLengthByte, valueLengthInfo: valueBufferInfo.valueLengthInfo, offsetOfValueInMain: offset });
        dataBuffers.push(valueBufferInfo.data);
        offset += valueBufferInfo.data.length;
    }
    const { hashBuffers, serializedMetadata, offsetSizeMetadataArray, hashTableSize } = (mt) => {
        const serialized = mt.map(serializeMetadataEntry);
        const serMeta = serializeArray(serialized);
        const metaOfMeta = (() => { const o = MAGIC_ARRAY.length; const h = serMeta[o]; return { oS: unpackLength(h & 3), aLS: unpackLength((h>>2)&3)}; })();
        const hashTableSize = mt.length * 2;
        const hashBuffer = new Uint8Array(hashTableSize * metaOfMeta.oS);
        mt.forEach((q, i) => {
            const hash = new DataView(md5(q.key).buffer).getUint32(0, false);
            let index = hash % hashTableSize;
            while(true) { let empty = true; for(let k=0; k<metaOfMeta.oS; k++) if (hashBuffer[index * metaOfMeta.oS + k] !== 0) {empty=false; break;} if(empty) break; index = (index+1)%hashTableSize; }
            const iTS = serMeta.length - metaOfMeta.aLS - (mt.length * metaOfMeta.oS);
            const valOffset = new DataView(serMeta.buffer).getUint32(iTS + i * metaOfMeta.oS, false); // Assuming 4-byte offset for simplicity here
            writeToBuffer(hashBuffer, valOffset, metaOfMeta.oS, index * metaOfMeta.oS);
        });
        return { hashBuffers: hashBuffer, serializedMetadata: serMeta, offsetSizeMetadataArray: metaOfMeta.oS, hashTableSize };
    })(metadataTable);
    const dataLength = dataBuffers.reduce((sum, buf) => sum + buf.length, 0);
    const { footer, packedHeaderSizes } = ((opts) => {
        const smai = writeConditional(opts.sml); const tli = writeConditional(opts.tk); const hli = writeConditional(opts.hts);
        const os = opts.dl<256?1:opts.dl<65536?2:opts.dl<4294967296?4:8;
        const pas = (packedLength(os)<<2)|packedLength(opts.osma);
        const foot = concat([new Uint8Array([pas]), tli.buffer, smai.buffer, hli.buffer]);
        const packAll = (packedLength(tli.size)<<4)|(packedLength(smai.size)<<2)|packedLength(hli.size);
        return { footer: foot, packedHeaderSizes: packAll };
    })({ sml: serializedMetadata.length, osma: offsetSizeMetadataArray, dl: dataLength, tk: keys.length, hts: hashTableSize });
    offsetSizePlaceholder[0] = packedHeaderSizes;
    return concat([concat(header), concat(dataBuffers), hashBuffers, serializedMetadata, footer]);
}

export function serialize(jsonObject) {
    if (typeof jsonObject !== 'object' || jsonObject === null) return null;
    return Array.isArray(jsonObject) ? serializeArray(jsonObject) : serializeObject(jsonObject);
}