// B"H
/**
 * @file serializer.js
 * @description
 *  The Sefirah of Chesed - The Flow of Numbers.
 *  Provides strictly synchronous VarInt and String serialization.
 */

/**
 * @function writeVarIntTo
 * @description Manifests a number as a LEB128 variable-length integer.
 */
function writeVarIntTo(buffer, offset, value) {
    let v = value;
    let bytesWritten = 0;
    while (v > 127) {
        buffer[offset + bytesWritten] = (v & 127) | 128;
        v >>>= 7; // Unsigned shift
        bytesWritten++;
    }
    buffer[offset + bytesWritten] = v & 127;
    return bytesWritten + 1;
}

/**
 * @function readVarInt
 * @description Resolves a LEB128 variable-length integer from binary data.
 */
function readVarInt(buffer, offset) {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;
    while (true) {
        if (offset + bytesRead >= buffer.length) throw new Error("B\"H: VarInt read out of bounds");
        const byte = buffer[offset + bytesRead];
        // B"H: Use arithmetic for shift > 28 to avoid signed 32-bit overflow issues in JS bitwise ops
        if (shift < 28) {
            value |= (byte & 127) << shift;
        } else {
            value += (byte & 127) * Math.pow(2, shift);
        }
        
        bytesRead++;
        if (!(byte & 128)) break;
        shift += 7;
        if (shift > 49) throw new Error("B\"H: VarInt exceeds safe integer capacity");
    }
    return { value, bytesRead };
}

/**
 * @function readString
 * @description Hydrates a UTF-8 string from a length-prefixed binary sequence.
 */
function readString(buffer, offset) {
    const lenInfo = readVarInt(buffer, offset);
    const start = offset + lenInfo.bytesRead;
    if (start + lenInfo.value > buffer.length) throw new Error("B\"H: String read out of bounds");
    const str = buffer.subarray(start, start + lenInfo.value).toString('utf8');
    return { value: str, bytesRead: lenInfo.bytesRead + lenInfo.value };
}

module.exports = { writeVarIntTo, readVarInt, readString };
