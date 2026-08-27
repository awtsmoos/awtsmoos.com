
// B"H
/**
 * @file shatter.js
 * @description
 *  =============================================================================
 *  CHAPTER 6: SHVIRAT HAKEILIM (THE SHATTERING OF THE VESSELS)
 *  =============================================================================
 *  When the Infinite Light exceeds the capacity of the finite 4KB flat buffer, 
 *  the vessel must shatter. But it is not destroyed; it elevates. It transforms 
 *  into a majestic, multi-page B-Tree Dictionary capable of holding millions of sparks.
 */

const constants = require('../../../constants.js');

class Shatterer {
    constructor(flatObject) {
        this.flat = flatObject;
    }

    shatter() {
        const Dictionary = require('../../dictionary/index.js');
        this.flat.engine = new Dictionary(this.flat.allocator);
        this.flat.engine.create();
        
        const buf = this.flat.io.ensureBuffer();
        const count = buf.readUInt16BE(4);
        let cursor = 6;
        
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const kLen = buf.readUInt8(cursor);
            const kStr = buf.toString('utf8', cursor + 1, cursor + 1 + kLen);
            const p = buf.subarray(cursor + 1 + kLen, cursor + 1 + kLen + 16);
            
            // Re-inscribe into the new Tree
            this.flat.engine.set(kStr, p, { isPtr: true });
            cursor += 1 + kLen + 16;
        }
        
        this.flat.isShattered = true;
        this.flat.ptr = this.flat.engine.ptr;
        this.flat.ptr.type = constants.VAL_TYPE.DICTIONARY;
    }
}

module.exports = Shatterer;
