
// B"H
/**
 * @file chesed.js
 * @chapter Chapter 50: The Stream of Giving (Midat HaChesed)
 * @description
 * Chesed represents the absolute, unrestrained flow of expansion.
 * In this database universe, Chesed is the "Next Available Byte" Allocator.
 * 
 * Every byte that exists is given a dwelling place (Makom) without question.
 * To achieve extreme velocity, we have eliminated the Tzimtzum (restriction) 
 * of frequent disk writing. We allocate in Memory and only scribe the 
 * final cursor state to the Superblock during the "idle" or "closing" moments.
 */

/**
 * @class AllocatorChesed
 * @description Scribes coordinates of existence in an infinite sequential flow.
 */
class AllocatorChesed {
    /**
     * @constructor
     * @param {Object} pager - The Pager instance.
     */
    constructor(pager) {
        this.pager = pager;
        this.db = pager.db;
        /** @member {number} cursor - The final edge of manifest matter. */
        this.cursor = 0;
        /** @member {Array<{offset:number,length:number}>} freeList - Exact reusable gaps. */
        this.freeList = [];
    }

    /**
     * @method init
     * @description Loads the initial cursor from the Superblock's scroll.
     */
    init() {
        // Read 8 bytes from index 0 of the physical universe (the Superblock header).
        const header = this.pager.readExact(0, 8);
        if (header && header.length === 8) {
            const bigVal = header.readBigUInt64BE(0);
            this.cursor = Number(bigVal);
            // Protect against corrupted zeros or non-finite addresses.
            if (isNaN(this.cursor) || this.cursor < 64) this.cursor = 64;
        } else {
            // First Day of Creation
            this.cursor = 64;
            this.flushCursor();
        }
    }

    /**
     * @method allocate
     * @description
     * Grants the requested magnitude of space.
     * ZERO Disk I/O performed here!
     * 
     * @param {number} size - Amount of bytes to carve from the void.
     * @returns {Object} {offset, length}
     */
    allocate(size) {
        if (this.cursor === 0) this.init();
        if (size <= 0) return { offset: 0, length: 0 };

        for (let i = 0; i < this.freeList.length; i++) {
            const gap = this.freeList[i];

            if (gap.length >= size) {
                const loc = { offset: gap.offset, length: size };
                gap.offset += size;
                gap.length -= size;

                if (gap.length === 0) {
                    this.freeList.splice(i, 1);
                }

                return loc;
            }
        }
        
        const offset = this.cursor;
        this.cursor += size;
        
        // B"H: Optimization! We NO LONGER write the Superblock 0 on every call.
        // It remains in RAM and is saved by db.waitForIdle or on exit.
        
        return { offset, length: size };
    }

    /**
     * @method free
     * @description
     * Returns an exact range to the reusable middle-space ledger. If the freed
     * range touches the current end of reality, the cursor withdraws instantly.
     *
     * @param {number} offset - Start byte.
     * @param {number} length - Number of bytes.
     * @returns {void}
     */
    free(offset, length) {
        if (this.cursor === 0) this.init();
        if (!Number.isFinite(offset) || !Number.isFinite(length) || length <= 0) return;
        if (offset < 64) return;

        if (offset + length === this.cursor) {
            this.cursor = offset;
            this._absorbTrailingGaps();
            this.flushCursor();
            return;
        }

        if (offset + length > this.cursor) return;

        this.freeList.push({ offset, length });
        this._mergeFreeList();
    }

    /**
     * @method releasePointer
     * @description Frees the decoded range represented by a pointer seal.
     * @param {Buffer|object} ptr - Pointer seal or decoded pointer.
     * @returns {void}
     */
    releasePointer(ptr) {
        if (!ptr) return;

        const Pointer = require('../../utils/pointer/crown.js');
        const dec = Buffer.isBuffer(ptr) ? Pointer.decode(ptr) : ptr;

        if (!dec || dec.type === require('../../constants.js').VAL_TYPE.ANCHOR) return;
        this.free(dec.offset, dec.length);
    }

    /**
     * @method _mergeFreeList
     * @description Sorts and coalesces adjacent free gaps.
     * @returns {void}
     */
    _mergeFreeList() {
        if (this.freeList.length < 2) return;

        this.freeList.sort((a, b) => a.offset - b.offset);

        const merged = [this.freeList[0]];

        for (let i = 1; i < this.freeList.length; i++) {
            const last = merged[merged.length - 1];
            const gap = this.freeList[i];

            if (last.offset + last.length >= gap.offset) {
                const end = Math.max(last.offset + last.length, gap.offset + gap.length);
                last.length = end - last.offset;
            } else {
                merged.push(gap);
            }
        }

        this.freeList = merged;
    }

    /**
     * @method _absorbTrailingGaps
     * @description Pulls the cursor backward through adjacent free ranges.
     * @returns {void}
     */
    _absorbTrailingGaps() {
        let changed = true;

        while (changed) {
            changed = false;

            for (let i = 0; i < this.freeList.length; i++) {
                const gap = this.freeList[i];

                if (gap.offset + gap.length === this.cursor) {
                    this.cursor = gap.offset;
                    this.freeList.splice(i, 1);
                    changed = true;
                    break;
                }
            }
        }
    }

    /**
     * @method save
     * @description Redirects to the specialized scribes to save abstract thought.
     */
    save(val) {
        if (!this.db.primitiveSaver) {
             throw new Error("B\"H Fatal: Primitive Scribe not manifested. Cannot preserve truth.");
        }
        return this.db.primitiveSaver.save(val);
    }

    /**
     * @method flushCursor
     * @description Materializes the current cursor address to the physical Stone.
     */
    flushCursor() {
        if (this.cursor < 64) return;
        const buf = Buffer.allocUnsafe(8);
        buf.writeBigUInt64BE(BigInt(this.cursor), 0);
        this.pager.writeExact(0, buf);
    }
}

module.exports = AllocatorChesed;
