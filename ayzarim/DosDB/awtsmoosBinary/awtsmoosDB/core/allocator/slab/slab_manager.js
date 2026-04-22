
// B"H
/**
 * @file slab_manager.js
 * @description
 *  =============================================================================
 *  CHAPTER 4: THE TIGHT COMPRESSION OF THE VOID (SLAB ARENAS)
 *  =============================================================================
 *  "A perfect weight and a perfect measure shall you have." (Deuteronomy 25:15)
 * 
 *  This angel divides massive 4KB blocks into precise micro-slots (16B, 32B, 64B).
 *  Using a multi-tier bitmap index, it finds exact byte matches instantly, 
 *  meaning short strings are packed cheek-by-jowl with zero padding waste.
 */

const constants = require('../../../constants.js');
const BitmapTier = require('./bitmap_tier.js');

class SlabManager {
    constructor(v1Allocator) {
        this.v1 = v1Allocator;
        // Tracking active arenas by slot size
        this.arenas = {
            16: null,
            32: null,
            64: null,
            128: null
        };
    }

    /**
     * @method allocateTight
     * @description Assigns a byte-perfect space from the active slabs.
     */
    allocateTight(sizeRequired) {
        let slotSize = 16;
        if (sizeRequired > 16) slotSize = 32;
        if (sizeRequired > 32) slotSize = 64;
        if (sizeRequired > 64) slotSize = 128;
        
        if (sizeRequired > 128) {
            // If it exceeds the slabs, it demands the full block flow
            return this.v1.allocate(sizeRequired);
        }

        let arena = this.arenas[slotSize];
        
        if (!arena || arena.isFull()) {
            arena = this._createNewArena(slotSize);
            this.arenas[slotSize] = arena;
        }

        return arena.claimSlot();
    }

    _createNewArena(slotSize) {
        const ptr = this.v1.allocate(constants.BLOCK_SIZE);
        const buf = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        // Header space for the tiered bitmap
        const capacity = Math.floor((constants.BLOCK_SIZE - 32) / slotSize);
        
        return new BitmapTier(this.v1.db, ptr, buf, slotSize, capacity);
    }
}

module.exports = SlabManager;
