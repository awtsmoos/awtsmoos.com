
// B"H
/**
 * @file healer.js
 * @description Recreates missing physical foundations from the void.
 */
const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class Healer {
    static heal(flat) {
        if (!flat.ptr || flat.ptr.blockId === undefined) {
            this.remanifest(flat);
        }
        
        let buf = flat.allocator.db._readChainSafe(flat.ptr);
        
        if (!buf) {
            this.remanifest(flat);
            buf = flat.allocator.db._readChainSafe(flat.ptr);
            if (!buf) {
                // Return a safe dummy buffer if the disk is still dark
                buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
                buf.write("FLTO", 0);
                buf.writeUInt16BE(0, 4);
            }
        }
        return buf;
    }

    static remanifest(flat) {
        const ptr = flat.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        buf.write("FLTO", 0);
        buf.writeUInt16BE(0, 4);
        flat.allocator.db._writeChainSafe(ptr, buf);
        
        flat.ptr = { ...ptr, type: constants.VAL_TYPE.SMART_OBJECT };
    }
}
module.exports = Healer;
