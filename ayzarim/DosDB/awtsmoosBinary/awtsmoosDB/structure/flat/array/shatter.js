
// B"H
/**
 * @file shatter.js
 * @description
 *  =============================================================================
 *  CHAPTER 4: THE ELEVATION TO BINAH (SHATTERING THE VESSEL)
 *  =============================================================================
 *  When the array overflows its physical bounds, it elevates into a fully 
 *  structured Sequence B-Tree. It reads exact VarInt sizes to transfer the souls 
 *  into the new hierarchy.
 */

const constants = require('../../../constants.js');
const SmartPointer = require('../../../utils/smartPointer.js');

class Shatterer {
    constructor(flatArray) {
        this.flat = flatArray;
    }

    shatter() {
        const Sequence = require('../../sequence/index.js');
        this.flat.engine = new Sequence(this.flat.allocator);
        this.flat.engine.create();
        
        const buf = this.flat.io.ensureBuffer();
        const count = buf.readUInt16BE(4);
        
        let cursor = 10;
        
        for(let i = 0; i < count; i++) {
            if (cursor >= buf.length) break;
            const ptrSize = SmartPointer.readSize(buf, cursor);
            const p = buf.subarray(cursor, cursor + ptrSize);
            
            // Re-inscribe into the new Sequence Tree
            this.flat.engine.push(p, { isPtr: true }); 
            cursor += ptrSize;
        }
        
        this.flat.isShattered = true;
        this.flat.ptr = this.flat.engine.ptr;
        this.flat.ptr.type = constants.VAL_TYPE.SEQUENCE;
    }
}

module.exports = Shatterer;
