// B"H
/**
 * @module serializer
 * @description
 *  Shared serialization primitives used by Parser, LiveHandle, and OmniCompressor.
 */

/**
 * @description Writes a Variable Integer (1-9 bytes) into a new Buffer.
 */
function writeVarInt(value) {
    let size = 0;
    let v = Math.abs(value);
    do {
        size++;
        v = Math.floor(v / 128);
    } while (v > 0);

    const buf = Buffer.allocUnsafe(size);
    let temp = Math.abs(value);
    for (let i = 0; i < size - 1; i++) {
        buf.writeUInt8((temp & 0x7F) | 0x80, i);
        temp = Math.floor(temp / 128);
    }
    buf.writeUInt8(temp & 0x7F, size - 1);
    return buf;
}

/**
 * @description Zero-Allocation version of writeVarInt.
 */
function writeVarIntTo(buf, offset, value) {
    let size = 0;
    let temp = Math.abs(value);
    let currentOffset = offset;
    
    do {
        let byte = temp & 0x7F;
        temp = Math.floor(temp / 128);
        if (temp > 0) byte |= 0x80;
        buf.writeUInt8(byte, currentOffset);
        currentOffset++;
        size++;
    } while (temp > 0);
    
    return size;
}

function getVarIntSize(value) {
    let size = 0;
    let v = Math.abs(value);
    do {
        size++;
        v = Math.floor(v / 128);
    } while (v > 0);
    return size;
}

/**
 * @description Reads a Variable Integer (LEB128) from a Buffer.
 */
function readVarInt(buf, offset) {
    let value = 0;
    let bytesRead = 0;
    let multiplier = 1;
    
    while (true) {
        if (offset + bytesRead >= buf.length) break;
        const b = buf.readUInt8(offset + bytesRead);
        value += (b & 0x7F) * multiplier; 
        bytesRead++;
        if ((b & 0x80) === 0) break;
        multiplier *= 128;
    }
    return { value, bytesRead };
}

/**
 * @description Reads a string prefixed by VarInt Length.
 */
function readString(buf, offset) {
    const len = readVarInt(buf, offset);
    const start = offset + len.bytesRead;
    const str = buf.toString('utf8', start, start + len.value);
    return { value: str, bytesRead: len.bytesRead + len.value };
}

function readBuffer(buf, offset) {
    const len = readVarInt(buf, offset);
    const start = offset + len.bytesRead;
    const data = buf.subarray(start, start + len.value);
    return { value: data, bytesRead: len.bytesRead + len.value };
}

module.exports = {
    writeVarInt,
    writeVarIntTo,
    getVarIntSize,
    readVarInt,
    readString,
    readBuffer
};
