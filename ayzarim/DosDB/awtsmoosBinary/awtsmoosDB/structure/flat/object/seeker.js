
/**
 * @file seeker.js
 * @chapter The Searcher of the Flat Earth
 * @description
 * Not every creation needs a mountain (B-Tree). Many simple objects are perfectly 
 * content living on a flat, tightly packed plain of existence. 
 * 
 * The Flat Object Seeker scans these plains linearly. Because the data is 
 * extremely dense, this linear scan is actually faster than tree traversal 
 * for objects with fewer than 200 keys, hitting the CPU cache perfectly.
 * 
 * "The words of Our G-d are eternal." We read the exact bytes, measuring the 
 * length of the name, and comparing it to the target. If it matches, we 
 * extract the VarInt pointer seal and return it to the Navigator.
 */

const PointerCrown = require('../../../utils/pointer/crown.js');

class FlatObjectSeeker {
    /**
     * @method get
     * @description 
     * Sweeps across the flat binary sequence, comparing names until the truth is found.
     * 
     * @param {Object} db - The cosmic database universe.
     * @param {Object} ptr - The decoded coordinate of the Flat Object.
     * @param {string} key - The name of the spark we seek.
     * @returns {Buffer|null} The raw binary seal of the found item.
     */
    static get(db, ptr, key) {
        if (!ptr || ptr.offset === undefined) return null;

        // Pull the entire flat earth into memory
        const buf = db.pager.readExact(ptr.offset, ptr.length);
        if (!buf || buf.length < 6) return null;

        // The Layout: [Magic:4] [Count:2] [kLen:1][kBytes][vPtr:VarInt]...
        const count = buf.readUInt16BE(4);
        const target = Buffer.from(String(key), 'utf8');
        let pos = 6;

        for (let i = 0; i < count; i++) {
            if (pos >= buf.length) break;

            // 1. Extract Key Length
            const kLen = buf[pos++];
            
            // 2. Extract Key Bytes
            const kBuf = buf.subarray(pos, pos + kLen); 
            pos += kLen;

            // 3. Decode the Value Pointer to find its exact byte footprint
            const dec = PointerCrown.decode(buf, pos);
            if (!dec) break;

            // 4. Compare the Essence
            if (kLen === target.length && kBuf.compare(target) === 0) {
                // Return the raw Buffer of the seal, not the decoded object!
                // This preserves the purity required by the Navigator.wrap() function.
                return buf.subarray(pos, pos + dec.byteSize);
            }

            // 5. If it wasn't a match, leap over the pointer's footprint and continue
            pos += dec.byteSize;
        }

        // The spark does not exist in this realm
        return null;
    }
}

module.exports = FlatObjectSeeker;
