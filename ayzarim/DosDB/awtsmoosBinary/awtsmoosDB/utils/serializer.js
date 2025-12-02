// B"H
const { writeConditional, packedLength } = require('./binaryHelpers.js');

function writeVarInt(value) {
    if (value < 0xfd) {
        return Buffer.from([value]);
    } else if (value <= 0xffff) {
        const b = Buffer.alloc(3);
        b[0] = 0xfd;
        b.writeUInt16BE(value, 1);
        return b;
    } else if (value <= 0xffffffff) {
        const b = Buffer.alloc(5);
        b[0] = 0xfe;
        b.writeUInt32BE(value, 1);
        return b;
    } else {
        const b = Buffer.alloc(9);
        b[0] = 0xff;
        b.writeBigUInt64BE(BigInt(value), 1);
        return b;
    }
}

function readVarInt(buffer, offset) {
    if (offset >= buffer.length) throw new Error("Buffer overrun in readVarInt");
    const first = buffer.readUInt8(offset);
    if (first < 0xfd) {
        return { value: first, bytesRead: 1 };
    } else if (first === 0xfd) {
        if (offset + 3 > buffer.length) throw new Error("Buffer overrun in readVarInt (16)");
        return { value: buffer.readUInt16BE(offset + 1), bytesRead: 3 };
    } else if (first === 0xfe) {
        if (offset + 5 > buffer.length) throw new Error("Buffer overrun in readVarInt (32)");
        return { value: buffer.readUInt32BE(offset + 1), bytesRead: 5 };
    } else {
        if (offset + 9 > buffer.length) throw new Error("Buffer overrun in readVarInt (64)");
        return { value: Number(buffer.readBigUInt64BE(offset + 1)), bytesRead: 9 };
    }
}

function writeString(str) {
    const buf = Buffer.from(str, 'utf8');
    const lenBuf = writeVarInt(buf.length);
    return Buffer.concat([lenBuf, buf]);
}

function readString(buffer, offset) {
    const lenInfo = readVarInt(buffer, offset);
    const start = offset + lenInfo.bytesRead;
    const end = start + lenInfo.value;
    if (end > buffer.length) throw new Error("Buffer overrun in readString");
    const str = buffer.toString('utf8', start, end);
    return { value: str, bytesRead: lenInfo.bytesRead + lenInfo.value };
}

module.exports = { writeVarInt, readVarInt, writeString, readString };