
// B"H
/**
 * @file arena.js
 * @description
 *  =============================================================================
 *  CHAPTER 2: THE ARENA OF THE MICROSCOPIC
 *  =============================================================================
 *  "He spreads out the northern skies over empty space; He suspends the earth over nothing." (Job 26:7)
 * 
 *  The Arena is a physical 4KB block, but instead of holding one giant entity, 
 *  it is sliced perfectly into micro-slots (e.g., 32 bytes). This eliminates 
 *  the chaotic waste of padding, compressing the universe into its most dense form.
 */

const SlabBitmap = require('./bitmap.js');
const constants = require('../../../constants.js');

class SlabArena {
    /**
     * @param {Object} db - The AwtsmoosDB context.
     * @param {Object} ptr - The physical 16-byte block pointer of this 4KB page.
     * @param {number} slotSize - The precise byte-width of the micro-slots (16, 32, 64, 128).
     */
    constructor(db, ptr, slotSize) {
        this.db = db;
        this.ptr = ptr;
        this.slotSize = slotSize;
        
        // 32 bytes for header (Magic, Slot Size, Used Count, etc.)
        this.headerSize = 32;
        this.capacity = Math.floor((constants.BLOCK_SIZE - this.headerSize) / slotSize);
        this.bitmap = new SlabBitmap(this.capacity);
        
        this.buffer = Buffer.alloc(constants.BLOCK_SIZE).fill(0);
        this.buffer.write("SLAB", 0);
        this.buffer.writeUInt16BE(slotSize, 4);
    }

    /**
     * @description Claims a microscopic piece of physical reality.
     */
    claim() {
        const idx = this.bitmap.findAndSet();
        if (idx === -1) return null; // The vessel is full

        // Calculate absolute physical offset within the 4KB block
        const offset = this.headerSize + (idx * this.slotSize);
        
        // Etch the utilization count into the header
        this.buffer.writeUInt32BE(this.bitmap.used, 6);
        this.db._writeChainSafe(this.ptr, this.buffer);

        // Return a physical coordinate targeting only the micro-slot
        return {
            blockId: this.ptr.blockId,
            offset: offset,
            length: this.slotSize,
            isChain: false
        };
    }
}

module.exports = SlabArena;
