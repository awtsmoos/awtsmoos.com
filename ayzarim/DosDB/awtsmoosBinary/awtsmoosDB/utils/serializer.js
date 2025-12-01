// B"H
/**
 * @module Serializer
 * @description Helper functions for packing and unpacking binary data (VarInts, Strings).
 * Essential for keeping Page metadata compact so we fit more pointers in 4KB.
 */
// B"H
// VarInt Serializer for Page Headers
module.exports = {
    writeVarInt(value) {
        const bytes = [];
        let val = value;
        while (val >= 0x80) {
            bytes.push((val & 0x7F) | 0x80);
            val = val >>> 7;
        }
        bytes.push(val);
        return Buffer.from(bytes);
    },
    readVarInt(buffer, offset) {
        let value = 0;
        let shift = 0;
        let bytesRead = 0;
        let byte = 0;
        do {
            if (offset + bytesRead >= buffer.length) throw new Error("Buffer overrun");
            byte = buffer[offset + bytesRead];
            value |= (byte & 0x7F) << shift;
            shift += 7;
            bytesRead++;
        } while (byte & 0x80);
        return { value, bytesRead };
    },
    writeString(str) {
        const strBuf = Buffer.from(str, 'utf8');
        const lenBuf = this.writeVarInt(strBuf.length);
        return Buffer.concat([lenBuf, strBuf]);
    },
    readString(buffer, offset) {
        const { value: length, bytesRead: lenBytes } = this.readVarInt(buffer, offset);
        const str = buffer.toString('utf8', offset + lenBytes, offset + lenBytes + length);
        return { value: str, bytesRead: lenBytes + length };
    }
};