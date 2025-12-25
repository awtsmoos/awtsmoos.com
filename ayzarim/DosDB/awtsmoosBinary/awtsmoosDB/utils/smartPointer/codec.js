// B"H
/**
 * @file codec.js
 * @description
 *  The Sefirah of Gevurah - The Boundaries of the Spark.
 *  Handles the raw bitwise encoding and decoding of the 16-byte SmartPointer vessel.
 */

const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../binaryHelpers.js');

module.exports = {
    /**
     * @description Encodes a new 16-byte pointer vessel.
     */
    encode(type, mode, payloadBuffer) {
        const buf = Buffer.allocUnsafe(constants.POINTER_SIZE);
        const header = (mode << 6) | (type & 0x3F);
        buf.writeUInt8(header, 0);
        
        if (payloadBuffer) {
            if (payloadBuffer.length > 15) throw new Error("B\"H: Pointer Payload exceeds 15 bytes");
            payloadBuffer.copy(buf, 1);
            if (payloadBuffer.length < 15) buf.fill(0, 1 + payloadBuffer.length);
        } else {
            buf.fill(0, 1);
        }
        return buf;
    },

    /**
     * @description Decodes a 16-byte spark into its constituent parts.
     * Safe against hydrated object descriptors.
     */
    decode(buf) {
        if (!buf || typeof buf.subarray !== 'function' || buf.length < constants.POINTER_SIZE) return null;
        const header = buf[0];
        return {
            mode: (header >> 6) & 0x03,
            type: header & 0x3F,
            payload: buf.subarray(1, constants.POINTER_SIZE)
        };
    },

    // --- Fast Bitwise Accessors (No Allocation) ---
    getMode(buf) { return (buf[0] >> 6) & 0x03; },
    getType(buf) { return buf[0] & 0x3F; },
    getBlockId(buf) { return readPointer48(buf, 1); },
    getLength(buf) { return buf.readUInt32BE(7); },
    getOffset(buf) { return buf.readUInt32BE(11); },
    isChain(buf) { return buf[15] === 1; }
};