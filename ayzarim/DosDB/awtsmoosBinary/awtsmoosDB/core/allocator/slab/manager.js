
// B"H
/**
 * @file manager.js
 * @description
 *  =============================================================================
 *  CHAPTER 3: THE ARCHANGEL OF THE SLAB (TZIMTZUM)
 *  =============================================================================
 *  "He appointed a weight for the wind, and apportioned the waters by measure." (Job 28:25)
 * 
 *  This Manager intercepts allocations smaller than 128 bytes. Instead of 
 *  wasting a 4096-byte block, it contracts the data (Tzimtzum) into tightly 
 *  packed Arenas. It utilizes pure Data-Based routing to determine the tier.
 */

const SlabArena = require('./arena.js');
const constants = require('../../../constants.js');

class SlabManager {
    constructor(v1Allocator) {
        this.v1 = v1Allocator;
        this.db = v1Allocator.db;
        
        // Data-Based routing map for O(1) slot discovery
        this.arenas = {
            16: [],
            32: [],
            64: [],
            128: []
        };
    }

    /**
     * @description Determines the perfect vessel size for the requested data.
     */
    _getTier(size) {
        if (size <= 16) return 16;
        if (size <= 32) return 32;
        if (size <= 64) return 64;
        if (size <= 128) return 128;
        return null;
    }

    /**
     * @description Secures a micro-slot, birthing a new Arena if all are full.
     */
    allocate(size) {
        const tier = this._getTier(size);
        if (tier === null) return null; // Too large, fallback to heavy allocation

        const list = this.arenas[tier];
        let arena = list.find(a => !a.bitmap.isFull());
        
        if (!arena) {
            // Manifest a new 4KB physical block
            const ptr = this.v1.allocate(constants.BLOCK_SIZE);
            // Transform the block into a Slab Arena
            arena = new SlabArena(this.db, ptr, tier);
            list.push(arena);
        }

        return arena.claim();
    }
}

module.exports = SlabManager;
