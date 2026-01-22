// B"H
/**
 * @file codec.js
 * @description Handles raw bitwise encoding and decoding of the 16-byte SmartPointer.
 */

const constants = require('../../constants.js');
const { writePointer48, readPointer48 } = require('../../utils/binaryHelpers.js');

module.exports = {
    encode(type, mode, payloadBuffer) {
        const buf = Buffer.allocUnsafe(constants.POINTER_SIZE);
        const header = (mode << 6) | (type & 0x3F);
        buf.writeUInt8(header, 0);
        
        if (payloadBuffer) {
            // Allow strict length check but clamp for safety if logic drifts
            const copyLen = Math.min(payloadBuffer.length, 15);
            payloadBuffer.copy(buf, 1, 0, copyLen);
            
            if (copyLen < 15) {
                buf.fill(0, 1 + copyLen);
            }
        } else {
            buf.fill(0, 1);
        }
        return buf;
    },

    decode(buf) {
        if (!buf || !Buffer.isBuffer(buf) || buf.length < constants.POINTER_SIZE) return null;
        const header = buf[0];
        return {
            mode: (header >> 6) & 0x03,
            type: header & 0x3F,
            payload: buf.subarray(1, constants.POINTER_SIZE)
        };
    }
};