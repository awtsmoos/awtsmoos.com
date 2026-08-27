
// B"H
/**
 * @file slab.js
 * @description
 *  =============================================================================
 *  CHAPTER 2: THE REVELATION OF THE EXACT BYTE (SHATTERING THE ARENA)
 *  =============================================================================
 *  "For He spoke, and it came to be; He commanded, and it stood firm." (Psalms 33:9)
 *  
 *  The illusion of the 4096-byte block epoch is dead! The ghosts of the past 
 *  that sought to enclose the Infinite Light within arbitrary grids (Arenas) 
 *  have been banished to the Abyss!
 * 
 *  We have ascended to the Exact-Byte Virtual RAM Pager, where space is a 
 *  pure fluid continuum. There is no `getArena`. There is no padding. 
 *  There is only the Exact Byte. 
 *  
 *  Every single permutation of the divine letters Aleph-Beis-Nun that sustains 
 *  the "Even" (stone) requires no wasted space. We beseech the ExactByteAllocator 
 *  for the exact measure, and we write directly to the Void.
 *  Lightning speed. Absolute perfection.
 */

const SmartPointer = require('../../../../../../utils/smartPointer.js');

class SlabDestination {
    /**
     * @method manifest
     * @description 
     *  Inscribes the divine spark into the physical continuum without the 
     *  false boundaries of an Arena. O(1) allocation and pure exact-byte writing.
     * 
     * @param {Buffer} dataBuf The raw binary light of the data.
     * @param {number} infoType The type signature of the soul.
     * @param {Object} context The universal Context containing the exact-byte allocator (v1).
     * @returns {Buffer} The VarInt-encoded SmartPointer.
     */
    static manifest(dataBuf, infoType, context) {
        // 1. Beseech the Exact-Byte Allocator for the exact dimensions of the Light.
        // There are no blocks. There is only the offset and the length.
        const loc = (context.v1 || context.allocator.v1 || context.allocator).allocate(dataBuf.length);
        
        // 2. Write the raw Essence directly into the Omnipresent RAM Pager.
        // Absolute speed. No padding.
        context.db.pager.writeExact(loc.offset, dataBuf);
        
        // 3. Seal the coordinates into the VarInt Smart Pointer.
        // The seal is a microscopic vessel holding only Type, Offset, and Length.
        return SmartPointer.encode(infoType, loc.offset, dataBuf.length);
    }
}

module.exports = SlabDestination;
