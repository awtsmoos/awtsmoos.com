// B"H
/**
 * @module binaryHelpers
 * @description
 *  Low-level binary manipulation for AwtsmoosDB.
 *  Handles 48-bit pointers, variable integer packing, and conditional field sizing.
 */
const crypto = require('crypto');

// Writes a 48-bit pointer (Block ID) to a buffer
function writePointer48(buf, value, offset) {
    if (value > 0xFFFFFFFFFFFF) throw new Error("Pointer exceeds 48 bits");
    // Write high 16 bits
    buf.writeUInt16BE(Math.floor(value / 0x100000000), offset);
    // Write low 32 bits
    // Bitwise operators in JS treat numbers as 32-bit signed ints, so modulo is safer for large numbers
    buf.writeUInt32BE(value % 0x100000000, offset + 2);
}

// Reads a 48-bit pointer from a buffer
function readPointer48(buf, offset) {
    const high = buf.readUInt16BE(offset);
    const low = buf.readUInt32BE(offset + 2);
    // B"H: Correct multiplication factor for 2^32
    return (high * 0x100000000) + low;
}

// Determines the number of bytes needed to store a length
function packedLength(size) {
    if (size === 1) return 0; // 00
    if (size === 2) return 1; // 01
    if (size === 4) return 2; // 10
    if (size === 8) return 3; // 11
    return 0;
}

// Packs Type ID and Length Size into a single byte
// Type: 6 bits, LengthSize: 2 bits
function packTypeAndLengthSize(type, lengthSize) {
    const lenBits = packedLength(lengthSize);
    return (type << 2) | lenBits;
}

// Unpacks the byte back to Type and Length Size
function unpackTypeAndLengthSize(byte) {
    const type = byte >> 2;
    const lenBits = byte & 0b11;
    const lengthSize = [1, 2, 4, 8][lenBits];
    return { type, lengthSize };
}

// Returns buffer and size for a number (1, 2, 4, or 8 bytes)
function writeConditional(num) {
    let size = 1;
    if (num >= 256) size = 2;
    if (num >= 65536) size = 4;
    if (num >= 4294967296) size = 8; // JS Max Safe Int fits in 8 bytes (double) but here we treat as uint64

    const buf = Buffer.alloc(size);
    if (size === 1) buf.writeUInt8(num, 0);
    else if (size === 2) buf.writeUInt16BE(num, 0);
    else if (size === 4) buf.writeUInt32BE(num, 0);
    else buf.writeBigUInt64BE(BigInt(num), 0);

    return { buffer: buf, size };
}

// Reads a number of `size` bytes
function readConditional(buf, offset, size) {
    if (size === 1) return buf.readUInt8(offset);
    if (size === 2) return buf.readUInt16BE(offset);
    if (size === 4) return buf.readUInt32BE(offset);
    if (size === 8) return Number(buf.readBigUInt64BE(offset));
    return 0;
}

// Writes data to a buffer at specific index/size
function writeToBuffer(buf, value, size, offset) {
    if (size === 1) buf.writeUInt8(value, offset);
    else if (size === 2) buf.writeUInt16BE(value, offset);
    else if (size === 4) buf.writeUInt32BE(value, offset);
    else buf.writeBigUInt64BE(BigInt(value), offset);
}

// Simple hash for hash tables
function hashKey(key, tableSize) {
    const hash = crypto.createHash('sha1').update(key).digest();
    const idx = hash.readUInt32BE(0);
    return idx % tableSize;
}

module.exports = {
    writePointer48,
    readPointer48,
    packedLength,
    packTypeAndLengthSize,
    unpackTypeAndLengthSize,
    writeConditional,
    readConditional,
    writeToBuffer,
    hashKey
};