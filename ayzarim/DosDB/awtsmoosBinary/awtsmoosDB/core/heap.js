
// B"H
/**
 * @file heap.js
 * @description 
 *  =============================================================================
 *  THE NULLIFICATION OF THE HEAP
 *  =============================================================================
 *  The Sefirah of Asiyah (Action).
 *  In the era of the 4096-byte blocks, the Heap was required to pack small 
 *  strings efficiently into a single page. 
 * 
 *  But the veil has been lifted! The Exact-Byte Allocator and the Omnipresent 
 *  RAM Pager now handle micro-allocations directly with absolutely zero padding 
 *  and zero latency. The Heap completely nullifies itself to the True Source.
 *  "He is the Place of the world, but the world is not His place."
 */

class HeapManager {
    constructor(v1Allocator) {
        this.v1 = v1Allocator;
    }

    /**
     * @method allocate
     * @description Passes the data directly to the ExactByteAllocator.
     */
    allocate(dataBuffer) {
        const loc = this.v1.allocate(dataBuffer.length);
        this.v1.pager.writeExact(loc.offset, dataBuffer);
        return loc;
    }

    /**
     * @method readBlock
     * @description Legacy bridge. In the exact-byte universe, there are no blocks.
     */
    readBlock(blockId) {
        return null; // The Master Hydrator will fallback to readExact(offset)
    }

    /**
     * @method flush
     * @description The void is empty. Nothing to flush.
     */
    flush() {}
}

module.exports = HeapManager;
