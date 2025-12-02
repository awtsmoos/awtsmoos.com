// B"H
const crypto = require('crypto');

function writePointer48(buffer, blockId, offset) {
    // 48-bit pointer: Write BlockID as 6 bytes BE
    buffer.writeUIntBE(blockId, offset, 6);
}

function readPointer48(buffer, offset) {
    return buffer.readUIntBE(offset, 6);
}

function writeConditional(num) {
    if (num < 0) throw new Error("Negative length not supported in writeConditional");
    if (num < 256) {
        return { size: 1, buffer: Buffer.from([num]) };
    } else if (num < 65536) {
        const b = Buffer.alloc(2);
        b.writeUInt16BE(num);
        return { size: 2, buffer: b };
    } else if (num < 4294967296) {
        const b = Buffer.alloc(4);
        b.writeUInt32BE(num);
        return { size: 4, buffer: b };
    } else {
        const b = Buffer.alloc(8);
        b.writeBigUInt64BE(BigInt(num));
        return { size: 8, buffer: b };
    }
}

function readConditional(buffer, offset, size) {
    if (size === 1) return buffer.readUInt8(offset);
    if (size === 2) return buffer.readUInt16BE(offset);
    if (size === 4) return buffer.readUInt32BE(offset);
    if (size === 8) return Number(buffer.readBigUInt64BE(offset));
    return 0;
}

function packTypeAndLengthSize(type, lenSize) {
    // Top 6 bits: Type, Bottom 2 bits: LengthSize (0=1, 1=2, 2=4, 3=8)
    const lenBits = lenSize === 1 ? 0 : lenSize === 2 ? 1 : lenSize === 4 ? 2 : 3;
    return (type << 2) | lenBits;
}

function unpackTypeAndLengthSize(byte) {
    const type = byte >> 2;
    const lenBits = byte & 0b11;
    const lenSize = [1, 2, 4, 8][lenBits];
    return { type, lengthSize: lenSize };
}

function packedLength(size) {
    return size === 1 ? 0 : size === 2 ? 1 : size === 4 ? 2 : 3;
}

function writeToBuffer(buffer, value, size, offset) {
    if (size === 1) buffer.writeUInt8(value, offset);
    else if (size === 2) buffer.writeUInt16BE(value, offset);
    else if (size === 4) buffer.writeUInt32BE(value, offset);
    else buffer.writeBigUInt64BE(BigInt(value), offset);
}

function hashKey(key, tableSize) {
    const hash = crypto.createHash('sha1').update(key).digest();
    const val = hash.readUInt32BE(0);
    return val % tableSize;
}

module.exports = {
    writePointer48,
    readPointer48,
    writeConditional,
    readConditional,
    packTypeAndLengthSize,
    unpackTypeAndLengthSize,
    packedLength,
    writeToBuffer,
    hashKey
};