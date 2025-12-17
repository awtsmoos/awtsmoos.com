// B"H
/**
 * @module serializer
 * @description
 *  Shared serialization primitives used by Parser, LiveHandle, and Structures.
 */

// Writes a Variable Integer (1-9 bytes)
function writeVarInt(value) {
    let size = 0;
    let v = value;
    do {
        size++;
        v = Math.floor(v / 128);
    } while (v > 0);

    // B"H: Optimization - allocUnsafe
    const buf = Buffer.allocUnsafe(size);
    let temp = value;
    for (let i = 0; i < size - 1; i++) {
        buf.writeUInt8((temp & 0x7F) | 0x80, i);
        temp = Math.floor(temp / 128);
    }
    buf.writeUInt8(temp & 0x7F, size - 1);
    return buf;
}

// B"H: Zero-Alloc version
function writeVarIntTo(buf, offset, value) {
    let size = 0;
    let temp = value;
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
    let v = value;
    do {
        size++;
        v = Math.floor(v / 128);
    } while (v > 0);
    return size;
}

// Writes a string prefixed by VarInt Length
function writeString(str) {
    const strBuf = Buffer.from(str, 'utf8');
    const lenBuf = writeVarInt(strBuf.length);
    return Buffer.concat([lenBuf, strBuf]);
}

// B"H: Zero-Alloc version
function writeStringTo(buf, offset, str) {
    const strByteLen = Buffer.byteLength(str, 'utf8');
    const lenSize = writeVarIntTo(buf, offset, strByteLen);
    const written = buf.write(str, offset + lenSize, 'utf8');
    return lenSize + written;
}

// Reads a Variable Integer
function readVarInt(buf, offset) {
    let value = 0;
    let bytesRead = 0;
    
    while (true) {
        if (offset + bytesRead >= buf.length) break;
        const b = buf.readUInt8(offset + bytesRead);
        value += (b & 0x7F) * Math.pow(128, bytesRead); 
        bytesRead++;
        if ((b & 0x80) === 0) break;
    }
    return { value, bytesRead };
}

// Reads a string prefixed by VarInt Length
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
    writeString,
    writeStringTo,
    readString,
    readBuffer
};