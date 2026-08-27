
// B"H
/**
 * @file io.js
 * @description 
 *  =============================================================================
 *  THE SEFIRAH OF DA'AT (KNOWLEDGE) - THE BRIDGE OF I/O
 *  =============================================================================
 *  Strictly Synchronous.
 * 
 *  THE TIKKUN OF EXACT BYTES:
 *  All the convoluted logic for checking block boundaries, jumping across chunks,
 *  and reading chains has been banished to the abyss. 
 *  
 *  Because the `pager.js` now uses a Virtual RAM mapping system that treats 
 *  the entire disk as a single contiguous array, we simply ask for exactly 
 *  what we want, and it arrives instantly. 
 */

const DatabaseIO = {
    /**
     * @method readChainSafe
     * @description Fetches data precisely from an absolute offset.
     * @param {Object} db - The database context.
     * @param {Object} ptr - The decoded SmartPointer (contains offset and length).
     * @returns {Buffer|null} The exact unpadded binary data.
     */
    readChainSafe: (db, ptr) => {
        if (!ptr || ptr.offset === undefined) return null;
        return db.pager.readExact(ptr.offset, ptr.length);
    },

    /**
     * @method writeChainSafe
     * @description Inscribes data precisely at an absolute offset.
     * @param {Object} db - The database context.
     * @param {Object} ptr - The decoded SmartPointer.
     * @param {Buffer} data - The raw light to write.
     */
    writeChainSafe: (db, ptr, data) => {
        if (!ptr || ptr.offset === undefined) return;
        db.pager.writeExact(ptr.offset, data);
    }
};

module.exports = DatabaseIO;
