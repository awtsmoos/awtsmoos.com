// B"H
/**
 * @module serializer
 * @description 
 *  The Sefirah of Gevurah - The Constraint of Number.
 *  Variable Integer serialization with strictly deterministic decoding.
 */

/**
 * @function writeVarInt
 * @description Encodes a number into a variable-length LEB128 buffer.
 */
function writeVarInt(value) {
    const val = Math.abs(Math.floor(value));
    const bytes = [];
    let v = val;
    while (v >= 128) {
        bytes.push((v % 128) | 128);
        v = Math.floor(v / 128);
    }
    bytes.push(v);
    return Buffer.from(bytes);
}

/**
 * @function writeVarIntTo
 * @description Zero-allocation encoding of a number into an existing buffer.
 */
function writeVarIntTo(buf, offset, value) {
    const val = Math.abs(Math.floor(value));
    let v = val;
    let currentOffset = offset;
    while (v >= 128) {
        buf.writeUInt8((v % 128) | 128, currentOffset++);
        v = Math.floor(v / 128);
    }
    buf.writeUInt8(v, currentOffset++);
    return currentOffset - offset;
}

/**
 * @function readVarInt
 * @description Decodes a variable-length integer with a strict 10-byte safety limit.
 */
function readVarInt(buf, offset) {
    let value = 0;
    let bytesRead = 0;
    let multiplier = 1;
    while (offset + bytesRead < buf.length) {
        const b = buf.readUInt8(offset + bytesRead);
        value += (b & 0x7F) * multiplier;
        bytesRead++;
        if ((b & 0x80) === 0) break;
        multiplier *= 128;
        if (bytesRead >= 10) break; // B"H: Absolute limit for 64-bit safe floats
    }
    return { value, bytesRead };
}

/**
 * @function readString
 * @description Decodes a VarInt-prefixed UTF-8 string.
 */
function readString(buf, offset) {
    const len = readVarInt(buf, offset);
    if (len.bytesRead === 0) return { value: "", bytesRead: 0 };
    const start = offset + len.bytesRead;
    const end = start + len.value;
    if (end > buf.length) return { value: "", bytesRead: len.bytesRead };
    const str = buf.toString('utf8', start, end);
    return { value: str, bytesRead: len.bytesRead + len.value };
}

module.exports = { writeVarInt, writeVarIntTo, readVarInt, readString };
