
// B"H
const constants = require('../../constants.js');

class BitmapManager {
    static mark(block, start, count, val) {
        // Range checks implicitly handled by bitwise logic, but start must be valid
        const bitmapOffset = constants.BITMAP_OFFSET;
        
        // Optimize: If setting a range, loop bytes if aligned? 
        // For simplicity and safety in JS, we stick to bit manipulation but optimize the loop
        
        const end = start + count;
        for (let i = start; i < end; i++) {
            const byteIndex = (i >>> 3) + bitmapOffset; // i / 8
            const bitIndex = 7 - (i & 7);               // 7 - (i % 8)
            
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
        // B"H: Hyper-Allocator Optimization
        // Scan 32-bit words (4 bytes) at a time to skip full sections quickly.
        // The bitmap is at offset 4, length 16.
        // It aligns perfectly with 4 x 32-bit integers.
        
        const bitmapOffset = constants.BITMAP_OFFSET;
        const maxBits = constants.BITMAP_SIZE * 8; // 128 bits
        
        let run = 0;
        let start = -1;
        
        // Fast path: Check if block is full (common case for allocated blocks)
        // We can read 32-bit integers from the buffer
        // Offset 4, 8, 12, 16.
        
        // Note: Buffer.readUInt32BE is fast.
        // 0xFFFFFFFF means all bits set (full)
        
        // We iterate bits, but we can skip words
        for (let i = 0; i < maxBits; ) {
            // Check word alignment optimization
            if ((i & 31) === 0 && (i + 32) <= maxBits) {
                const byteOffset = (i >>> 3) + bitmapOffset;
                const word = block.readUInt32BE(byteOffset);
                if (word === 0xFFFFFFFF) {
                    // Entire word full, reset run and skip 32 bits
                    run = 0;
                    start = -1;
                    i += 32;
                    continue;
                }
            }

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
            i++;
        }
        
        return -1;
    }

    static isEmpty(block) {
        // Fast check: Read 4 x 32-bit words. If all 0, it's empty.
        // Bitmap is 16 bytes starting at offset 4.
        if (block.readUInt32BE(4) !== 0) return false;
        if (block.readUInt32BE(8) !== 0) return false;
        if (block.readUInt32BE(12) !== 0) return false;
        if (block.readUInt32BE(16) !== 0) return false;
        return true;
    }

    static markHeader(block, headerSize, unitSize) {
        const headerUnits = Math.ceil(headerSize / unitSize);
        this.mark(block, 0, headerUnits, true);
    }
}

module.exports = BitmapManager;
