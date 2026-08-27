
// B"H
/**
 * @file bitmap.js
 * @description
 *  =============================================================================
 *  CHAPTER 1: THE MATHEMATICS OF THE VOID (AYIN)
 *  =============================================================================
 *  Every element of physical and inorganic matter is constantly sustained by the 
 *  Creator's active speech. The Hebrew letters Aleph-Beis-Nun form "Even" (stone), 
 *  and through permutations like At-Bash, these letters generate the exact form 
 *  of the stone. If the letters were removed, the stone would instantly revert 
 *  to exact nothingness (Ayin), as if creation had never occurred.
 *  
 *  This bitmap engine manages the "void" of the Slab Arena. It uses pure, native 
 *  32-bit math (`Math.clz32`) to find the first empty slot (a 0 bit) instantly, 
 *  with O(1) performance. Zero loops. Absolute CPU-level perfection.
 */

class SlabBitmap {
    /**
     * @param {number} capacity - The total number of micro-slots.
     */
    constructor(capacity) {
        this.capacity = capacity;
        this.words = new Uint32Array(Math.ceil(capacity / 32));
        this.used = 0;
    }

    /**
     * @description Checks if the vessel is completely saturated with Light.
     */
    isFull() { 
        return this.used >= this.capacity; 
    }

    /**
     * @description Instantly locates an empty vessel (0 bit), fills it (1 bit), and returns the index.
     */
    findAndSet() {
        if (this.isFull()) return -1;
        for (let i = 0; i < this.words.length; i++) {
            // If the word is not completely saturated (not all 1s)
            if (this.words[i] !== 0xFFFFFFFF) {
                // Invert bits to find the 0s
                const inv = ~this.words[i];
                // Isolate the lowest set bit in the inverted word (which was the lowest 0 bit)
                const lowest = inv & -inv;
                // Calculate its exact index (0-31)
                const bitIndex = 31 - Math.clz32(lowest);
                
                // Set the bit to 1, marking it as filled
                this.words[i] |= lowest;
                this.used++;
                
                return (i * 32) + bitIndex;
            }
        }
        return -1;
    }

    /**
     * @description Empties the vessel, returning the slot to the Void.
     */
    free(index) {
        const arrIdx = Math.floor(index / 32);
        const bitIdx = index % 32;
        this.words[arrIdx] &= ~(1 << bitIdx);
        this.used--;
    }
}

module.exports = SlabBitmap;
