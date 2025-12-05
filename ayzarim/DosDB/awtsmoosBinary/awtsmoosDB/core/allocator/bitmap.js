// B"H
const constants = require('../../constants.js');

class BitmapManager {
    static mark(block, start, count, val) {
        const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
        for (let i = 0; i < count; i++) {
            const idx = start + i;
            const byteIndex = Math.floor(idx / 8);
            const bitIndex = idx % 8;
            if (byteIndex < constants.BITMAP_SIZE) {
                if (val) bitmap[byteIndex] |= (1 << (7 - bitIndex));
                else bitmap[byteIndex] &= ~(1 << (7 - bitIndex));
            }
        }
    }

    static check(block, start, count) {
        const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
        for (let i = 0; i < count; i++) {
            const idx = start + i;
            const byteIndex = Math.floor(idx / 8);
            const bitIndex = idx % 8;
            if (byteIndex < constants.BITMAP_SIZE) {
                const isUsed = (bitmap[byteIndex] >> (7 - bitIndex)) & 1;
                if (!isUsed) return false;
            }
        }
        return true;
    }

    static findGap(block, count) {
        const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
        let run = 0;
        let start = -1;
        const maxBits = constants.BITMAP_SIZE * 8;
        
        for (let i = 0; i < maxBits; i++) {
            const byteIndex = Math.floor(i / 8);
            const bitIndex = i % 8;
            const isUsed = (bitmap[byteIndex] >> (7 - bitIndex)) & 1;
            if (!isUsed) {
                if (run === 0) start = i;
                run++;
                if (run === count) return start;
            } else {
                run = 0; 
            }
        }
        return -1;
    }

    static isEmpty(block) {
        const bitmap = block.subarray(constants.BITMAP_OFFSET, constants.BITMAP_OFFSET + constants.BITMAP_SIZE);
        for(let i=0; i<bitmap.length; i++) {
            if (bitmap[i] !== 0) return false;
        }
        return true;
    }

    static markHeader(block, headerSize, unitSize) {
        const headerUnits = Math.ceil(headerSize / unitSize);
        this.mark(block, 0, headerUnits, true);
    }
}

module.exports = BitmapManager;
