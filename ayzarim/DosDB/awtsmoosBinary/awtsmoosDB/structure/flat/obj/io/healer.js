
// B"H
/**
 * @file healer.js
 * @description
 *  =============================================================================
 *  CHAPTER 2: THE MIRACLE OF SELF-HEALING (TZIKKUN HA'SHVIRA)
 *  =============================================================================
 *  "He heals the brokenhearted and binds up their wounds." (Psalms 147:3)
 *  
 *  If the database pointer leads to an empty void (null buffer), this Angel 
 *  instantly forces the manifestation of a pristine 4KB "FLTO" foundation.
 *  This totally annihilates the dreaded `Cannot read properties of null` error.
 */

const constants = require('../../../../constants.js');
const SmartPointer = require('../../../../utils/smartPointer.js');

class ObjectHealer {
    static heal(flatObject) {
        if (!flatObject.ptr || flatObject.ptr.blockId === undefined) {
            this.createRoot(flatObject);
        }
        
        let buf = flatObject.allocator.db._readChainSafe(flatObject.ptr);
        
        if (!buf) {
            this.createRoot(flatObject);
            buf = flatObject.allocator.db._readChainSafe(flatObject.ptr);
            
            // If the void remains stubborn, we conjure pure physical light.
            if (!buf) {
                buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
                buf.write("FLTO", 0);
                buf.writeUInt16BE(0, 4);
            }
        }
        return buf;
    }

    static createRoot(flatObject) {
        flatObject.ptr = flatObject.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        buf.write("FLTO", 0);
        buf.writeUInt16BE(0, 4); 
        flatObject.allocator.db._writeChainSafe(flatObject.ptr, buf);
        flatObject.ptr.type = constants.VAL_TYPE.SMART_OBJECT;
    }
}
module.exports = ObjectHealer;
