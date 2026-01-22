// B"H
/**
 * @file bitmap.js
 * @description The absolute map of existence within a page.
 * PURIFIED: Strict bitwise verification without jump optimizations.
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

    static findGap(block, count) {
        const bitmapOffset = constants.BITMAP_OFFSET;
        const maxBits = constants.BITMAP_SIZE * 8; // 128 units
        let run = 0;
        let start = -1;

        // B"H: Strict bit-by-bit scan. 
        // Eliminates any possibility of jumps skipping valid or invalid space.
        for (let i = 0; i < maxBits; i++) {
            const byteIndex = (i >>> 3) + bitmapOffset;
            const bitIndex = 7 - (i & 7);
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