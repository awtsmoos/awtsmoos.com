// B"H
/**
 * @module serializer
 * @description
 *  Shared serialization primitives used by Parser, LiveHandle, and BTree.
 *  Ensures consistency in VarInt decoding/encoding.
 */

// Writes a Variable Integer (1-9 bytes)
function writeVarInt(value) {
    // Determine size
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
    let shift = 0;
    let bytesRead = 0;
    
    while (true) {
        if (offset + bytesRead >= buf.length) break;
        const b = buf.readUInt8(offset + bytesRead);
        value += (b & 0x7F) * Math.pow(128, bytesRead); // Use Math.pow for safety with larger numbers within safe range
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

module.exports = {
    writeVarInt,
    readVarInt,
    writeString,
    readString
};