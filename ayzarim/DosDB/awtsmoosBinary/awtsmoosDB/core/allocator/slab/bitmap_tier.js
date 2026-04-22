
// B"H
/**
 * @file bitmap_tier.js
 * @description
 *  =============================================================================
 *  CHAPTER 5: THE SPEED OF LIGHT (O(1) BITMAPS)
 *  =============================================================================
 *  Uses raw 32-bit native JavaScript math (`Math.clz32`) to find the first 
 *  available zero in a bitmap. An entire 4KB page can be scanned for an empty 
 *  32-byte slot in micro-operations.
 */

class BitmapTier {
    constructor(db, ptr, buffer, slotSize, capacity) {
        this.db = db;
        this.ptr = ptr;
        this.buffer = buffer;
        this.slotSize = slotSize;
        this.capacity = capacity;
        this.usedCount = 0;
        
        // Internal bit tracker (kept in RAM for pure speed)
        this.bitmap = new Uint32Array(Math.ceil(capacity / 32));
    }

    isFull() {
        return this.usedCount >= this.capacity;
    }

    claimSlot() {
        // Fast path: find first 32-bit int that isn't fully saturated (0xFFFFFFFF)
        for (let i = 0; i < this.bitmap.length; i++) {
            if (this.bitmap[i] !== 0xFFFFFFFF) {
                // Find the first 0 bit.
                // Invert the bits (~), isolate the lowest set bit (x & -x), 
                // and compute its index using clz32.
                const inv = ~this.bitmap[i];
                const lowestBit = inv & -inv; 
                const bitIndex = 31 - Math.clz32(lowestBit);
                
                // Mark it as used
                this.bitmap[i] |= lowestBit;
                this.usedCount++;

                const slotGlobalIndex = (i * 32) + bitIndex;
                const physicalOffset = 32 + (slotGlobalIndex * this.slotSize);

                // Etch the map state back to the physical buffer header
                this.buffer.writeUInt32BE(this.bitmap[i], i * 4);
                this.db._writeChainSafe(this.ptr, this.buffer);

                return {
                    blockId: this.ptr.blockId,
                    offset: physicalOffset,
                    length: this.slotSize,
                    isChain: false
                };
            }
        }
        throw new Error("B\"H Fatal: Claim called on a saturated Arena.");
    }
    
    releaseSlot(slotIndex) {
        const arrIdx = Math.floor(slotIndex / 32);
        const bitIdx = slotIndex % 32;
        
        this.bitmap[arrIdx] &= ~(1 << bitIdx);
        this.usedCount--;
        
        this.buffer.writeUInt32BE(this.bitmap[arrIdx], arrIdx * 4);
        this.db._writeChainSafe(this.ptr, this.buffer);
    }
}

module.exports = BitmapTier;
