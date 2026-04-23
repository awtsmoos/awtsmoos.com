
// B"H
/**
 * @file mutator.js
 * @description
 *  =============================================================================
 *  CHAPTER 3: THE SURGEON OF THE SEQUENCE
 *  =============================================================================
 *  "To everything there is a season, and a time to every purpose under heaven."
 * 
 *  When an array is altered, the precise physical dimensions of the universe 
 *  must be updated. This mutator reads the VarInt bounds, splices the new 
 *  spark precisely into the void, and allocates a brand new exact-byte vessel 
 *  to hold the modified reality. No padding. No waste.
 */

const SmartPointer = require('../../../utils/smartPointer.js');

class Mutator {
    constructor(flatArray) {
        this.flat = flatArray;
    }

    push(itemPtr) {
        if (this.flat.isShattered) {
            this.flat.engine.push(itemPtr, { isPtr: true });
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }
        
        const buf = this.flat.io.ensureBuffer();
        const count = buf.readUInt16BE(4);
        const totalLen = buf.readUInt32BE(6);
        
        // If appending crosses the boundary of the physical 16KB threshold, shatter.
        if (totalLen + itemPtr.length > 16384) {
            this.flat.shatter();
            return this.push(itemPtr); 
        }
        
        // Exact byte reallocation
        const newBuf = Buffer.allocUnsafe(totalLen + itemPtr.length);
        buf.copy(newBuf, 0, 0, totalLen);
        itemPtr.copy(newBuf, totalLen);
        
        newBuf.writeUInt16BE(count + 1, 4);
        newBuf.writeUInt32BE(totalLen + itemPtr.length, 6);
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
        this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 19 }; // SMART_ARRAY
        this.flat.io.write(newBuf);
        
        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }

    splice(start, delCount, itemPtrs) {
        if (this.flat.isShattered) {
            this.flat.engine.splice(start, delCount, ...itemPtrs);
            this.flat.ptr = this.flat.engine.ptr;
            return { shattered: true, ptr: SmartPointer.toBuffer(this.flat.ptr) };
        }

        const buf = this.flat.io.ensureBuffer();
        const count = buf.readUInt16BE(4);
        const totalLen = buf.readUInt32BE(6);
        
        let s = Math.max(0, Math.min(start, count));
        let d = Math.max(0, Math.min(delCount, count - s));
        
        let cursor = 10;
        // Trace the exact path to the splice start
        for(let i = 0; i < s; i++) {
            cursor += SmartPointer.readSize(buf, cursor);
        }
        const spliceStartOff = cursor;
        
        // Trace the exact path across the deleted elements
        for(let i = 0; i < d; i++) {
            cursor += SmartPointer.readSize(buf, cursor);
        }
        const spliceEndOff = cursor;
        
        let insertLen = 0;
        for(const p of itemPtrs) insertLen += p.length;
        
        const newTotalLen = totalLen - (spliceEndOff - spliceStartOff) + insertLen;
        
        if (newTotalLen > 16384) {
            this.flat.shatter();
            return this.splice(start, delCount, itemPtrs);
        }
        
        const newBuf = Buffer.allocUnsafe(newTotalLen);
        
        // 1. Copy Head
        buf.copy(newBuf, 0, 0, spliceStartOff);
        
        // 2. Insert new sparks
        let insertCur = spliceStartOff;
        for(const p of itemPtrs) {
            p.copy(newBuf, insertCur);
            insertCur += p.length;
        }
        
        // 3. Copy Tail
        buf.copy(newBuf, insertCur, spliceEndOff, totalLen);
        
        const newCount = count - d + itemPtrs.length;
        newBuf.writeUInt16BE(newCount, 4);
        newBuf.writeUInt32BE(newTotalLen, 6);
        
        const loc = (this.flat.v1 || this.flat.allocator).allocate(newBuf.length);
        this.flat.ptr = { offset: loc.offset, length: newBuf.length, type: 19 };
        this.flat.io.write(newBuf);

        return { shattered: false, ptr: SmartPointer.toBuffer(this.flat.ptr) };
    }
}

module.exports = Mutator;
