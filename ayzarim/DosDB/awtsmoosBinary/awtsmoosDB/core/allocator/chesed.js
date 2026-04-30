
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
        
        const offset = this.cursor;
        this.cursor += size;
        
        // B"H: Optimization! We NO LONGER write the Superblock 0 on every call.
        // It remains in RAM and is saved by db.waitForIdle or on exit.
        
        return { offset, length: size };
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
