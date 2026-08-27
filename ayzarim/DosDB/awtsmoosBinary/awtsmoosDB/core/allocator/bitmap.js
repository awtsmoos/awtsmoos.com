
// B"H
/**
 * @file bitmap.js
 * @description The absolute map of existence within a page.
 * 
 * THE TIKKUN OF THE SWIFT SCRIBE:
 * `findGap` now accepts a `startHint`. The Scribe no longer starts his 
 * search from the beginning of the parchment every time. He remembers 
 * where the ink last fell, achieving absolute O(1) velocity during bulk creation.
 */
const constants = require('../../constants.js');

class BitmapManager {
    static mark(block, start, count, val) {
        const bitmapOffset = constants.BITMAP_OFFSET;
        const end = start + count;
        for (let i = start; i < end; i++) {
            const byteIndex = (i >>> 3) + bitmapOffset;
            const bitIndex = 7 - (i & 7); // Strict high-to-low bit alignment
            if (val) {
                block[byteIndex] |= (1 << bitIndex);
            } else {
                block[byteIndex] &= ~(1 << bitIndex);
            }
        }
    }

    static check(block, start, count) {
        const bitmapOffset = constants.BITMAP_OFFSET;
        const end = start + count;
        for (let i = start; i < end; i++) {
            const byteIndex = (i >>> 3) + bitmapOffset;
            const bitIndex = 7 - (i & 7);
            if (!((block[byteIndex] >> bitIndex) & 1)) return false;
        }
        return true;
    }

    /**
     * @method findGap
     * @description Searches for an unbroken string of unwritten units.
     * @param {Buffer} block The page's physical memory.
     * @param {number} count The number of continuous units required.
     * @param {number} startHint The unit index to begin the search from.
     * @returns {number} The starting unit index, or -1 if the void is insufficient.
     */
    static findGap(block, count, startHint = 0) {
        const bitmapOffset = constants.BITMAP_OFFSET;
        const maxBits = constants.BITMAP_SIZE * 8; // 128 units
        let run = 0;
        let start = -1;

        // 1. Search forward from the Hint
        for (let i = startHint; i < maxBits; i++) {
            const byteIndex = (i >>> 3) + bitmapOffset;
            const bitIndex = 7 - (i & 7);
            
            // The Great Leap! If at the start of a saturated byte, skip it entirely.
            if (bitIndex === 7 && block[byteIndex] === 0xFF) {
                run = 0;
                start = -1;
                i += 7; 
                continue;
            }

            const isUsed = (block[byteIndex] >> bitIndex) & 1;

            if (!isUsed) {
                if (run === 0) start = i;
                run++;
                if (run === count) return start;
            } else {
                run = 0;
                start = -1;
            }
        }

        // 2. If the end of the page was reached without success, 
        // wrap around and search the beginning up to the Hint.
        if (start === -1 && startHint > 0) {
            run = 0;
            start = -1;
            for (let i = 0; i < startHint; i++) {
                const byteIndex = (i >>> 3) + bitmapOffset;
                const bitIndex = 7 - (i & 7);
                
                if (bitIndex === 7 && block[byteIndex] === 0xFF) {
                    run = 0;
                    start = -1;
                    i += 7; 
                    continue;
                }

                const isUsed = (block[byteIndex] >> bitIndex) & 1;

                if (!isUsed) {
                    if (run === 0) start = i;
                    run++;
                    if (run === count) return start;
                } else {
                    run = 0;
                    start = -1;
                }
            }
        }

        return -1;
    }

    static isEmpty(block) {
        return block.readUInt32BE(4) === 0 && 
               block.readUInt32BE(8) === 0 && 
               block.readUInt32BE(12) === 0 && 
               block.readUInt32BE(16) === 0;
    }

    static markHeader(block, headerSize, unitSize) {
        const headerUnits = Math.ceil(headerSize / unitSize);
        this.mark(block, 0, headerUnits, true);
    }
}
module.exports = BitmapManager;
