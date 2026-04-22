
// B"H
/**
 * @file v1.js
 * @description
 *  =============================================================================
 *  CHAPTER 4: THE FOUNDATION (YESOD)
 *  =============================================================================
 *  When the light is massive (greater than 1024 bytes), it demands a full 
 *  physical block (or a chain of blocks). The V1 Allocator is summoned to 
 *  carve the mountains of the disk.
 */

const SmartPointer = require('../../../../../../utils/smartPointer.js');

class V1Destination {
    /**
     * @method manifest
     * @description Carves out full 4KB sectors for the data.
     * @param {Buffer} dataBuf The raw binary light.
     * @param {number} infoType The dimensional type identifier.
     * @param {Object} context The universal context.
     * @returns {Buffer} The 16-byte seal.
     */
    static manifest(dataBuf, infoType, context) {
        const p = context.v1.allocate(dataBuf.length);
        context.db._writeChainSafe(p, dataBuf);
        return SmartPointer.block(infoType, p.blockId, dataBuf.length, !!p.isChain, p.offset);
    }
}

module.exports = V1Destination;
