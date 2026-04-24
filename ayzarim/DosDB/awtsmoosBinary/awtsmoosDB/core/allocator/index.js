
// B"H
/**
 * @file index.js
 * @description
 *  =============================================================================
 *  THE SEFIRAH OF CHESED (KINDNESS) - THE EXACT BYTE ALLOCATOR
 *  =============================================================================
 *  "The world is built on kindness." (Psalms 89:3)
 *  
 *  Chesed is the infinite flow of expansion. But unchecked expansion leads to 
 *  chaos. This Allocator gives EXACTLY what is needed. 
 *  ABSOLUTELY NO PADDING. EVER.
 * 
 *  THE TIKKUN OF FREE SPACE & SHIELDED CURSORS:
 *  By bounding the initial cursor recovery and utilizing `Math.clz32` for O(1) 
 *  bucket searches, allocations complete in nanoseconds safely.
 */

class ExactByteAllocator {
    /**
     * @constructor
     * @param {Object} pager - The Omnipresent RAM Pager.
     * @param {Object} db - The AwtsmoosDB instance.
     */
    constructor(pager, db) {
        this.pager = pager;
        this.db = db;
        this.cursor = 0;
        
        // Smart Nested Bitmap: 32 buckets corresponding to powers of 2 size limits.
        this.freeBitmap = 0;
        // Data-driven tracking of the void
        this.freeBuckets = new Array(32).fill(null); 
    }

    /**
     * @method init
     * @description Reads the Superblock to find the End of the Universe (EOF).
     */
    init() {
        this.pager.init();
        
        if (this.pager.fileSize === 0) {
            this.cursor = 64; 
            const sb = Buffer.alloc(64).fill(0);
            sb.writeBigUInt64BE(BigInt(this.cursor), 0);
            this.pager.writeExact(0, sb);
        } else {
            const sb = this.pager.readExact(0, 64);
            if (sb && sb.length >= 8) {
                this.cursor = Number(sb.readBigUInt64BE(0));
            }
            
            // B"H: The Absolute Shield
            // If the Superblock was overwritten by raw tests, the cursor could be 
            // interpreted as a massive string (e.g. 4.7 Exabytes). We banish this chaos.
            if (!this.cursor || this.cursor < 64 || this.cursor > Number.MAX_SAFE_INTEGER) {
                this.cursor = 64;
                const sbFix = Buffer.alloc(64).fill(0);
                sbFix.writeBigUInt64BE(BigInt(this.cursor), 0);
                this.pager.writeExact(0, sbFix);
            }
        }
    }

    /**
     * @method allocate
     * @description Grants EXACTLY the number of bytes requested. NO PADDING.
     * Uses O(1) bitwise searching to instantly recover dead space.
     * @param {number} sizeBytes - The exact breath of life required.
     * @returns {Object} An object { offset, length }.
     */
    allocate(sizeBytes) {
        if (this.cursor === 0) this.init();
        if (sizeBytes === 0) return { offset: 0, length: 0 };

        // 1. Search the Smart Nested Bitmap for best fit in O(1) time
        const bucketIdx = 31 - Math.clz32(sizeBytes);
        const mask = ~((1 << bucketIdx) - 1);
        const availableBits = this.freeBitmap & mask;

        if (availableBits !== 0) {
            // Found a bucket with space! Fast O(1) lookup.
            const bestBucket = 31 - Math.clz32(availableBits & -availableBits);
            const bucketList = this.freeBuckets[bestBucket];
            
            if (bucketList) {
                // Pop the first segment that fits
                for (let i = 0; i < bucketList.length; i++) {
                    if (bucketList[i].size >= sizeBytes) {
                        const seg = bucketList.splice(i, 1)[0];
                        
                        if (bucketList.length === 0) {
                            this.freeBitmap &= ~(1 << bestBucket);
                        }
                        
                        const leftover = seg.size - sizeBytes;
                        if (leftover > 0) {
                            this.free(seg.offset + sizeBytes, leftover);
                        }
                        
                        return { offset: seg.offset, length: sizeBytes };
                    }
                }
            }
        }

        // 2. If no free space fits perfectly, append directly to the Void (EOF).
        const finalOffset = this.cursor;
        this.cursor += sizeBytes;
        
        // Update EOF in Superblock precisely
        const cursorBuf = Buffer.allocUnsafe(8);
        cursorBuf.writeBigUInt64BE(BigInt(this.cursor), 0);
        this.pager.writeExact(0, cursorBuf);

        return { offset: finalOffset, length: sizeBytes };
    }

    /**
     * @method free
     * @description Returns exact bytes to the Void, organizing them into the O(1) Smart Blockchain buckets.
     * @param {number} offset - The location of the dead vessel.
     * @param {number} sizeBytes - The exact size of the released light.
     */
    free(offset, sizeBytes) {
        if (sizeBytes === 0) return;
        const bucketIdx = 31 - Math.clz32(sizeBytes);
        
        if (!this.freeBuckets[bucketIdx]) {
            this.freeBuckets[bucketIdx] = [];
        }
        
        this.freeBuckets[bucketIdx].push({ offset, size: sizeBytes });
        this.freeBitmap |= (1 << bucketIdx);

        // Physically mark the space as free (0xFF)
        const freeMark = Buffer.allocUnsafe(1);
        freeMark[0] = 0xFF; 
        this.pager.writeExact(offset, freeMark);
    }
}

module.exports = ExactByteAllocator;
