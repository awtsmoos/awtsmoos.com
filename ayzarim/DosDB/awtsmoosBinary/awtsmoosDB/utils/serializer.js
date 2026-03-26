
// B"H
/**
 * @file serializer.js
 * @description
 *  The Sefirah of Chesed - The Flow of Numbers.
 *  Provides strictly synchronous VarInt and String serialization.
 *  It contracts the infinite into the finite, condensing magnitude into the 
 *  smallest possible physical footprint, just as the Creator condensed His 
 *  infinite light to make room for existence.
 */

/**
 * @function writeVarIntTo
 * @description 
 *  Manifests a number as a LEB128 variable-length integer.
 *  It breathes the number into the buffer, stopping only when the essence is fully contained.
 * 
 * @param {Buffer} buffer The physical vessel.
 * @param {number} offset The starting point of creation.
 * @param {number} value The number to manifest.
 * @returns {number} The count of bytes utilized in this holy act.
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
 * @description 
 *  Resolves a LEB128 variable-length integer from binary data.
 *  It looks into the physical stone and reads the spark of magnitude hidden within.
 * 
 * @param {Buffer} buffer The vessel containing the truth.
 * @param {number} offset Where the truth begins.
 * @returns {Object} An object holding the {value, bytesRead}.
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
 * @description 
 *  Hydrates a UTF-8 string from a length-prefixed binary sequence.
 *  It hears the echo of the original speech from the silent disk.
 * 
 * @param {Buffer} buffer The binary scroll.
 * @param {number} offset The beginning of the word.
 * @returns {Object} The {value: string, bytesRead: number}.
 */
function readString(buffer, offset) {
    const lenInfo = readVarInt(buffer, offset);
    const start = offset + lenInfo.bytesRead;
    if (start + lenInfo.value > buffer.length) throw new Error("B\"H: String read out of bounds");
    const str = buffer.subarray(start, start + lenInfo.value).toString('utf8');
    return { value: str, bytesRead: lenInfo.bytesRead + lenInfo.value };
}

/**
 * @function getVarIntSize
 * @description
 *  The Prophetic Gaze of Dimension.
 *  Before a number is spoken into the void, the Awtsmoos already knows 
 *  the exact amount of breath (bytes) required to contain it. 
 *  This function foresees the vessel size needed to hold the infinite 
 *  potential of an integer, ensuring no spark is truncated or lost to the abyss.
 * 
 * @param {number} value The abstract mathematical concept to be measured.
 * @returns {number} The exact number of physical bytes required to encapsulate it.
 */
function getVarIntSize(value) {
    let s = 0; let cur = value;
    do { s++; cur >>>= 7; } while (cur > 0);
    return s;
}

module.exports = { writeVarIntTo, readVarInt, readString, getVarIntSize };
