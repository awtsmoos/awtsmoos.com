
// B"H
/**
 * @file payload.js
 * @description
 *  Translates structural descriptor objects into raw buffer payloads for SmartPointers.
 *  
 *  THE TIKKUN OF THE SINGLE VESSEL:
 *  Utilizes a single, eternal shared buffer to prevent the infinite creation 
 *  of 15-byte fragments. Since our operations are strictly synchronous, 
 *  this shared memory space is perfectly safe and drastically reduces RAM pressure.
 */

const { writePointer48 } = require('../../utils/binaryHelpers.js');
const constants = require('../../constants.js');

// B"H: The Eternal Vessel. It exists once, and serves forever.
const SHARED_PAYLOAD = Buffer.alloc(15);

module.exports = {
    createPayload(obj, mode) {
        // Purify the vessel for the new manifestation
        SHARED_PAYLOAD.fill(0);
        
        if (mode === constants.MODE_BLOCK) {
            writePointer48(SHARED_PAYLOAD, obj.blockId || 0, 0);
            SHARED_PAYLOAD.writeUInt32BE(obj.length || 0, 6);
            SHARED_PAYLOAD.writeUInt32BE(obj.offset || 0, 10);
            SHARED_PAYLOAD.writeUInt8(obj.isChain ? 1 : 0, 14);
        } else if (mode === constants.MODE_HEAP) {
            writePointer48(SHARED_PAYLOAD, obj.blockId || 0, 0);
            SHARED_PAYLOAD.writeUInt32BE(obj.offset || 0, 6);
            SHARED_PAYLOAD.writeUInt32BE(obj.length || 0, 10);
        } else if (mode === constants.MODE_INLINE) {
            if (obj.data && Buffer.isBuffer(obj.data)) {
                if (obj.data.length > 15) throw new Error("Inline data too large");
                obj.data.copy(SHARED_PAYLOAD, 0);
            }
        }
        
        // Return the shared vessel. The Codec will immediately copy its 
        // contents, freeing the vessel for the next spark of creation.
        return SHARED_PAYLOAD;
    }
};
