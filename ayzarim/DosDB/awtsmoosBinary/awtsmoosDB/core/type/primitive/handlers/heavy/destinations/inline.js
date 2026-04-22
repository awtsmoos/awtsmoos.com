
// B"H
/**
 * @file inline.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE INLINE VOID (AYIN)
 *  =============================================================================
 *  "He suspends the earth upon nothingness." (Job 26:7)
 *  
 *  When the abstract thought (data) is 14 bytes or less, it does not need a 
 *  physical block on the disk. It is woven directly into the 16-byte SmartPointer.
 *  The Awtsmoos sustains this spark entirely within the metadata of the universe.
 */

const constants = require('../../../../../../constants.js');
const SmartPointer = require('../../../../../../utils/smartPointer.js');

class InlineDestination {
    /**
     * @method manifest
     * @description Breathes the data directly into the pointer seal.
     * @param {Buffer} dataBuf The raw binary light.
     * @param {number} infoType The dimensional type identifier.
     * @returns {Buffer} The 16-byte seal.
     */
    static manifest(dataBuf, infoType) {
        const p = Buffer.alloc(15).fill(0); 
        p[0] = dataBuf.length; 
        dataBuf.copy(p, 1);
        return SmartPointer.encode(infoType, constants.MODE_INLINE, p);
    }
}

module.exports = InlineDestination;
