
// B"H
/**
 * @file binaryHelpers.js
 * @description Essential tools for manifesting precise binary offsets.
 */

function readPointer48(buffer, offset) {
    const high = buffer.readUInt16BE(offset);
    const low = buffer.readUInt32BE(offset + 2);
    return (high * 0x100000000) + low;
}

function writePointer48(buffer, value, offset) {
    const high = Math.floor(value / 0x100000000);
    const low = value % 0x100000000;
    buffer.writeUInt16BE(high, offset);
    buffer.writeUInt32BE(low, offset + 2);
}

function packTypeAndLengthSize(type, lenSize) {
    const sizeCode = lenSize === 1 ? 0 : lenSize === 2 ? 1 : lenSize === 4 ? 2 : 3;
    return (type & 0x3F) | (sizeCode << 6);
}

function unpackTypeAndLengthSize(byte) {
    const type = byte & 0x3F;
    const sizeCode = (byte >> 6) & 0x03;
    const lengthSize = [1, 2, 4, 8][sizeCode];
    return { type, lengthSize };
}

function writeConditional(value) {
    if (value < 256) {
        const b = Buffer.allocUnsafe(1);
        b.writeUInt8(value, 0);
        return { buffer: b, size: 1 };
    }
    if (value < 65536) {
        const b = Buffer.allocUnsafe(2);
        b.writeUInt16BE(value, 0);
        return { buffer: b, size: 2 };
    }
    const b = Buffer.allocUnsafe(4);
    b.writeUInt32BE(value, 0);
    return { buffer: b, size: 4 };
}

function readConditional(buffer, offset, size) {
    if (size === 1) return buffer.readUInt8(offset);
    if (size === 2) return buffer.readUInt16BE(offset);
    if (size === 4) return buffer.readUInt32BE(offset);
    if (size === 8) return Number(buffer.readBigUInt64BE(offset));
    return 0;
}

function packedLength(size) {
    if (size === 1) return 0;
    if (size === 2) return 1;
    if (size === 4) return 2;
    return 3;
}

module.exports = {
    readPointer48,
    writePointer48,
    packTypeAndLengthSize,
    unpackTypeAndLengthSize,
    writeConditional,
    readConditional,
    packedLength
};
