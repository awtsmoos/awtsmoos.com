
// B"H
/**
 * @file io_vessel.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE FOUNDATION OF THE ARRAY (NO PADDING)
 *  =============================================================================
 *  "The letters of His speech are the soul of the stone." 
 * 
 *  Just as the letters Aleph-Beis-Nun form the rock ("Even") and give it exact 
 *  dimensions from absolute nothingness, this vessel allocates EXACTLY 10 bytes 
 *  to begin its existence. 
 *  
 *  [Magic: 4] + [Count: 2] + [Total Length: 4] = 10 Bytes.
 *  There is no 4096-byte blank buffer. The void is banished.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer/index.js');

class IoVessel {
    constructor(flatArray) {
        this.flat = flatArray;
    }

    create() {
        // Exact 10 byte allocation. Pure Light.
        const buf = Buffer.alloc(10).fill(0);
        buf.write("FLTA", 0);
        buf.writeUInt16BE(0, 4); // Count = 0
        buf.writeUInt32BE(10, 6); // Total Length = 10
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(10);
        this.flat.ptr = { offset: loc.offset, length: 10, type: 19 }; // TYPE_SMART_ARRAY
        this.write(buf);
        
        return SmartPointer.toBuffer(this.flat.ptr);
    }

    ensureBuffer() {
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) {
            this.create();
        }
        
        let buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        
        if (!buf || buf.length < 10) {
            this.create(); 
            buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
            if (!buf) {
                // Absolute fallback in extreme corruption
                buf = Buffer.alloc(10).fill(0);
                buf.write("FLTA", 0);
                buf.writeUInt16BE(0, 4);
                buf.writeUInt32BE(10, 6);
            }
        }
        return buf;
    }

    write(buf) {
        this.flat.allocator.db._writeChainSafe(this.flat.ptr, buf);
    }
}

module.exports = IoVessel;
