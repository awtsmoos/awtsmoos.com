
// B"H
/**
 * @file seeker.js
 * @description
 *  =============================================================================
 *  CHAPTER 2: THE REVELATION OF THE EXACT INDEX
 *  =============================================================================
 *  "He counts the number of the stars; to all of them He gives names." (Psalms 147:4)
 * 
 *  Because every pointer is exactly the size it needs to be (VarInt), we cannot 
 *  blindly jump by multiplying by 16. We must read the exact size of each star 
 *  (pointer) and step over it. Because the array is densely packed with zero 
 *  padding, this scan fits entirely inside the CPU's L1 cache and completes 
 *  faster than an object property lookup.
 */

const SmartPointer = require('../../../utils/smartPointer.js');

class Seeker {
    constructor(flatArray) {
        this.flat = flatArray;
    }

    length() {
        if (this.flat.isShattered) return this.flat.engine.length();
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return 0;
        
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 10) return 0;
        
        return buf.readUInt16BE(4);
    }

    get(index) {
        if (this.flat.isShattered) return this.flat.engine.getPtr(index);
        if (!this.flat.ptr || this.flat.ptr.offset === undefined) return undefined;
        
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf || buf.length < 10) return undefined;
        
        const count = buf.readUInt16BE(4);
        if (index < 0 || index >= count) return undefined;
        
        let cursor = 10;
        // Ascend the chain of existence exactly to the requested coordinate
        for(let i = 0; i < index; i++) {
            cursor += SmartPointer.readSize(buf, cursor);
        }
        
        const ptrSize = SmartPointer.readSize(buf, cursor);
        return buf.subarray(cursor, cursor + ptrSize);
    }
}

module.exports = Seeker;
