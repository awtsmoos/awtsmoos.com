
// B"H
/**
 * @file serializer.js
 * @description
 *  =============================================================================
 *  THE SEFIRAH OF CHESED - THE FLOW OF NUMBERS (VARINT)
 *  =============================================================================
 *  It contracts the infinite into the finite, condensing magnitude into the 
 *  smallest possible physical footprint.
 * 
 *  THE TIKKUN OF INFINITE ADDRESSING:
 *  JS Bitwise operations (`<<`, `|`) strictly truncate to 32 bits. Our absolute
 *  file offsets can easily exceed 4GB. This module uses floating point arithmetic 
 *  (`Math.pow`) for shifts >= 28 to safely reconstruct massive 53-bit integers 
 *  (up to 9 Petabytes) without corruption!
 */

/**
 * @function writeVarIntTo
 * @description Manifests a number as a LEB128 variable-length integer.
 * @param {Buffer} buffer The physical vessel.
 * @param {number} offset The starting point.
 * @param {number} value The number to manifest.
 * @returns {number} The count of bytes utilized.
 */
function writeVarIntTo(buffer, offset, value) {
    let v = Math.floor(value); // Ensure it's a clean integer
    let bytesWritten = 0;
    while (v > 127) {
        // Use modulus instead of bitwise to prevent 32-bit truncation
        buffer[offset + bytesWritten] = (v % 128) | 128;
        v = Math.floor(v / 128);
        bytesWritten++;
    }
    buffer[offset + bytesWritten] = v & 127;
    return bytesWritten + 1;
}

/**
 * @function readVarInt
 * @description Resolves a LEB128 variable-length integer, safe up to 53-bits.
 * @param {Buffer} buffer The binary scroll.
 * @param {number} offset The start of the word.
 * @returns {Object} {value, bytesRead}.
 */
function readVarInt(buffer, offset) {
    let value = 0;
    let shift = 0;
    let bytesRead = 0;
    
    while (true) {
        if (offset + bytesRead >= buffer.length) throw new Error("B\"H: VarInt read out of bounds");
        const byte = buffer[offset + bytesRead];
        
        // B"H: The Shield against 32-bit truncation. 
        // We switch to raw arithmetic for high shifts.
        if (shift < 28) {
            value += (byte & 127) << shift;
        } else {
            value += (byte & 127) * Math.pow(2, shift);
        }
        
        bytesRead++;
        if (!(byte & 128)) break;
        
        shift += 7;
        if (shift > 53) throw new Error("B\"H: VarInt exceeds safe 53-bit JavaScript integer capacity");
    }
    return { value, bytesRead };
}

/**
 * @function readString
 * @description Hydrates a UTF-8 string from a VarInt length-prefixed sequence.
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
 * @description Foresees the exact byte size needed for a number.
 */
function getVarIntSize(value) {
    let s = 0; 
    let cur = Math.floor(value);
    do { 
        s++; 
        cur = Math.floor(cur / 128); 
    } while (cur > 0);
    return s;
}

module.exports = { writeVarIntTo, readVarInt, readString, getVarIntSize };
