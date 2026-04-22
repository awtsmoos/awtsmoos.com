
// B"H
/**
 * @file slab.js
 * @description
 *  =============================================================================
 *  CHAPTER 2: THE PRECISE MEASURE (MIDDAS HA'DIN)
 *  =============================================================================
 *  "A perfect weight and a perfect measure shall you have." (Deuteronomy 25:15)
 *  
 *  THE REVELATION OF THE EXACT LENGTH:
 *  In the previous era, the Slab Arena recorded the size of the *slot* (the physical vessel). 
 *  But the Light (the data) was often smaller, leaving a trail of empty zeroes (nulls). 
 *  When the Reader summoned the data, the zeroes were included, corrupting the 
 *  Omni-Compression and breaking the Doubling Shield.
 *  
 *  NOW: We etch the absolute, precise length of the data into the 16-byte seal.
 *  The Reader sees only the Light, and the void is ignored.
 */

const constants = require('../../../../../../constants.js');
const SmartPointer = require('../../../../../../utils/smartPointer.js');

class SlabDestination {
    /**
     * @method manifest
     * @description Inscribes data into a micro-slot while preserving its true dimensions.
     */
    static manifest(dataBuf, infoType, context) {
        const slabLoc = context.slab.allocate(dataBuf.length);
        if (!slabLoc) return null; 

        // Access the physical Arena through the Slab Manager's cache
        const arena = context.slab.getArena(slabLoc.blockId);
        if (!arena) return null;
        
        // Copy the data into the Arena's RAM buffer
        dataBuf.copy(arena.buffer, slabLoc.offset);
        arena.isDirty = true; // Mark for lazy flushing
        
        // B"H: THE TIKKUN. We store dataBuf.length, NOT slabLoc.length.
        // slabLoc.length is the slot size (e.g. 64), but the data might be 34.
        return SmartPointer.block(infoType, slabLoc.blockId, dataBuf.length, false, slabLoc.offset);
    }
}

module.exports = SlabDestination;
