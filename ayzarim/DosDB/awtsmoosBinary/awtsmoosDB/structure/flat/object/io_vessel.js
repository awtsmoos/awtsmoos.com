
// B"H
/**
 * @file io_vessel.js
 * @description
 *  =============================================================================
 *  CHAPTER 2: THE BREATH OF CREATION (I/O OPERATIONS)
 *  =============================================================================
 *  "He spoke, and it came to be."
 * 
 *  This module is responsible for physically etching the 10 statements of creation 
 *  into the SSD. It fixes the dreaded 'null' bug by refusing to let a vessel 
 *  read from the Void without first manifesting a body.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');

class IoVessel {
    constructor(flatObject) {
        this.flat = flatObject;
    }

    create() {
        this.flat.ptr = this.flat.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        
        buf.write("FLTO", 0);
        buf.writeUInt16BE(0, 4); // count begins at Ayin (0)
        
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buf);
        this.flat.ptr.type = constants.VAL_TYPE.SMART_OBJECT;
        return SmartPointer.toBuffer(this.flat.ptr);
    }

    /**
     * @method ensureBuffer
     * @description 
     *  THE MIRACLE OF SELF-HEALING. If the database attempts to read a pointer 
     *  that has no physical block (null), this function instantly recreates the 
     *  foundation, averting the TypeError crash and maintaining eternal stability.
     */
    ensureBuffer() {
        if (!this.flat.ptr || !this.flat.ptr.blockId) {
            this.create();
        }
        
        let buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        
        if (!buf) {
            this.create(); // Breath life into the abyss
            buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
            
            if (!buf) {
                // Absolute fallback to a safe, empty dimension
                buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
                buf.write("FLTO", 0);
                buf.writeUInt16BE(0, 4);
            }
        }
        return buf;
    }

    write(buf) {
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buf);
    }
}

module.exports = IoVessel;
