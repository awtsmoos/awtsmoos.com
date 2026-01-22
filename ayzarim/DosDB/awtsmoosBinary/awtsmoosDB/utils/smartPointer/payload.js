// B"H
/**
 * @file payload.js
 * @description
 *  Translates structural descriptor objects into raw buffer payloads for SmartPointers.
 */

const { writePointer48 } = require('../../utils/binaryHelpers.js');
const constants = require('../../constants.js');

module.exports = {
    createPayload(obj, mode) {
        const payload = Buffer.alloc(15).fill(0);
        
        if (mode === constants.MODE_BLOCK) {
            writePointer48(payload, obj.blockId || 0, 0);
            payload.writeUInt32BE(obj.length || 0, 6);
            payload.writeUInt32BE(obj.offset || 0, 10);
            payload.writeUInt8(obj.isChain ? 1 : 0, 14);
        } else if (mode === constants.MODE_HEAP) {
            writePointer48(payload, obj.blockId || 0, 0);
            payload.writeUInt32BE(obj.offset || 0, 6);
            payload.writeUInt32BE(obj.length || 0, 10);
        } else if (mode === constants.MODE_INLINE) {
            if (obj.data && Buffer.isBuffer(obj.data)) {
                if (obj.data.length > 15) throw new Error("Inline data too large");
                obj.data.copy(payload, 0);
            }
        }
        return payload;
    }
};