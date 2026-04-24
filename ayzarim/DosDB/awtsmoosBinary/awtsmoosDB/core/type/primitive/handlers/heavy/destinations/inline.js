
// B"H
/**
 * @file inline.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE NULLIFICATION OF INLINE ILLUSIONS
 *  =============================================================================
 *  "He suspends the earth upon nothingness." (Job 26:7)
 *  
 *  In the epoch of 16-byte pointers, we packed data into the pointer itself 
 *  to save space. Now, with VarInt pointers compressing to 3 bytes, forcing 
 *  inline data creates BLOAT! 
 *  
 *  The Inline Destination fully nullifies itself and delegates directly to 
 *  the Exact-Byte Virtual RAM Pager for ultimate speed and density.
 */

const SmartPointer = require('../../../../../../utils/smartPointer.js');

class InlineDestination {
    /**
     * @method manifest
     * @description Breathes the light directly into the Exact-Byte Void.
     */
    static manifest(dataBuf, infoType, context) {
        const loc = (context.v1 || context.allocator.v1 || context.allocator).allocate(dataBuf.length);
        context.db.pager.writeExact(loc.offset, dataBuf);
        return SmartPointer.encode(infoType, loc.offset, dataBuf.length);
    }
}

module.exports = InlineDestination;
