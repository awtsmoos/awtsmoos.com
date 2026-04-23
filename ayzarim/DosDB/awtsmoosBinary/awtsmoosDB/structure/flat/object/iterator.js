
// B"H
/**
 * @file iterator.js
 * @description
 *  =============================================================================
 *  CHAPTER 5: THE PROCESSION OF GENERATIONS (ITERATION)
 *  =============================================================================
 *  Yields the physical contents of the Flat Object sequentially.
 */

const SmartPointer = require('../../../utils/smartPointer.js');

class Iterator {
    constructor(flatObject) {
        this.flat = flatObject;
    }

    *keys() {
        if (!this.flat.ptr || !this.flat.ptr.blockId) return;
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf) return;
        
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            yield buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            cursor += 1 + kLen + 16;
        }
    }

    *entries(ctx) {
        if (!this.flat.ptr || !this.flat.ptr.blockId) return;
        const buf = this.flat.allocator.db._readChainSafe(this.flat.ptr);
        if (!buf) return;
        
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const keyStr = buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            const p = buf.subarray(cursor + 1 + kLen, cursor + 1 + kLen + 16);
            
            const val = SmartPointer.resolve(p, this.flat.allocator, ctx);
            yield [keyStr, val];
            
            cursor += 1 + kLen + 16;
        }
    }
}

module.exports = Iterator;
