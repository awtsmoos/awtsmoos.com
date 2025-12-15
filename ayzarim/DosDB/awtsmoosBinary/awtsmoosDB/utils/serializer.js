
// B"H
/**
 * @module serializer
 * @description
 *  Shared serialization primitives used by Parser, LiveHandle, and Structures.
 *  Ensures consistency in VarInt decoding/encoding across the unified engine.
 */

// Writes a Variable Integer (1-9 bytes)
function writeVarInt(value) {
    let size = 0;
    let v = value;
    do {
        size++;
        v = Math.floor(v / 128);
    } while (v > 0);

    const buf = Buffer.alloc(size);
    let temp = value;
    for (let i = 0; i < size - 1; i++) {
        buf.writeUInt8((temp & 0x7F) | 0x80, i);
        temp = Math.floor(temp / 128);
    }
    buf.writeUInt8(temp & 0x7F, size - 1);
    return buf;
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

// Writes a string prefixed by VarInt Length
function writeString(str) {
    const strBuf = Buffer.from(str, 'utf8');
    const lenBuf = writeVarInt(strBuf.length);
    return Buffer.concat([lenBuf, strBuf]);
}

// Reads a string prefixed by VarInt Length
function readString(buf, offset) {
    const len = readVarInt(buf, offset);
    const start = offset + len.bytesRead;
    const str = buf.toString('utf8', start, start + len.value);
    return { value: str, bytesRead: len.bytesRead + len.value };
}

// B"H: New zero-copy buffer reader
function readBuffer(buf, offset) {
    const len = readVarInt(buf, offset);
    const start = offset + len.bytesRead;
    // Return a subarray (view) instead of copy for speed
    const data = buf.subarray(start, start + len.value);
    return { value: data, bytesRead: len.bytesRead + len.value };
}

module.exports = {
    writeVarInt,
    readVarInt,
    writeString,
    readString,
    readBuffer
};
