
// B"H
/**
 * @file phys_id.js
 * @module PhysicalIdentity
 * @description
 *  =============================================================================
 *  CHAPTER 8: THE REVELATION OF THE CORE (PHYSICAL ID)
 *  =============================================================================
 *  "I am the Lord, that is My Name; and My glory I will not give to another." (Isaiah 42:8)
 *  
 *  Every object in AwtsmoosDB is clothed in garments—types, modes, flags. 
 *  When a Buffer wrapper is applied, the physical pointer is disguised. 
 *  However, to intersect the results of a search query, we must strip away 
 *  these outer garments (the upper 6 bits of the type) to gaze upon the 
 *  naked physical address (the block ID and mode). 
 * 
 *  This module performs the sacred act of stripping the type bits, 
 *  leaving only the physical coordinates. This ensures that a Book, 
 *  whether it is wrapped in an Object tag, a Dictionary tag, or a Buffer tag, 
 *  is always recognized as the exact same physical entity.
 */

class PhysicalIdentity {
    /**
     * @method get
     * @description Extracts the unadulterated physical anchor of a pointer.
     * @param {Buffer} p The SmartPointer containing the coordinates.
     * @returns {string} A hex string representing the absolute location, devoid of type.
     */
    static get(p) {
        if (!p || !Buffer.isBuffer(p)) return "";
        try {
            const SmartPointer = require('../../../utils/smartPointer/index.js');
            const dec = SmartPointer.decode(p);
            if (!dec) return "";
            return `${dec.offset}:${dec.length}`;
        } catch (_e) {
            return "";
        }
    }
}

module.exports = PhysicalIdentity;
