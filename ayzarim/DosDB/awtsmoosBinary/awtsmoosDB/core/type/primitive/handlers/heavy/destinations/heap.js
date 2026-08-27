
// B"H
/**
 * @file heap.js
 * @description
 *  =============================================================================
 *  CHAPTER 3: THE RIVER OF LIGHT (THE HEAP)
 *  =============================================================================
 *  For medium-sized manifestations (up to 1024 bytes), we bypass block fragmentation 
 *  and stream the data directly into the append-only Heap. It is lightning fast.
 */

const SmartPointer = require('../../../../../../utils/smartPointer.js');

class HeapDestination {
    /**
     * @method manifest
     * @description Streams data into the sequential Heap.
     * @param {Buffer} dataBuf The raw binary light.
     * @param {number} infoType The dimensional type identifier.
     * @param {Object} context The universal context.
     * @returns {Buffer} The 16-byte seal.
     */
    static manifest(dataBuf, infoType, context) {
        const loc = context.heap.allocate(dataBuf);
        return SmartPointer.heap(infoType, loc.blockId, loc.offset, loc.length);
    }
}

module.exports = HeapDestination;
