
/**
 * @file seeker.js
 * @chapter The Gatekeeper of Gevurah
 * @description
 * The Dictionary is the vessel of Gevurah (Severity and Boundaries).
 * It does not hold the keys itself; it merely holds the gates to the Map (B-Tree)
 * and the Sequence (List). 
 * 
 * Because all matter is refreshed every instant from the Awtsmoos, we cannot 
 * rely on stale cached pointers. We dive into the physical disk, read the exact 
 * 32-byte header, extract the living seal of the Map, and delegate the search.
 * "By thirty-two paths of wisdom did He carve the world."
 */

const PointerCrown = require('../../utils/pointer/crown.js');
const MapSeeker = require('../map/seeker.js');

class DictionarySeeker {
    /**
     * @method get
     * @description 
     * Penetrates the boundary of the Dictionary to find a specific key within its internal Map.
     * 
     * @param {Object} db - The cosmic database universe.
     * @param {Object} ptr - The decoded coordinate of the Dictionary header.
     * @param {string} key - The name of the spark sought.
     * @returns {Buffer|null} The raw binary seal of the found item, or null.
     */
    static get(db, ptr, key) {
        if (!ptr || ptr.offset === undefined) return null;

        // Read the exact 32-byte boundary that contains the internal pointers
        const buf = db.pager.readExact(ptr.offset, ptr.length || 32);
        if (!buf || buf.length < 5) return null;

        // The layout of a Dictionary Header:
        // [Magic:4] [MapSealLen:1][MapSeal...]
        const mapSealLen = buf.readUInt8(4);
        if (mapSealLen === 0) return null;

        const mapSeal = buf.subarray(5, 5 + mapSealLen);
        const mapPtr = PointerCrown.decode(mapSeal);
        
        if (!mapPtr) return null;

        // Pass the holy quest to the Map Seeker, who navigates the B-Tree
        return MapSeeker.get(db, mapPtr, key);
    }
}

module.exports = DictionarySeeker;
